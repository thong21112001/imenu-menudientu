'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { storageService, formatCurrencyVND } from '@imenu/utils';
import { Table, Order } from '@imenu/types';
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
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setTables(storageService.getTables());
    setOrders(storageService.getOrders());
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const occupiedCount = tables.filter((t) => t.status === 'Occupied' || t.status === 'PaymentRequested').length;
  const kitchenPendingCount = orders.filter((o) => o.status === 'Preparing' || o.status === 'WaitingConfirmation').length;

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Bảng Điều Khiển Tổng Quan</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Dữ liệu vận hành nhà hàng thời gian thực hôm nay
          </p>
        </div>
        <div className="flex gap-3">
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
        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Doanh thu hôm nay</span>
            <div className="text-2xl font-extrabold text-[#176044]">
              {formatCurrencyVND(totalRevenue)}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold">↗ +18.4% so với hôm qua</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#176044] grid place-items-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Bàn đang phục vụ</span>
            <div className="text-2xl font-extrabold text-[#09271d]">
              {occupiedCount} / {tables.length}
            </div>
            <span className="text-[11px] text-amber-600 font-bold">Tỉ lệ lấp đầy: {Math.round((occupiedCount / tables.length) * 100)}%</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#a66d12] grid place-items-center">
            <Grid3X3 className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Đơn chờ bếp nấu</span>
            <div className="text-2xl font-extrabold text-purple-700">
              {kitchenPendingCount} đơn
            </div>
            <span className="text-[11px] text-slate-500">Thời gian chờ TB: 6 phút</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 grid place-items-center">
            <ChefHat className="w-6 h-6" />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Tổng số đơn hoàn thành</span>
            <div className="text-2xl font-extrabold text-[#09271d]">
              {orders.length}
            </div>
            <span className="text-[11px] text-slate-500">AOV: {formatCurrencyVND(totalRevenue / (orders.length || 1))}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 grid place-items-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Grid: Hourly Chart Simulation & Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Chart */}
        <Card className="lg:col-span-7 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Biểu đồ doanh thu theo khung giờ</h3>
              <p className="text-xs text-slate-500">Cao điểm buổi trưa 11h-13h và tối 18h-20h</p>
            </div>
            <Badge variant="brand">Hôm nay</Badge>
          </div>

          <div className="h-56 flex items-end gap-3 pt-8 pb-2 px-2 border-b border-slate-200">
            {[
              { h: '09h', val: 25 },
              { h: '10h', val: 40 },
              { h: '11h', val: 85 },
              { h: '12h', val: 100 },
              { h: '13h', val: 70 },
              { h: '14h', val: 30 },
              { h: '15h', val: 35 },
              { h: '16h', val: 45 },
              { h: '17h', val: 60 },
              { h: '18h', val: 95 },
              { h: '19h', val: 90 },
              { h: '20h', val: 75 },
            ].map((col, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div
                  style={{ height: `${col.val}%` }}
                  className="w-full bg-gradient-to-t from-[#124a36] to-[#1f7a55] rounded-t-md group-hover:from-amber-500 group-hover:to-amber-400 transition-all relative"
                >
                  <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded transition-opacity whitespace-nowrap">
                    {col.val * 10}k
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">{col.h}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Active Orders */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Đơn hàng đang xử lý</h3>
            <Link href="/tables" className="text-xs font-bold text-[#176044] hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-slate-900">{ord.tableName}</strong>
                    <StatusChip status={ord.status} size="sm" />
                  </div>
                  <small className="text-[11px] text-slate-500 mt-0.5 block">
                    {ord.items.length} món · {ord.orderCode}
                  </small>
                </div>
                <span className="text-xs font-extrabold text-[#176044]">
                  {formatCurrencyVND(ord.totalAmount)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
