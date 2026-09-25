'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { storageService, formatCurrencyVND, apiClient, realtimeHub } from '@imenu/utils';
import { DashboardOverviewData } from '@imenu/types';
import { Card, Button, StatusChip, Badge } from '@imenu/ui';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Grid3X3,
  ChefHat,
  ArrowRight,
  Clock,
  Sparkles,
  Building2,
  Store,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(storageService.getActiveBranchId());
  const [restaurant, setRestaurant] = useState<any>(storageService.getRestaurant());
  const [currentUser, setCurrentUser] = useState<any>(storageService.getCurrentUser());

  const isMainBranchUser = Boolean(currentUser?.isMainBranch);

  const loadDashboard = async (branchId = activeBranchId) => {
    setLoading(true);
    try {
      const res = await apiClient.dashboard.getOverview(branchId);
      if (res?.data) {
        setOverview(res.data);
        return;
      }
    } catch {
      // Fallback nếu chưa có backend data
    } finally {
      setLoading(false);
    }

    // Fallback tính toán từ local storage
    const tables = storageService.getTables();
    const orders = storageService.getOrders();
    const totalRev = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const occupied = tables.filter((t) => t.status === 'Occupied' || t.status === 'PaymentRequested').length;
    const pendingKitchen = orders.filter((o) => o.status === 'Preparing' || o.status === 'WaitingConfirmation').length;

    setOverview({
      branchId: branchId,
      branchName: branchId ? 'Chi nhánh' : 'Toàn chuỗi',
      isMainBranch: isMainBranchUser,
      revenueToday: totalRev,
      revenueGrowthRate: 18.4,
      occupiedTables: occupied,
      totalTables: tables.length,
      occupancyRate: Math.round((occupied / (tables.length || 1)) * 100),
      kitchenPendingOrders: pendingKitchen,
      completedOrdersToday: orders.length,
      averageOrderValue: Math.round(totalRev / (orders.length || 1)),
      hourlyRevenue: [
        { hour: 9, revenue: 150000 },
        { hour: 10, revenue: 320000 },
        { hour: 11, revenue: 850000 },
        { hour: 12, revenue: 1420000 },
        { hour: 13, revenue: 780000 },
        { hour: 14, revenue: 290000 },
        { hour: 15, revenue: 340000 },
        { hour: 16, revenue: 520000 },
        { hour: 17, revenue: 920000 },
        { hour: 18, revenue: 1680000 },
        { hour: 19, revenue: 1550000 },
        { hour: 20, revenue: 980000 },
      ],
      recentOrders: orders.slice(0, 4).map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        tableName: o.tableName,
        totalAmount: o.totalAmount,
        status: o.status,
        itemCount: o.items?.length || 1,
        createdAt: o.createdAt,
      })),
    });
  };

  useEffect(() => {
    setCurrentUser(storageService.getCurrentUser());
    setRestaurant(storageService.getRestaurant());
    loadDashboard();

    const handleBranchChange = (e: any) => {
      const bId = e.detail?.branchId ?? null;
      setActiveBranchId(bId);
      loadDashboard(bId);
    };

    window.addEventListener('imenu:branch_changed', handleBranchChange);

    const unsub = realtimeHub.subscribe('*', () => {
      loadDashboard();
    });

    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
      unsub();
    };
  }, []);

  // Tính toán biểu đồ giờ (hiển thị 12 khung giờ chính từ 9h-20h)
  const displayHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const maxHourRev = Math.max(
    ...(overview?.hourlyRevenue?.map((h) => h.revenue) || [100000]),
    100000,
  );

  const activeBranchName = !activeBranchId
    ? 'Toàn chuỗi (Hợp nhất)'
    : restaurant?.branches?.find((b: any) => (b._id || b.id) === activeBranchId)?.name ||
      overview?.branchName ||
      'Chi nhánh';

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#09271d]">Bảng Điều Khiển Tổng Quan</h1>
            {isMainBranchUser && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#176044] border border-emerald-300">
                {activeBranchId ? `🏢 ${activeBranchName}` : '🏢 Toàn chuỗi (HQ)'}
              </span>
            )}
          </div>
          <p className="text-xs text-[#66736d] mt-0.5">
            Dữ liệu vận hành thời gian thực · Cập nhật tự động qua WebSockets
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => loadDashboard()}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#176044]' : ''}`} />
          </button>
          <Link href="/tables">
            <Button variant="outline" size="sm">
              <Grid3X3 className="w-4 h-4 mr-1.5" /> Sơ đồ bàn
            </Button>
          </Link>
          <Link href="/kitchen">
            <Button variant="primary" size="sm">
              <ChefHat className="w-4 h-4 mr-1.5" /> Màn hình Bếp
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doanh thu hôm nay */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Doanh thu hôm nay</span>
            <div className="text-2xl font-black text-[#176044]">
              {formatCurrencyVND(overview?.revenueToday || 0)}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">
              ↗ {overview?.revenueGrowthRate !== undefined && overview.revenueGrowthRate >= 0 ? '+' : ''}
              {overview?.revenueGrowthRate || 0}% so với hôm qua
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#176044] grid place-items-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 2: Bàn đang phục vụ */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Bàn đang phục vụ</span>
            <div className="text-2xl font-black text-[#09271d]">
              {overview?.occupiedTables || 0} / {overview?.totalTables || 0}
            </div>
            <span className="text-[11px] text-amber-600 font-bold">
              Tỉ lệ lấp đầy: {overview?.occupancyRate || 0}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#a66d12] grid place-items-center shrink-0">
            <Grid3X3 className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 3: Đơn chờ bếp nấu */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Đơn chờ bếp nấu</span>
            <div className="text-2xl font-black text-purple-700">
              {overview?.kitchenPendingOrders || 0} đơn
            </div>
            <span className="text-[11px] text-slate-500">Tiến độ chế biến tức thời</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 grid place-items-center shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 4: Tổng số đơn hoàn thành */}
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Đơn hoàn tất hôm nay</span>
            <div className="text-2xl font-black text-[#09271d]">
              {overview?.completedOrdersToday || 0} đơn
            </div>
            <span className="text-[11px] text-slate-500">
              AOV: {formatCurrencyVND(overview?.averageOrderValue || 0)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 grid place-items-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Grid: Hourly Chart & Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Chart */}
        <Card className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Biểu đồ doanh thu theo khung giờ</h3>
              <p className="text-xs text-slate-500">Theo dõi nhịp độ kinh doanh hôm nay ({activeBranchName})</p>
            </div>
            <Badge variant="brand">Hôm nay</Badge>
          </div>

          <div className="h-56 flex items-end gap-2.5 pt-8 pb-2 px-2 border-b border-slate-200">
            {displayHours.map((hour) => {
              const item = overview?.hourlyRevenue?.find((h) => h.hour === hour);
              const rev = item?.revenue || 0;
              const heightPercent = Math.max(Math.round((rev / maxHourRev) * 100), 8);

              return (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-linear-to-t from-[#124a36] to-[#1f7a55] rounded-t-md group-hover:from-amber-500 group-hover:to-amber-400 transition-all relative"
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-md font-bold transition-opacity whitespace-nowrap shadow-lg z-10">
                      {formatCurrencyVND(rev)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{hour}h</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live Active Orders */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Đơn hàng mới nhất</h3>
            <Link href="/pos" className="text-xs font-bold text-[#176044] hover:underline">
              Mở POS bán hàng
            </Link>
          </div>

          <div className="space-y-2.5">
            {!overview?.recentOrders || overview.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có đơn hàng nào hôm nay
              </div>
            ) : (
              overview.recentOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-emerald-50/40 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs text-slate-900 truncate">{ord.tableName}</strong>
                      <StatusChip status={ord.status} size="sm" />
                    </div>
                    <small className="text-[11px] text-slate-500 mt-0.5 block truncate">
                      {ord.itemCount} món · {ord.orderCode || 'Đơn hàng'}
                    </small>
                  </div>
                  <span className="text-xs font-black text-[#176044] shrink-0">
                    {formatCurrencyVND(ord.totalAmount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
