'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient, formatCurrencyVND } from '@imenu/utils';
import { PlatformOverviewDto } from '@imenu/types';
import {
  Store,
  Building2,
  Users,
  Receipt,
  TrendingUp,
  DollarSign,
  Crown,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react';

export default function PlatformDashboardPage() {
  const [data, setData] = useState<PlatformOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.platform.getOverview();
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Không thể tải dữ liệu tổng quan nền tảng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpi = data?.kpi;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              SuperAdmin Platform Center
            </span>
            <span className="text-xs text-slate-400">• Vận hành thời gian thực</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Trung Tâm Điều Hành Nền Tảng iMenu
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Giám sát toàn bộ mạng lưới nhà hàng, phân tích GMV, doanh thu SaaS và đội ngũ kinh doanh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            Làm mới
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Nhà hàng */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Nhà Hàng
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {kpi ? kpi.totalRestaurants : '--'}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 flex-wrap">
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                {kpi?.statusBreakdown?.ACTIVE_PAID || 0} Trả phí
              </span>
              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                {kpi?.statusBreakdown?.TRIAL || 0} Dùng thử
              </span>
              {(kpi?.statusBreakdown?.SUSPENDED || 0) > 0 && (
                <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">
                  {kpi?.statusBreakdown?.SUSPENDED} Đang khóa
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 2: Tổng GMV F&B toàn sàn */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Doanh Thu GMV F&B
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-800">
              {kpi ? formatCurrencyVND(kpi.totalGmvRevenue) : '--'}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              <span>{kpi ? kpi.totalPaidOrders.toLocaleString('vi-VN') : 0} đơn hàng thành công</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Doanh thu gói SaaS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Doanh Thu Gói SaaS
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-indigo-900">
              {kpi ? formatCurrencyVND(kpi.totalSaaSRevenue) : '--'}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span>Thu từ đăng ký & gia hạn bản quyền phần mềm</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Đội ngũ NVKD & Hoa hồng */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hoa Hồng NVKD Chờ Chi
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-800">
              {kpi ? formatCurrencyVND(kpi.commissions.pending + kpi.commissions.approved) : '--'}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <span>Đội ngũ: <strong>{kpi ? kpi.totalSalesReps : 0}</strong> nhân sự đối tác</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Nav Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/platform/restaurants"
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-purple-300 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
              <Store className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">Quản Lý Toàn Bộ Nhà Hàng</h3>
            <p className="text-xs text-slate-500 mt-1">
              Xem danh sách, kiểm tra vòng đời gói cước, khóa/mở khóa quán và truy cập hỗ trợ kỹ thuật trực tiếp.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-purple-700 group-hover:translate-x-1 transition gap-1">
            <span>Truy cập quản lý</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/platform/revenues"
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">Báo Cáo Doanh Thu Kép</h3>
            <p className="text-xs text-slate-500 mt-1">
              Phân tích doanh thu GMV nhà hàng (theo 4 phương thức thanh toán) & đối soát lợi nhuận ròng nền tảng SaaS.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition gap-1">
            <span>Xem chi tiết báo cáo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/platform/sales"
          className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mt-3 text-base">Đội Ngũ NVKD & Kỳ Đối Soát</h3>
            <p className="text-xs text-slate-500 mt-1">
              Duyệt đơn ứng tuyển, quản lý NVKD, thiết lập chính sách % hoa hồng và chốt kỳ đối soát ngày 05 & 20.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-bold text-indigo-700 group-hover:translate-x-1 transition gap-1">
            <span>Quản lý kinh doanh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Top Performing Restaurants */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-slate-900 text-base">
              Bảng Xếp Hạng Top Nhà Hàng Doanh Thu GMV Cao Nhất
            </h2>
          </div>
          <Link
            href="/platform/restaurants"
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 transition"
          >
            Xem tất cả nhà hàng →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Hạng</th>
                <th className="py-3 px-4">Tên Nhà Hàng</th>
                <th className="py-3 px-4">Gói Cước</th>
                <th className="py-3 px-4 text-right">Tổng Đơn Hàng</th>
                <th className="py-3 px-4 text-right">Tổng Doanh Thu (GMV)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.topRestaurants && data.topRestaurants.length > 0 ? (
                data.topRestaurants.map((r, idx) => (
                  <tr key={r.restaurantId} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 text-center font-black">
                      {idx === 0 ? (
                        <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center justify-center text-xs font-bold tabular-nums">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center justify-center text-xs font-bold tabular-nums">
                          2
                        </span>
                      ) : idx === 2 ? (
                        <span className="w-6 h-6 rounded-md bg-amber-50/50 text-amber-900 border border-amber-100 inline-flex items-center justify-center text-xs font-bold tabular-nums">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium tabular-nums">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                      <div className="text-[11px] text-slate-400">slug: {r.slug}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {r.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {r.ordersCount.toLocaleString('vi-VN')} đơn
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                      {formatCurrencyVND(r.totalGmv)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {loading ? 'Đang tải dữ liệu xếp hạng...' : 'Chưa có dữ liệu giao dịch trên hệ thống'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
