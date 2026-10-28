'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  storageService,
  formatCurrencyVND,
  formatDateTime,
  generateVietQRUrl,
  apiClient,
  realtimeHub,
  socketClient,
  buildReceiptData,
  EscPosEncoder,
  thermalPrinterService,
  resolveEffectiveBankAccount,
} from '@imenu/utils';
import { Order, Restaurant, ReceiptData, PaymentMethod, Bill } from '@imenu/types';
import { Card, Button, StatusChip } from '@imenu/ui';
import {
  Receipt,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Clock,
  QrCode,
  Store,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  CreditCard,
  Banknote,
  Check,
  Copy,
  Download,
  Sparkles,
  Percent,
  DollarSign,
  AlertCircle,
  ArrowRight,
  FileText,
  Layers,
  Flame,
  ShieldCheck,
  Send,
} from 'lucide-react';

export default function BillsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>(storageService.getRestaurant());
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<Order | null>(null);
  const [activeReceiptData, setActiveReceiptData] = useState<ReceiptData | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(storageService.getActiveBranchId());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PaymentRequested' | 'Active' | 'Paid'>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'Cash' | 'VietQR' | 'Card' | 'Transfer'>('all');

  // Quick Checkout Panel State (inside preview modal)
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>('Cash');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);
  const checkoutIdempotencyKeyRef = useRef<string | null>(null);
  const [copiedEscPos, setCopiedEscPos] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Reset idempotency key when changing order
  useEffect(() => {
    checkoutIdempotencyKeyRef.current = null;
  }, [selectedOrderForBill?.id]);

  // Current logged in user / cashier
  const currentUser = useMemo(() => storageService.getCurrentUser(), []);

  // Fetch orders and bills
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ordersRes, billsRes] = await Promise.all([
        apiClient.orders.list({
          branchId: activeBranchId || undefined,
          limit: 100,
        }).catch(() => null),
        apiClient.bills.list({
          branchId: activeBranchId || undefined,
          limit: 100,
        }).catch(() => null),
      ]);

      const rawOrders = ordersRes?.data?.items || ordersRes?.data || [];
      const orderList: Order[] = Array.isArray(rawOrders) ? rawOrders : [];
      setOrders(orderList);

      const rawBills = billsRes?.data || [];
      const billList: Bill[] = Array.isArray(rawBills) ? rawBills : [];
      setBills(billList);
    } catch (err) {
      console.error('Lỗi tải dữ liệu hóa đơn:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeBranchId]);

  useEffect(() => {
    fetchData();
    setRestaurant(storageService.getRestaurant());

    const handleBranchChange = (e: any) => {
      const newBranchId = e.detail?.branchId ?? null;
      setActiveBranchId(newBranchId);
      const rest = storageService.getRestaurant();
      const restId = (rest as any)?.id || (rest as any)?._id;
      if (restId) {
        socketClient.switchBranch(restId, newBranchId);
      }
    };
    window.addEventListener('imenu:branch_changed', handleBranchChange);

    const unsub = realtimeHub.subscribe('*', (payload) => {
      const evt = payload.type as string;
      if (
        evt === 'PAYMENT_COMPLETED' ||
        evt === 'order:payment_completed' ||
        evt === 'ORDER_STATUS_UPDATED' ||
        evt === 'order:updated' ||
        evt === 'PAYMENT_REQUESTED' ||
        evt === 'order:payment_requested'
      ) {
        fetchData();
      }
    });

    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
      unsub();
    };
  }, [fetchData]);

  // Keyboard shortcut: ESC to close preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClosePreview();
      }
    };
    if (selectedOrderForBill) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedOrderForBill]);

  // Find active branch object
  const currentBranch = useMemo(() => {
    const branches = restaurant?.branches || [];
    return branches.find((b: any) => b.id === activeBranchId || b._id === activeBranchId) || branches[0] || null;
  }, [restaurant, activeBranchId]);

  // Open Preview Modal & Compute ReceiptData
  const handleOpenPreview = (order: Order) => {
    setSelectedOrderForBill(order);
    setZoomScale(1);

    // Initialize checkout form from order
    setCheckoutPaymentMethod((order.paymentMethod as PaymentMethod) || 'Cash');
    setDiscountType('fixed');
    setDiscountValue(order.discountAmount || 0);
    setVatPercent(order.vatAmount ? 8 : 0);
    setServiceFee(order.serviceFee || 0);
    setCashGiven(order.totalAmount || 0);

    // Try to find matching Bill snapshot first
    const matchedBill = bills.find((b) => b.orderId === order.id || (b as any).orderCode === order.orderCode);

    const receipt = buildReceiptData(matchedBill || order, restaurant, {
      branch: currentBranch,
      cashierName: currentUser?.fullName || (matchedBill as any)?.cashierName || 'Thu ngân',
      billCode: matchedBill?.billCode,
      paidAt: matchedBill?.paidAt || order.closedAt,
      printCount: matchedBill?.printCount || 0,
    });

    setActiveReceiptData(receipt);
  };

  const handleClosePreview = () => {
    setSelectedOrderForBill(null);
    setActiveReceiptData(null);
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.0));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.6));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  // Re-calculate live receipt data when checkout form values change (if order is unpaid)
  useEffect(() => {
    if (!selectedOrderForBill || selectedOrderForBill.status === 'Paid') return;

    const subTotal = selectedOrderForBill.subTotal || selectedOrderForBill.totalAmount || 0;
    const calcDiscount =
      discountType === 'percent'
        ? Math.round((subTotal * Math.min(100, Math.max(0, discountValue))) / 100)
        : Math.min(subTotal, Math.max(0, discountValue));

    const taxable = Math.max(0, subTotal - calcDiscount);
    const calcVat = Math.round((taxable + serviceFee) * (vatPercent / 100));
    const calcFinal = taxable + serviceFee + calcVat;

    const updatedOrder = {
      ...selectedOrderForBill,
      subTotal,
      discountAmount: calcDiscount,
      discountPercent: discountType === 'percent' ? discountValue : undefined,
      taxableBase: taxable,
      serviceFee,
      vatAmount: calcVat,
      vatPercent,
      finalAmount: calcFinal,
      totalAmount: calcFinal,
      paymentMethod: checkoutPaymentMethod,
      amountReceived: cashGiven,
      changeAmount: Math.max(0, cashGiven - calcFinal),
    };

    const receipt = buildReceiptData(updatedOrder, restaurant, {
      branch: currentBranch,
      cashierName: currentUser?.fullName || 'Thu ngân',
      discountPercent: discountType === 'percent' ? discountValue : undefined,
      serviceFeePercent: undefined,
      vatPercent,
      paymentMethod: checkoutPaymentMethod,
      cashGiven,
      cashChange: Math.max(0, cashGiven - calcFinal),
    });

    setActiveReceiptData(receipt);
  }, [
    selectedOrderForBill,
    checkoutPaymentMethod,
    discountType,
    discountValue,
    vatPercent,
    serviceFee,
    cashGiven,
    restaurant,
    currentBranch,
    currentUser,
  ]);

  // Execute Quick Payment Completion
  const handleCompletePaymentAndPrint = async () => {
    if (!selectedOrderForBill || isProcessingCheckout) return;
    setIsProcessingCheckout(true);

    try {
      const calcFinal = activeReceiptData?.financials.totalAmount || selectedOrderForBill.totalAmount;
      if (!checkoutIdempotencyKeyRef.current) {
        checkoutIdempotencyKeyRef.current = `pay-${selectedOrderForBill.id}-${Date.now()}`;
      }
      const idempotencyKey = checkoutIdempotencyKeyRef.current;

      const res = await apiClient.orders.completePayment(
        selectedOrderForBill.id,
        {
          paymentMethod: checkoutPaymentMethod,
          discountAmount: activeReceiptData?.financials.discountAmount || 0,
          discountPercent: discountType === 'percent' ? discountValue : undefined,
          serviceFee,
          vatAmount: activeReceiptData?.financials.vatAmount || 0,
          vatPercent,
          amountReceived: cashGiven >= calcFinal ? cashGiven : calcFinal,
        },
        { idempotencyKey },
      );

      // Reset idempotency key on success
      checkoutIdempotencyKeyRef.current = null;

      showToast('✅ Đã thu tiền thành công! Đang tiến hành in hóa đơn...');

      // Update local state to Paid
      if (res?.data?.order) {
        setSelectedOrderForBill(res.data.order);
      }
      if (res?.data?.bill) {
        const updatedBill = res.data.bill;
        setBills((prev) => [updatedBill, ...prev.filter((b) => b.id !== updatedBill.id)]);
      }

      await fetchData();

      // Trigger standard 80mm print
      setTimeout(() => {
        handlePrintReceipt();
      }, 400);
    } catch (err: any) {
      console.error('Lỗi thanh toán:', err);
      showToast(err.message || 'Không thể hoàn tất thanh toán. Vui lòng thử lại!');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Print Action via Browser (@media print)
  const handlePrintReceipt = async () => {
    if (selectedOrderForBill) {
      // Find and log print count if bill exists
      const matchedBill = bills.find((b) => b.orderId === selectedOrderForBill.id);
      if (matchedBill?.id) {
        apiClient.bills.logPrint(matchedBill.id).catch(() => {});
      }
    }
    window.print();
  };

  // Export ESC/POS Command & WebUSB direct print
  const handleExportEscPos = async () => {
    if (!activeReceiptData) return;

    try {
      const payload = thermalPrinterService.generatePrintPayload(activeReceiptData, {
        paperWidth: '80mm',
        kickDrawerOnCash: true,
      });

      // Try WebUSB if supported
      if (thermalPrinterService.isWebUsbSupported()) {
        try {
          const usbRes = await thermalPrinterService.printReceiptUsb(activeReceiptData);
          if (usbRes.success) {
            showToast('✅ Đã gửi lệnh in nhiệt trực tiếp qua WebUSB thành công!');
            return;
          }
        } catch {
          // Fall through to clipboard / download
        }
      }

      // Copy Base64 ESC/POS string to clipboard
      await navigator.clipboard.writeText(payload.base64);
      setCopiedEscPos(true);
      setTimeout(() => setCopiedEscPos(false), 3000);
      showToast('📋 Đã sao chép mã Base64 lệnh ESC/POS vào bộ nhớ tạm!');
    } catch (err: any) {
      showToast('Không thể tạo lệnh ESC/POS: ' + (err.message || 'Lỗi không xác định'));
    }
  };

  // Filter orders according to Search & Filter criteria
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (statusFilter === 'PaymentRequested' && o.status !== 'PaymentRequested') return false;
      if (statusFilter === 'Active' && !['Preparing', 'Ready', 'Served'].includes(o.status)) return false;
      if (statusFilter === 'Paid' && !(o.status === 'Paid' || o.isPaid)) return false;

      // Payment Method filter
      if (paymentMethodFilter !== 'all') {
        const method = o.paymentMethod || 'Cash';
        if (method !== paymentMethodFilter) return false;
      }

      // Search query filter (orderCode, billCode, tableName)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = o.orderCode?.toLowerCase().includes(q);
        const tableMatch = o.tableName?.toLowerCase().includes(q);
        const bill = bills.find((b) => b.orderId === o.id);
        const billMatch = bill?.billCode?.toLowerCase().includes(q);
        if (!codeMatch && !tableMatch && !billMatch) return false;
      }

      return true;
    });
  }, [orders, bills, statusFilter, paymentMethodFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#09271d] text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 text-xs font-semibold animate-slideLeft">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#09271d] flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-[#176044]" />
            Quản Lý Hóa Đơn & In Bill Nhiệt 80mm
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tra cứu chứng từ, chốt thanh toán nhanh và in hóa đơn nhiệt ESC/POS chuẩn khổ 80mm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs font-bold"
          >
            Làm mới
          </Button>

          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#176044] font-bold flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            <span>{currentBranch?.name || restaurant.name || 'Chi nhánh mặc định'}</span>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn (ORD-...), mã bill (BILL-...), hoặc tên bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176044] bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176044] bg-white text-slate-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PaymentRequested">Chờ thanh toán (Yêu cầu)</option>
              <option value="Active">Đang phục vụ (Bếp / Ra bàn)</option>
              <option value="Paid">Đã thanh toán (Hoàn tất)</option>
            </select>
          </div>

          {/* Payment method filter */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176044] bg-white text-slate-700"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="Cash">Tiền mặt (Cash)</option>
              <option value="VietQR">Chuyển khoản VietQR</option>
              <option value="Card">Thẻ (Card / POS)</option>
              <option value="Transfer">Chuyển khoản (Transfer)</option>
            </select>
          </div>
        </div>

        {/* Quick status tabs count */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#124a36] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('PaymentRequested')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'PaymentRequested'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            Chờ thanh toán ({orders.filter((o) => o.status === 'PaymentRequested').length})
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'Active'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Đang phục vụ ({orders.filter((o) => ['Preparing', 'Ready', 'Served'].includes(o.status)).length})
          </button>
          <button
            onClick={() => setStatusFilter('Paid')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'Paid'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Đã thanh toán ({orders.filter((o) => o.status === 'Paid' || o.isPaid).length})
          </button>
        </div>
      </div>

      {/* ORDERS / BILLS LIST */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-16 text-center bg-white rounded-lg border border-slate-200 space-y-3">
            <Loader2 className="w-8 h-8 text-[#176044] animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Đang đồng bộ danh sách hóa đơn từ máy chủ...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-lg border border-slate-200 space-y-2">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy hóa đơn nào khớp với bộ lọc</p>
            <p className="text-xs text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc trạng thái khác</p>
          </div>
        ) : (
          filteredOrders.map((ord) => {
            const bill = bills.find((b) => b.orderId === ord.id);
            const isPaid = ord.status === 'Paid' || ord.isPaid;
            const isPaymentRequested = ord.status === 'PaymentRequested';

            return (
              <Card
                key={ord.id}
                onClick={() => handleOpenPreview(ord)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 transition-all cursor-pointer group bg-white ${
                  isPaymentRequested
                    ? 'border-rose-400 bg-rose-50/20 shadow-md ring-2 ring-rose-300/40'
                    : 'border-slate-200 hover:border-[#176044] hover:shadow-md'
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-black text-[#09271d] group-hover:text-[#176044] transition-colors">
                      {ord.tableName}
                    </span>
                    <span className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                      {ord.orderCode}
                    </span>
                    {bill?.billCode && (
                      <span className="text-[11px] text-emerald-800 font-mono bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-md font-extrabold">
                        {bill.billCode}
                      </span>
                    )}
                    <StatusChip status={ord.status} size="sm" />
                    {isPaymentRequested && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                        Khách gọi tính tiền
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDateTime(ord.createdAt)}
                    </span>
                    <span>·</span>
                    <span className="font-semibold text-slate-700">
                      {ord.items.filter((i) => i.status !== 'Cancelled').length} món hợp lệ
                    </span>
                    <span>·</span>
                    <span className="font-medium text-slate-600 flex items-center gap-1">
                      {ord.paymentMethod === 'VietQR' ? (
                        <>
                          <QrCode className="w-3.5 h-3.5 text-indigo-600" /> VietQR
                        </>
                      ) : ord.paymentMethod === 'Card' ? (
                        <>
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Thẻ POS
                        </>
                      ) : (
                        <>
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" /> Tiền mặt
                        </>
                      )}
                    </span>
                    <span>·</span>
                    <span className="text-[11px] text-[#176044] font-bold">
                      {ord.orderSource === 'STAFF_POS' ? 'POS Thu Ngân' : 'Khách quét QR'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-extrabold tracking-wider">
                      {isPaid ? 'Đã Thanh Toán' : 'Tổng Cần Thu'}
                    </span>
                    <span className={`text-base sm:text-lg font-bold tabular-nums ${isPaid ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {formatCurrencyVND(ord.totalAmount)}
                    </span>
                  </div>

                  <Button
                    variant={isPaid ? 'primary' : 'amber'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPreview(ord);
                    }}
                    icon={<Receipt className="w-4 h-4" />}
                    className="shadow-sm font-bold"
                  >
                    {isPaid ? 'Xem & In Bill' : 'Chốt Thu Tiền & In'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* FULLSCREEN RESPONSIVE RECEIPT & QUICK CHECKOUT MODAL */}
      {selectedOrderForBill && activeReceiptData && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-md animate-fadeIn"
          style={{ zIndex: 9999 }}
          onClick={handleClosePreview}
        >
          {/* MODAL HEADER */}
          <div
            className="flex-shrink-0 bg-[#09271d] text-white px-4 sm:px-6 py-3.5 border-b border-[#183a2e] flex items-center justify-between shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#176044] text-white grid place-items-center flex-shrink-0 shadow-inner">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black truncate text-white flex items-center gap-2">
                  <span>Hóa Đơn In Nhiệt 80mm</span>
                  {selectedOrderForBill.status === 'Paid' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold uppercase">
                      Đã Hoàn Tất
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black uppercase">
                      Phiếu Tạm Tính
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-emerald-300 truncate">
                  {selectedOrderForBill.tableName} · Mã đơn:{' '}
                  <span className="font-mono font-bold text-white">{selectedOrderForBill.orderCode}</span>
                  {activeReceiptData.metadata.billCode && (
                    <span>
                      {' '}· Mã Bill: <span className="font-mono font-bold text-amber-300">{activeReceiptData.metadata.billCode}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClosePreview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white transition-all text-xs font-bold border border-white/20 active:scale-95 cursor-pointer"
                title="Đóng (phím ESC)"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Đóng</span>
              </button>
            </div>
          </div>

          {/* ZOOM & CONTROLS TOOLBAR */}
          <div
            className="flex-shrink-0 bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="text-[11px] text-slate-400">Thu phóng:</span>
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 0.6}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors border border-slate-700"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="min-w-[48px] text-center font-bold font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 2.0}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors border border-slate-700"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-700 ml-1"
              >
                <RotateCcw className="w-3 h-3" /> Chuẩn (100%)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden sm:inline">Khổ giấy chuẩn: <strong>80mm ESC/POS</strong></span>
              <button
                onClick={handleExportEscPos}
                className="px-2.5 py-1 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                title="Xuất tập lệnh nhị phân ESC/POS và gửi WebUSB"
              >
                {copiedEscPos ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5" />}
                <span>{copiedEscPos ? 'Đã chép lệnh ESC/POS' : 'Xuất Lệnh ESC/POS'}</span>
              </button>
            </div>
          </div>

          {/* MAIN MODAL BODY: 2-COLUMN LAYOUT ON DESKTOP (PANEL + THERMAL PAPER) */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center items-start touch-pan-y"
            onClick={handleClosePreview}
          >
            <div
              className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              onClick={(e) => e.stopPropagation()}
            >
              {/* LEFT COLUMN: QUICK CHECKOUT PANEL (IF UNPAID) OR BILL AUDIT METRICS (IF PAID) */}
              <div className="lg:col-span-5 space-y-4">
                {selectedOrderForBill.status !== 'Paid' ? (
                  <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-lg text-white space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-extrabold flex items-center gap-2 text-amber-400">
                        <DollarSign className="w-4 h-4" /> Chốt Thanh Toán Nhanh
                      </h3>
                      <span className="text-[11px] font-bold text-slate-400">
                        {selectedOrderForBill.tableName}
                      </span>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Phương thức thanh toán
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod('Cash')}
                          className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                            checkoutPaymentMethod === 'Cash'
                              ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          <Banknote className="w-4 h-4" />
                          <span>Tiền mặt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod('VietQR')}
                          className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                            checkoutPaymentMethod === 'VietQR'
                              ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          <QrCode className="w-4 h-4" />
                          <span>VietQR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCheckoutPaymentMethod('Card')}
                          className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                            checkoutPaymentMethod === 'Card'
                              ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Thẻ POS</span>
                        </button>
                      </div>
                    </div>

                    {/* Financial Adjustments (Discount, VAT, Service) */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {/* Discount input */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                          <span>Chiết khấu</span>
                          <button
                            type="button"
                            onClick={() => setDiscountType((p) => (p === 'percent' ? 'fixed' : 'percent'))}
                            className="text-[10px] text-amber-400 hover:underline"
                          >
                            {discountType === 'percent' ? 'Đổi sang VNĐ' : 'Đổi sang %'}
                          </button>
                        </div>
                        <input
                          type="number"
                          min={0}
                          value={discountValue || ''}
                          onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                          placeholder={discountType === 'percent' ? 'Ví dụ: 10 (%)' : 'Ví dụ: 20000'}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                        />
                      </div>

                      {/* VAT percent input */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-300 block">Thuế VAT (%)</label>
                        <select
                          value={vatPercent}
                          onChange={(e) => setVatPercent(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none font-bold"
                        >
                          <option value={0}>0% (Không thuế)</option>
                          <option value={8}>8% (VAT ưu đãi)</option>
                          <option value={10}>10% (VAT chuẩn)</option>
                        </select>
                      </div>
                    </div>

                    {/* Cash Given & Quick Presets (Only when Cash) */}
                    {checkoutPaymentMethod === 'Cash' && (
                      <div className="space-y-2 pt-1 border-t border-slate-800">
                        <label className="text-[11px] font-bold text-slate-300 block">
                          Tiền khách đưa (VNĐ)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={10000}
                          value={cashGiven || ''}
                          onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-extrabold text-emerald-400 font-mono focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            activeReceiptData.financials.totalAmount,
                            Math.ceil(activeReceiptData.financials.totalAmount / 50000) * 50000,
                            Math.ceil(activeReceiptData.financials.totalAmount / 100000) * 100000,
                            Math.ceil(activeReceiptData.financials.totalAmount / 500000) * 500000,
                          ]
                            .filter((val, idx, self) => val > 0 && self.indexOf(val) === idx)
                            .map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setCashGiven(preset)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 border border-slate-700"
                              >
                                {new Intl.NumberFormat('vi-VN').format(preset)} đ
                              </button>
                            ))}
                        </div>

                        {/* Calculated Change */}
                        <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Tiền thừa trả khách:</span>
                          <span className="text-sm font-black text-amber-400 font-mono">
                            {formatCurrencyVND(Math.max(0, cashGiven - activeReceiptData.financials.totalAmount))}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Confirmation Button */}
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        onClick={handleCompletePaymentAndPrint}
                        disabled={isProcessingCheckout}
                        className="w-full py-3 text-xs font-black bg-[#176044] hover:bg-[#124a36] shadow-xl flex items-center justify-center gap-2"
                      >
                        {isProcessingCheckout ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Printer className="w-4 h-4" />
                        )}
                        <span>Xác Nhận Đã Thu Tiền & In Bill</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* BILL AUDIT INFO CARD (FOR PAID BILLS) */
                  <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-lg text-white space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 text-emerald-400 border-b border-slate-800 pb-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-extrabold">Chứng Từ Đã Thanh Toán</h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Mã hóa đơn:</span>
                        <strong className="text-white font-mono">{activeReceiptData.metadata.billCode || 'N/A'}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Mã đơn hàng:</span>
                        <strong className="text-white font-mono">{activeReceiptData.metadata.orderCode}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Thu ngân xác nhận:</span>
                        <strong className="text-white">{activeReceiptData.metadata.cashierName}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Phương thức:</span>
                        <strong className="text-emerald-400">{activeReceiptData.financials.paymentMethod}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Số lần đã in:</span>
                        <strong className="text-amber-300 font-mono">{activeReceiptData.metadata.printCount || 0} lần</strong>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex gap-2">
                      <Button
                        variant="primary"
                        onClick={handlePrintReceipt}
                        className="w-full py-2.5 text-xs font-bold bg-[#176044] hover:bg-[#124a36]"
                        icon={<Printer className="w-4 h-4 mr-1.5" />}
                      >
                        In Lại Hóa Đơn 80mm
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: 80MM ESC/POS THERMAL RECEIPT DISPLAY */}
              <div className="lg:col-span-7 flex justify-center">
                <div
                  className="transition-transform duration-150 ease-out origin-top py-2"
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: 'top center',
                  }}
                >
                  {/* THERMAL PAPER CONTAINER (PRINTABLE AREA) */}
                  <div
                    id="thermal-print-area"
                    className="relative bg-white text-black font-mono shadow-2xl rounded-sm border border-slate-300 p-5 w-[340px] max-w-[94vw] mx-auto text-xs leading-relaxed select-text"
                    style={{
                      boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1)',
                    }}
                  >
                    {/* Top Perforation Edge */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-60" />

                    {/* HEADER: Dynamic Restaurant & Branch Info */}
                    <div className="text-center pb-3 border-b-2 border-dashed border-slate-900 space-y-1">
                      <h3 className="text-base font-black font-sans tracking-wide uppercase text-slate-950">
                        {activeReceiptData.header.restaurantName}
                      </h3>
                      {activeReceiptData.header.branchName && (
                        <p className="text-[11px] font-bold text-slate-800">
                          Chi nhánh: {activeReceiptData.header.branchName}
                        </p>
                      )}
                      {activeReceiptData.header.address && (
                        <p className="text-[11px] text-slate-700 leading-tight">
                          {activeReceiptData.header.address}
                        </p>
                      )}
                      {activeReceiptData.header.hotline && (
                        <p className="text-[11px] text-slate-700">
                          Hotline: <strong>{activeReceiptData.header.hotline}</strong>
                        </p>
                      )}
                      {activeReceiptData.header.wifiSsid && (
                        <p className="text-[10px] text-slate-500">
                          Wifi: {activeReceiptData.header.wifiSsid}{' '}
                          {activeReceiptData.header.wifiPassword ? `| Pass: ${activeReceiptData.header.wifiPassword}` : ''}
                        </p>
                      )}
                    </div>

                    {/* TITLE & METADATA */}
                    <div className="text-center py-2.5 space-y-1">
                      <div className="text-sm font-black tracking-wider uppercase text-slate-950">
                        {activeReceiptData.metadata.receiptType === 'FINAL_BILL'
                          ? 'HÓA ĐƠN THANH TOÁN'
                          : 'PHIẾU TẠM TÍNH TIỀN'}
                      </div>
                      <div className="text-xs font-black text-slate-900">
                        {activeReceiptData.metadata.tableName}
                      </div>
                      <div className="text-[10px] text-slate-600 flex justify-between pt-1">
                        <span>
                          {activeReceiptData.metadata.billCode ? (
                            <>Số HĐ: <strong>{activeReceiptData.metadata.billCode}</strong></>
                          ) : (
                            <>Mã đơn: <strong>{activeReceiptData.metadata.orderCode}</strong></>
                          )}
                        </span>
                        <span>Thu ngân: <strong>{activeReceiptData.metadata.cashierName}</strong></span>
                      </div>
                      <div className="text-[10px] text-slate-600 flex justify-between">
                        <span>
                          Giờ vào:{' '}
                          {activeReceiptData.metadata.createdAt instanceof Date
                            ? activeReceiptData.metadata.createdAt.toLocaleString('vi-VN')
                            : String(activeReceiptData.metadata.createdAt || '')}
                        </span>
                        {activeReceiptData.metadata.paidAt && (
                          <span>
                            Giờ ra:{' '}
                            {activeReceiptData.metadata.paidAt instanceof Date
                              ? activeReceiptData.metadata.paidAt.toLocaleTimeString('vi-VN')
                              : String(activeReceiptData.metadata.paidAt).slice(11, 16)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ITEMS TABLE (EXCLUDES CANCELLED ITEMS) */}
                    <div className="border-t-2 border-b-2 border-dashed border-slate-900 py-2 my-2">
                      <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-dotted border-slate-400">
                        <span className="w-1/2 text-left">Tên món</span>
                        <span className="w-1/6 text-center">SL</span>
                        <span className="w-1/3 text-right">T.Tiền</span>
                      </div>

                      <div className="divide-y divide-dotted divide-slate-300 pt-1">
                        {activeReceiptData.items.map((it, idx) => (
                          <div key={idx} className="py-1.5 flex justify-between items-start text-[11px]">
                            <div className="w-1/2 pr-1">
                              <strong className="block text-slate-950 font-bold leading-tight">
                                {it.name}
                              </strong>
                              <span className="text-[10px] text-slate-600 block">
                                @{formatCurrencyVND(it.unitPrice)}
                              </span>
                              {it.selectedOptionsNote && (
                                <span className="text-[10px] text-slate-500 block leading-tight pt-0.5">
                                  + {it.selectedOptionsNote}
                                </span>
                              )}
                              {it.note && (
                                <span className="text-[10px] text-amber-800 block italic">
                                  * {it.note}
                                </span>
                              )}
                            </div>
                            <div className="w-1/6 text-center font-bold pt-0.5 text-slate-900">
                              {it.quantity}
                            </div>
                            <div className="w-1/3 text-right font-bold pt-0.5 text-slate-950">
                              {formatCurrencyVND(it.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FINANCIAL SUMMARY */}
                    <div className="space-y-1 py-1 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span>Tổng số lượng món:</span>
                        <span className="font-bold">
                          {activeReceiptData.items.reduce((s, c) => s + c.quantity, 0)} món
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Tạm tính tiền món:</span>
                        <span>{formatCurrencyVND(activeReceiptData.financials.subTotal)}</span>
                      </div>

                      {activeReceiptData.financials.discountAmount > 0 && (
                        <div className="flex justify-between text-rose-600 font-medium">
                          <span>
                            Giảm giá{' '}
                            {activeReceiptData.financials.discountPercent
                              ? `(${activeReceiptData.financials.discountPercent}%)`
                              : ''}
                            :
                          </span>
                          <span>-{formatCurrencyVND(activeReceiptData.financials.discountAmount)}</span>
                        </div>
                      )}

                      {activeReceiptData.financials.serviceFee > 0 && (
                        <div className="flex justify-between text-slate-700">
                          <span>Phí dịch vụ:</span>
                          <span>+{formatCurrencyVND(activeReceiptData.financials.serviceFee)}</span>
                        </div>
                      )}

                      {activeReceiptData.financials.vatAmount > 0 && (
                        <div className="flex justify-between text-slate-700">
                          <span>Thuế VAT ({activeReceiptData.financials.vatPercent}%):</span>
                          <span>+{formatCurrencyVND(activeReceiptData.financials.vatAmount)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-slate-700">
                        <span>Hình thức thanh toán:</span>
                        <span className="font-bold">
                          {activeReceiptData.financials.paymentMethod === 'Cash'
                            ? 'Tiền mặt'
                            : activeReceiptData.financials.paymentMethod === 'VietQR'
                            ? 'Chuyển khoản VietQR'
                            : activeReceiptData.financials.paymentMethod === 'Card'
                            ? 'Thẻ ngân hàng'
                            : activeReceiptData.financials.paymentMethod || 'Tiền mặt'}
                        </span>
                      </div>

                      {activeReceiptData.financials.cashGiven !== undefined &&
                        activeReceiptData.financials.cashGiven > 0 && (
                          <>
                            <div className="flex justify-between text-slate-700">
                              <span>Tiền khách đưa:</span>
                              <span>{formatCurrencyVND(activeReceiptData.financials.cashGiven)}</span>
                            </div>
                            {activeReceiptData.financials.cashChange !== undefined && (
                              <div className="flex justify-between text-emerald-800 font-bold">
                                <span>Tiền thừa trả khách:</span>
                                <span>{formatCurrencyVND(activeReceiptData.financials.cashChange)}</span>
                              </div>
                            )}
                          </>
                        )}

                      {/* GRAND TOTAL */}
                      <div className="flex justify-between items-center text-sm font-black pt-2 border-t-2 border-dashed border-slate-900 text-slate-950">
                        <span>TỔNG THANH TOÁN:</span>
                        <span className="text-base font-black text-slate-950">
                          {formatCurrencyVND(activeReceiptData.financials.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* DYNAMIC VIETQR PAYMENT CODE (IF ACCOUNT CONFIGURED) */}
                    {activeReceiptData.paymentQr?.vietQrPayloadUrl && (
                      <div className="my-3 p-3 bg-slate-50 border border-slate-300 rounded-xl text-center space-y-2">
                        <span className="text-[10px] font-bold text-slate-700 block uppercase">
                          Quét mã VietQR thanh toán Napas 24/7
                        </span>
                        <div className="flex justify-center">
                          <img
                            src={activeReceiptData.paymentQr.vietQrPayloadUrl}
                            alt="VietQR Chuyển Khoản"
                            className="w-32 h-32 object-contain border border-slate-200 rounded-lg p-1 bg-white"
                          />
                        </div>
                        <div className="text-[10px] text-slate-600 font-sans space-y-0.5">
                          <p>
                            <strong>{activeReceiptData.paymentQr.bankName}</strong>
                          </p>
                          <p>
                            STK: <strong>{activeReceiptData.paymentQr.accountNo}</strong>
                          </p>
                          <p>
                            Chủ TK: <strong>{activeReceiptData.paymentQr.accountName}</strong>
                          </p>
                          {activeReceiptData.paymentQr.memo && (
                            <p className="font-mono text-[9px] text-slate-500">
                              Nội dung: <strong>{activeReceiptData.paymentQr.memo}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* FOOTER */}
                    <div className="text-center pt-2 border-t border-dashed border-slate-900 space-y-1 text-[10px] text-slate-700">
                      <p className="font-bold">{activeReceiptData.footer.thankYouMessage}</p>
                      <p className="text-[9px] text-slate-500 font-mono">
                        {activeReceiptData.footer.softwareCredit}
                      </p>
                      <div className="tracking-widest font-mono text-center pt-1 text-slate-400 text-[10px]">
                        ||| | |||| || |||||| | ||| |||| | ||
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STICKY BOTTOM ACTIONS */}
          <div
            className="flex-shrink-0 bg-[#09271d] border-t border-[#183a2e] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white text-xs hidden sm:block">
              <span>Đang xem: <strong>{selectedOrderForBill.tableName}</strong> ({selectedOrderForBill.orderCode})</span>
              <span className="ml-2 text-emerald-400 font-bold">
                · {formatCurrencyVND(activeReceiptData.financials.totalAmount)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleClosePreview}
                className="flex-1 sm:flex-initial py-2 px-4 text-xs bg-transparent text-slate-200 border-white/20 hover:bg-white/10 hover:text-white font-bold"
              >
                <X className="w-4 h-4 mr-1.5" /> Đóng
              </Button>

              <Button
                variant="primary"
                onClick={handlePrintReceipt}
                className="flex-1 sm:flex-initial py-2 px-6 text-xs font-bold shadow-lg bg-[#176044] hover:bg-[#124a36]"
              >
                <Printer className="w-4 h-4 mr-2" /> In Hóa Đơn 80mm (Trình duyệt)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
