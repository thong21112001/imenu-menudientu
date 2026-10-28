'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiClient, formatCurrencyVND, storageService } from '@imenu/utils';
import {
  RevenueReportData,
  TopItemsResponseData,
  TopItemData,
  RestaurantBranch,
  PaymentMethodStatItem,
  BranchBreakdownItem,
  CategoryBreakdownItem,
} from '@imenu/types';
import { Card, Badge, Button, CustomSelect, useToast } from '@imenu/ui';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  Building2,
  Store,
  RefreshCw,
  Loader2,
  Download,
  FileSpreadsheet,
  Users,
  CreditCard,
  ShoppingBag,
  Percent,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

type DatePreset = 'today' | '7days' | '30days' | 'thisMonth' | 'custom';
type GroupByOption = 'day' | 'week' | 'month';

function getTodayVnDate(): string {
  const now = new Date();
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return vn.toISOString().split('T')[0];
}

function calculateDatesForPreset(preset: DatePreset): { startDate: string; endDate: string } {
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const todayStr = vnNow.toISOString().split('T')[0];

  switch (preset) {
    case 'today':
      return { startDate: todayStr, endDate: todayStr };
    case '7days': {
      const past7 = new Date(vnNow.getTime() - 6 * 24 * 60 * 60 * 1000);
      return { startDate: past7.toISOString().split('T')[0], endDate: todayStr };
    }
    case '30days': {
      const past30 = new Date(vnNow.getTime() - 29 * 24 * 60 * 60 * 1000);
      return { startDate: past30.toISOString().split('T')[0], endDate: todayStr };
    }
    case 'thisMonth': {
      const year = vnNow.getFullYear();
      const month = String(vnNow.getMonth() + 1).padStart(2, '0');
      return { startDate: `${year}-${month}-01`, endDate: todayStr };
    }
    default:
      return { startDate: todayStr, endDate: todayStr };
  }
}

