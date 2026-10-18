'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, formatCurrencyVND } from '@imenu/utils';
import { PlatformRevenueReport, PlatformSaaSRevenueDto } from '@imenu/types';
import { useToast } from '@imenu/ui';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Calendar,
  Building2,
  ArrowLeft,
  RefreshCw,
  PieChart,
  CheckCircle2,
} from 'lucide-react';

export default function PlatformRevenuesPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'GMV' | 'SAAS'>('GMV');
  const [timeRange, setTimeRange] = useState('this_month');
  const [drillDownRestaurantId, setDrillDownRestaurantId] = useState<string | null>(null);

  const [gmvData, setGmvData] = useState<PlatformRevenueReport | null>(null);
  const [saasData, setSaasData] = useState<PlatformSaaSRevenueDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenues = async () => {
    try {
      setLoading(true);
      if (activeTab === 'GMV') {
        const res = await apiClient.platform.getRestaurantRevenues({
          timeRange,
          restaurantId: drillDownRestaurantId || undefined,
        });
        if (res && res.data) {
          setGmvData(res.data);
        }
      } else {
        const res = await apiClient.platform.getSaaSRevenues({
          timeRange,
        });
        if (res && res.data) {
          setSaasData(res.data);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải báo cáo doanh thu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenues();
  }, [activeTab, timeRange, drillDownRestaurantId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Báo Cáo Tài Chính Toàn Hệ Thống
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Phân Tích Doanh Thu Kép: GMV F&B & Nền Tảng SaaS
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Báo cáo tổng hợp dòng tiền bán hàng của toàn bộ nhà hàng và doanh thu bản quyền SaaS kèm đối soát hoa hồng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                timeRange === 'today' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Hôm nay
            </button>
            <button
              onClick={() => setTimeRange('this_week')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                timeRange === 'this_week' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tuần này
            </button>
            <button
              onClick={() => setTimeRange('this_month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                timeRange === 'this_month' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tháng này
            </button>
            <button
              onClick={() => setTimeRange('last_month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                timeRange === 'last_month' ? 'bg-purple-700 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tháng trước
            </button>
          </div>

          <button
            onClick={fetchRevenues}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            title="Làm mới báo cáo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 space-x-4">
        <button
          onClick={() => {
            setActiveTab('GMV');
            setDrillDownRestaurantId(null);
          }}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'GMV'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Doanh Thu Bán Hàng Nhà Hàng (GMV)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('SAAS');
            setDrillDownRestaurantId(null);
          }}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'SAAS'
              ? 'border-indigo-600 text-indigo-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Doanh Thu Gói SaaS & Lợi Nhuận Ròng</span>
        </button>
      </div>

      {/* TAB 1: GMV ANALYTICS */}
      {activeTab === 'GMV' && (
        <div className="space-y-6">
          {/* Back button if in drill-down */}
          {drillDownRestaurantId && gmvData?.isDrillDown && (
            <div className="flex items-center justify-between p-4 bg-purple-50/80 border border-purple-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDrillDownRestaurantId(null)}
                  className="p-1.5 bg-white rounded-xl shadow-2xs hover:bg-slate-100 transition cursor-pointer text-purple-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-extrabold text-purple-950 text-sm">
                    Đang xem chi tiết chi nhánh: {gmvData.restaurant?.name}
                  </h3>
                  <p className="text-xs text-purple-700">
                    Gói cước: {gmvData.restaurant?.plan} • Bấm nút quay lại để xem toàn bộ nhà hàng
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDrillDownRestaurantId(null)}
                className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
              >
                Quay lại danh sách tổng
              </button>
            </div>
          )}

          {/* GMV Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tổng Doanh Thu GMV</span>
              <div className="text-2xl font-black text-emerald-800 mt-2">
                {formatCurrencyVND(gmvData?.summary?.totalRevenue || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {gmvData?.summary?.totalOrders || 0} đơn hoàn thành
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-blue-600" /> VietQR Chuyển Khoản
              </span>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {formatCurrencyVND(gmvData?.summary?.paymentMethods?.VietQR || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Thanh toán tự động qua mã QR</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-amber-600" /> Tiền Mặt (Cash)
              </span>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {formatCurrencyVND(gmvData?.summary?.paymentMethods?.Cash || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Thu ngân thu trực tiếp tại quầy</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-600" /> Thẻ / Chuyển Khoản
              </span>
              <div className="text-xl font-bold text-slate-900 mt-2">
                {formatCurrencyVND(
                  (gmvData?.summary?.paymentMethods?.Card || 0) +
                    (gmvData?.summary?.paymentMethods?.Transfer || 0),
                )}
              </div>
              <div className="text-xs text-slate-400 mt-1">POS quẹt thẻ & chuyển khoản khác</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {gmvData?.isDrillDown ? 'Doanh Thu Từng Chi Nhánh' : 'Bảng Xếp Hạng Doanh Thu Các Nhà Hàng'}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Đơn Vị</th>
                    <th className="py-3 px-4 text-right">Tổng Đơn</th>
                    <th className="py-3 px-4 text-right">Tiền Mặt</th>
                    <th className="py-3 px-4 text-right">VietQR</th>
                    <th className="py-3 px-4 text-right">Thẻ & CK</th>
                    <th className="py-3 px-4 text-right">Tổng Doanh Thu</th>
                    {!gmvData?.isDrillDown && <th className="py-3 px-4 text-center">Chi Tiết</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gmvData?.isDrillDown ? (
                    gmvData.branches && gmvData.branches.length > 0 ? (
                      gmvData.branches.map((b) => (
                        <tr key={b.branchId} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-purple-600" />
                            {b.branchName}
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                            {b.orderCount} đơn
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-600">
                            {formatCurrencyVND(b.paymentMethods.Cash)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-600">
                            {formatCurrencyVND(b.paymentMethods.VietQR)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-slate-600">
                            {formatCurrencyVND(b.paymentMethods.Card + b.paymentMethods.Transfer)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                            {formatCurrencyVND(b.totalRevenue)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Chưa có đơn hàng nào tại các chi nhánh trong kỳ này
                        </td>
                      </tr>
                    )
                  ) : gmvData?.restaurants && gmvData.restaurants.length > 0 ? (
                    gmvData.restaurants.map((r) => (
                      <tr key={r.restaurantId} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                          <div className="text-[11px] text-slate-400">Gói: {r.plan}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                          {r.orderCount} đơn
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-600">
                          {formatCurrencyVND(r.paymentMethods.Cash)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-600">
                          {formatCurrencyVND(r.paymentMethods.VietQR)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-600">
                          {formatCurrencyVND(r.paymentMethods.Card + r.paymentMethods.Transfer)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                          {formatCurrencyVND(r.totalRevenue)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setDrillDownRestaurantId(r.restaurantId)}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-lg text-[11px] transition cursor-pointer border border-purple-200"
                          >
                            Xem chi nhánh
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {loading ? 'Đang tải dữ liệu...' : 'Không có doanh thu trong khoảng thời gian đã chọn'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAAS REVENUE & PROFIT */}
      {activeTab === 'SAAS' && (
        <div className="space-y-6">
          {/* SaaS KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total SaaS Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tổng Doanh Thu SaaS</span>
              <div className="text-2xl font-black text-indigo-900 mt-2">
                {formatCurrencyVND(saasData?.summary?.totalSaaSRevenue || 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Ký mới: {formatCurrencyVND(saasData?.summary?.initialSetupRevenue || 0)} • Tái ký:{' '}
                {formatCurrencyVND(saasData?.summary?.renewalRevenue || 0)}
              </div>
            </div>

            {/* Total Commission Incurred */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Chi Phí Hoa Hồng NVKD</span>
              <div className="text-2xl font-black text-amber-800 mt-2">
                {formatCurrencyVND(saasData?.summary?.commissions?.totalIncurred || 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Đã trả: {formatCurrencyVND(saasData?.summary?.commissions?.paid || 0)} • Đang chờ:{' '}
                {formatCurrencyVND(
                  (saasData?.summary?.commissions?.pending || 0) +
                    (saasData?.summary?.commissions?.approved || 0),
                )}
              </div>
            </div>

            {/* Accrual Net Profit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Lợi Nhuận Kế Toán (Accrual)</span>
              <div className="text-2xl font-black text-emerald-800 mt-2">
                {formatCurrencyVND(saasData?.summary?.profits?.accrualNetProfit || 0)}
              </div>
              <div className="text-xs text-emerald-600 mt-1 font-semibold">
                Biên lợi nhuận ròng: {saasData?.summary?.profits?.profitMarginPercent || 0}%
              </div>
            </div>

            {/* Cash Flow Net Profit */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Lợi Nhuận Dòng Tiền (Cash)</span>
              <div className="text-2xl font-black text-purple-900 mt-2">
                {formatCurrencyVND(saasData?.summary?.profits?.cashFlowNetProfit || 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Doanh thu trừ hoa hồng đã thực chi</div>
            </div>
          </div>

          {/* Recent Subscription Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Giao Dịch Gói Cước SaaS Gần Nhất</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Mã Giao Dịch</th>
                    <th className="py-3 px-4">Nhà Hàng</th>
                    <th className="py-3 px-4">Gói Cước</th>
                    <th className="py-3 px-4">Loại Giao Dịch</th>
                    <th className="py-3 px-4">NVKD Phụ Trách</th>
                    <th className="py-3 px-4 text-right">Số Tiền Thu</th>
                    <th className="py-3 px-4 text-center">Ngày Thu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {saasData?.recentTransactions && saasData.recentTransactions.length > 0 ? (
                    saasData.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                          {tx.transactionCode}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {tx.restaurantName}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            {tx.plan}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-700">
                            {tx.transactionType === 'INITIAL_SETUP' ? 'Ký Mới (Setup)' : 'Tái Ký (Gia Hạn)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {tx.salesName}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                          {formatCurrencyVND(tx.netAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-500">
                          {new Date(tx.paidAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {loading ? 'Đang tải dữ liệu...' : 'Chưa có giao dịch SaaS nào được ghi nhận'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
