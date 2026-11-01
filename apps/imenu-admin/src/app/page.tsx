'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  storageService,
  formatCurrencyVND,
  apiClient,
  realtimeHub,
  soundEngine,
} from '@imenu/utils';
import { DashboardOverviewData } from '@imenu/types';
import { Card, Button, StatusChip, Badge, useToast } from '@imenu/ui';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Grid3X3,
  ChefHat,
  Smartphone,
  RefreshCw,
  Calendar,
  CreditCard,
  Building2,
  Clock,
  ArrowRight,
  Receipt,
  Store,
  Layers,
} from 'lucide-react';

function getTodayVnDate(): string {
  const now = new Date();
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return vn.toISOString().split('T')[0];
}

function getYesterdayVnDate(): string {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000);
  return yesterday.toISOString().split('T')[0];
}

export default function DashboardOverviewPage() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(storageService.getActiveBranchId());
  const [restaurant, setRestaurant] = useState<any>(storageService.getRestaurant());
  const [currentUser, setCurrentUser] = useState<any>(storageService.getCurrentUser());

  // Lọc theo ngày: 'today' | 'yesterday' | 'custom'
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayVnDate());

  // Lọc ca cho biểu đồ giờ: 'all' | 'morning' | 'lunch' | 'dinner'
  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'lunch' | 'dinner'>('all');

  // Chống race condition khi fetch song song
  const requestIdRef = useRef(0);

  const isMainBranchUser = Boolean(currentUser?.isMainBranch);

  const fetchDashboard = async (branchId = activeBranchId, queryDate = selectedDate) => {
    const currentReqId = ++requestIdRef.current;
    setLoading(true);

    try {
      const res = await apiClient.dashboard.getOverview({
        branchId: branchId || undefined,
        date: queryDate,
      });

      if (currentReqId !== requestIdRef.current) return;

      if (res?.data) {
        setOverview(res.data);
      }
    } catch (err: any) {
      if (currentReqId !== requestIdRef.current) return;
      console.error('Lỗi tải dữ liệu dashboard:', err);
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const usr = storageService.getCurrentUser();
    const roleSlug = String(usr?.role || '').toLowerCase();
    if (roleSlug === 'system_admin' || roleSlug === 'super_admin') {
      window.location.replace('/platform/dashboard');
      return;
    }

    setCurrentUser(usr);
    setRestaurant(storageService.getRestaurant());
    fetchDashboard(activeBranchId, selectedDate);

    const handleBranchChange = (e: any) => {
      const bId = e.detail?.branchId ?? null;
      setActiveBranchId(bId);
      fetchDashboard(bId, selectedDate);
    };

    window.addEventListener('imenu:branch_changed', handleBranchChange);

    const unsub = realtimeHub.subscribe('*', (payload) => {
      const evt = payload.type as string;
      const orderData = payload.data?.order || payload.data;
      const status = orderData?.status || payload.data?.status;
      const tableName = orderData?.table?.name || payload.data?.tableName || 'Bàn';

      if (
        (evt === 'ORDER_STATUS_UPDATED' || evt === 'order:item_status_updated') &&
        status === 'Ready'
      ) {
        soundEngine.playItemReadyChime();
        toast.success(
          `🔔 Bếp đã nấu xong toàn bộ món cho ${tableName}! Vui lòng mang ra phục vụ.`,
          { duration: 5000 },
        );
      }
      fetchDashboard(activeBranchId, selectedDate);
    });

    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
      unsub();
    };
  }, [selectedDate]);

  const handleDateModeChange = (mode: 'today' | 'yesterday' | 'custom', customVal?: string) => {
    setDateMode(mode);
    let target = selectedDate;
    if (mode === 'today') {
      target = getTodayVnDate();
    } else if (mode === 'yesterday') {
      target = getYesterdayVnDate();
    } else if (customVal) {
      target = customVal;
    }
    setSelectedDate(target);
    fetchDashboard(activeBranchId, target);
  };

  const activeBranchName = !activeBranchId
    ? 'Toàn chuỗi (Hợp nhất)'
    : restaurant?.branches?.find((b: any) => (b._id || b.id) === activeBranchId)?.name ||
      overview?.branchName ||
      'Chi nhánh';

  // Lọc khung giờ theo ca làm việc
  const allHourlyItems = overview?.hourlyRevenue || [];
  const filteredHourlyItems = allHourlyItems.filter((item) => {
    if (shiftFilter === 'morning') return item.hour >= 9 && item.hour < 12;
    if (shiftFilter === 'lunch') return item.hour >= 12 && item.hour < 16;
    if (shiftFilter === 'dinner') return item.hour >= 16 && item.hour <= 20;
    return true; // 'all' (9h-20h)
  });

  const maxHourRev = Math.max(
    ...(filteredHourlyItems.map((h) => h.revenue) || [100000]),
    100000,
  );

  // Phân bổ phương thức thanh toán
  const pmSummary = overview?.paymentMethodSummary;
  const pmMethods = [
    { key: 'VietQR', label: 'VietQR', count: pmSummary?.byMethod?.VietQR?.count || 0, revenue: pmSummary?.VietQR || pmSummary?.byMethod?.VietQR?.revenue || 0, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { key: 'Cash', label: 'Tiền mặt', count: pmSummary?.byMethod?.Cash?.count || 0, revenue: pmSummary?.Cash || pmSummary?.byMethod?.Cash?.revenue || 0, color: 'bg-amber-500', textColor: 'text-amber-700' },
    { key: 'Card', label: 'Thẻ POS', count: pmSummary?.byMethod?.Card?.count || 0, revenue: pmSummary?.Card || pmSummary?.byMethod?.Card?.revenue || 0, color: 'bg-blue-500', textColor: 'text-blue-700' },
    { key: 'Transfer', label: 'Chuyển khoản khác', count: pmSummary?.byMethod?.Transfer?.count || 0, revenue: pmSummary?.Transfer || pmSummary?.byMethod?.Transfer?.revenue || 0, color: 'bg-purple-500', textColor: 'text-purple-700' },
  ];
  const totalPmRev = pmMethods.reduce((sum, m) => sum + m.revenue, 0);

  // Danh sách đơn active và recent
  const activeOrdersList = overview?.activeOrders || [];
  const recentOrdersList = overview?.recentOrders || [];

  return (
    <div className="space-y-6 pb-12">
      {/* =========================================================================
          KHU VỰC 1: HEADER + CHI NHÁNH + CHỌN NGÀY + ĐIỀU HƯỚNG NHANH
          ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#09271d] tracking-tight">
              Bảng Điều Khiển Tổng Quan
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#176044] border border-emerald-200">
              <Building2 className="w-3.5 h-3.5" />
              {activeBranchId ? activeBranchName : 'Toàn chuỗi (HQ)'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dữ liệu vận hành thời gian thực · Đồng bộ tức thời qua WebSockets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bộ chọn ngày nhanh */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => handleDateModeChange('today')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                dateMode === 'today'
                  ? 'bg-white text-[#09271d] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => handleDateModeChange('yesterday')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                dateMode === 'yesterday'
                  ? 'bg-white text-[#09271d] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hôm qua
            </button>
            <div className="relative pl-1">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateModeChange('custom', e.target.value)}
                className="text-xs font-semibold bg-transparent border-0 px-2 py-1 text-slate-700 outline-hidden cursor-pointer"
                title="Chọn ngày tùy ý"
              />
            </div>
          </div>

          {/* Nút làm mới */}
          <button
            onClick={() => fetchDashboard(activeBranchId, selectedDate)}
            className="p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#176044]' : ''}`} />
          </button>

          {/* Cụm nút điều hướng nhanh */}
          <div className="flex items-center gap-2">
            <Link href="/tables">
              <Button variant="outline" size="sm" className="rounded-xl font-bold">
                <Grid3X3 className="w-4 h-4 mr-1.5 text-[#176044]" /> Sơ đồ bàn
              </Button>
            </Link>
            <Link href="/pos">
              <Button variant="outline" size="sm" className="rounded-xl font-bold">
                <Smartphone className="w-4 h-4 mr-1.5 text-blue-600" /> POS Bán hàng
              </Button>
            </Link>
            <Link href="/kitchen">
              <Button variant="primary" size="sm" className="rounded-xl font-bold">
                <ChefHat className="w-4 h-4 mr-1.5 text-amber-300" /> Bếp KDS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          KHU VỰC 2: 4 THẺ KPI CHÍNH
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Doanh thu ngày */}
        <Card className="p-5 relative overflow-hidden bg-white border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Doanh thu {dateMode === 'today' ? 'hôm nay' : dateMode === 'yesterday' ? 'hôm qua' : selectedDate}
              </span>
              <div className="text-2xl font-black text-[#176044] tracking-tight">
                {formatCurrencyVND(overview?.revenueToday ?? overview?.todayRevenue ?? 0)}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold">
                {(overview?.revenueGrowthRate || 0) >= 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{overview?.revenueGrowthRate ?? 0}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {overview?.revenueGrowthRate ?? 0}%
                  </span>
                )}
                <span className="text-slate-400 font-normal">so với hôm qua</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#176044] grid place-items-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Thẻ 2: Bàn đang phục vụ */}
        <Card className="p-5 relative overflow-hidden bg-white border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5 flex-1 pr-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bàn đang phục vụ
              </span>
              <div className="text-2xl font-black text-[#09271d] tracking-tight">
                {overview?.occupiedTablesCount ?? overview?.occupiedTables ?? 0}
                <span className="text-slate-400 text-base font-semibold"> / {overview?.totalTablesCount ?? overview?.totalTables ?? 0}</span>
              </div>
              {/* Thanh tỷ lệ lấp đầy bàn */}
              <div className="space-y-1 pt-0.5">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(overview?.occupancyRate || 0, 100)}%` }}
                  />
                </div>
                <div className="text-[11px] text-amber-700 font-bold">
                  Lấp đầy: {overview?.occupancyRate || 0}% công suất
                </div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
              <Grid3X3 className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Thẻ 3: Đơn chờ bếp nấu */}
        <Card className="p-5 relative overflow-hidden bg-white border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Đơn chờ bếp nấu
              </span>
              <div className="text-2xl font-black text-purple-700 tracking-tight">
                {overview?.kitchenPendingOrders ?? overview?.kitchenPendingCount ?? 0} <span className="text-base font-semibold text-purple-500">đơn</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Chờ xác nhận & đang nấu trên KDS
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 grid place-items-center shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Thẻ 4: Đơn hoàn tất & AOV */}
        <Card className="p-5 relative overflow-hidden bg-white border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Đơn hoàn tất & AOV
              </span>
              <div className="text-2xl font-black text-blue-700 tracking-tight">
                {overview?.completedOrdersToday ?? overview?.completedOrdersCount ?? 0} <span className="text-base font-semibold text-blue-500">đơn</span>
              </div>
              <p className="text-[11px] text-slate-600 font-bold">
                AOV: <span className="text-slate-900">{formatCurrencyVND(overview?.averageOrderValue || 0)}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* =========================================================================
          KHU VỰC 3: BIỂU ĐỒ DOANH THU THEO GIỜ & CƠ CẤU THANH TOÁN / CHI NHÁNH
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Cột trái: Biểu đồ doanh thu theo khung giờ (xl:col-span-8) */}
        <Card className="xl:col-span-8 p-6 space-y-5 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Biểu đồ Doanh thu theo Khung giờ
              </h2>
              <p className="text-xs text-slate-500">
                Nhịp độ kinh doanh theo múi giờ Việt Nam (+07:00) · {activeBranchName}
              </p>
            </div>

            {/* Bộ lọc ca làm việc */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 text-xs font-bold">
              <button
                onClick={() => setShiftFilter('all')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  shiftFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cả ngày
              </button>
              <button
                onClick={() => setShiftFilter('morning')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  shiftFilter === 'morning'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ca sáng (9-12h)
              </button>
              <button
                onClick={() => setShiftFilter('lunch')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  shiftFilter === 'lunch'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ca trưa (12-16h)
              </button>
              <button
                onClick={() => setShiftFilter('dinner')}
                className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                  shiftFilter === 'dinner'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Ca tối (16-20h)
              </button>
            </div>
          </div>

          {/* Vùng vẽ biểu đồ cột */}
          <div className="overflow-x-auto pb-2">
            <div className="h-64 min-w-[500px] flex items-end gap-3 pt-8 pb-3 px-2 border-b border-slate-200">
              {filteredHourlyItems.length === 0 ? (
                <div className="w-full h-full grid place-items-center text-xs text-slate-400">
                  Không có dữ liệu trong khung giờ đã chọn
                </div>
              ) : (
                filteredHourlyItems.map((item) => {
                  const rev = item.revenue || 0;
                  const ordersCount = item.ordersCount || 0;
                  const heightPercent = maxHourRev > 0 ? Math.max(Math.round((rev / maxHourRev) * 100), 6) : 6;

                  return (
                    <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-zinc-800 hover:bg-emerald-600 rounded-t-lg group-hover:from-amber-500 group-hover:to-amber-400 transition-all relative cursor-pointer"
                      >
                        {/* Tooltip bay khi hover */}
                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold transition-opacity whitespace-nowrap shadow-xl z-20">
                          <div>{item.hourLabel || `${item.hour}:00`} · {ordersCount} đơn</div>
                          <div className="text-amber-400 text-xs">{formatCurrencyVND(rev)}</div>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-bold">{item.hour}h</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Cột phải: Cơ cấu thanh toán & Phân bổ chi nhánh (xl:col-span-4) */}
        <Card className="xl:col-span-4 p-6 space-y-5 bg-white border border-slate-200/80 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Cơ Cấu Doanh Thu Ngày
            </h2>
            <p className="text-xs text-slate-500">
              Kênh thanh toán & phân bổ chi nhánh
            </p>
          </div>

          {/* Phân rã Phương thức thanh toán */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Phương thức thanh toán
            </span>
            <div className="space-y-2">
              {pmMethods.map((pm) => {
                const pct = totalPmRev > 0 ? Math.round((pm.revenue / totalPmRev) * 1000) / 10 : 0;
                return (
                  <div key={pm.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span className={`w-2 h-2 rounded-full ${pm.color}`} />
                        {pm.label}
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatCurrencyVND(pm.revenue)} <span className="text-slate-400 text-[10px]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`${pm.color} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phân bổ Chi nhánh (chỉ hiện khi xem toàn chuỗi) */}
          {overview?.isConsolidated && overview.branchBreakdown && overview.branchBreakdown.length > 0 && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Đóng góp theo Chi nhánh
              </span>
              <div className="space-y-2.5">
                {overview.branchBreakdown.map((b) => (
                  <div key={b.branchId} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span className="truncate">{b.branchName}</span>
                      <span className="text-[#176044]">{formatCurrencyVND(b.todayRevenue ?? b.revenue ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                      <span>{b.orderCount ?? b.ordersCount ?? 0} đơn</span>
                      <span className="font-semibold text-emerald-600">{b.percentage || 0}% doanh số</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* =========================================================================
          KHU VỰC 4: ĐƠN ĐANG PHỤC VỤ & ĐƠN HÀNG MỚI NHẤT
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột 1: Đơn đang phục vụ tại bàn (activeOrders) */}
        <Card className="p-6 space-y-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Đơn Đang Phục Vụ Tại Bàn
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {activeOrdersList.length} đơn active
              </span>
            </div>
            <Link href="/tables" className="text-xs font-bold text-[#176044] hover:underline flex items-center gap-1">
              Xem sơ đồ bàn <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {activeOrdersList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-slate-100">
                Hiện không có bàn nào đang chờ phục vụ
              </div>
            ) : (
              activeOrdersList.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-amber-300 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-900 truncate">
                        {ord.tableName}
                      </strong>
                      <StatusChip status={ord.status} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {ord.orderCode} · {ord.itemCount} món · {new Date(ord.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-[#176044]">
                      {formatCurrencyVND(ord.totalAmount)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ord.paymentMethod || 'Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Cột 2: Đơn hàng mới nhất trong ngày (recentOrders) */}
        <Card className="p-6 space-y-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Đơn Hàng Mới Nhất Trong Ngày
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                8 đơn gần nhất
              </span>
            </div>
            <Link href="/bills" className="text-xs font-bold text-[#176044] hover:underline flex items-center gap-1">
              Hóa đơn & In bill <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentOrdersList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 border border-slate-100">
                Chưa có đơn hàng nào được tạo hôm nay
              </div>
            ) : (
              recentOrdersList.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between hover:border-emerald-300 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-slate-900 truncate">
                        {ord.tableName}
                      </strong>
                      <StatusChip status={ord.status} size="sm" />
                      {ord.paymentMethod === 'VietQR' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          VietQR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {ord.orderCode} · {ord.itemCount} món · {new Date(ord.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-[#176044]">
                      {formatCurrencyVND(ord.totalAmount)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ord.paymentMethod || 'Tiền mặt'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