export default function ReportsPage() {
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(storageService.getCurrentUser());
  const [permissions, setPermissions] = useState<string[]>([]);
  const [branches, setBranches] = useState<RestaurantBranch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(storageService.getActiveBranchId());

  // Bộ lọc
  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const [groupBy, setGroupBy] = useState<GroupByOption>('day');
  const [startDate, setStartDate] = useState<string>(() => calculateDatesForPreset('30days').startDate);
  const [endDate, setEndDate] = useState<string>(() => calculateDatesForPreset('30days').endDate);

  // Tab hiển thị bảng xếp hạng: 'topItems' | 'categories' | 'branches'
  const [activeTab, setActiveTab] = useState<'topItems' | 'categories' | 'branches'>('topItems');

  // Dữ liệu báo cáo
  const [report, setReport] = useState<RevenueReportData | null>(null);
  const [topItemsData, setTopItemsData] = useState<TopItemsResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const requestIdRef = useRef(0);

  const roleSlug = String(currentUser?.role || '').toLowerCase();
  const isSuperAdmin = roleSlug === 'system_admin' || roleSlug === 'super_admin';
  const isOwner = roleSlug === 'restaurant_admin';
  const isMainBranchUser = isSuperAdmin || Boolean(currentUser?.isMainBranch);

  // Quyền xuất file báo cáo
  const canExport = isSuperAdmin || isOwner || permissions.includes('perm-rep-export');

  const loadData = async (
    bId = activeBranchId,
    sDate = startDate,
    eDate = endDate,
    gBy = groupBy,
  ) => {
    const currentReqId = ++requestIdRef.current;
    setLoading(true);

    try {
      // 1. Tải báo cáo doanh thu
      const revRes = await apiClient.reports.getRevenue({
        startDate: sDate,
        endDate: eDate,
        groupBy: gBy,
        branchId: bId || undefined,
      });

      if (currentReqId !== requestIdRef.current) return;

      if (revRes?.data) {
        setReport(revRes.data);
      } else {
        setReport(null);
      }

      // 2. Tải danh sách top món bán chạy & phân bổ danh mục
      const topRes = await apiClient.reports.getTopItems({
        startDate: sDate,
        endDate: eDate,
        branchId: bId || undefined,
        limit: 15,
      });

      if (currentReqId !== requestIdRef.current) return;

      if (topRes?.data) {
        setTopItemsData(topRes.data);
      } else {
        setTopItemsData(null);
      }
    } catch (err: any) {
      if (currentReqId !== requestIdRef.current) return;
      console.error('Lỗi khi tải dữ liệu báo cáo:', err);
      toast.error(err.message || 'Không thể tải báo cáo từ máy chủ.');
      setReport(null);
      setTopItemsData(null);
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const loadBranches = async () => {
    try {
      const res = await apiClient.branches.list();
      if (res?.data && Array.isArray(res.data)) {
        setBranches(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    setCurrentUser(storageService.getCurrentUser());
    setPermissions(storageService.getPermissions() || []);
    loadBranches();
    loadData(activeBranchId, startDate, endDate, groupBy);

    const handleBranchChange = (e: any) => {
      const bId = e.detail?.branchId ?? null;
      setActiveBranchId(bId);
      loadData(bId, startDate, endDate, groupBy);
    };

    window.addEventListener('imenu:branch_changed', handleBranchChange);
    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
    };
  }, []);

  // Xử lý đổi Preset thời gian
  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom') {
      const range = calculateDatesForPreset(preset);
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      loadData(activeBranchId, range.startDate, range.endDate, groupBy);
    }
  };

  const handleCustomDateApply = () => {
    if (startDate > endDate) {
      toast.error('Ngày bắt đầu không được lớn hơn ngày kết thúc!');
      return;
    }
    loadData(activeBranchId, startDate, endDate, groupBy);
  };

  const handleGroupByChange = (gBy: GroupByOption) => {
    setGroupBy(gBy);
    loadData(activeBranchId, startDate, endDate, gBy);
  };

  // Xuất file CSV bảo mật (UTF-8 BOM, Anti-Injection)
  const handleExportCsv = async () => {
    if (!canExport) {
      toast.error('Bạn không có quyền xuất dữ liệu báo cáo (Yêu cầu perm-rep-export).');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await apiClient.reports.exportReport({
        startDate,
        endDate,
        branchId: activeBranchId || undefined,
        format: 'csv',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imenu-report-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Xuất file báo cáo CSV (chuẩn UTF-8 BOM) thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xuất file báo cáo');
    } finally {
      setIsExporting(false);
    }
  };

  const activeBranchName = !activeBranchId
    ? 'Toàn chuỗi (Hợp nhất)'
    : branches.find((b: any) => (b._id || b.id) === activeBranchId)?.name || 'Chi nhánh';

  // Chuỗi thời gian cho biểu đồ xu hướng
  const timelineItems = report?.timeline || [];
  const maxTimelineRev = Math.max(...timelineItems.map((t) => t.revenue), 100000);

  // Phương thức thanh toán
  const pmStats = report?.paymentMethodStats || [];
  const totalPmRev = pmStats.reduce((sum, p) => sum + p.revenue, 0);

  // Top món & Danh mục
  const topItemsList: TopItemData[] = topItemsData?.items || [];
  const categoriesList: CategoryBreakdownItem[] = topItemsData?.categoryBreakdown || [];
  const branchBreakdownList: BranchBreakdownItem[] = report?.branchBreakdown || [];

  return (
    <div className="space-y-6 pb-16">
      {/* =========================================================================
          KHU VỰC 1: HEADER & THANH CÔNG CỤ LỌC THỜI GIAN / CHI NHÁNH / XUẤT CSV
          ========================================================================= */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-[#09271d] tracking-tight">
                Báo Cáo & Phân Tích Doanh Thu
              </h1>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#176044] border border-emerald-200">
                <Building2 className="w-3.5 h-3.5" />
                {activeBranchId ? activeBranchName : 'Toàn chuỗi (HQ)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Phân tích doanh thu thuần, tỷ trọng thanh toán VietQR và hiệu suất thực đơn
            </p>
          </div>

          {/* Cụm thao tác: Làm mới & Xuất CSV */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadData(activeBranchId, startDate, endDate, groupBy)}
              className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#176044]' : ''}`} />
            </button>

            {canExport && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCsv}
                disabled={isExporting}
                className="rounded-xl font-bold bg-[#176044] hover:bg-[#124a36] text-white shadow-xs"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Đang xuất...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4 mr-1.5 text-amber-300" /> Xuất file CSV (Excel)
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Thanh công cụ lọc: Presets + Độ mịn + Chọn ngày tùy chỉnh */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Nhóm nút chọn kỳ nhanh */}
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 font-semibold">
            {(
              [
                { id: 'today', label: 'Hôm nay' },
                { id: '7days', label: '7 ngày qua' },
                { id: '30days', label: '30 ngày qua' },
                { id: 'thisMonth', label: 'Tháng này' },
                { id: 'custom', label: 'Tùy chọn' },
              ] as { id: DatePreset; label: string }[]
            ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset.id)}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                  datePreset === preset.id
                    ? 'bg-white text-[#09271d] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Bộ chọn độ mịn theo ngày / tuần / tháng */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Gom theo:</span>
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 text-xs font-bold">
              {(
                [
                  { id: 'day', label: 'Ngày' },
                  { id: 'week', label: 'Tuần' },
                  { id: 'month', label: 'Tháng' },
                ] as { id: GroupByOption; label: string }[]
              ).map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleGroupByChange(g.id)}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    groupBy === g.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ô nhập ngày tùy chỉnh (khi chọn 'custom') */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold"
              />
              <span className="text-slate-400 font-medium">đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold"
              />
              <Button size="sm" variant="primary" onClick={handleCustomDateApply}>
                Áp dụng
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          KHU VỰC 2: 4 THẺ CHỈ SỐ TÀI CHÍNH TOÀN DIỆN
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Tổng doanh thu thuần */}
        <Card className="p-5 bg-white border border-slate-200/80 shadow-xs">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Tổng doanh thu thuần
            </span>
            <div className="text-2xl font-black text-[#176044] tracking-tight">
              {formatCurrencyVND(report?.totalRevenue || 0)}
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-0.5 text-[11px] text-slate-500">
              <div className="flex justify-between">
                <span>Tạm tính món:</span>
                <span className="font-bold text-slate-700">{formatCurrencyVND(report?.subTotal || 0)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Giảm giá / Ưu đãi:</span>
                <span className="font-bold">-{formatCurrencyVND(report?.totalDiscount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thuế VAT & Phí DV:</span>
                <span className="font-bold">+{formatCurrencyVND((report?.totalVat || 0) + (report?.totalServiceFee || 0))}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Thẻ 2: Đơn hoàn tất & Đơn hủy */}
        <Card className="p-5 bg-white border border-slate-200/80 shadow-xs">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Số đơn phát sinh
            </span>
            <div className="text-2xl font-black text-[#09271d] tracking-tight">
              {report?.completedOrders || 0}
              <span className="text-base font-semibold text-slate-400"> / {report?.orderCount || 0} đơn</span>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất
                </span>
                <span className="font-bold text-slate-800">
                  {report?.orderCount ? Math.round(((report.completedOrders || 0) / report.orderCount) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-rose-600 font-bold">
                  <XCircle className="w-3.5 h-3.5" /> Đơn đã hủy
                </span>
                <span className="font-bold text-rose-600">{report?.cancelledOrders || 0} đơn</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Thẻ 3: AOV & Lượt khách */}
        <Card className="p-5 bg-white border border-slate-200/80 shadow-xs">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Giá trị TB Đơn (AOV)
            </span>
            <div className="text-2xl font-black text-blue-700 tracking-tight">
              {formatCurrencyVND(report?.averageOrderValue || 0)}
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-0.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> Tổng khách phục vụ:
                </span>
                <span className="font-bold text-slate-900">{report?.totalGuests || 0} lượt</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Chi tiêu TB / khách:</span>
                <span className="font-bold text-slate-700">
                  {formatCurrencyVND(
                    report?.totalGuests && report.totalGuests > 0
                      ? Math.round((report.totalRevenue || 0) / report.totalGuests)
                      : 0,
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Thẻ 4: Tỷ lệ thanh toán VietQR */}
        <Card className="p-5 bg-white border border-slate-200/80 shadow-xs">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Tỷ trọng VietQR
            </span>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {report?.vietQrPercentage || 0}%
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-linear-to-r from-teal-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${Math.min(report?.vietQrPercentage || 0, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Thanh toán không tiền mặt trực tiếp tại bàn ăn
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* =========================================================================
          KHU VỰC 3: BIỂU ĐỒ XU HƯỚNG DOANH THU & PHƯƠNG THỨC THANH TOÁN
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Cột trái: Biểu đồ xu hướng Timeline (xl:col-span-8) */}
        <Card className="xl:col-span-8 p-6 space-y-5 bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Biểu Đồ Xu Hướng Doanh Thu
              </h2>
              <p className="text-xs text-slate-500">
                Gom nhóm theo {groupBy === 'day' ? 'ngày' : groupBy === 'week' ? 'tuần' : 'tháng'} ({startDate} → {endDate})
              </p>
            </div>
            <Badge variant="brand">{timelineItems.length} mốc dữ liệu</Badge>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="h-64 min-w-[500px] flex items-end gap-2.5 pt-8 pb-3 px-2 border-b border-slate-200">
              {timelineItems.length === 0 ? (
                <div className="w-full h-full grid place-items-center text-xs text-slate-400">
                  Chưa có giao dịch phát sinh trong khoảng thời gian này
                </div>
              ) : (
                timelineItems.map((item) => {
                  const rev = item.revenue || 0;
                  const heightPercent = maxTimelineRev > 0 ? Math.max(Math.round((rev / maxTimelineRev) * 100), 6) : 6;

                  return (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-linear-to-t from-[#124a36] to-[#1f7a55] rounded-t-lg group-hover:from-amber-500 group-hover:to-amber-400 transition-all relative cursor-pointer"
                      >
                        {/* Tooltip bay khi hover */}
                        <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold transition-opacity whitespace-nowrap shadow-xl z-20">
                          <div>{item.date} · {item.orderCount} đơn</div>
                          <div className="text-amber-400 text-xs">{formatCurrencyVND(rev)}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold truncate max-w-[50px]">
                        {item.date.slice(5)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Cột phải: Phương thức thanh toán (xl:col-span-4) */}
        <Card className="xl:col-span-4 p-6 space-y-5 bg-white border border-slate-200/80 shadow-xs">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Kênh Thanh Toán
            </h2>
            <p className="text-xs text-slate-500">
              Phân bổ số đơn và doanh thu theo hình thức
            </p>
          </div>

          <div className="space-y-4">
            {pmStats.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Chưa có dữ liệu thanh toán
              </div>
            ) : (
              pmStats.map((pm) => {
                const colorClass =
                  pm.method === 'VietQR'
                    ? 'bg-emerald-500'
                    : pm.method === 'Cash'
                    ? 'bg-amber-500'
                    : pm.method === 'Card'
                    ? 'bg-blue-500'
                    : 'bg-purple-500';

                return (
                  <div key={pm.method} className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${colorClass}`} />
                        {pm.label}
                      </span>
                      <span className="font-black text-slate-900">{formatCurrencyVND(pm.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{pm.orderCount} đơn hàng</span>
                      <span className="font-bold text-emerald-600">{pm.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className={`${colorClass} h-1.5 rounded-full`} style={{ width: `${pm.percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* =========================================================================
          KHU VỰC 4: TOP MÓN BÁN CHẠY & PHÂN BỔ DANH MỤC / CHI NHÁNH
          ========================================================================= */}
      <Card className="p-6 space-y-5 bg-white border border-slate-200/80 shadow-xs">
        {/* Header Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Hiệu Suất Thực Đơn & Chi Nhánh
            </h2>
            <p className="text-xs text-slate-500">
              Chi tiết xếp hạng món ăn, doanh thu theo phân loại và cơ cấu chi nhánh
            </p>
          </div>

          <div className="inline-flex p-1 rounded-lg bg-slate-100 text-xs font-bold">
            <button
              onClick={() => setActiveTab('topItems')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'topItems'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              🔥 Top Món Bán Chạy ({topItemsList.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                activeTab === 'categories'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📂 Cơ Cấu Danh Mục ({categoriesList.length})
            </button>
            {branchBreakdownList.length > 0 && (
              <button
                onClick={() => setActiveTab('branches')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                  activeTab === 'branches'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🏢 Phân Bổ Chi Nhánh ({branchBreakdownList.length})
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: TOP MÓN BÁN CHẠY */}
        {activeTab === 'topItems' && (
          <div>
            {topItemsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Chưa có dữ liệu món bán chạy trong khoảng thời gian này
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold tracking-wider">
                        <th className="py-3 px-3 w-12 text-center">Hạng</th>
                        <th className="py-3 px-3">Tên món ăn</th>
                        <th className="py-3 px-3">Danh mục</th>
                        <th className="py-3 px-3 text-right">Số lượng bán</th>
                        <th className="py-3 px-3 text-right">Doanh thu</th>
                        <th className="py-3 px-3 w-48 text-right">Tỷ trọng doanh số</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topItemsList.map((item, idx) => (
                        <tr key={item.itemId || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`w-6 h-6 rounded-full inline-grid place-items-center font-black text-[11px] ${
                                idx === 0
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : idx === 1
                                  ? 'bg-slate-200 text-slate-700'
                                  : idx === 2
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'text-slate-500'
                              }`}
                            >
                              {item.rank || idx + 1}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-bold text-slate-900">{item.name}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              {item.categoryName || 'Món chính'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-black text-slate-800">{item.quantity} phần</td>
                          <td className="py-3.5 px-3 text-right font-black text-[#176044]">
                            {formatCurrencyVND(item.revenue)}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-1.5 rounded-full"
                                  style={{ width: `${item.percentageOfRevenue || 0}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-600 text-[11px] w-12 text-right">
                                {item.percentageOfRevenue || 0}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                  {topItemsList.map((item, idx) => (
                    <div
                      key={item.itemId || idx}
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full inline-grid place-items-center font-black text-[11px] ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            #{item.rank || idx + 1}
                          </span>
                          <strong className="text-xs text-slate-900">{item.name}</strong>
                        </div>
                        <span className="text-xs font-black text-[#176044]">
                          {formatCurrencyVND(item.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                        <span>{item.categoryName || 'Món chính'}</span>
                        <span>Đã bán: <strong className="text-slate-800">{item.quantity}</strong> phần ({item.percentageOfRevenue || 0}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: CƠ CẤU DANH MỤC */}
        {activeTab === 'categories' && (
          <div className="space-y-3">
            {categoriesList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Chưa có dữ liệu danh mục
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.categoryName}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900">{cat.categoryName}</strong>
                      <span className="text-xs font-black text-[#176044]">
                        {formatCurrencyVND(cat.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Đã bán: {cat.quantity} phần</span>
                      <span className="font-bold text-emerald-600">{cat.percentage}% doanh số</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PHÂN BỔ CHI NHÁNH */}
        {activeTab === 'branches' && (
          <div>
            {branchBreakdownList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Chưa có dữ liệu chi nhánh
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {branchBreakdownList.map((b) => (
                  <div
                    key={b.branchId}
                    className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-xs text-slate-900">{b.branchName}</strong>
                        {b.isMainBranch && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            HQ
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-black text-[#176044]">
                        {formatCurrencyVND(b.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{b.orderCount} đơn</span>
                      <span className="font-bold text-emerald-600">{b.percentage || 0}% tổng doanh thu</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#176044] h-1.5 rounded-full"
                        style={{ width: `${b.percentage || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
