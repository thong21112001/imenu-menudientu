'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  apiClient,
  storageService,
  formatCurrencyVND,
  generateVietQRUrl,
  realtimeHub,
  soundEngine,
  socketClient,
} from '@imenu/utils';
import {
  Restaurant,
  Table,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  SelectedOption,
  CustomerCreateOrderItemPayload,
} from '@imenu/types';
import {
  Logo,
  Button,
  Modal,
  Drawer,
  StatusChip,
  Toast,
  Badge,
} from '@imenu/ui';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Bell,
  Clock,
  Receipt,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  X,
  ChevronRight,
  Send,
  CreditCard,
  QrCode,
  Flame,
  AlertCircle,
  RefreshCw,
  Loader2,
  Hourglass,
  Wifi,
  Copy,
  Check,
  Store,
  Utensils,
  ChefHat,
  Trash2,
  ShoppingCart,
} from 'lucide-react';

export default function CustomerTableMenuPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantSlug = (params?.restaurantSlug as string) || '';
  const tableCode = (params?.tableCode as string) || '';
  const branchId = searchParams.get('branch') || undefined;
  const qrToken = searchParams.get('t') || undefined;

  // Context loading & error state
  const [isLoadingContext, setIsLoadingContext] = useState<boolean>(true);
  const [contextError, setContextError] = useState<string | null>(null);

  // Entities
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  interface CartItem {
    id: string; // generated unique key for variant
    menuItemId: string;
    item: MenuItem;
    quantity: number;
    selectedOptions: SelectedOption[];
    note: string;
    itemTotal: number;
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals state
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalSelectedOptions, setModalSelectedOptions] = useState<SelectedOption[]>([]);
  const [modalNote, setModalNote] = useState<string>('');

  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [isPreBillOpen, setIsPreBillOpen] = useState<boolean>(false);
  const [isCallStaffOpen, setIsCallStaffOpen] = useState<boolean>(false);
  const [customCallReason, setCustomCallReason] = useState<string>('');
  const [isSendingCallStaff, setIsSendingCallStaff] = useState<boolean>(false);
  const [callStaffCooldown, setCallStaffCooldown] = useState<number>(0);
  const [isQrRevoked, setIsQrRevoked] = useState<boolean>(false);
  const [isVietQROpen, setIsVietQROpen] = useState<boolean>(false);
  const [isPaidSuccessOpen, setIsPaidSuccessOpen] = useState<boolean>(false);
  const [paidSummary, setPaidSummary] = useState<any>(null);
  const [effectiveBankAccount, setEffectiveBankAccount] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedWifi, setCopiedWifi] = useState<boolean>(false);

  // Active orders for this table
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRequestingPayment, setIsRequestingPayment] = useState<boolean>(false);

  // Logical idempotency key: maintained across retries of the same cart submission attempt
  const [currentIdempotencyKey, setCurrentIdempotencyKey] = useState<string | null>(null);

  // 15s Cooldown counter for Call Staff action
  useEffect(() => {
    if (callStaffCooldown <= 0) return;
    const timer = setInterval(() => {
      setCallStaffCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [callStaffCooldown]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load verified context from backend API
  const loadData = useCallback(async () => {
    if (!restaurantSlug || !tableCode) {
      setContextError('Thiếu mã định danh nhà hàng hoặc bàn.');
      setIsLoadingContext(false);
      return;
    }

    try {
      setIsLoadingContext(true);
      setContextError(null);

      const ctxRes = await apiClient.customerOrders.getTableContext({
        restaurantSlug,
        tableCode,
        qrToken,
      });

      if (!ctxRes?.data?.restaurant || !ctxRes?.data?.table) {
        setContextError('Không tìm thấy thông tin bàn hoặc nhà hàng từ mã QR.');
        setIsLoadingContext(false);
        return;
      }

      const ctx = ctxRes.data;
      setRestaurant(ctx.restaurant as any);
      setTable(ctx.table as any);
      if (ctx.bankAccount || (ctx.restaurant as any)?.bankAccount) {
        setEffectiveBankAccount(ctx.bankAccount || (ctx.restaurant as any).bankAccount);
      }
      if (ctx.activeOrder) {
        setActiveOrder(ctx.activeOrder);
      } else {
        setActiveOrder(null);
      }

      // Fetch public categories and menu items using real restaurant ID
      const restId = (ctx.restaurant as any).id || (ctx.restaurant as any)._id;
      const targetBranchId = ctx.table.branchId || branchId;

      // Realtime Pairing: Join table room and restaurant room via WebSocket
      socketClient.connect(restId, targetBranchId, ctx.table.id);
      socketClient.joinTable(ctx.table.id, restId);

      const [catRes, itemRes] = await Promise.all([
        apiClient.categories.listPublic({
          restaurantId: restId,
          branchId: targetBranchId,
        }),
        apiClient.menuItems.listPublic({
          restaurantId: restId,
          branchId: targetBranchId,
        }),
      ]);

      setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data as any)?.categories || []);
      const rawItems = itemRes.data;
      const itemsList = Array.isArray(rawItems) ? rawItems : (rawItems as any)?.items || [];
      setMenuItems(itemsList);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu QR bàn:', err);
      setContextError(
        err.message || 'Mã QR không hợp lệ hoặc đã hết hạn. Vui lòng quét lại mã QR tại bàn.'
      );
    } finally {
      setIsLoadingContext(false);
    }
  }, [restaurantSlug, tableCode, qrToken, branchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to Realtime Hub for instant cross-app synchronization
  useEffect(() => {
    const unsub = realtimeHub.subscribe('*', (payload) => {
      if (!table) return;

      const evt = payload.type as string;

      // 1. Menu item availability changed (Bếp bấm "Báo hết món" hoặc "Mở bán lại")
      if (evt === 'MENU_AVAILABILITY_CHANGED' || evt === 'menu:availability_changed') {
        const changedItemId = payload.data?.menuItemId || payload.data?.id;
        const isAvailable = payload.data?.effectiveIsAvailable ?? payload.data?.isAvailable ?? false;
        if (changedItemId) {
          setMenuItems((prev) =>
            prev.map((item) =>
              item.id === changedItemId
                ? { ...item, isAvailable, effectiveIsAvailable: isAvailable }
                : item
            )
          );
          if (!isAvailable) {
            setCart((currentCart) => {
              const inCart = currentCart.find((c) => c.menuItemId === changedItemId);
              if (inCart) {
                showToast(`⚠️ Món "${inCart.item.name}" trong giỏ vừa hết hàng tại Bếp!`);
              }
              return currentCart;
            });
          }
        }
        return;
      }

      // 2. Order & Item status updates (KDS nấu món, duyệt đơn, hủy món)
      const orderEvents = [
        'ORDER_STATUS_UPDATED',
        'order:item_status_updated',
        'ORDER_CONFIRMED',
        'order:confirmed',
        'ROUND_CONFIRMED',
        'order:round_confirmed',
        'ROUND_CANCELLED',
        'order:round_cancelled',
        'ITEM_CANCELLED',
        'order:item_cancelled',
        'ORDER_CANCELLED',
        'order:cancelled',
        'ROUND_ADDED',
        'order:round_added',
        'PAYMENT_REQUESTED',
        'order:payment_requested',
        'PAYMENT_COMPLETED',
        'order:payment_completed',
        'order:updated',
      ];

      if (orderEvents.includes(evt)) {
        // Immediate optimistic update if payload contains order data matching current table
        const incomingOrder = payload.data?.order || (payload.data?.orderCode ? payload.data : null);
        const incomingTableId =
          incomingOrder?.tableId?._id || incomingOrder?.tableId || payload.data?.tableId;

        if (
          incomingOrder &&
          (incomingOrder.id === activeOrder?.id ||
            incomingOrder._id === activeOrder?.id ||
            incomingTableId === table.id ||
            incomingTableId === (table as any)._id)
        ) {
          setActiveOrder(incomingOrder);
        }

        // Notification sound & message
        if (evt === 'PAYMENT_COMPLETED' || evt === 'order:payment_completed' || incomingOrder?.status === 'Paid') {
          soundEngine.playRoundNotification();
          showToast('✅ Đơn hàng đã được thanh toán thành công — Cảm ơn quý khách!');
          setIsPreBillOpen(false);
          setIsVietQROpen(false);
          const billInfo = payload.data?.bill;
          setPaidSummary({
            orderCode: incomingOrder?.orderCode || activeOrder?.orderCode || '',
            billCode: billInfo?.billCode || '',
            finalAmount: billInfo?.finalAmount ?? incomingOrder?.finalAmount ?? incomingOrder?.totalAmount ?? 0,
            paymentMethod: billInfo?.paymentMethod || incomingOrder?.paymentMethod || 'Cash',
            paidAt: billInfo?.paidAt || new Date().toISOString(),
          });
          setIsPaidSuccessOpen(true);
        } else if (payload.data?.status === 'Ready') {
          soundEngine.playItemReadyChime();
          showToast('🍽️ Món ăn của bàn bạn đã được Bếp nấu xong!');
        } else if (evt === 'ORDER_CONFIRMED' || evt === 'order:confirmed') {
          showToast('🎉 Đơn gọi món đã được Thu ngân duyệt vào Bếp!');
        } else if (evt === 'ROUND_CONFIRMED' || evt === 'order:round_confirmed') {
          showToast('🎉 Lượt gọi món mới đã được duyệt vào Bếp!');
        } else if (evt === 'ROUND_CANCELLED' || evt === 'order:round_cancelled') {
          showToast('⚠️ Một lượt gọi món đã bị từ chối');
        } else if (evt === 'ITEM_CANCELLED' || evt === 'order:item_cancelled') {
          showToast('⚠️ Món ăn đã được Bếp hủy');
        }

        // Fallback API re-fetch for authoritative consistency
        if (activeOrder?.id) {
          apiClient.customerOrders
            .getActiveOrder(activeOrder.id)
            .then((res) => {
              if (res.data) {
                setActiveOrder(res.data);
                if (res.data.status === 'Paid') {
                  setIsPreBillOpen(false);
                  setIsVietQROpen(false);
                  setIsPaidSuccessOpen(true);
                }
              }
            })
            .catch(() => {});
        } else if (table.id) {
          apiClient.orders
            .getByTable(table.id)
            .then((res) => {
              if (res.data) setActiveOrder(res.data);
            })
            .catch(() => {});
        }
        return;
      }

      // 3. Staff Call Acknowledged (Nhân viên tiếp nhận yêu cầu hỗ trợ)
      if (evt === 'CALL_STAFF_ACKNOWLEDGED' || evt === 'table:call_acknowledged') {
        const ackTableId =
          payload.data?.tableId ||
          payload.data?.table?._id ||
          payload.data?.table?.id;
        if (ackTableId === table.id || ackTableId === (table as any)._id) {
          soundEngine.playSuccessChime();
          const responderName = payload.data?.responder?.name ? ` bởi ${payload.data.responder.name}` : '';
          showToast(`👨‍🍳 Nhân viên đã tiếp nhận yêu cầu${responderName} và đang tới bàn của bạn!`);
        }
        return;
      }

      // 4. Table QR Updated / Revoked (Đổi hoặc thu hồi mã QR bàn)
      if (evt === 'TABLE_QR_UPDATED' || evt === 'table:qr_updated') {
        const updatedTableId = payload.data?.tableId || payload.data?.id;
        if (updatedTableId === table.id || updatedTableId === (table as any)._id) {
          if (payload.data?.qrStatus === 'revoked') {
            setIsQrRevoked(true);
            showToast('⚠️ Mã QR của bàn đã bị thu hồi hoặc đổi mới. Vui lòng quét lại mã QR tại bàn!');
          }
        }
        return;
      }

      // 5. Socket Reconnected event -> resync active order
      if (evt === 'SOCKET_RECONNECTED') {
        if (activeOrder?.id) {
          apiClient.customerOrders
            .getActiveOrder(activeOrder.id)
            .then((res) => {
              if (res.data) setActiveOrder(res.data);
            })
            .catch(() => {});
        }
        return;
      }
    });

    return () => unsub();
  }, [table, activeOrder?.id]);

  // 8-second Polling Fallback if activeOrder is pending/cooking
  useEffect(() => {
    if (!activeOrder?.id) return;
    const isPending = activeOrder.status !== 'Paid' && activeOrder.status !== 'Cancelled';
    if (!isPending) return;

    const interval = setInterval(() => {
      apiClient.customerOrders
        .getActiveOrder(activeOrder.id)
        .then((res) => {
          if (res.data) {
            setActiveOrder(res.data);
          }
        })
        .catch(() => {});
    }, 8000);

    return () => clearInterval(interval);
  }, [activeOrder?.id, activeOrder?.status]);

  // Counts per category & quick filter
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      all: menuItems.length,
      popular: menuItems.filter((i) => i.isPopular).length,
    };
    for (const cat of categories) {
      counts[cat.id] = menuItems.filter((i) => i.categoryId === cat.id).length;
    }
    return counts;
  }, [menuItems, categories]);

  // Filter items (supporting 'all', 'popular', and specific categoryId)
  const filteredItems = menuItems.filter((item) => {
    let matchesCategory = true;
    if (activeCategoryId === 'all') {
      matchesCategory = true;
    } else if (activeCategoryId === 'popular') {
      matchesCategory = !!item.isPopular;
    } else {
      matchesCategory = item.categoryId === activeCategoryId;
    }
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Helpers for cart items and quantities
  const getItemCartQuantity = (itemId: string) => {
    return cart
      .filter((c) => c.menuItemId === itemId)
      .reduce((sum, c) => sum + c.quantity, 0);
  };

  const handleCartQuantityChange = (idx: number, delta: number) => {
    if (idx < 0 || idx >= cart.length) return;
    const item = cart[idx];
    if (delta < 0 && item.quantity <= 1) {
      setCart(cart.filter((_, i) => i !== idx));
      return;
    }
    const unitP = item.itemTotal / item.quantity;
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== idx));
      return;
    }
    const updated = [...cart];
    updated[idx] = {
      ...item,
      quantity: newQty,
      itemTotal: unitP * newQty,
    };
    setCart(updated);
  };

  const wifiSsid =
    (table as any)?.wifiSsid ||
    (restaurant as any)?.wifiSsid ||
    `${restaurant?.name || 'BepNha'}_Guest`;
  const wifiPassword =
    (table as any)?.wifiPassword ||
    (restaurant as any)?.wifiPassword ||
    'bepnha8888';

  const handleCopyWifi = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(wifiPassword);
      setCopiedWifi(true);
      showToast(`🔑 Đã sao chép mật khẩu Wifi: ${wifiPassword}`);
      setTimeout(() => setCopiedWifi(false), 3000);
    }
  };

  const orderItemsList = activeOrder?.items || [];
  const validOrderItems = orderItemsList.filter((i) => i.status !== 'Cancelled');
  const readyOrServedCount = validOrderItems.filter(
    (i) => i.status === 'Ready' || i.status === 'Served',
  ).length;
  const orderProgressPercent =
    validOrderItems.length > 0
      ? Math.round((readyOrServedCount / validOrderItems.length) * 100)
      : 0;

  // Open item customization modal
  const handleOpenItemModal = (item: MenuItem) => {
    setSelectedItemForDetail(item);
    setModalQuantity(1);
    setModalNote('');

    // Preselect default required options
    const defaults: SelectedOption[] = [];
    if (item.options) {
      item.options.forEach((grp) => {
        if (grp.required && grp.values.length > 0) {
          defaults.push({
            groupId: grp.id,
            groupName: grp.name,
            valueId: grp.values[0].id,
            valueName: grp.values[0].name,
            priceDelta: grp.values[0].priceDelta,
          });
        }
      });
    }
    setModalSelectedOptions(defaults);
  };

  // Add to cart from modal
  const handleAddToCart = () => {
    if (!selectedItemForDetail) return;

    const extraPrice = modalSelectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
    const unitPrice = selectedItemForDetail.price + extraPrice;
    const itemTotal = unitPrice * modalQuantity;

    const cartKey = `${selectedItemForDetail.id}_${modalSelectedOptions
      .map((o) => o.valueId)
      .sort()
      .join('_')}_${modalNote}`;

    const existingIdx = cart.findIndex((c) => c.id === cartKey);
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += modalQuantity;
      updated[existingIdx].itemTotal += itemTotal;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: cartKey,
          menuItemId: selectedItemForDetail.id,
          item: selectedItemForDetail,
          quantity: modalQuantity,
          selectedOptions: modalSelectedOptions,
          note: modalNote,
          itemTotal,
        },
      ]);
    }

    setSelectedItemForDetail(null);
    showToast(`Đã thêm ${modalQuantity}x ${selectedItemForDetail.name} vào giỏ!`);
  };

  // Quick add button (+) for items without required options
  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    if (item.options && item.options.some((o) => o.required)) {
      handleOpenItemModal(item);
      return;
    }

    const cartKey = item.id;
    const existingIdx = cart.findIndex((c) => c.id === cartKey);
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      updated[existingIdx].itemTotal += item.price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: cartKey,
          menuItemId: item.id,
          item: item,
          quantity: 1,
          selectedOptions: [],
          note: '',
          itemTotal: item.price,
        },
      ]);
    }
    showToast(`Đã thêm 1x ${item.name} vào giỏ!`);
  };

  // Cart total calculations
  const totalCartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalCartAmount = cart.reduce((sum, c) => sum + c.itemTotal, 0);

  // Submit Order via Backend API with Idempotency Key
  const handleSubmitOrder = async () => {
    if (isSubmitting || cart.length === 0 || !table || !restaurant) return;
    setIsSubmitting(true);

    // Reuse key on retry, or generate new logical key for a fresh submission
    const idempotencyKey =
      currentIdempotencyKey ||
      `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setCurrentIdempotencyKey(idempotencyKey);

    const itemsPayload: CustomerCreateOrderItemPayload[] = cart.map((c) => ({
      menuItemId: c.menuItemId,
      quantity: c.quantity,
      selectedOptions: c.selectedOptions,
      note: c.note,
    }));

    try {
      soundEngine.playNewOrderChime();
      let resOrder: Order;

      if (activeOrder) {
        // Calling addItems on existing order (Subsequent Round)
        const res = await apiClient.customerOrders.addItems(
          activeOrder.id,
          {
            restaurantSlug,
            tableCode,
            qrToken: qrToken || '',
            orderId: activeOrder.id,
            items: itemsPayload,
          },
          { idempotencyKey },
        );
        resOrder = res.data!;
      } else {
        // Calling create for Round 1
        const res = await apiClient.customerOrders.create(
          {
            restaurantSlug,
            tableCode,
            qrToken: qrToken || '',
            items: itemsPayload,
          },
          { idempotencyKey },
        );
        resOrder = res.data!;
      }

      setActiveOrder(resOrder);
      setCart([]);
      setIsCartOpen(false);
      setCurrentIdempotencyKey(null); // Reset key upon verified success
      showToast('🎉 Đã gửi đơn thành công! Vui lòng chờ thu ngân duyệt.');
      setIsTrackerOpen(true);
    } catch (err: any) {
      console.error('Lỗi gửi đơn gọi món:', err);
      showToast(err.message || 'Không thể gửi đơn món ăn. Vui lòng nhấn gửi lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Call Staff action
  const handleSendCallStaff = async (quickReason?: string) => {
    if (!table || !restaurant) return;
    if (callStaffCooldown > 0) {
      showToast(`⏳ Vui lòng chờ ${callStaffCooldown}s trước khi gửi tiếp.`);
      return;
    }

    const finalReason = quickReason || customCallReason.trim() || 'Cần nhân viên hỗ trợ';
    const note = customCallReason.trim() && quickReason ? customCallReason.trim() : (customCallReason.trim() ? customCallReason.trim() : undefined);

    setIsSendingCallStaff(true);
    try {
      await apiClient.customerOrders.callStaff(table.id, {
        reason: finalReason,
        note,
        qrToken: qrToken || undefined,
        restaurantSlug,
      });

      // Local RealtimeHub publish for immediate cross-tab sync fallback
      realtimeHub.publish(
        'CALL_STAFF',
        {
          tableId: table.id,
          tableName: table.name,
          reason: finalReason,
          note,
          timestamp: Date.now(),
        },
        restaurant.id,
      );

      setCustomCallReason('');
      setIsCallStaffOpen(false);
      setCallStaffCooldown(15);
      showToast(`🔔 Đã gửi yêu cầu "${finalReason}" đến nhân viên!`);
    } catch (err: any) {
      console.error('Lỗi gọi nhân viên:', err);
      showToast(err.message || 'Không thể gửi yêu cầu hỗ trợ. Vui lòng thử lại!');
    } finally {
      setIsSendingCallStaff(false);
    }
  };

  // Request payment action
  const handleRequestPayment = async (method: 'VietQR' | 'Cash') => {
    if (isRequestingPayment || !activeOrder || !table) return;
    setIsRequestingPayment(true);
    try {
      const res = await apiClient.customerOrders.requestPayment(activeOrder.id, {
        restaurantSlug,
        tableCode,
        qrToken: qrToken || '',
        paymentMethod: method,
      });
      if (res.data) {
        setActiveOrder(res.data);
      }
      setIsPreBillOpen(false);
      if (method === 'VietQR') {
        setIsVietQROpen(true);
      } else {
        showToast('💵 Đã báo thu ngân mang hóa đơn & tiền thừa tới bàn!');
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể gửi yêu cầu thanh toán lúc này.');
    } finally {
      setIsRequestingPayment(false);
    }
  };

  // Render Loading Screen
  if (isLoadingContext) {
    return (
      <div className="max-w-lg mx-auto bg-[#f7f5ef] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-[#176044] animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-800">Đang nạp thực đơn bàn...</h2>
        <p className="text-xs text-slate-500 mt-1">
          Hệ thống đang xác thực mã QR bàn {tableCode || ''} và kết nối máy chủ
        </p>
      </div>
    );
  }

  // Render Error Screen (QR Invalid / Network down)
  if (contextError || !restaurant || !table) {
    return (
      <div className="max-w-lg mx-auto bg-[#f7f5ef] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Không thể tải thực đơn</h2>
        <p className="text-xs text-slate-600 max-w-xs mt-2 leading-relaxed">
          {contextError || 'Không xác định được bàn hoặc thông tin nhà hàng.'}
        </p>
        <Button
          variant="primary"
          onClick={() => loadData()}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 text-xs font-semibold shadow-md"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#f7f5ef] min-h-screen pb-28 lg:pb-16 selection:bg-emerald-200 selection:text-emerald-900">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-[#09271d] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo light size="sm" />
            <div className="border-l border-white/20 pl-2.5">
              <strong className="text-xs sm:text-sm font-bold block leading-tight">{restaurant.name}</strong>
              <small className="text-[10px] text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đang mở cửa
              </small>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{table.name}</span>
              {table.zoneName && (
                <span className="text-[10px] text-emerald-200 hidden sm:inline">({table.zoneName})</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsCallStaffOpen(true)}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Gọi nhân viên phục vụ"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold hidden sm:inline">Gọi nhân viên</span>
            </button>
          </div>
        </div>

        {/* Quick actions strip if active order exists (on Mobile / Tablet only) */}
        {activeOrder && (
          <div className="bg-[#124a36] px-4 py-2 border-t border-white/10 lg:hidden">
            <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setIsTrackerOpen(true)}
                className="flex items-center gap-1.5 text-amber-300 font-semibold cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Tiến độ món ({readyOrServedCount}/{validOrderItems.length} món)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsPreBillOpen(true)}
                className="px-2.5 py-0.5 rounded-md bg-[#eab867] text-[#17211d] font-bold text-[11px] shadow-xs cursor-pointer hover:bg-amber-400 transition-colors"
              >
                Tạm tính: {formatCurrencyVND(activeOrder.totalAmount)}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ================= DẢI TIỆN ÍCH NHÀ HÀNG & WIFI TẠI BÀN ================= */}
      <div className="bg-white/95 border-b border-[#e4e8e5] px-4 py-2 text-xs backdrop-blur-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Restaurant Address & Status */}
          <div className="flex items-center gap-2 text-slate-600">
            <Store className="w-3.5 h-3.5 text-[#176044] shrink-0" />
            <span className="text-xs truncate max-w-[200px] sm:max-w-none">
              {restaurant?.address || 'Phục vụ tại bàn'} • Mở cửa 08:00 - 22:30
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đang kết nối
            </span>
          </div>

          {/* Wifi Info with 1-click copy */}
          <div className="flex items-center gap-2 bg-[#f0f8f3] px-2.5 py-1 rounded-xl border border-emerald-200/80 text-slate-700">
            <Wifi className="w-3.5 h-3.5 text-[#176044] shrink-0" />
            <span className="text-[11px] font-medium">
              Wifi: <strong className="font-bold text-slate-900">{wifiSsid}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500">
              MK: <code className="font-mono font-bold text-slate-900">{wifiPassword}</code>
            </span>
            <button
              type="button"
              onClick={handleCopyWifi}
              className="text-[10px] font-bold text-[#176044] hover:text-emerald-900 bg-white hover:bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-300 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
              title="Sao chép mật khẩu Wifi"
            >
              {copiedWifi ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#176044]" />
                  <span>Chép MK</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= BỐ CỤC CHÍNH ĐA MÀN HÌNH (RESPONSIVE 12 COLS) ================= */}
      <div className="max-w-lg sm:max-w-3xl lg:max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          
          {/* CỘT TRÁI (8 cols trên Desktop): Tìm kiếm, Bộ lọc & Lưới món ăn */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search & Categories Bar */}
            <div className="sticky top-[53px] z-30 bg-[#f7f5ef] pt-1 pb-3 space-y-2.5 border-b border-[#e4e8e5]/80 backdrop-blur-md">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm món ngon, đồ uống..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#176044]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Filter Pills & Categories with Dish Counts */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 items-center">
                <button
                  type="button"
                  onClick={() => setActiveCategoryId('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryId === 'all'
                      ? 'bg-[#124a36] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>🔥 Tất cả món</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeCategoryId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {categoryCounts.all || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategoryId('popular')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeCategoryId === 'popular'
                      ? 'bg-[#124a36] text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>⭐ Bán chạy</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeCategoryId === 'popular' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {categoryCounts.popular || 0}
                  </span>
                </button>

                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeCategoryId === cat.id
                        ? 'bg-[#124a36] text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.icon || '🍽️'}</span>
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeCategoryId === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {categoryCounts[cat.id] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dishes Grid: 1 col on Mobile, 2 cols on Tablet & Desktop */}
            <main className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
                  <p className="text-sm">Không tìm thấy món ăn phù hợp</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategoryId('all');
                    }}
                  >
                    Xem tất cả thực đơn
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredItems.map((item) => {
                    const itemCartQty = getItemCartQuantity(item.id);

                    return (
                      <div
                        key={item.id}
                        onClick={() => item.isAvailable && handleOpenItemModal(item)}
                        className={`p-3 bg-white rounded-2xl border border-[#e4e8e5] shadow-xs flex gap-3.5 transition-all relative ${
                          item.isAvailable
                            ? 'hover:border-[#cbdad3] hover:shadow-md active:scale-[0.99] cursor-pointer'
                            : 'opacity-60 grayscale cursor-not-allowed'
                        }`}
                      >
                        {/* Dish Photo */}
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={item.imageUrl || '/placeholder-food.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {item.isPopular && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                              <Flame className="w-2.5 h-2.5" /> Hot
                            </span>
                          )}
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                              Hết món
                            </div>
                          )}
                          {/* Cart Quantity Badge on Photo */}
                          {itemCartQty > 0 && (
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-[#124a36] text-amber-300 border border-white/40 text-[9px] font-black flex items-center gap-1 shadow-md">
                              <CheckCircle2 className="w-2.5 h-2.5 text-amber-300" />
                              Đang chọn: {itemCartQty}
                            </span>
                          )}
                        </div>

                        {/* Dish Content */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 truncate">{item.name}</h3>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-extrabold text-[#176044]">
                                {formatCurrencyVND(item.price)}
                              </span>
                              {item.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  {formatCurrencyVND(item.originalPrice)}
                                </span>
                              )}
                            </div>

                            {item.isAvailable && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickAdd(e, item)}
                                className="w-7 h-7 rounded-lg bg-[#124a36] hover:bg-[#176044] text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform cursor-pointer"
                                title="Thêm nhanh vào giỏ"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>

          {/* CỘT PHẢI (4 cols trên Desktop, sticky): LIVE TABLE SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20 space-y-4">
            {/* 1. Table Info Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#176044] grid place-items-center font-bold">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{table.name}</div>
                  <div className="text-xs text-slate-500">{table.zoneName || 'Khu vực chung'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCallStaffOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                <span>Gọi phục vụ</span>
              </button>
            </div>

            {/* 2. Live Cart Section (when cart has items) */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/30 shadow-md space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#176044]" />
                    <strong className="text-sm font-black text-slate-900">Giỏ món ăn</strong>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black">
                      {totalCartCount}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa hết</span>
                  </button>
                </div>

                {/* Cart Items list */}
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {cart.map((c, idx) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <strong className="text-xs font-bold text-slate-900 block truncate">
                          {c.item.name}
                        </strong>
                        {c.selectedOptions.length > 0 && (
                          <span className="text-[10px] text-slate-500 block">
                            {c.selectedOptions.map((o) => o.valueName).join(', ')}
                          </span>
                        )}
                        {c.note && (
                          <span className="text-[10px] text-amber-700 italic block">
                            Ghi chú: {c.note}
                          </span>
                        )}
                        <span className="text-xs font-extrabold text-[#176044] block mt-1">
                          {formatCurrencyVND(c.itemTotal)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleCartQuantityChange(idx, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 grid place-items-center hover:bg-slate-100 active:scale-95 disabled:opacity-40 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-slate-800 w-5 text-center">
                          {c.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isSubmitting || !c.item.isAvailable}
                          onClick={() => handleCartQuantityChange(idx, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 grid place-items-center hover:bg-slate-100 active:scale-95 disabled:opacity-40 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & Submit Button */}
                <div className="pt-2 border-t border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Tạm tính ({totalCartCount} món):</span>
                    <span className="text-base text-[#176044] font-black">
                      {formatCurrencyVND(totalCartAmount)}
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    onClick={handleSubmitOrder}
                    disabled={
                      isSubmitting ||
                      cart.some((c) => menuItems.find((m) => m.id === c.menuItemId)?.isAvailable === false)
                    }
                    className="w-full py-3 text-sm font-black shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang gửi Bếp...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Bếp Gọi Món ({totalCartCount})</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 3. Live Active Order Section (when activeOrder exists) */}
            {activeOrder && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Đơn Đang Phục Vụ
                    </div>
                    <div className="text-xs font-mono font-black text-slate-900 mt-0.5">
                      #{activeOrder.orderCode}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {activeOrder.status === 'Paid' ? 'Đã thanh toán' : 'Đang phục vụ'}
                  </span>
                </div>

                {/* Cooking Progress Bar */}
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                      <ChefHat className="w-3.5 h-3.5 text-[#176044]" />
                      Tiến độ chế biến
                    </span>
                    <span className="font-black text-[#176044]">
                      {readyOrServedCount}/{validOrderItems.length} món xong
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden my-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${orderProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Preview of active items */}
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {validOrderItems.map((it, idx) => {
                    const isCooking = it.status === 'Cooking';
                    const isReady = it.status === 'Ready';
                    const isServed = it.status === 'Served';

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="min-w-0 flex-1 pr-2 truncate">
                          <span className="font-bold text-slate-800">{it.name}</span>
                          <span className="text-slate-400 font-semibold ml-1">x{it.quantity}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isServed
                              ? 'bg-slate-200 text-slate-700'
                              : isReady
                              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                              : isCooking
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isServed
                            ? 'Đã phục vụ'
                            : isReady
                            ? '🍽️ Sẵn sàng'
                            : isCooking
                            ? '🔥 Đang nấu'
                            : 'Chờ bếp'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Total & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Tạm tính đơn:</span>
                    <span className="text-base text-amber-600 font-black">
                      {formatCurrencyVND(activeOrder.totalAmount)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsPreBillOpen(true)}
                      className="text-xs font-bold py-2 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Xem tạm tính</span>
                    </Button>
                    <Button
                      variant="amber"
                      size="sm"
                      onClick={() => setIsVietQROpen(true)}
                      className="text-xs font-bold py-2 cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Quét VietQR</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Empty State when both cart and activeOrder are empty */}
            {cart.length === 0 && !activeOrder && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#176044] grid place-items-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">Giỏ hàng đang trống</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Chọn món ăn từ thực đơn bên trái để thêm vào giỏ và gửi bếp chế biến
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ================= FLOATING CART BOTTOM DRAWER TRIGGER (MOBILE / TABLET ONLY) ================= */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-slideUp lg:hidden">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#124a36] hover:bg-[#176044] text-white rounded-2xl p-3.5 px-5 shadow-2xl flex items-center justify-between font-bold border-2 border-amber-300 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 grid place-items-center text-xs font-black">
                {totalCartCount}
              </div>
              <div className="text-left">
                <div className="text-xs text-amber-200">Giỏ món ăn</div>
                <div className="text-sm leading-tight">{formatCurrencyVND(totalCartAmount)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-300">
              <span>Xem giỏ & Gửi món</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* ================= SMART FIXED BOTTOM ACTION BAR ON MOBILE / TABLET ================= */}
      {totalCartCount === 0 && activeOrder && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl p-2 px-3 lg:hidden">
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setIsTrackerOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[#176044]">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs font-black">
                  {readyOrServedCount}/{validOrderItems.length}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-full">
                Tiến độ món
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsCallStaffOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold mt-0.5">Gọi nhân viên</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreBillOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#124a36] hover:bg-[#176044] text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <div className="text-[11px] font-black text-amber-300 truncate max-w-full">
                {formatCurrencyVND(activeOrder.totalAmount)}
              </div>
              <span className="text-[9px] text-emerald-200 font-semibold uppercase tracking-wider">
                Tạm tính / Bill
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ================= ITEM OPTIONS DETAIL MODAL ================= */}
      <Modal
        isOpen={!!selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        title={selectedItemForDetail?.name || 'Chi tiết món'}
        subtitle={
          selectedItemForDetail
            ? `Giá gốc: ${formatCurrencyVND(selectedItemForDetail.price)}`
            : undefined
        }
      >
        {selectedItemForDetail && (
          <div className="space-y-4">
            {/* Options Groups */}
            {selectedItemForDetail.options?.map((grp) => (
              <div key={grp.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {grp.name}{' '}
                    {grp.required && <span className="text-rose-500 font-semibold">*</span>}
                  </span>
                  {grp.required && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">
                      Bắt buộc
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {grp.values.map((val) => {
                    const isSelected = modalSelectedOptions.some(
                      (o) => o.groupId === grp.id && o.valueId === val.id,
                    );
                    return (
                      <button
                        type="button"
                        key={val.id}
                        onClick={() => {
                          if (grp.required) {
                            setModalSelectedOptions([
                              ...modalSelectedOptions.filter((o) => o.groupId !== grp.id),
                              {
                                groupId: grp.id,
                                groupName: grp.name,
                                valueId: val.id,
                                valueName: val.name,
                                priceDelta: val.priceDelta,
                              },
                            ]);
                          } else {
                            if (isSelected) {
                              setModalSelectedOptions(
                                modalSelectedOptions.filter((o) => o.valueId !== val.id),
                              );
                            } else {
                              setModalSelectedOptions([
                                ...modalSelectedOptions,
                                {
                                  groupId: grp.id,
                                  groupName: grp.name,
                                  valueId: val.id,
                                  valueName: val.name,
                                  priceDelta: val.priceDelta,
                                },
                              ]);
                            }
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#edf6f1] border-[#176044] text-[#176044] font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{val.name}</span>
                        {val.priceDelta > 0 && (
                          <span className="text-slate-500">
                            +{formatCurrencyVND(val.priceDelta)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Note input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800">Ghi chú cho bếp:</label>
              <input
                type="text"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="Ví dụ: Ít đá, không hành, cay vừa..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176044]"
              />
            </div>

            {/* Quantity Stepper & Add Button */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="primary"
                onClick={handleAddToCart}
                className="flex-1 py-3"
              >
                Thêm vào giỏ ·{' '}
                {formatCurrencyVND(
                  (selectedItemForDetail.price +
                    modalSelectedOptions.reduce((s, o) => s + o.priceDelta, 0)) *
                    modalQuantity,
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= CART DRAWER ================= */}
      <Drawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title={`Giỏ hàng · ${table.name}`}
        position="bottom"
      >
        <div className="space-y-4">
          {/* Out-of-stock warning banner in cart */}
          {cart.some((c) => {
            const currentItem = menuItems.find((m) => m.id === c.menuItemId);
            return currentItem && currentItem.isAvailable === false;
          }) && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Trong giỏ có món vừa hết hàng tại Bếp. Vui lòng xóa món hết hàng trước khi gửi đơn!</span>
            </div>
          )}

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {cart.map((item, idx) => {
              const isItemOutOfStock =
                menuItems.find((m) => m.id === item.menuItemId)?.isAvailable === false ||
                item.item.isAvailable === false;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border flex items-start justify-between gap-3 ${
                    isItemOutOfStock
                      ? 'bg-rose-50/60 border-rose-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800">{item.item.name}</h4>
                      {isItemOutOfStock && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-sm">
                          Hết món tại Bếp
                        </span>
                      )}
                    </div>
                    {item.selectedOptions.length > 0 && (
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {item.selectedOptions.map((o) => o.valueName).join(', ')}
                      </div>
                    )}
                    {item.note && (
                      <div className="text-[10px] text-amber-700 mt-0.5 italic">
                        Ghi chú: {item.note}
                      </div>
                    )}
                    <span className="text-xs font-bold text-[#176044] mt-1 block">
                      {formatCurrencyVND(item.itemTotal)}
                    </span>
                  </div>

                  {/* Quantity Control */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isSubmitting}
                      onClick={() => {
                        if (item.quantity === 1) {
                          setCart(cart.filter((_, i) => i !== idx));
                        } else {
                          const updated = [...cart];
                          updated[idx].quantity -= 1;
                          updated[idx].itemTotal -= item.itemTotal / item.quantity;
                          setCart(updated);
                        }
                      }}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      disabled={isSubmitting || isItemOutOfStock}
                      onClick={() => {
                        const updated = [...cart];
                        const unitP = item.itemTotal / item.quantity;
                        updated[idx].quantity += 1;
                        updated[idx].itemTotal += unitP;
                        setCart(updated);
                      }}
                      className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Tổng tiền ({totalCartCount} món):</span>
              <span className="text-lg text-[#176044]">{formatCurrencyVND(totalCartAmount)}</span>
            </div>

            <Button
              variant="primary"
              onClick={handleSubmitOrder}
              disabled={
                isSubmitting ||
                cart.some((c) => menuItems.find((m) => m.id === c.menuItemId)?.isAvailable === false)
              }
              className="w-full py-3.5 text-base shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi gọi món...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gửi gọi món tới Bếp ngay</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* ================= ORDER TRACKER DRAWER ================= */}
      <Drawer
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        title="Theo dõi tiến độ chế biến"
        position="bottom"
      >
        {activeOrder ? (() => {
          const validItems = activeOrder.items?.filter((it) => it.status !== 'Cancelled') || [];
          const totalValid = validItems.length;
          const scoreWeight: Record<string, number> = {
            WaitingConfirmation: 10,
            Waiting: 25,
            Cooking: 60,
            Ready: 90,
            Served: 100,
          };
          const progressPercent =
            totalValid > 0
              ? Math.min(
                  100,
                  Math.round(
                    validItems.reduce((sum, it) => sum + (scoreWeight[it.status] || 25), 0) /
                      totalValid,
                  ),
                )
              : 0;

          const readyOrServedCount = validItems.filter(
            (it) => it.status === 'Ready' || it.status === 'Served',
          ).length;

          return (
            <div className="space-y-5">
              {/* Progress Summary Card */}
              <div className="p-4 rounded-2xl bg-[#edf6f1] border border-[#d9ece3] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#176044]" /> Tiến độ hoàn thành:
                  </span>
                  <span className="text-sm font-black text-[#176044]">{progressPercent}%</span>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-emerald-200/80 p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-[#176044] to-emerald-500 transition-all duration-700 shadow-sm"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>
                    Đã xong / Phục vụ: <strong className="text-slate-900">{readyOrServedCount}</strong>/{totalValid} món
                  </span>
                  <StatusChip status={activeOrder.status} size="sm" />
                </div>
              </div>

              {/* Dishes List with Distinct Stages */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 tracking-wider">
                  <span>Chi tiết món ăn ({activeOrder.items?.length || 0})</span>
                  <span className="font-mono text-[10px] text-slate-400">Mã đơn: {activeOrder.orderCode}</span>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {activeOrder.items?.map((it) => {
                    const isWaitingConf =
                      it.status === 'WaitingConfirmation' ||
                      activeOrder.status === 'WaitingConfirmation';
                    const isWaitingKitchen = it.status === 'Waiting' && !isWaitingConf;
                    const isCooking = it.status === 'Cooking';
                    const isReady = it.status === 'Ready';
                    const isServed = it.status === 'Served';
                    const isCancelled = it.status === 'Cancelled';

                    return (
                      <div
                        key={it.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isReady
                            ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/40'
                            : isCooking
                            ? 'bg-orange-50/50 border-orange-200'
                            : isCancelled
                            ? 'bg-slate-50 border-slate-200 opacity-60'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <strong className="text-xs font-bold text-slate-900 block truncate">
                            {it.quantity}x {it.name}
                          </strong>
                          {it.roundNumber && (
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Lượt #{it.roundNumber}
                            </span>
                          )}
                          {it.selectedOptions && it.selectedOptions.length > 0 && (
                            <span className="text-[10px] text-slate-500 block truncate">
                              {it.selectedOptions.map((o) => o.valueName).join(', ')}
                            </span>
                          )}
                          {it.note && (
                            <span className="text-[10px] text-amber-700 block italic">
                              Ghi chú: {it.note}
                            </span>
                          )}
                          {isCancelled && (it as any).cancelReason && (
                            <span className="text-[10px] text-rose-600 block">
                              Lý do hủy: {(it as any).cancelReason}
                            </span>
                          )}
                        </div>

                        {/* Distinct Status Badges */}
                        <div className="shrink-0">
                          {isWaitingConf ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse flex items-center gap-1 shadow-sm">
                              <Hourglass className="w-3 h-3 text-amber-700" /> Chờ xác nhận
                            </span>
                          ) : isWaitingKitchen ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" /> Chờ bếp nấu
                            </span>
                          ) : isCooking ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 animate-pulse flex items-center gap-1 shadow-sm">
                              <Flame className="w-3 h-3 text-orange-600" /> Đang chế biến ♨
                            </span>
                          ) : isReady ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#176044] border border-emerald-300 flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã xong ✓
                            </span>
                          ) : isServed ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                              ✓ Đã phục vụ
                            </span>
                          ) : isCancelled ? (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              ✕ Đã hủy
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                              {it.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTrackerOpen(false);
                    setIsPreBillOpen(true);
                  }}
                  className="flex-1 py-3 text-xs font-bold"
                >
                  <Receipt className="w-4 h-4 mr-1.5" /> Phiếu tạm tính
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsTrackerOpen(false)}
                  className="flex-1 py-3 text-xs font-bold"
                >
                  Gọi thêm món
                </Button>
              </div>
            </div>
          );
        })() : (
          <div className="text-center py-8 text-slate-500 text-xs">
            Bàn hiện chưa có đơn gọi món nào.
          </div>
        )}
      </Drawer>

      {/* ================= PRE-BILL REVIEW MODAL ================= */}
      <Modal
        isOpen={isPreBillOpen}
        onClose={() => setIsPreBillOpen(false)}
        title="Phiếu tạm tính hóa đơn"
        subtitle={`${restaurant.name} · ${table.name}`}
      >
        {activeOrder ? (() => {
          const validItems = activeOrder.items?.filter((it) => it.status !== 'Cancelled') || [];
          const subTotal = activeOrder.subTotal ?? validItems.reduce((sum, it) => sum + (it.itemTotal || 0), 0);
          const discount = activeOrder.discountAmount || 0;
          const serviceFee = activeOrder.serviceFee || 0;
          const vat = activeOrder.vatAmount || 0;
          const total = activeOrder.totalAmount;

          return (
            <div className="space-y-4">
              <div className="p-4 bg-[#fff9ed] border border-[#f0dbb5] rounded-2xl space-y-3 font-mono text-xs">
                <div className="text-center pb-3 border-b border-dashed border-[#dbc89f]">
                  <strong className="text-sm font-sans block text-slate-900">{restaurant.name}</strong>
                  <span className="text-[11px] text-slate-600">
                    {table.name} · {activeOrder.orderCode}
                  </span>
                </div>

                <div className="space-y-2 py-1">
                  {validItems.length > 0 ? (
                    validItems.map((it) => (
                      <div key={it.id || it._id} className="border-b border-[#f3e6cf] pb-1.5 last:border-b-0">
                        <div className="flex justify-between items-start text-[11px]">
                          <span className="text-slate-800 font-semibold">
                            {it.quantity}x {it.name}
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatCurrencyVND(it.itemTotal)}
                          </span>
                        </div>
                        {it.selectedOptions && it.selectedOptions.length > 0 && (
                          <div className="text-[10px] text-slate-500 pl-4 mt-0.5">
                            {it.selectedOptions.map((opt) => opt.valueName || opt.groupName).join(', ')}
                          </div>
                        )}
                        {it.note && (
                          <div className="text-[10px] text-amber-700 italic pl-4 mt-0.5">
                            Ghi chú: {it.note}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 text-xs py-2">
                      Không có món hợp lệ nào
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-dashed border-[#dbc89f] space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính món:</span>
                    <span>{formatCurrencyVND(subTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Giảm giá / Ưu đãi:</span>
                      <span>-{formatCurrencyVND(discount)}</span>
                    </div>
                  )}
                  {serviceFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Phí dịch vụ:</span>
                      <span>+{formatCurrencyVND(serviceFee)}</span>
                    </div>
                  )}
                  {vat > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Thuế VAT:</span>
                      <span>+{formatCurrencyVND(vat)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center text-sm font-bold font-sans">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-base text-[#176044]">
                    {formatCurrencyVND(total)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => handleRequestPayment('Cash')}
                  disabled={isRequestingPayment}
                  className="py-3"
                >
                  💵 Tiền mặt
                </Button>
                <Button
                  variant="amber"
                  onClick={() => handleRequestPayment('VietQR')}
                  disabled={isRequestingPayment}
                  className="py-3"
                >
                  <QrCode className="w-4 h-4 mr-1.5" /> Quét VietQR
                </Button>
              </div>
            </div>
          );
        })() : null}
      </Modal>

      {/* ================= CALL STAFF MODAL ================= */}
      <Modal
        isOpen={isCallStaffOpen}
        onClose={() => setIsCallStaffOpen(false)}
        title="Gọi nhân viên phục vụ"
        subtitle="Chọn yêu cầu nhanh hoặc nhập nội dung cần hỗ trợ"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            {[
              'Xin thêm đá lạnh',
              'Xin thêm nước lọc / Trà đá',
              'Xin thêm chén dĩa / Đũa muỗng',
              'Cần lau dọn bàn',
              'Cần gọi nhân viên tư vấn',
            ].map((reason) => (
              <button
                key={reason}
                disabled={isSendingCallStaff || callStaffCooldown > 0}
                onClick={() => handleSendCallStaff(reason)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-[#edf6f1] border border-slate-200 hover:border-[#176044] text-xs font-semibold text-slate-800 hover:text-[#176044] text-left transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{reason}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="text-xs font-semibold text-slate-700">Yêu cầu khác hoặc ghi chú chi tiết:</label>
            <input
              type="text"
              value={customCallReason}
              onChange={(e) => setCustomCallReason(e.target.value)}
              placeholder="VD: Cần ghế trẻ em, thêm tương ớt..."
              maxLength={200}
              disabled={isSendingCallStaff || callStaffCooldown > 0}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#176044] transition-colors"
            />
            <Button
              variant="primary"
              className="w-full py-2.5"
              disabled={isSendingCallStaff || callStaffCooldown > 0 || !customCallReason.trim()}
              onClick={() => handleSendCallStaff()}
            >
              {isSendingCallStaff ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang gửi yêu cầu...</span>
                </div>
              ) : callStaffCooldown > 0 ? (
                `Vui lòng chờ (${callStaffCooldown}s)`
              ) : (
                'Gửi yêu cầu hỗ trợ'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= VIETQR MODAL ================= */}
      <Modal
        isOpen={isVietQROpen}
        onClose={() => setIsVietQROpen(false)}
        title="Thanh toán VietQR Napas 24/7"
        subtitle="Mở app ngân hàng bất kỳ để quét mã thanh toán chính xác"
      >
        {activeOrder && (() => {
          const bank = effectiveBankAccount || restaurant.bankAccount;
          const bankId = bank?.bankId || 'MB';
          const accountNo = bank?.accountNo || '';
          const accountName = bank?.accountName || restaurant.name || 'NHA HANG';
          const memo = `IMENU ${activeOrder.orderCode}`;

          if (!accountNo) {
            return (
              <div className="text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Chưa cấu hình tài khoản ngân hàng</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nhà hàng chưa cập nhật số tài khoản nhận tiền chuyển khoản. Quý khách vui lòng chọn thanh toán bằng Tiền mặt hoặc gọi nhân viên phục vụ hỗ trợ.
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsVietQROpen(false);
                    handleRequestPayment('Cash');
                  }}
                  className="w-full"
                >
                  Đổi sang Thanh toán Tiền mặt
                </Button>
              </div>
            );
          }

          const qrUrl = generateVietQRUrl({
            bankId,
            accountNo,
            accountName,
            amount: activeOrder.totalAmount,
            memo,
          });

          return (
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <img
                  src={qrUrl}
                  alt="VietQR Payment"
                  className="w-56 h-auto rounded-lg shadow-sm"
                />
                <div className="mt-3 text-xs space-y-1 w-full max-w-xs text-left bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Ngân hàng:</span>
                    <span className="font-bold text-slate-900">{bankId}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Số tài khoản:</span>
                    <span className="font-mono font-bold text-slate-900">{accountNo}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Chủ tài khoản:</span>
                    <span className="font-semibold text-slate-900">{accountName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Nội dung CK:</span>
                    <span className="font-mono font-bold text-[#176044]">{memo}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                    <span>Số tiền:</span>
                    <span className="text-base text-[#176044]">{formatCurrencyVND(activeOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Sau khi chuyển khoản thành công, hệ thống thu ngân sẽ tự động xác nhận đơn hàng tại bàn của bạn.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsVietQROpen(false)}
                  className="w-full"
                >
                  Đóng
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsVietQROpen(false);
                    showToast('Đang chờ thu ngân xác nhận đã nhận tiền...');
                  }}
                  className="w-full"
                >
                  Đã chuyển khoản
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ================= PAYMENT COMPLETED SUCCESS MODAL ================= */}
      <Modal
        isOpen={isPaidSuccessOpen}
        onClose={() => {
          setIsPaidSuccessOpen(false);
          setActiveOrder(null);
          setCart([]);
          loadData();
        }}
        title="Thanh toán thành công"
        subtitle="Hóa đơn đã được hoàn tất"
      >
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Cảm ơn quý khách!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Đơn hàng tại bàn {table?.name || ''} đã được thu ngân xác nhận thanh toán thành công.
            </p>
          </div>

          {paidSummary && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left font-mono text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Mã đơn:</span>
                <span className="font-bold text-slate-800">{paidSummary.orderCode}</span>
              </div>
              {paidSummary.billCode && (
                <div className="flex justify-between text-slate-600">
                  <span>Mã hóa đơn:</span>
                  <span className="font-bold text-slate-800">{paidSummary.billCode}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Phương thức:</span>
                <span className="font-semibold text-slate-800">
                  {paidSummary.paymentMethod === 'VietQR' ? 'Chuyển khoản VietQR' : paidSummary.paymentMethod === 'Card' ? 'Thẻ' : 'Tiền mặt'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold font-sans">
                <span>Đã thanh toán:</span>
                <span className="text-emerald-700 text-base">
                  {formatCurrencyVND(paidSummary.finalAmount)}
                </span>
              </div>
            </div>
          )}

          <Button
            variant="primary"
            onClick={() => {
              setIsPaidSuccessOpen(false);
              setActiveOrder(null);
              setCart([]);
              loadData();
            }}
            className="w-full py-3"
          >
            Tiếp tục gọi món mới / Đóng
          </Button>
        </div>
      </Modal>

      {/* ================= QR REVOKED MODAL ================= */}
      {isQrRevoked && (
        <div className="fixed inset-0 z-50 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Mã QR đã hết hiệu lực</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mã QR tại bàn này vừa được cập nhật hoặc thu hồi. Quý khách vui lòng quét lại mã QR mới dán trên bàn để tiếp tục sử dụng thực đơn.
              </p>
            </div>
            <Button
              variant="primary"
              className="w-full py-2.5"
              onClick={() => window.location.reload()}
            >
              Quét lại / Tải lại trang
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
