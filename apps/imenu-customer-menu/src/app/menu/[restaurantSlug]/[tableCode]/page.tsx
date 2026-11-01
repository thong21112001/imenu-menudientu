'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  apiClient,
  storageService,
  formatCurrencyVND,
  realtimeHub,
  soundEngine,
  socketClient,
  buildReceiptData,
  downloadReceiptAsPng,
} from '@imenu/utils';
import {
  Restaurant,
  Table,
  MenuCategory,
  MenuItem,
  Order,
  SelectedOption,
  CustomerCreateOrderItemPayload,
} from '@imenu/types';
import { Button, Toast } from '@imenu/ui';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Utensils,
  PhoneCall,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Send,
  ChefHat,
  Receipt,
  QrCode,
  ShoppingBag,
  Clock,
} from 'lucide-react';

// Modular Presentation Components
import { CustomerHeader } from '../../../../components/CustomerHeader';
import { TableUtilityBar } from '../../../../components/TableUtilityBar';
import { CategoryNav } from '../../../../components/CategoryNav';
import { FoodCard } from '../../../../components/FoodCard';
import { FoodDetailDrawer } from '../../../../components/FoodDetailDrawer';
import { CartDrawer, CartItem } from '../../../../components/CartDrawer';
import { MobileFloatingCartBar } from '../../../../components/MobileFloatingCartBar';
import { CookingTrackerDrawer } from '../../../../components/CookingTrackerDrawer';
import { CallStaffModal } from '../../../../components/CallStaffModal';
import { PreBillModal } from '../../../../components/PreBillModal';
import { VietQRModal } from '../../../../components/VietQRModal';
import { PaymentSuccessModal } from '../../../../components/PaymentSuccessModal';
import { ReceiptPreviewModal } from '../../../../components/ReceiptPreviewModal';

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals & Drawers state
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

  // Active Order state
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isRequestingPayment, setIsRequestingPayment] = useState<boolean>(false);
  const [currentIdempotencyKey, setCurrentIdempotencyKey] = useState<string | null>(null);
  const [copiedWifi, setCopiedWifi] = useState<boolean>(false);

  // Receipt & Review state
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [isRenderingPng, setIsRenderingPng] = useState<boolean>(false);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewFoodRating, setReviewFoodRating] = useState<number>(5);
  const [reviewServiceRating, setReviewServiceRating] = useState<number>(5);
  const [reviewAmbianceRating, setReviewAmbianceRating] = useState<number>(5);
  const [reviewQuickTags, setReviewQuickTags] = useState<string[]>(['Món ăn ngon', 'Phục vụ chu đáo']);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Cooldown countdown effect
  useEffect(() => {
    if (callStaffCooldown <= 0) return;
    const timer = setInterval(() => {
      setCallStaffCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [callStaffCooldown]);

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
        qrToken: qrToken || undefined,
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
      // Fallback local mock if API fails
      const fallbackRest = storageService.getRestaurant();
      const fallbackTables = storageService.getTables();
      const matchedTable = fallbackTables.find((t) => t.code === tableCode);

      if (fallbackRest && matchedTable) {
        setRestaurant(fallbackRest);
        setTable(matchedTable);
        setCategories(storageService.getCategories());
        setMenuItems(storageService.getMenuItems());
      } else {
        setContextError(
          err.message || 'Mã QR không hợp lệ hoặc đã hết hạn. Vui lòng quét lại mã QR tại bàn.',
        );
      }
    } finally {
      setIsLoadingContext(false);
    }
  }, [restaurantSlug, tableCode, qrToken, branchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to Realtime Hub for instant cross-app synchronization
  useEffect(() => {
    const unsub = realtimeHub.subscribe('*', (payload: any) => {
      if (!table) return;

      const evt = payload.type as string;

      // 1. Menu item availability changed
      if (evt === 'MENU_AVAILABILITY_CHANGED' || evt === 'menu:availability_changed') {
        const changedItemId = payload.data?.menuItemId || payload.data?.id;
        const isAvailable = payload.data?.effectiveIsAvailable ?? payload.data?.isAvailable ?? false;
        if (changedItemId) {
          setMenuItems((prev) =>
            prev.map((item) =>
              item.id === changedItemId
                ? { ...item, isAvailable, effectiveIsAvailable: isAvailable }
                : item,
            ),
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

      // 2. Order & Item status updates
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

        // Authoritative re-fetch
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
        } else if (restaurantSlug && tableCode) {
          apiClient.customerOrders
            .getTableContext({ restaurantSlug, tableCode, qrToken })
            .then((res) => {
              if (res.data?.activeOrder) {
                setActiveOrder(res.data.activeOrder);
              }
            })
            .catch(() => {});
        }
        return;
      }

      // 3. Staff Call Acknowledged
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

      // 4. Table QR Updated / Revoked
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

      // 5. Socket Reconnected event
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
  }, [table, activeOrder?.id, restaurantSlug, tableCode, qrToken, showToast]);

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

  // Category dish counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: menuItems.length,
      popular: menuItems.filter((i) => i.isPopular).length,
    };
    for (const cat of categories) {
      counts[cat.id] = menuItems.filter((i) => i.categoryId === cat.id).length;
    }
    return counts;
  }, [menuItems, categories]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
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
  }, [menuItems, activeCategoryId, searchQuery]);

  // Helpers for cart items
  const getItemCartQuantity = useCallback(
    (itemId: string) => {
      return cart
        .filter((c) => c.menuItemId === itemId)
        .reduce((sum, c) => sum + c.quantity, 0);
    },
    [cart],
  );

  const handleCartQuantityChange = useCallback((idx: number, delta: number) => {
    setCart((prevCart) => {
      if (idx < 0 || idx >= prevCart.length) return prevCart;
      const item = prevCart[idx];
      if (delta < 0 && item.quantity <= 1) {
        return prevCart.filter((_, i) => i !== idx);
      }
      const unitP = item.itemTotal / item.quantity;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prevCart.filter((_, i) => i !== idx);
      }
      const updated = [...prevCart];
      updated[idx] = {
        ...item,
        quantity: newQty,
        itemTotal: unitP * newQty,
      };
      return updated;
    });
  }, []);

  const totalCartCount = useMemo(() => cart.reduce((sum, c) => sum + c.quantity, 0), [cart]);
  const totalCartAmount = useMemo(() => cart.reduce((sum, c) => sum + c.itemTotal, 0), [cart]);

  // Wifi Info
  const wifiSsid =
    (table as any)?.wifiSsid ||
    (restaurant as any)?.wifiSsid ||
    `${restaurant?.name || 'BepNha'}_Guest`;
  const wifiPassword =
    (table as any)?.wifiPassword ||
    (restaurant as any)?.wifiPassword ||
    'bepnha8888';

  const handleCopyWifi = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(wifiPassword);
      setCopiedWifi(true);
      showToast(`🔑 Đã sao chép mật khẩu Wifi: ${wifiPassword}`);
      setTimeout(() => setCopiedWifi(false), 3000);
    }
  }, [wifiPassword, showToast]);

  // Open item customization drawer
  const handleOpenItemModal = useCallback((item: MenuItem) => {
    setSelectedItemForDetail(item);
    setModalQuantity(1);
    setModalNote('');

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
  }, []);

  // Add to cart from detail drawer
  const handleAddToCart = useCallback(() => {
    if (!selectedItemForDetail) return;

    const extraPrice = modalSelectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
    const unitPrice = selectedItemForDetail.price + extraPrice;
    const itemTotal = unitPrice * modalQuantity;

    const cartKey = `${selectedItemForDetail.id}_${modalSelectedOptions
      .map((o: SelectedOption) => o.valueId)
      .sort()
      .join('_')}_${modalNote}`;

    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === cartKey);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += modalQuantity;
        updated[existingIdx].itemTotal += itemTotal;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: cartKey,
            menuItemId: selectedItemForDetail.id,
            item: selectedItemForDetail,
            quantity: modalQuantity,
            selectedOptions: modalSelectedOptions,
            note: modalNote,
            itemTotal,
          },
        ];
      }
    });

    const addedName = selectedItemForDetail.name;
    const addedQty = modalQuantity;
    setSelectedItemForDetail(null);
    showToast(`Đã thêm ${addedQty}x ${addedName} vào giỏ!`);
  }, [selectedItemForDetail, modalSelectedOptions, modalQuantity, modalNote, showToast]);

  // Quick add button (+)
  const handleQuickAdd = useCallback(
    (e: React.MouseEvent, item: MenuItem) => {
      e.stopPropagation();
      if (item.options && item.options.some((o) => o.required)) {
        handleOpenItemModal(item);
        return;
      }

      const cartKey = item.id;
      setCart((prev) => {
        const existingIdx = prev.findIndex((c) => c.id === cartKey);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx].quantity += 1;
          updated[existingIdx].itemTotal += item.price;
          return updated;
        } else {
          return [
            ...prev,
            {
              id: cartKey,
              menuItemId: item.id,
              item: item,
              quantity: 1,
              selectedOptions: [],
              note: '',
              itemTotal: item.price,
            },
          ];
        }
      });
      showToast(`Đã thêm 1x ${item.name} vào giỏ!`);
    },
    [handleOpenItemModal, showToast],
  );

  // Submit Order via Backend API
  const handleSubmitOrder = useCallback(async () => {
    if (isSubmitting || cart.length === 0 || !table || !restaurant) return;
    setIsSubmitting(true);

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
        const res = await apiClient.customerOrders.addItems(
          activeOrder.id,
          {
            restaurantSlug: restaurant?.slug || restaurantSlug,
            tableCode: table?.code || tableCode,
            qrToken: qrToken || '',
            orderId: activeOrder.id,
            items: itemsPayload,
          },
          { idempotencyKey },
        );
        resOrder = res.data!;
      } else {
        const res = await apiClient.customerOrders.create(
          {
            restaurantSlug: restaurant?.slug || restaurantSlug,
            tableCode: table?.code || tableCode,
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
      setCurrentIdempotencyKey(null);
      showToast('🎉 Đã gửi đơn thành công! Vui lòng chờ thu ngân duyệt.');
      setIsTrackerOpen(true);
    } catch (err: any) {
      console.error('Lỗi gửi đơn gọi món:', err);
      showToast(err.message || 'Không thể gửi đơn món ăn. Vui lòng nhấn gửi lại!');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, cart, table, restaurant, currentIdempotencyKey, activeOrder, restaurantSlug, tableCode, qrToken, showToast]);

  // Call Staff
  const handleSendCallStaff = useCallback(
    async (quickReason?: string) => {
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
          restaurantSlug: restaurant?.slug || restaurantSlug,
        });

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
    },
    [table, restaurant, callStaffCooldown, customCallReason, qrToken, restaurantSlug, showToast],
  );

  // Request Payment
  const handleRequestPayment = useCallback(
    async (method: 'VietQR' | 'Cash') => {
      if (isRequestingPayment || !activeOrder || !table) return;
      setIsRequestingPayment(true);
      try {
        const res = await apiClient.customerOrders.requestPayment(activeOrder.id, {
          restaurantSlug: restaurant?.slug || restaurantSlug,
          tableCode: table?.code || tableCode,
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
    },
    [isRequestingPayment, activeOrder, table, restaurantSlug, tableCode, qrToken, showToast],
  );

  // Submit Review
  const handleSubmitReview = useCallback(async () => {
    const targetOrder = activeOrder || paidSummary;
    const targetOrderId = targetOrder?._id || targetOrder?.id;
    if (!targetOrderId) {
      showToast('Không tìm thấy thông tin đơn hàng để đánh giá');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await apiClient.reviews.createCustomerReview({
        orderId: targetOrderId,
        overallRating: reviewRating,
        foodRating: reviewFoodRating,
        serviceRating: reviewServiceRating,
        ambianceRating: reviewAmbianceRating,
        quickTags: reviewQuickTags,
        comment: reviewComment,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        restaurantSlug: restaurant?.slug || restaurantSlug,
        tableCode: table?.code || tableCode,
        qrToken: qrToken || undefined,
        receiptAccessToken: targetOrder.receiptAccessToken,
      });

      if (res.data || res.success) {
        setHasReviewed(true);
        showToast('⭐ Cảm ơn bạn đã gửi đánh giá chất lượng bữa ăn!');
      } else {
        showToast(res.message || 'Không thể gửi đánh giá');
      }
    } catch (err: any) {
      showToast(err.message || 'Đã có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setIsSubmittingReview(false);
    }
  }, [activeOrder, paidSummary, reviewRating, reviewFoodRating, reviewServiceRating, reviewAmbianceRating, reviewQuickTags, reviewComment, customerName, customerPhone, restaurantSlug, tableCode, qrToken, showToast]);

  // Download Bill PNG
  const handleDownloadBillPng = useCallback(async () => {
    const targetOrder = activeOrder || paidSummary;
    const targetOrderId = targetOrder?._id || targetOrder?.id;
    if (!targetOrderId || !restaurant) {
      showToast('Không tìm thấy thông tin đơn hàng để xuất bill');
      return;
    }

    setIsRenderingPng(true);
    try {
      let receiptData: any;
      try {
        const res = await apiClient.customerOrders.downloadBill(targetOrderId, {
          restaurantSlug: restaurant?.slug || restaurantSlug,
          tableCode: table?.code || tableCode,
          qrToken: qrToken || undefined,
          receiptAccessToken: targetOrder.receiptAccessToken,
        });
        if (res.data) receiptData = res.data;
      } catch (e) {
        // Fallback to local receipt build
      }

      if (!receiptData) {
        receiptData = buildReceiptData(targetOrder, restaurant, {
          billCode: targetOrder.billCode,
          receiptType: targetOrder.isPaid || targetOrder.status === 'Paid' ? 'FINAL_BILL' : 'PRE_BILL',
        });
      }

      const dataUrl = await downloadReceiptAsPng(receiptData);
      setReceiptPreviewUrl(dataUrl);
      showToast('📸 Đã tạo ảnh hóa đơn PNG thành công!');
    } catch (err: any) {
      showToast(err.message || 'Không thể xuất ảnh hóa đơn');
    } finally {
      setIsRenderingPng(false);
    }
  }, [activeOrder, paidSummary, restaurant, restaurantSlug, tableCode, qrToken, showToast]);

  const handlePrintBill = useCallback(() => {
    window.print();
  }, []);

  // Order counts & progress
  const orderItemsList = activeOrder?.items || [];
  const validOrderItems = orderItemsList.filter((i) => i.status !== 'Cancelled');
  const readyOrServedCount = validOrderItems.filter(
    (i) => i.status === 'Ready' || i.status === 'Served',
  ).length;
  const orderProgressPercent =
    validOrderItems.length > 0
      ? Math.round((readyOrServedCount / validOrderItems.length) * 100)
      : 0;

  // Render Loading Screen
  if (isLoadingContext) {
    return (
      <div className="max-w-lg mx-auto bg-[#FAF7F0] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-[#244B3C] animate-spin mb-4" />
        <h2 className="text-base font-bold text-[#282923]">Đang nạp thực đơn bàn...</h2>
        <p className="text-xs text-[#5F6055] mt-1">
          Hệ thống đang xác thực mã QR bàn {tableCode || ''} và kết nối máy chủ
        </p>
      </div>
    );
  }

  // Render Error Screen
  if (contextError || !restaurant || !table) {
    return (
      <div className="max-w-lg mx-auto bg-[#FAF7F0] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[#282923]">Không thể tải thực đơn</h2>
        <p className="text-xs text-[#5F6055] max-w-xs mt-2 leading-relaxed">
          {contextError || 'Không xác định được bàn hoặc thông tin nhà hàng.'}
        </p>
        <Button
          variant="fnb-primary"
          onClick={() => loadData()}
          className="mt-6 flex items-center gap-2 px-6 py-2.5 text-xs font-semibold shadow-md cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#FAF7F0] min-h-screen pb-28 lg:pb-16 selection:bg-[#E9F0EC] selection:text-[#17382D]">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* ================= 1. HEADER ================= */}
      <CustomerHeader
        restaurant={restaurant}
        table={table}
        activeOrder={activeOrder}
        readyOrServedCount={readyOrServedCount}
        validOrderItemsCount={validOrderItems.length}
        onOpenCallStaff={() => setIsCallStaffOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenPreBill={() => setIsPreBillOpen(true)}
      />

      {/* ================= 2. TABLE UTILITY BAR (WIFI & ADDRESS) ================= */}
      <TableUtilityBar
        restaurant={restaurant}
        table={table}
        wifiSsid={wifiSsid}
        wifiPassword={wifiPassword}
        copiedWifi={copiedWifi}
        onCopyWifi={handleCopyWifi}
      />

      {/* ================= 3. MAIN RESPONSIVE LAYOUT (12 COLS) ================= */}
      <div className="max-w-lg sm:max-w-3xl lg:max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
          
          {/* CỘT TRÁI (8 COLS TRÊN DESKTOP): Danh mục & Lưới món ăn */}
          <div className="lg:col-span-8 space-y-4">
            {/* Category Nav & Search */}
            <CategoryNav
              categories={categories}
              activeCategoryId={activeCategoryId}
              categoryCounts={categoryCounts}
              onSelectCategory={(id: string) => setActiveCategoryId(id)}
              searchQuery={searchQuery}
              onSearchChange={(q: string) => setSearchQuery(q)}
              onClearSearch={() => setSearchQuery('')}
            />

            {/* Dishes Grid */}
            <main className="space-y-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-16 text-[#8C8D82] space-y-2 bg-white rounded-2xl border border-[#E8E4DA] p-8 shadow-xs">
                  <p className="text-sm font-medium">Không tìm thấy món ăn phù hợp</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategoryId('all');
                    }}
                    className="cursor-pointer"
                  >
                    Xem tất cả thực đơn
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filteredItems.map((item) => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      itemCartQty={getItemCartQuantity(item.id)}
                      onOpenDetail={handleOpenItemModal}
                      onQuickAdd={handleQuickAdd}
                      isHero={item.isPopular && activeCategoryId === 'all'}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>

          {/* CỘT PHẢI (4 COLS TRÊN DESKTOP, STICKY): LIVE TABLE SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-20 space-y-4">
            {/* 1. Table Info Card */}
            <div className="bg-white rounded-2xl p-4 border border-[#E8E4DA] shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E9F0EC] border border-[#C5DACF] text-[#244B3C] grid place-items-center font-bold">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-[#282923]">{table.name}</div>
                  <div className="text-xs text-[#5F6055]">{table.zoneName || 'Khu vực chung'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCallStaffOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] hover:bg-[#E9F0EC] border border-[#E8E4DA] text-[#244B3C] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#244B3C]" />
                <span>Gọi phục vụ</span>
              </button>
            </div>

            {/* 2. Live Cart Section */}
            {cart.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border-2 border-[#244B3C]/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE3]">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-[#244B3C]" />
                    <strong className="text-sm font-black text-[#282923]">Giỏ món ăn</strong>
                    <span className="px-2 py-0.5 rounded-full bg-[#E9B84C] text-[#17382D] text-xs font-black">
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
                      className="p-2.5 rounded-xl bg-[#FAF7F0] border border-[#E8E4DA] flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <strong className="text-xs font-bold text-[#282923] block truncate">
                          {c.item.name}
                        </strong>
                        {c.selectedOptions.length > 0 && (
                          <span className="text-[10px] text-[#5F6055] block truncate">
                            {c.selectedOptions.map((o) => o.valueName).join(', ')}
                          </span>
                        )}
                        {c.note && (
                          <span className="text-[10px] text-[#C2542E] italic block">
                            Ghi chú: {c.note}
                          </span>
                        )}
                        <span className="text-xs font-black text-[#244B3C] block mt-1">
                          {formatCurrencyVND(c.itemTotal)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleCartQuantityChange(idx, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-[#E8E4DA] text-[#282923] grid place-items-center hover:bg-[#F4F1EA] active:scale-95 disabled:opacity-40 cursor-pointer shadow-2xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-[#282923] w-5 text-center tabular-nums">
                          {c.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isSubmitting || !c.item.isAvailable}
                          onClick={() => handleCartQuantityChange(idx, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-[#E8E4DA] text-[#282923] grid place-items-center hover:bg-[#F4F1EA] active:scale-95 disabled:opacity-40 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & Submit Button */}
                <div className="pt-2 border-t border-[#E8E4DA] space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#5F6055]">
                    <span>Tạm tính ({totalCartCount} món):</span>
                    <span className="text-base text-[#244B3C] font-black">
                      {formatCurrencyVND(totalCartAmount)}
                    </span>
                  </div>

                  <Button
                    variant="fnb-primary"
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

            {/* 3. Live Active Order Section */}
            {activeOrder && (
              <div className="bg-white rounded-2xl p-4 border border-[#E8E4DA] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0ECE3]">
                  <div>
                    <div className="text-[11px] font-bold text-[#5F6055] uppercase tracking-wider">
                      Đơn Đang Phục Vụ
                    </div>
                    <div className="text-xs font-mono font-black text-[#282923] mt-0.5">
                      #{activeOrder.orderCode}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E9F0EC] text-[#244B3C] border border-[#C5DACF]">
                    {activeOrder.status === 'Paid' ? 'Đã thanh toán' : 'Đang phục vụ'}
                  </span>
                </div>

                {/* Cooking Progress Bar */}
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5F6055] font-semibold flex items-center gap-1.5">
                      <ChefHat className="w-3.5 h-3.5 text-[#244B3C]" />
                      Tiến độ chế biến
                    </span>
                    <span className="font-black text-[#244B3C] tabular-nums">
                      {readyOrServedCount}/{validOrderItems.length} món xong
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF7F0] rounded-full h-2 overflow-hidden my-2 border border-[#E8E4DA]">
                    <div
                      className="bg-[#10b981] h-2 rounded-full transition-all duration-500"
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
                        className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-[#FAF7F0] border border-[#E8E4DA]"
                      >
                        <div className="min-w-0 flex-1 pr-2 truncate">
                          <span className="font-bold text-[#282923]">{it.name}</span>
                          <span className="text-[#77776C] font-semibold ml-1">x{it.quantity}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isServed
                              ? 'bg-slate-200 text-slate-700'
                              : isReady
                              ? 'bg-emerald-100 text-[#17382D] animate-pulse'
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
                <div className="pt-2 border-t border-[#E8E4DA] space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-[#5F6055]">
                    <span>Tạm tính đơn:</span>
                    <span className="text-base text-[#C2542E] font-black">
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
                      className="text-xs font-bold py-2 cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Quét VietQR</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Empty State */}
            {cart.length === 0 && !activeOrder && (
              <div className="bg-white rounded-2xl p-6 border border-[#E8E4DA] shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E9F0EC] text-[#244B3C] grid place-items-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#282923]">Giỏ hàng đang trống</div>
                  <p className="text-xs text-[#5F6055] mt-1 leading-relaxed">
                    Chọn món ăn từ thực đơn bên trái để thêm vào giỏ và gửi bếp chế biến
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ================= 4. MOBILE / TABLET FLOATING CART TRIGGER ================= */}
      <MobileFloatingCartBar
        totalCartCount={totalCartCount}
        totalCartAmount={totalCartAmount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* ================= 5. SMART FIXED BOTTOM ACTION BAR ON MOBILE / TABLET ================= */}
      {totalCartCount === 0 && activeOrder && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E4DA] shadow-2xl p-2 px-3 lg:hidden">
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setIsTrackerOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#FAF7F0] hover:bg-[#E9F0EC] border border-[#E8E4DA] text-[#282923] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1 text-[#244B3C]">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs font-black tabular-nums">
                  {readyOrServedCount}/{validOrderItems.length}
                </span>
              </div>
              <span className="text-[10px] text-[#5F6055] font-medium mt-0.5 truncate max-w-full">
                Tiến độ món
              </span>
            </button>

            <button
              type="button"
              onClick={() => setIsCallStaffOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#FAF7F0] hover:bg-[#E9F0EC] border border-[#E8E4DA] text-[#244B3C] transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#244B3C]" />
              <span className="text-[10px] font-bold mt-0.5">Gọi nhân viên</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPreBillOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#244B3C] hover:bg-[#17382D] text-white shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <div className="text-[11px] font-black text-[#E9B84C] truncate max-w-full">
                {formatCurrencyVND(activeOrder.totalAmount)}
              </div>
              <span className="text-[9px] text-[#FAF7F0]/80 font-semibold uppercase tracking-wider">
                Tạm tính / Bill
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ================= 6. FOOD DETAIL DRAWER ================= */}
      <FoodDetailDrawer
        selectedItem={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        quantity={modalQuantity}
        onQuantityChange={setModalQuantity}
        selectedOptions={modalSelectedOptions}
        onOptionsChange={setModalSelectedOptions}
        note={modalNote}
        onNoteChange={setModalNote}
        onAddToCart={handleAddToCart}
      />

      {/* ================= 7. CART DRAWER ================= */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableName={table.name}
        cart={cart}
        menuItems={menuItems}
        isSubmitting={isSubmitting}
        totalCartCount={totalCartCount}
        totalCartAmount={totalCartAmount}
        onQuantityChange={handleCartQuantityChange}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* ================= 8. ORDER TRACKER DRAWER ================= */}
      <CookingTrackerDrawer
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        activeOrder={activeOrder}
        onOpenPreBill={() => setIsPreBillOpen(true)}
      />

      {/* ================= 9. PRE-BILL REVIEW MODAL ================= */}
      <PreBillModal
        isOpen={isPreBillOpen}
        onClose={() => setIsPreBillOpen(false)}
        restaurant={restaurant}
        table={table}
        activeOrder={activeOrder}
        isRenderingPng={isRenderingPng}
        onDownloadBillPng={handleDownloadBillPng}
        onPrintBill={handlePrintBill}
        isRequestingPayment={isRequestingPayment}
        onRequestPayment={handleRequestPayment}
        hasReviewed={hasReviewed}
        reviewRating={reviewRating}
        onRatingChange={setReviewRating}
        reviewQuickTags={reviewQuickTags}
        onToggleQuickTag={(tag: string) =>
          setReviewQuickTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
          )
        }
        reviewComment={reviewComment}
        onCommentChange={setReviewComment}
        isSubmittingReview={isSubmittingReview}
        onSubmitReview={handleSubmitReview}
      />

      {/* ================= 10. CALL STAFF MODAL ================= */}
      <CallStaffModal
        isOpen={isCallStaffOpen}
        onClose={() => setIsCallStaffOpen(false)}
        customReason={customCallReason}
        onCustomReasonChange={setCustomCallReason}
        isSending={isSendingCallStaff}
        cooldown={callStaffCooldown}
        onSendCallStaff={handleSendCallStaff}
      />

      {/* ================= 11. VIETQR MODAL ================= */}
      <VietQRModal
        isOpen={isVietQROpen}
        onClose={() => setIsVietQROpen(false)}
        activeOrder={activeOrder}
        restaurant={restaurant}
        effectiveBankAccount={effectiveBankAccount}
        onSwitchToCash={() => {
          setIsVietQROpen(false);
          handleRequestPayment('Cash');
        }}
        onConfirmTransferred={() => {
          setIsVietQROpen(false);
          showToast('Đang chờ thu ngân xác nhận đã nhận tiền...');
        }}
      />

      {/* ================= 12. PAYMENT SUCCESS MODAL ================= */}
      <PaymentSuccessModal
        isOpen={isPaidSuccessOpen}
        onClose={() => {
          setIsPaidSuccessOpen(false);
          setActiveOrder(null);
          setCart([]);
          loadData();
        }}
        table={table}
        paidSummary={paidSummary}
        isRenderingPng={isRenderingPng}
        onDownloadBillPng={handleDownloadBillPng}
        onPrintBill={handlePrintBill}
        hasReviewed={hasReviewed}
        reviewRating={reviewRating}
        onRatingChange={setReviewRating}
        reviewQuickTags={reviewQuickTags}
        onToggleQuickTag={(tag: string) =>
          setReviewQuickTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
          )
        }
        reviewComment={reviewComment}
        onCommentChange={setReviewComment}
        isSubmittingReview={isSubmittingReview}
        onSubmitReview={handleSubmitReview}
        onContinueOrdering={() => {
          setIsPaidSuccessOpen(false);
          setActiveOrder(null);
          setCart([]);
          loadData();
        }}
      />

      {/* ================= 13. RECEIPT PREVIEW MODAL ================= */}
      <ReceiptPreviewModal
        receiptPreviewUrl={receiptPreviewUrl}
        onClose={() => setReceiptPreviewUrl(null)}
      />

      {/* ================= 14. QR REVOKED MODAL ================= */}
      {isQrRevoked && (
        <div className="fixed inset-0 z-50 bg-[#17382D]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#282923]">Mã QR đã hết hiệu lực</h3>
              <p className="text-xs text-[#5F6055] leading-relaxed">
                Mã QR tại bàn này vừa được cập nhật hoặc thu hồi. Quý khách vui lòng quét lại mã QR mới dán trên bàn để tiếp tục sử dụng thực đơn.
              </p>
            </div>
            <Button
              variant="fnb-primary"
              className="w-full py-2.5 font-bold cursor-pointer"
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
