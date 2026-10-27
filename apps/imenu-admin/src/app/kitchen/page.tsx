'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  storageService,
  formatTime,
  formatCurrencyVND,
  realtimeHub,
  soundEngine,
  apiClient,
  socketClient,
  matchVietnameseSearch,
} from '@imenu/utils';
import {
  Order,
  OrderItem,
  KitchenItemsSummaryItem,
  KitchenItemsSummaryResponse,
} from '@imenu/types';
import { Card, Button, StatusChip, Badge, Drawer, useToast } from '@imenu/ui';
import {
  ChefHat,
  Flame,
  Check,
  Clock,
  Volume2,
  RefreshCw,
  Search,
  AlertTriangle,
  Layers,
  UtensilsCrossed,
  AlertCircle,
  X,
  PackageX,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  CheckCheck,
  Hourglass,
  BellRing,
  TableProperties,
} from 'lucide-react';

export default function KitchenDisplaySystemPage() {
  const { toast } = useToast();

  // Data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [summaryData, setSummaryData] = useState<KitchenItemsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [now, setNow] = useState<number>(Date.now());

  // UI / View states
  const [viewMode, setViewMode] = useState<'tickets' | 'summary'>('tickets');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Waiting' | 'Cooking' | 'Ready'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isActionInProgress, setIsActionInProgress] = useState<Record<string, boolean>>({});

  // Stockout (86) Drawer state
  const [isStockoutOpen, setIsStockoutOpen] = useState<boolean>(false);
  const [stockoutItems, setStockoutItems] = useState<any[]>([]);
  const [isLoadingStockout, setIsLoadingStockout] = useState<boolean>(false);
  const [stockoutSearch, setStockoutSearch] = useState<string>('');

  // User & Permission states
  const [user, setUser] = useState<any>(null);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUser(storageService.getCurrentUser());
      setActiveBranchId(storageService.getActiveBranchId());
    }
  }, []);

  const perms = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return storageService.getPermissions() || [];
  }, []);

  const canStockOut = useMemo(() => {
    if (!user) return true; // Default allow if user loaded or role admin
    return (
      user?.role === 'SUPER_ADMIN' ||
      user?.role === 'RESTAURANT_ADMIN' ||
      user?.role === 'RESTAURANT_MANAGER' ||
      perms.includes('perm-kds-out') ||
      perms.includes('perm-menu-status')
    );
  }, [user, perms]);

  // SLA Aging ticker every 15s to re-evaluate minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active kitchen orders
  const loadOrders = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const branchId = storageService.getActiveBranchId() || undefined;
        const res = await apiClient.kitchen.getOrders({
          branchId,
          includeUnconfirmed: true,
        }).catch((err) => {
          console.warn('apiClient.kitchen.getOrders error:', err);
          return null;
        });

        if (res && res.data) {
          const raw = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
          setOrders(raw);
        } else {
          setOrders([]);
        }

        // Also fetch items summary for the second view
        const sumRes = await apiClient.kitchen.getItemsSummary({ branchId }).catch(() => null);
        if (sumRes && sumRes.data) {
          setSummaryData(sumRes.data);
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu màn hình bếp:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Load menu items for stockout (86) drawer
  const loadStockoutItems = useCallback(async () => {
    setIsLoadingStockout(true);
    try {
      const branchId = storageService.getActiveBranchId() || undefined;
      const res = await apiClient.kitchen.getMenuItems({ branchId });
      const raw = res?.data?.items || res?.data || [];
      setStockoutItems(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Lỗi tải thực đơn báo hết món:', err);
    } finally {
      setIsLoadingStockout(false);
    }
  }, []);

  const isStockoutOpenRef = React.useRef(isStockoutOpen);
  useEffect(() => {
    isStockoutOpenRef.current = isStockoutOpen;
  }, [isStockoutOpen]);

  useEffect(() => {
    loadOrders();

    const handleBranchChange = () => {
      const newBranchId = storageService.getActiveBranchId();
      setActiveBranchId(newBranchId);
      const rest = storageService.getRestaurant();
      const restId = (rest as any)?.id || (rest as any)?._id;
      if (restId) {
        socketClient.switchBranch(restId, newBranchId);
      }
      loadOrders(true);
    };
    window.addEventListener('imenu:branch_changed', handleBranchChange);

    // Lắng nghe các sự kiện WebSocket đích danh từ Backend
    const unsub = realtimeHub.subscribe('*', (payload) => {
      const pType = payload?.type;
      if (
        pType === 'NEW_ORDER' ||
        pType === 'order:created' ||
        pType === 'ROUND_CONFIRMED' ||
        pType === 'order:round_confirmed' ||
        pType === 'ORDER_CONFIRMED' ||
        pType === 'order:confirmed'
      ) {
        soundEngine.playNewOrderChime();
        loadOrders(true);
      } else if (
        pType === 'ORDER_STATUS_UPDATED' ||
        pType === 'order:item_status_updated' ||
        pType === 'ROUND_CANCELLED' ||
        pType === 'order:round_cancelled' ||
        pType === 'ORDER_CANCELLED' ||
        pType === 'order:cancelled' ||
        pType === 'ITEM_CANCELLED' ||
        pType === 'order:item_cancelled' ||
        pType === 'PAYMENT_COMPLETED' ||
        pType === 'order:payment_completed'
      ) {
        loadOrders(true);
      } else if (
        pType === 'MENU_AVAILABILITY_CHANGED' ||
        pType === 'menu:availability_changed'
      ) {
        loadOrders(true);
        if (isStockoutOpenRef.current) {
          loadStockoutItems();
        }
      }
    });

    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
      unsub();
    };
  }, [loadOrders, loadStockoutItems]);

  // Single Item Status Transition Handler
  const handleTransitionItem = async (
    orderId: string,
    itemId: string,
    action: 'startCooking' | 'markReady' | 'markServed',
  ) => {
    const actionKey = `${orderId}-${itemId}-${action}`;
    if (isActionInProgress[actionKey]) return;

    setIsActionInProgress((prev) => ({ ...prev, [actionKey]: true }));

    // Snapshot state for Rollback (AUD-7.6)
    const previousOrders = orders;
    const nextStatus = action === 'startCooking' ? 'Cooking' : action === 'markReady' ? 'Ready' : 'Served';

    // Optimistic Update
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            items: (ord.items || []).map((it) => (it.id === itemId ? { ...it, status: nextStatus } : it)),
          };
        }
        return ord;
      }),
    );

    try {
      if (action === 'startCooking') {
        await apiClient.kitchen.startCookingItem(itemId, orderId);
        toast.success('Bắt đầu chế biến món ăn');
      } else if (action === 'markReady') {
        await apiClient.kitchen.markItemReady(itemId, orderId);
        soundEngine.playReadyChime(); // Hardening AUD-7.6: Chỉ phát chuông SAU KHI server ghi nhận thành công
        toast.success('Món ăn đã chế biến xong!');
      } else if (action === 'markServed') {
        await apiClient.kitchen.markItemServed(itemId, orderId);
        toast.success('Đã phục vụ món ra bàn');
      }
      await loadOrders(true);
    } catch (err: any) {
      console.error('Lỗi chuyển trạng thái món:', err);
      // Hardening AUD-7.6: Rollback ngay lập tức về snapshot trước đó
      setOrders(previousOrders);
      toast.error(err.message || 'Không thể cập nhật trạng thái món');
      await loadOrders(true);
    } finally {
      setIsActionInProgress((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  // Batch action handlers
  const handleStartCookingAll = async (orderId: string, roundNumber?: number) => {
    const actionKey = `batch-cooking-${orderId}-${roundNumber || 'all'}`;
    if (isActionInProgress[actionKey]) return;

    setIsActionInProgress((prev) => ({ ...prev, [actionKey]: true }));
    try {
      const res = await apiClient.kitchen.startCookingAll(orderId, roundNumber);
      toast.success(res?.message || 'Đã bắt đầu nấu tất cả món');
      await loadOrders(true);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi bắt đầu nấu món hàng loạt');
    } finally {
      setIsActionInProgress((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleMarkReadyAll = async (orderId: string, roundNumber?: number) => {
    const actionKey = `batch-ready-${orderId}-${roundNumber || 'all'}`;
    if (isActionInProgress[actionKey]) return;

    setIsActionInProgress((prev) => ({ ...prev, [actionKey]: true }));
    soundEngine.playReadyChime();
    try {
      const res = await apiClient.kitchen.markReadyAll(orderId, roundNumber);
      toast.success(res?.message || 'Đã hoàn tất tất cả món');
      await loadOrders(true);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi hoàn tất món hàng loạt');
    } finally {
      setIsActionInProgress((prev) => ({ ...prev, [actionKey]: false }));
    }
  };

  // Stockout toggle handler
  const handleToggleStockout = async (item: any) => {
    const isCurrentlyAvail =
      item.effectiveIsAvailable !== undefined ? item.effectiveIsAvailable : item.isAvailable;
    const nextStatus = !isCurrentlyAvail;
    const itemId = item._id || item.id;
    const branchId = storageService.getActiveBranchId() || undefined;

    // Snapshot state for Rollback (AUD-7.6)
    const previousStockoutItems = stockoutItems;

    // Optimistic Update in Drawer
    setStockoutItems((prev) =>
      prev.map((it) => {
        if ((it._id || it.id) === itemId) {
          return {
            ...it,
            isAvailable: nextStatus,
            effectiveIsAvailable: nextStatus,
          };
        }
        return it;
      }),
    );

    try {
      await apiClient.kitchen.toggleItemAvailability(itemId, nextStatus, branchId);
      toast.success(`Đã đổi "${item.name}" sang: ${nextStatus ? 'Còn món' : 'Hết món (86)'}`);
    } catch (err: any) {
      // Hardening AUD-7.6: Rollback ngay lập tức
      setStockoutItems(previousStockoutItems);
      toast.error(err.message || 'Không thể cập nhật tình trạng món');
      await loadStockoutItems();
    }
  };

  // Quick KPI Calculations
  const kpis = useMemo(() => {
    let waitingTickets = 0;
    let cookingItems = 0;
    let readyItems = 0;
    let slaBreachedCount = 0;

    for (const ord of orders) {
      const items = ord.items || [];
      const hasWaiting = items.some((i) => i.status === 'Waiting');
      if (hasWaiting) waitingTickets++;

      for (const it of items) {
        if (it.status === 'Cooking') cookingItems += it.quantity || 1;
        if (it.status === 'Ready') readyItems += it.quantity || 1;
      }

      const elapsed = Math.floor((now - new Date(ord.createdAt).getTime()) / 60000);
      if (elapsed >= 15 && ord.status !== 'Ready' && ord.status !== 'Served') {
        slaBreachedCount++;
      }
    }

    return {
      waitingTickets,
      cookingItems,
      readyItems,
      slaBreachedCount,
    };
  }, [orders, now]);

  // Filtered orders for Kanban Ticket View
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Lọc theo trạng thái
      if (statusFilter === 'Waiting') {
        const hasWaiting = (ord.items || []).some((i) => i.status === 'Waiting');
        if (!hasWaiting) return false;
      } else if (statusFilter === 'Cooking') {
        const hasCooking = (ord.items || []).some((i) => i.status === 'Cooking');
        if (!hasCooking) return false;
      } else if (statusFilter === 'Ready') {
        const hasReady = (ord.items || []).some((i) => i.status === 'Ready');
        if (!hasReady) return false;
      }

      // 2. Lọc theo từ khóa tìm kiếm (bàn, mã đơn, tên món)
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        const matchTable = matchVietnameseSearch(ord.tableName || '', q);
        const matchCode = (ord.orderCode || '').toLowerCase().includes(q.toLowerCase());
        const matchDish = (ord.items || []).some((it) => matchVietnameseSearch(it.name || '', q));
        if (!matchTable && !matchCode && !matchDish) return false;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Filtered dishes for Aggregated Summary View
  const filteredSummary = useMemo(() => {
    if (!summaryData?.summary) return [];
    if (!searchQuery.trim()) return summaryData.summary;
    return summaryData.summary.filter((item) =>
      matchVietnameseSearch(item.name || '', searchQuery.trim()),
    );
  }, [summaryData, searchQuery]);

  // Filtered stockout items
  const filteredStockoutItems = useMemo(() => {
    if (!stockoutSearch.trim()) return stockoutItems;
    return stockoutItems.filter((it) =>
      matchVietnameseSearch(it.name || '', stockoutSearch.trim()),
    );
  }, [stockoutItems, stockoutSearch]);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP HEADER & KPI STATS
          ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#09271d] flex items-center gap-2.5">
            <ChefHat className="w-8 h-8 text-[#176044]" />
            Màn Hình Điều Phối Bếp & Bar (KDS)
          </h1>
          <p className="text-xs text-[#66736d] mt-1">
            Xử lý vé chế biến theo thời gian thực (FIFO), tự động kiểm soát tương tranh OCC & cảnh báo SLA
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Sound Test */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => soundEngine.playNewOrderChime()}
            icon={<Volume2 className="w-4 h-4 text-emerald-700" />}
            title="Thử chuông gọi món mới"
          >
            Thử chuông
          </Button>

          {/* Quick 86 Stockout Drawer Trigger */}
          {canStockOut && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsStockoutOpen(true);
                loadStockoutItems();
              }}
              icon={<PackageX className="w-4 h-4 text-rose-600" />}
              className="border-rose-200 text-rose-800 hover:bg-rose-50"
            >
              Báo hết món (86)
            </Button>
          )}

          {/* Manual Refresh */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadOrders(false)}
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Vé chờ nấu</span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{kpis.waitingTickets}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Món đang nấu</span>
            <div className="text-2xl font-black text-orange-600 mt-0.5">{kpis.cookingItems}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 grid place-items-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Món chờ bưng</span>
            <div className="text-2xl font-black text-teal-600 mt-0.5">{kpis.readyItems}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 grid place-items-center">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-colors ${
          kpis.slaBreachedCount > 0
            ? 'bg-rose-50 border-rose-300 animate-pulse'
            : 'bg-white border-slate-200'
        }`}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Quá hạn (&gt;15p)</span>
            <div className={`text-2xl font-black mt-0.5 ${kpis.slaBreachedCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {kpis.slaBreachedCount}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl grid place-items-center ${
            kpis.slaBreachedCount > 0 ? 'bg-rose-200 text-rose-700' : 'bg-slate-100 text-slate-400'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTROL BAR: VIEW SWITCHER, STATUS TABS & SEARCH
          ========================================================================= */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* View Switcher: Tickets vs All-Day Summary */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            onClick={() => setViewMode('tickets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'tickets'
                ? 'bg-white text-[#124a36] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            Vé Bàn (Kanban FIFO)
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'summary'
                ? 'bg-white text-[#124a36] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Gom Nhóm Món ({summaryData?.totalWaitingItems || 0})
          </button>
        </div>

        {/* Status Filters (Only for Tickets View) */}
        {viewMode === 'tickets' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'Waiting', label: 'Chờ nấu' },
              { id: 'Cooking', label: 'Đang nấu' },
              { id: 'Ready', label: 'Đã xong' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === st.id
                    ? 'bg-[#124a36] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}

        {/* Fast Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={viewMode === 'tickets' ? 'Tìm bàn, mã vé, món...' : 'Tìm món cần nấu...'}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#124a36] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: TICKET KANBAN VIEW (FIFO)
          ========================================================================= */}
      {viewMode === 'tickets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-400">
              <ChefHat className="w-14 h-14 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
              <h3 className="text-base font-bold text-slate-700">Không có vé nào cần chế biến</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Không tìm thấy kết quả phù hợp với bộ lọc hiện tại.'
                  : 'Gian bếp đã hoàn thành tất cả đơn hàng. Sẵn sàng nhận đơn mới!'}
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const elapsedMinutes = Math.floor((now - new Date(ord.createdAt).getTime()) / 60000);
              const isLocked = ord.status === 'WaitingConfirmation';

              // Group items by roundNumber if rounds present
              const items = ord.items || [];
              const waitingCount = items.filter((i) => i.status === 'Waiting').length;
              const cookingCount = items.filter((i) => i.status === 'Cooking').length;

              return (
                <Card
                  key={ord.id}
                  className={`p-5 flex flex-col justify-between border-2 shadow-md bg-white transition-all rounded-3xl ${
                    isLocked
                      ? 'border-amber-300 bg-amber-50/20 opacity-80'
                      : elapsedMinutes >= 20
                      ? 'border-rose-400 ring-2 ring-rose-200 shadow-rose-100'
                      : elapsedMinutes >= 10
                      ? 'border-amber-300 shadow-amber-50'
                      : 'border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header: Table Name + SLA Aging Timer */}
                    <div className="flex items-start justify-between pb-3 border-b-2 border-slate-200 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xl font-black text-[#09271d] tracking-tight">
                            {ord.tableName}
                          </strong>
                          {ord.orderSource === 'QR_CUSTOMER' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                              QR
                            </span>
                          )}
                          {ord.orderSource === 'STAFF_POS' && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                              POS
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                          {ord.orderCode} · {formatTime(ord.createdAt)}
                        </span>
                      </div>

                      {/* Aging Badge */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-black border flex items-center gap-1 ${
                            elapsedMinutes >= 20
                              ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                              : elapsedMinutes >= 10
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {elapsedMinutes}p
                        </span>
                        {isLocked && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                            Chờ duyệt
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Customer Common Note */}
                    {ord.customerNote && (
                      <div className="my-2.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate">Ghi chú đơn: {ord.customerNote}</span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-2.5 py-3 divide-y divide-slate-100">
                      {items.map((it) => {
                        const isItemWaitingConf =
                          it.status === 'WaitingConfirmation' || ord.status === 'WaitingConfirmation';
                        const isCancelled = it.status === 'Cancelled';
                        const isCooking = it.status === 'Cooking';
                        const isReady = it.status === 'Ready';
                        const isServed = it.status === 'Served';
                        const isWaiting = it.status === 'Waiting';

                        return (
                          <div
                            key={it.id}
                            className={`pt-2.5 first:pt-0 flex items-start justify-between gap-3 ${
                              isCancelled
                                ? 'opacity-40'
                                : isServed
                                ? 'opacity-60'
                                : ''
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`w-5 h-5 rounded-md text-xs font-black grid place-items-center flex-shrink-0 ${
                                    isReady
                                      ? 'bg-teal-700 text-white'
                                      : isCooking
                                      ? 'bg-amber-600 text-white'
                                      : isCancelled
                                      ? 'bg-slate-300 text-slate-600'
                                      : 'bg-[#124a36] text-white'
                                  }`}
                                >
                                  {it.quantity}
                                </span>

                                <strong
                                  className={`text-sm tracking-tight ${
                                    isCancelled
                                      ? 'line-through text-slate-400'
                                      : isReady
                                      ? 'text-teal-900 font-extrabold'
                                      : 'text-slate-900 font-bold'
                                  }`}
                                >
                                  {it.name}
                                </strong>

                                {it.roundNumber && it.roundNumber > 1 && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                    Đợt {it.roundNumber}
                                  </span>
                                )}
                              </div>

                              {/* Selected Options / Modifiers Display */}
                              {it.selectedOptions && it.selectedOptions.length > 0 && (
                                <div className="mt-1 pl-7 flex flex-wrap gap-1">
                                  {it.selectedOptions.map((opt, oIdx) => (
                                    <span
                                      key={oIdx}
                                      className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200"
                                    >
                                      {opt.groupName}: <span className="font-bold">{opt.valueName}</span>
                                      {opt.priceDelta > 0 && ` (+${formatCurrencyVND(opt.priceDelta)})`}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Item Note */}
                              {it.note && (
                                <span className="text-[11px] text-amber-900 font-bold block mt-1 pl-7 flex items-center gap-1">
                                  ⚠️ {it.note}
                                </span>
                              )}

                              {/* Cancel Reason */}
                              {isCancelled && (
                                <span className="text-[11px] text-rose-600 font-semibold block mt-1 pl-7">
                                  ✕ Đã hủy: {it.cancelReason || 'Hủy món'}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons with strict state logic */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5">
                              {isItemWaitingConf ? (
                                <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                                  ⏳ Chờ duyệt
                                </span>
                              ) : isCooking ? (
                                <button
                                  onClick={() => handleTransitionItem(ord.id, it.id, 'markReady')}
                                  className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Xong món
                                </button>
                              ) : isReady ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-extrabold text-teal-700 flex items-center gap-0.5">
                                    ✓ Xong
                                  </span>
                                  <button
                                    onClick={() => handleTransitionItem(ord.id, it.id, 'markServed')}
                                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200 transition-colors"
                                    title="Xác nhận nhân viên đã bưng ra bàn"
                                  >
                                    Đã bưng
                                  </button>
                                </div>
                              ) : isServed ? (
                                <span className="text-xs font-semibold text-slate-400">
                                  ✓ Đã phục vụ
                                </span>
                              ) : isCancelled ? (
                                <span className="text-xs font-bold text-rose-400">
                                  Đã hủy
                                </span>
                              ) : isWaiting ? (
                                <button
                                  onClick={() => handleTransitionItem(ord.id, it.id, 'startCooking')}
                                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95"
                                >
                                  <Flame className="w-3.5 h-3.5" />
                                  Nấu món
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer: Batch actions */}
                  {!isLocked && (waitingCount >= 2 || cookingCount >= 2) && (
                    <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-end gap-2 mt-2">
                      {waitingCount >= 2 && (
                        <button
                          onClick={() => handleStartCookingAll(ord.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          Nấu tất cả ({waitingCount})
                        </button>
                      )}
                      {cookingCount >= 2 && (
                        <button
                          onClick={() => handleMarkReadyAll(ord.id)}
                          className="px-3 py-1.5 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Hoàn tất tất cả ({cookingCount})
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: ALL-DAY DISH AGGREGATION VIEW (GOM NHÓM MÓN TOÀN CHI NHÁNH)
          ========================================================================= */}
      {viewMode === 'summary' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-[#09271d] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#176044]" />
                Tổng Hợp Toàn Bộ Món Cần Chế Biến
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Gom mẻ nấu đồng loạt theo loại món để tối ưu công suất bếp
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg">
                Chờ nấu: {summaryData?.totalWaitingItems || 0}
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-900 rounded-lg">
                Đang nấu: {summaryData?.totalCookingItems || 0}
              </span>
            </div>
          </div>

          {filteredSummary.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">Hiện chưa có món nào cần chế biến</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSummary.map((item, idx) => (
                <div
                  key={item.menuItemId || idx}
                  className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#124a36] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-base font-extrabold text-[#09271d]">
                      {item.name}
                    </strong>
                    <span className="px-2.5 py-1 rounded-xl bg-[#124a36] text-white text-xs font-black">
                      Tổng: {item.totalActiveQty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      Chờ nấu: {item.waitingQty}
                    </span>
                    <span className="text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                      Đang nấu: {item.cookingQty}
                    </span>
                  </div>

                  {/* Tables List */}
                  {item.tables && item.tables.length > 0 && (
                    <div className="text-[11px] text-slate-600 font-medium">
                      <span className="text-slate-400 font-bold block mb-1">Các bàn đang gọi:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.tables.map((t, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 text-[10px] font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && item.notes.length > 0 && (
                    <div className="text-[10px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200 space-y-0.5">
                      <span className="font-bold block">Ghi chú đặc biệt:</span>
                      {item.notes.map((n, nIdx) => (
                        <div key={nIdx}>• {n}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          DRAWER: QUICK STOCKOUT (86 - BÁO HẾT NGUYÊN LIỆU TẠI BẾP)
          ========================================================================= */}
      <Drawer
        isOpen={isStockoutOpen}
        onClose={() => setIsStockoutOpen(false)}
        title="Báo Hết Món Nhanh (86 Out-of-Stock)"
        position="right"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Gạt công tắc để tắt món khi hết nguyên liệu. Món bị hết sẽ tự động làm mờ và khóa chọn trên Menu QR của khách hàng ngay lập tức.
          </p>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={stockoutSearch}
              onChange={(e) => setStockoutSearch(e.target.value)}
              placeholder="Tìm món cần báo hết..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#124a36]"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {isLoadingStockout ? (
              <div className="text-center py-12 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
                <p className="text-xs">Đang tải thực đơn...</p>
              </div>
            ) : filteredStockoutItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-xs font-semibold">Không tìm thấy món ăn nào</p>
              </div>
            ) : (
              filteredStockoutItems.map((item) => {
                const isAvail =
                  item.effectiveIsAvailable !== undefined
                    ? item.effectiveIsAvailable
                    : item.isAvailable;

                return (
                  <div
                    key={item._id || item.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs text-slate-900 block truncate font-bold">
                        {item.name}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatCurrencyVND(item.effectivePrice || item.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleStockout(item)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isAvail
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {isAvail ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-600" />
                          <span>Còn món</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-rose-600" />
                          <span>HẾT MÓN (86)</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}
