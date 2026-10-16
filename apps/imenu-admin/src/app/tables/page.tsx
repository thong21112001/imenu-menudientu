'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  storageService,
  formatCurrencyVND,
  realtimeHub,
  soundEngine,
  apiClient,
  generateVietQRUrl,
  resolveEffectiveBankAccount,
  buildReceiptData,
} from '@imenu/utils';
import { Table, Order, TableStatus, PaymentMethod, Restaurant } from '@imenu/types';
import { Card, Button, StatusChip, Drawer, Modal, useToast } from '@imenu/ui';
import {
  Grid3X3,
  Users,
  Plus,
  ArrowRightLeft,
  Merge,
  Split,
  Receipt,
  CheckCircle2,
  PhoneCall,
  Clock,
  X,
  ExternalLink,
  RefreshCw,
  Sparkles,
  CreditCard,
  QrCode,
  Banknote,
  Minus,
  Loader2,
  DollarSign,
  Printer,
} from 'lucide-react';

export default function TablesMapPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([
    { id: 'all', name: 'Tất cả khu vực' },
  ]);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Transfer table modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferTargetTableId, setTransferTargetTableId] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);

  // Merge tables modal state
  const [isMergeModalOpen, setIsMergeModalOpen] = useState<boolean>(false);
  const [mergeFromTableIds, setMergeFromTableIds] = useState<string[]>([]);
  const [mergeTargetTableId, setMergeTargetTableId] = useState<string>('');
  const [mergeNote, setMergeNote] = useState<string>('');
  const [isMerging, setIsMerging] = useState<boolean>(false);

  // Move items modal state
  const [isMoveItemsModalOpen, setIsMoveItemsModalOpen] = useState<boolean>(false);
  const [moveTargetTableId, setMoveTargetTableId] = useState<string>('');
  const [moveItemSelections, setMoveItemSelections] = useState<Record<string, number>>({});
  const [isMovingItems, setIsMovingItems] = useState<boolean>(false);

  // Payment Drawer Checkout State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [serviceFee, setServiceFee] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const checkoutIdempotencyKeyRef = useRef<string | null>(null);
  const [showVietQRModal, setShowVietQRModal] = useState<boolean>(false);
  const [isPreBillPreviewOpen, setIsPreBillPreviewOpen] = useState<boolean>(false);
  const [restaurant, setRestaurant] = useState<Restaurant>(storageService.getRestaurant());

  // Reset idempotency key when changing selected table
  useEffect(() => {
    checkoutIdempotencyKeyRef.current = null;
  }, [selectedTable?.id]);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const activeBranchId = storageService.getActiveBranchId();

      const [tblRes, zoneRes, ordRes] = await Promise.all([
        apiClient.tables.list({ branchId: activeBranchId || undefined }).catch(() => null),
        apiClient.tableZones.list({ branchId: activeBranchId || undefined }).catch(() => null),
        apiClient.orders
          .list({ isPaid: false, branchId: activeBranchId || undefined, limit: 100 })
          .catch(() => null),
      ]);

      // 1. Process zones
      if (zoneRes && Array.isArray(zoneRes.data) && zoneRes.data.length > 0) {
        const loadedZones = zoneRes.data.map((z: any) => ({
          id: z._id || z.id,
          name: z.name,
        }));
        setZones([{ id: 'all', name: 'Tất cả khu vực' }, ...loadedZones]);
      } else {
        setZones([{ id: 'all', name: 'Tất cả khu vực' }]);
      }

      // 2. Process tables
      if (tblRes && Array.isArray(tblRes.data) && tblRes.data.length > 0) {
        const normalizedTables: Table[] = tblRes.data.map((t: any) => ({
          ...t,
          id: t._id || t.id,
          zoneId: t.zone?._id || t.zone || t.zoneId || 'default-zone',
          zoneName: t.zone?.name || t.zoneName || 'Khu vực chung',
        }));
        setTables(normalizedTables);
      } else {
        setTables([]);
      }

      // 3. Process active orders
      if (ordRes && ordRes.data) {
        const rawOrders = Array.isArray(ordRes.data) ? ordRes.data : ordRes.data.data || [];
        const normalizedOrders: Order[] = rawOrders.map((o: any) => ({
          ...o,
          id: o._id || o.id,
          tableId: o.tableId?._id ? o.tableId._id.toString() : o.tableId ? o.tableId.toString() : '',
        }));
        setOrders(normalizedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Load tables error:', err);
      setTables([]);
      setOrders([]);
      setZones([{ id: 'all', name: 'Tất cả khu vực' }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    setRestaurant(storageService.getRestaurant());

    const handleBranchChange = () => {
      loadData(true);
      setRestaurant(storageService.getRestaurant());
    };
    window.addEventListener('imenu:branch_changed', handleBranchChange);

    const unsub = realtimeHub.subscribe('*', (payload) => {
      const evt = payload.type as string;
      const orderData = payload.data?.order || payload.data;
      const status = orderData?.status || payload.data?.status;
      const tableName = orderData?.table?.name || payload.data?.tableName || 'Bàn';

      if (
        evt === 'PAYMENT_REQUESTED' ||
        evt === 'order:payment_requested' ||
        evt === 'order.payment_requested'
      ) {
        soundEngine.playNewOrderNotification();
        const reqMethod = payload.data?.paymentMethod || orderData?.paymentMethod || 'VietQR';
        const methodLabel = reqMethod === 'VietQR' ? 'VietQR' : 'Tiền mặt';
        toast.warning(
          `🔔 Bàn ${tableName} yêu cầu thanh toán bằng ${methodLabel}!`,
          { duration: 8000 },
        );
      } else if (
        (evt === 'ORDER_STATUS_UPDATED' || evt === 'order:item_status_updated') &&
        status === 'Ready'
      ) {
        soundEngine.playItemReadyChime();
        toast.success(
          `🔔 Bếp đã nấu xong toàn bộ món cho ${tableName}! Vui lòng mang ra bàn phục vụ.`,
          { duration: 6000 },
        );
      } else if (
        (evt === 'ORDER_STATUS_UPDATED' || evt === 'order:item_status_updated') &&
        payload.data?.status === 'Ready'
      ) {
        soundEngine.playItemReadyChime();
        toast.info(
          `🍽️ Món "${payload.data?.itemName || 'Món'}" của ${tableName} đã nấu xong!`,
          { duration: 4500 },
        );
      }

      loadData(true);
    });
    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
      unsub();
    };
  }, [loadData]);

  const filteredTables = tables.filter(
    (t) => activeZone === 'all' || t.zoneId === activeZone,
  );

  // Find active order for selected table
  const selectedTableOrder = selectedTable
    ? orders.find(
        (o) =>
          (o.tableId === selectedTable.id || o.tableId === (selectedTable as any)._id) &&
          o.status !== 'Paid' &&
          o.status !== 'Cancelled',
      )
    : null;

  // Bill Calculations
  const billCalculation = useMemo(() => {
    if (!selectedTableOrder) {
      return {
        subtotal: 0,
        discount: 0,
        afterDiscount: 0,
        service: 0,
        vat: 0,
        finalAmount: 0,
        cashChange: 0,
      };
    }
    const subtotal = selectedTableOrder.totalAmount || 0;
    const discount = Math.min(subtotal, Math.max(0, discountAmount));
    const afterDiscount = Math.max(0, subtotal - discount);
    const service = Math.max(0, serviceFee);
    const vat = Math.round((afterDiscount + service) * (vatPercent / 100));
    const finalAmount = afterDiscount + service + vat;
    const cashChange = Math.max(0, cashGiven - finalAmount);

    return {
      subtotal,
      discount,
      afterDiscount,
      service,
      vat,
      finalAmount,
      cashChange,
    };
  }, [selectedTableOrder, discountAmount, serviceFee, vatPercent, cashGiven]);

  // Complete Payment for table
  const handleCompletePayment = async () => {
    if (!selectedTable || !selectedTableOrder || isProcessingPayment) return;
    setIsProcessingPayment(true);

    try {
      if (!checkoutIdempotencyKeyRef.current) {
        checkoutIdempotencyKeyRef.current = `pay-${selectedTableOrder.id}-${Date.now()}`;
      }
      const idempotencyKey = checkoutIdempotencyKeyRef.current;

      await apiClient.orders.completePayment(
        selectedTableOrder.id,
        {
          paymentMethod,
          discountAmount: billCalculation.discount,
          serviceFee: billCalculation.service,
          vatAmount: billCalculation.vat,
          vatPercent,
          amountReceived: billCalculation.finalAmount,
          cashGiven: paymentMethod === 'Cash' ? cashGiven : undefined,
          note: paymentNote,
        },
        { idempotencyKey },
      );

      // Reset idempotency key on success
      checkoutIdempotencyKeyRef.current = null;

      soundEngine.playReadyChime();
      toast.success(
        `Đã hoàn tất thanh toán ${formatCurrencyVND(billCalculation.finalAmount)} & giải phóng bàn ${selectedTable.name}!`,
      );

      setSelectedTable(null);
      setDiscountAmount(0);
      setServiceFee(0);
      setVatPercent(0);
      setCashGiven(0);
      setPaymentNote('');
      await loadData(true);
    } catch (err: any) {
      console.error('API pay error:', err);
      toast.error(err.message || 'Thanh toán thất bại. Đang làm mới dữ liệu...');
      await loadData(true);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Transfer table
  const handleTransferTable = async () => {
    if (!selectedTable || !transferTargetTableId) {
      toast.error('Vui lòng chọn bàn đích!');
      return;
    }
    setIsTransferring(true);
    try {
      await apiClient.tables.transfer({
        fromTableId: selectedTable.id,
        toTableId: transferTargetTableId,
      });
      toast.success('Chuyển bàn thành công!');
      setIsTransferModalOpen(false);
      setTransferTargetTableId('');
      setSelectedTable(null);
      await loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi chuyển bàn');
    } finally {
      setIsTransferring(false);
    }
  };

  // Merge tables
  const handleMergeTables = async () => {
    if (mergeFromTableIds.length === 0 || !mergeTargetTableId) {
      toast.error('Vui lòng chọn ít nhất 1 bàn nguồn và 1 bàn đích!');
      return;
    }
    if (mergeFromTableIds.includes(mergeTargetTableId)) {
      toast.error('Bàn đích không được trùng với các bàn nguồn cần gộp!');
      return;
    }
    setIsMerging(true);
    try {
      await apiClient.tables.merge({
        fromTableIds: mergeFromTableIds,
        targetTableId: mergeTargetTableId,
        note: mergeNote,
      });
      toast.success('Gộp bàn thành công!');
      setIsMergeModalOpen(false);
      setMergeFromTableIds([]);
      setMergeTargetTableId('');
      setMergeNote('');
      setSelectedTable(null);
      await loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Gộp bàn thất bại');
    } finally {
      setIsMerging(false);
    }
  };

  // Move items
  const handleMoveItems = async () => {
    if (!selectedTable || !moveTargetTableId) {
      toast.error('Vui lòng chọn bàn đích!');
      return;
    }
    const itemsToMove = Object.entries(moveItemSelections)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, quantity]) => ({ itemId, quantity }));

    if (itemsToMove.length === 0) {
      toast.error('Vui lòng chọn số lượng ít nhất 1 món cần chuyển!');
      return;
    }

    setIsMovingItems(true);
    try {
      await apiClient.tables.moveItems({
        fromTableId: selectedTable.id,
        toTableId: moveTargetTableId,
        items: itemsToMove,
      });
      toast.success('Chuyển món sang bàn mới thành công!');
      setIsMoveItemsModalOpen(false);
      setMoveTargetTableId('');
      setMoveItemSelections({});
      await loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Chuyển món thất bại');
    } finally {
      setIsMovingItems(false);
    }
  };

  // Seed default tables for current restaurant & active branch
  const handleSeedDefaultTables = async () => {
    try {
      const activeBranchId = storageService.getActiveBranchId();
      await apiClient.tables.seedDefault(activeBranchId || undefined);
      toast.success('Đã khởi tạo sơ đồ 12 bàn mẫu thành công!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi khởi tạo bàn');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Sơ Đồ Quản Lý Bàn</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Trực quan hóa trạng thái bàn, mở bàn, gộp bàn, chuyển món và thanh toán POS
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMergeFromTableIds([]);
              setMergeTargetTableId('');
              setMergeNote('');
              setIsMergeModalOpen(true);
            }}
            icon={<Merge className="w-4 h-4 text-[#176044]" />}
            className="text-xs font-bold"
          >
            Gộp nhiều bàn
          </Button>

          {tables.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDefaultTables}
              icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
            >
              Tạo sơ đồ mẫu
            </Button>
          )}

          {/* Legend status indicators */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bàn trống
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Đang dùng
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Chờ thanh toán
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Đã đặt
            </div>
          </div>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setActiveZone(z.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeZone === z.id
                ? 'bg-[#124a36] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {z.name}
          </button>
        ))}
      </div>

      {/* Empty State when no tables */}
      {!isLoading && tables.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Grid3X3 className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-extrabold text-slate-900">Nhà hàng chưa có bàn ăn nào</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bắt đầu thiết lập sơ đồ phục vụ bằng cách thêm từng bàn ăn hoặc khởi tạo nhanh sơ đồ 12 bàn mẫu chuẩn nhà hàng Việt.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSeedDefaultTables}
              className="bg-[#124a36] hover:bg-[#176044] text-white shadow-md text-xs font-bold"
              icon={<Sparkles className="w-4 h-4 text-emerald-300" />}
            >
              Khởi tạo sơ đồ mẫu (12 bàn)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                window.location.href = '/qr-codes';
              }}
              className="text-xs font-bold border-slate-300"
              icon={<Plus className="w-4 h-4 text-slate-600" />}
            >
              Thêm bàn & QR Code
            </Button>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      {tables.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTables.map((tbl) => {
            const isOccupied = tbl.status === 'Occupied';
            const isPayment = tbl.status === 'PaymentRequested';
            const isReserved = tbl.status === 'Reserved';

            const tblOrder = orders.find(
              (o) =>
                (o.tableId === tbl.id || o.tableId === (tbl as any)._id) &&
                o.status !== 'Paid' &&
                o.status !== 'Cancelled',
            );
            const hasReadyDish =
              tblOrder?.status === 'Ready' ||
              tblOrder?.items?.some((it) => it.status === 'Ready');

            return (
              <div
                key={tbl.id}
                onClick={() => {
                  setSelectedTable(tbl);
                  setDiscountAmount(0);
                  setServiceFee(0);
                  setVatPercent(0);
                  setCashGiven(0);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[120px] shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                  hasReadyDish
                    ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400 shadow-emerald-100'
                    : isPayment
                    ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400 animate-pulse'
                    : isOccupied
                    ? 'bg-amber-50/70 border-amber-300'
                    : isReserved
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-slate-200 hover:border-[#176044]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <strong className="text-sm font-extrabold text-slate-900 block">{tbl.name}</strong>
                    {hasReadyDish && (
                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-black animate-pulse shadow-sm">
                        <span>🍽️</span> Món đã xong
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-semibold">
                    <Users className="w-3 h-3" /> {tbl.capacity}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <StatusChip status={tbl.status} size="sm" />
                  {tblOrder && (
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {tblOrder.items?.length || 0} món
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Table Drawer */}
      <Drawer
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        title={`Chi tiết: ${selectedTable?.name || ''} · ${selectedTable?.zoneName || ''}`}
        position="right"
      >
        {selectedTable && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Trạng thái hiện tại:</span>
              <StatusChip status={selectedTable.status} />
            </div>

            {selectedTableOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Món đang phục vụ ({selectedTableOrder.items?.length || 0})</span>
                  <span className="text-slate-500 font-mono">{selectedTableOrder.orderCode}</span>
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selectedTableOrder.items?.map((it) => {
                    const isReady = it.status === 'Ready';
                    return (
                      <div
                        key={it.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                          isReady ? 'bg-emerald-50/80 border-emerald-300' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <strong className="text-slate-900 block truncate">
                            {it.quantity}x {it.name}
                          </strong>
                          {it.roundNumber && (
                            <span className="text-[10px] text-slate-400 font-mono block">
                              Lượt #{it.roundNumber}
                            </span>
                          )}
                          {it.note && <small className="text-[10px] text-amber-700 block">{it.note}</small>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              it.status === 'Ready'
                                ? 'bg-emerald-600 text-white'
                                : it.status === 'Cooking'
                                ? 'bg-orange-100 text-orange-800'
                                : it.status === 'Served'
                                ? 'bg-blue-100 text-blue-800'
                                : it.status === 'Cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {it.status === 'Ready'
                              ? '✓ Đã xong'
                              : it.status === 'Cooking'
                              ? '♨ Đang nấu'
                              : it.status === 'Served'
                              ? 'Đã phục vụ'
                              : it.status === 'Cancelled'
                              ? 'Đã hủy'
                              : 'Chờ nấu'}
                          </span>
                          {isReady && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await apiClient.kitchen.markItemServed(it.id);
                                  toast.success(`Đã phục vụ món "${it.name}"!`);
                                  loadData(true);
                                } catch (err: any) {
                                  toast.error(err.message || 'Lỗi khi phục vụ món');
                                }
                              }}
                              className="px-2 py-0.5 bg-[#176044] hover:bg-[#124a36] text-white text-[10px] font-bold rounded-lg shadow-sm"
                            >
                              Phục vụ
                            </button>
                          )}
                          <span className="font-bold text-[#176044] shrink-0">
                            {formatCurrencyVND(it.itemTotal)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bill Adjustments & Preview */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Tính toán hóa đơn</span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Giảm giá (VNĐ):</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={discountAmount || ''}
                        onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Phí dịch vụ (VNĐ):</label>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={serviceFee || ''}
                        onChange={(e) => setServiceFee(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Thuế VAT (%):</label>
                      <select
                        value={vatPercent}
                        onChange={(e) => setVatPercent(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                      >
                        <option value="0">0%</option>
                        <option value="8">8%</option>
                        <option value="10">10%</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-slate-500">Phương thức:</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                      >
                        <option value="Cash">Tiền mặt</option>
                        <option value="VietQR">VietQR</option>
                        <option value="Card">Thẻ POS</option>
                        <option value="Transfer">Chuyển khoản</option>
                      </select>
                    </div>
                  </div>

                  {paymentMethod === 'Cash' && (
                    <div className="pt-1">
                      <label className="text-[10px] font-semibold text-slate-500">Tiền khách đưa (VNĐ):</label>
                      <input
                        type="number"
                        min="0"
                        step="10000"
                        value={cashGiven || ''}
                        onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                        placeholder={String(billCalculation.finalAmount)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold text-slate-800"
                      />
                    </div>
                  )}

                  {/* Summary Breakdown */}
                  <div className="pt-2 border-t border-slate-200 space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Tạm tính:</span>
                      <span>{formatCurrencyVND(billCalculation.subtotal)}</span>
                    </div>
                    {billCalculation.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Giảm giá:</span>
                        <span>-{formatCurrencyVND(billCalculation.discount)}</span>
                      </div>
                    )}
                    {billCalculation.vat > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>VAT ({vatPercent}%):</span>
                        <span>+{formatCurrencyVND(billCalculation.vat)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-[#176044] pt-1 border-t border-slate-200">
                      <span>Tổng phải thu:</span>
                      <span>{formatCurrencyVND(billCalculation.finalAmount)}</span>
                    </div>
                    {paymentMethod === 'Cash' && cashGiven > 0 && (
                      <div className="flex justify-between font-bold text-amber-800 pt-0.5">
                        <span>Tiền thừa thối lại:</span>
                        <span>{formatCurrencyVND(billCalculation.cashChange)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operations Action Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTransferTargetTableId('');
                      setIsTransferModalOpen(true);
                    }}
                    className="text-xs"
                    icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                  >
                    Đổi bàn
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMoveTargetTableId('');
                      setMoveItemSelections({});
                      setIsMoveItemsModalOpen(true);
                    }}
                    className="text-xs"
                    icon={<Split className="w-3.5 h-3.5" />}
                  >
                    Chuyển món
                  </Button>

                  <a href={`/pos`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Thêm món
                    </Button>
                  </a>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsPreBillPreviewOpen(true)}
                  className="w-full py-2.5 text-xs font-bold border-slate-300 text-slate-800 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <Receipt className="w-4 h-4 text-[#176044]" />
                  <span>Xem & In Phiếu Tạm Tính 80mm</span>
                </Button>

                {paymentMethod === 'VietQR' && (
                  <Button
                    variant="amber"
                    onClick={() => setShowVietQRModal(true)}
                    className="w-full py-2.5 text-xs font-bold"
                  >
                    <QrCode className="w-4 h-4 mr-1.5" /> Hiển thị mã VietQR thanh toán
                  </Button>
                )}

                <Button
                  variant="primary"
                  onClick={handleCompletePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 shadow-md flex items-center justify-center gap-2 text-xs font-bold"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xử lý thanh toán...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Xác nhận Thu {formatCurrencyVND(billCalculation.finalAmount)} & Trả Bàn
                      </span>
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <p className="text-xs">Bàn đang trống, chưa có đơn hàng nào.</p>
                <div className="flex gap-2 justify-center">
                  <a href="/pos">
                    <Button variant="primary" size="sm">
                      Mở bán tại quầy POS
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Transfer Table Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Chuyển Bàn Gọi Món"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Chuyển toàn bộ món ăn và hóa đơn từ <strong>{selectedTable?.name}</strong> sang bàn trống khác:
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Chọn bàn đích (đang trống):</label>
            <select
              value={transferTargetTableId}
              onChange={(e) => setTransferTargetTableId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
            >
              <option value="">-- Chọn bàn đích --</option>
              {tables
                .filter((t) => t.id !== selectedTable?.id && t.status === 'Available')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.zoneName})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsTransferModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isTransferring}
              onClick={handleTransferTable}
            >
              {isTransferring ? 'Đang chuyển...' : 'Xác nhận chuyển'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Merge Tables Modal */}
      <Modal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        title="Gộp Nhiều Bàn Ăn"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Gộp các hóa đơn của các bàn đang phục vụ vào một bàn đích duy nhất:
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Chọn các bàn nguồn cần gộp:
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto border rounded-xl p-2 bg-slate-50">
              {tables
                .filter((t) => t.status === 'Occupied' || t.status === 'PaymentRequested')
                .map((t) => {
                  const isChecked = mergeFromTableIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white text-xs cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMergeFromTableIds([...mergeFromTableIds, t.id]);
                          } else {
                            setMergeFromTableIds(mergeFromTableIds.filter((id) => id !== t.id));
                          }
                        }}
                        className="rounded text-[#176044]"
                      />
                      <span className="font-semibold text-slate-800">{t.name}</span>
                      <span className="text-[10px] text-slate-400">({t.zoneName})</span>
                    </label>
                  );
                })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Chọn bàn đích (nhận hóa đơn gộp):
            </label>
            <select
              value={mergeTargetTableId}
              onChange={(e) => setMergeTargetTableId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
            >
              <option value="">-- Chọn bàn đích --</option>
              {tables
                .filter((t) => !mergeFromTableIds.includes(t.id))
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.zoneName}) - {t.status}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ghi chú gộp bàn:</label>
            <input
              type="text"
              value={mergeNote}
              onChange={(e) => setMergeNote(e.target.value)}
              placeholder="Ví dụ: Khách ghép 2 đoàn làm một..."
              className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsMergeModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" disabled={isMerging} onClick={handleMergeTables}>
              {isMerging ? 'Đang gộp bàn...' : 'Xác nhận gộp bàn'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Move Items Modal */}
      <Modal
        isOpen={isMoveItemsModalOpen}
        onClose={() => setIsMoveItemsModalOpen(false)}
        title={`Chuyển Món Từ ${selectedTable?.name || 'Bàn'}`}
      >
        {selectedTableOrder ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Chọn số lượng từng món ăn muốn tách chuyển sang một bàn khác:
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Chọn bàn đích:</label>
              <select
                value={moveTargetTableId}
                onChange={(e) => setMoveTargetTableId(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-xl bg-white"
              >
                <option value="">-- Chọn bàn đích --</option>
                {tables
                  .filter((t) => t.id !== selectedTable?.id)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.zoneName}) - {t.status}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {selectedTableOrder.items?.map((it) => {
                const moveQty = moveItemSelections[it.id] || 0;
                return (
                  <div
                    key={it.id}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <strong className="text-slate-900 block truncate">{it.name}</strong>
                      <span className="text-[10px] text-slate-500">
                        Tổng có: {it.quantity} phần · {formatCurrencyVND(it.price)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setMoveItemSelections({
                            ...moveItemSelections,
                            [it.id]: Math.max(0, moveQty - 1),
                          })
                        }
                        className="w-6 h-6 rounded bg-white border text-slate-700 flex items-center justify-center font-bold"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-slate-800">{moveQty}</span>
                      <button
                        onClick={() =>
                          setMoveItemSelections({
                            ...moveItemSelections,
                            [it.id]: Math.min(it.quantity, moveQty + 1),
                          })
                        }
                        className="w-6 h-6 rounded bg-white border text-slate-700 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsMoveItemsModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isMovingItems}
                onClick={handleMoveItems}
              >
                {isMovingItems ? 'Đang chuyển món...' : 'Xác nhận chuyển món'}
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* VietQR Modal */}
      {showVietQRModal && selectedTableOrder && (() => {
        const activeBranchId = storageService.getActiveBranchId();
        const activeBranch =
          restaurant?.branches?.find((b: any) => b.id === activeBranchId || b._id === activeBranchId) ||
          restaurant?.branches?.[0];
        const bankAcc = resolveEffectiveBankAccount(restaurant, activeBranch);

        return (
          <Modal
            isOpen={true}
            onClose={() => setShowVietQRModal(false)}
            title="Quét Mã VietQR Napas 24/7"
            subtitle={`${selectedTable?.name} · Số tiền: ${formatCurrencyVND(billCalculation.finalAmount)}`}
          >
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <img
                  src={generateVietQRUrl({
                    bankId: bankAcc?.bankId || 'MB',
                    accountNo: bankAcc?.accountNo || '0901234567',
                    accountName: bankAcc?.accountName || restaurant?.name || 'IMENU RESTAURANT',
                    amount: billCalculation.finalAmount,
                    memo: `IMENU ${(selectedTableOrder.orderCode || '').replace(/[^a-zA-Z0-9-]/g, '')}`,
                    template: 'compact2',
                  })}
                  alt="VietQR Payment"
                  className="w-56 h-auto rounded-lg shadow-sm"
                />
                <div className="mt-3 text-xs space-y-1">
                  <strong className="text-sm text-[#176044] block">
                    {formatCurrencyVND(billCalculation.finalAmount)}
                  </strong>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Nội dung: IMENU {selectedTableOrder.orderCode}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {bankAcc?.bankName || 'Ngân hàng thụ hưởng'} - STK: {bankAcc?.accountNo || ''}
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowVietQRModal(false)}
                className="w-full"
              >
                Đóng cửa sổ mã QR
              </Button>
            </div>
          </Modal>
        );
      })()}

      {/* 80mm Pre-Bill Modal */}
      {isPreBillPreviewOpen && selectedTableOrder && (() => {
        const activeBranchId = storageService.getActiveBranchId();
        const activeBranch =
          restaurant?.branches?.find((b: any) => b.id === activeBranchId || b._id === activeBranchId) ||
          restaurant?.branches?.[0];
        const receipt = buildReceiptData(selectedTableOrder, restaurant, {
          branch: activeBranch,
          cashierName: storageService.getCurrentUser()?.fullName || 'Thu ngân',
          receiptType: 'PRE_BILL',
          paymentMethod,
          cashGiven,
          cashChange: billCalculation.cashChange,
        });

        return (
          <Modal
            isOpen={true}
            onClose={() => setIsPreBillPreviewOpen(false)}
            title="Phiếu Tạm Tính Hóa Đơn 80mm"
            subtitle={`${selectedTable?.name} · Mã đơn: ${selectedTableOrder.orderCode}`}
          >
            <div className="space-y-4">
              <div
                id="thermal-print-area"
                className="bg-white p-4 border border-slate-300 rounded-lg shadow-inner font-mono text-xs max-h-[60vh] overflow-y-auto space-y-2 text-slate-900"
              >
                <div className="text-center pb-2 border-b border-dashed border-slate-800 space-y-0.5">
                  <h4 className="font-bold text-sm uppercase">{receipt.header.restaurantName}</h4>
                  {receipt.header.branchName && <p className="text-[10px]">CN: {receipt.header.branchName}</p>}
                  {receipt.header.address && <p className="text-[10px] text-slate-600">{receipt.header.address}</p>}
                  {receipt.header.hotline && <p className="text-[10px] text-slate-600">Hotline: {receipt.header.hotline}</p>}
                </div>

                <div className="text-center py-1">
                  <strong className="block font-sans text-xs uppercase font-extrabold text-slate-950">
                    PHIẾU TẠM TÍNH TIỀN
                  </strong>
                  <div className="flex justify-between text-[10px] text-slate-600 pt-1">
                    <span>Bàn: <strong>{receipt.metadata.tableName}</strong></span>
                    <span>Đơn: <strong>{receipt.metadata.orderCode}</strong></span>
                  </div>
                </div>

                <div className="border-t border-b border-dashed border-slate-800 py-1 space-y-1">
                  {receipt.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-start text-[11px]">
                      <div className="w-1/2 pr-1">
                        <span className="font-bold block leading-tight">{it.name}</span>
                        {it.selectedOptionsNote && (
                          <span className="text-[9px] text-slate-500 block leading-tight">+ {it.selectedOptionsNote}</span>
                        )}
                      </div>
                      <span className="w-1/6 text-center font-bold">{it.quantity}</span>
                      <span className="w-1/3 text-right font-bold">{formatCurrencyVND(it.amount)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-xs pt-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính:</span>
                    <span>{formatCurrencyVND(receipt.financials.subTotal)}</span>
                  </div>
                  {receipt.financials.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrencyVND(receipt.financials.discountAmount)}</span>
                    </div>
                  )}
                  {receipt.financials.vatAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>VAT ({receipt.financials.vatPercent}%):</span>
                      <span>+{formatCurrencyVND(receipt.financials.vatAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm border-t border-dashed border-slate-800 pt-1 text-slate-950">
                    <span>TỔNG CỘNG:</span>
                    <span>{formatCurrencyVND(receipt.financials.totalAmount)}</span>
                  </div>
                </div>

                {receipt.paymentQr?.vietQrPayloadUrl && (
                  <div className="text-center pt-2 border-t border-dashed border-slate-300">
                    <p className="text-[10px] font-bold text-slate-700 mb-1">Quét mã VietQR chuyển khoản:</p>
                    <img
                      src={receipt.paymentQr.vietQrPayloadUrl}
                      alt="VietQR"
                      className="w-28 h-28 mx-auto border p-1 rounded bg-white"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsPreBillPreviewOpen(false)}>
                  Đóng
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.print()}
                  icon={<Printer className="w-4 h-4 mr-1" />}
                >
                  In Phiếu Tạm Tính 80mm
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
