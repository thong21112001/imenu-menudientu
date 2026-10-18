'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@imenu/utils';
import { SalesDashboardData } from '@imenu/types';
import {
  TrendingUp,
  Store,
  DollarSign,
  Users,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Award,
  Calendar,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function SalesDashboardPage() {
  const [data, setData] = useState<SalesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRecruit, setCopiedRecruit] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.sales.getDashboard();
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải dữ liệu Bảng điều khiển đối tác');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, isRecruit = false) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (isRecruit) {
        setCopiedRecruit(true);
        setTimeout(() => setCopiedRecruit(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500 font-medium">Đang tải số liệu hiệu suất kinh doanh...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-xl mx-auto my-10 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-rose-900">Không thể tải thông tin đối tác</h3>
        <p className="text-xs text-rose-700">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { kpi, affiliate, policy, bankAccount } = data;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* ================= HERO HEADER ================= */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cổng Đối Tác Kinh Doanh iMenu (Partner Portal)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Chào mừng, Đối Tác Phát Triển Thị Trường
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl">
              Theo dõi doanh số nhà hàng, hoa hồng đối soát 4 tầng và mạng lưới cộng tác viên của bạn theo thời gian thực.
            </p>
          </div>

          {/* Kỳ đối soát Badge */}
          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-right space-y-1 shrink-0">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Kỳ Đối Soát Hiện Tại</span>
            <div className="text-lg font-black text-white flex items-center justify-end gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{affiliate.payoutPeriod}</span>
            </div>
            <span className="text-[10px] text-slate-300 block">Thanh toán chuyển khoản ngày 05 & 20</span>
          </div>
        </div>
      </div>

      {/* ================= 4 KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Hoa hồng tích lũy</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {kpi.totalCommissionEarned.toLocaleString('vi-VN')}₫
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Kỳ này: +{kpi.currentPeriodCommission.toLocaleString('vi-VN')}₫
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Nhà hàng đã mời</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 grid place-items-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {kpi.totalReferred} <span className="text-xs font-normal text-slate-500">quán</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {kpi.totalAssisted} quán tạo hộ trực tiếp
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Đạt chuẩn vận hành</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 grid place-items-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-900">
              {kpi.totalQualified} <span className="text-xs font-normal text-slate-500">quán</span>
            </div>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">
              Đã nhận thưởng 250K/quán
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Mạng lưới CTV</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 grid place-items-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-900">
              {kpi.subTeamCount} <span className="text-xs font-normal text-slate-500">CTV</span>
            </div>
            <p className="text-[11px] text-purple-700 font-medium mt-0.5">
              {kpi.totalPaid} quán đã lên gói trả phí
            </p>
          </div>
        </div>

      </div>

      {/* ================= AFFILIATE TOOLBOX & REFERRAL LINKS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cột trái: Bộ công cụ tiếp thị (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Công Cụ Tiếp Thị Của Bạn</h2>
              <p className="text-xs text-slate-500">Chia sẻ đường link hoặc mã giới thiệu để tự động gắn attribution vĩnh viễn.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
              {affiliate.referralCode}
            </span>
          </div>

          <div className="space-y-4">
            {/* Tool 1: Link mời chủ quán */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-700" />
                  Link Giới Thiệu Chủ Quán Mở Nhà Hàng:
                </span>
                <a
                  href={affiliate.affiliateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:underline flex items-center gap-1 font-bold text-[11px]"
                >
                  Mở thử <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={affiliate.affiliateUrl}
                  className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-700 select-all focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(affiliate.affiliateUrl, false)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>

            {/* Tool 2: Link tuyển dụng CTV */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-700" />
                  Link Mời Bạn Bè Làm Cộng Tác Viên (CTV):
                </span>
                <a
                  href={affiliate.recruitAffiliateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-700 hover:underline flex items-center gap-1 font-bold text-[11px]"
                >
                  Mở thử <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={affiliate.recruitAffiliateUrl}
                  className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-700 select-all focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(affiliate.recruitAffiliateUrl, true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copiedRecruit ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedRecruit ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/sales/restaurants"
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Xem danh sách nhà hàng & Tạo giúp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/sales/commissions"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Chi tiết sổ cái hoa hồng</span>
            </Link>
          </div>
        </div>

        {/* Cột phải: Thông tin thanh toán & Chính sách hoa hồng (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Ngân hàng nhận tiền */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                Tài khoản nhận đối soát
              </h3>
              <Link href="/sales/commissions" className="text-xs text-emerald-700 hover:underline font-bold">
                Cập nhật
              </Link>
            </div>

            {bankAccount?.accountNo ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 text-emerald-950">
                <div className="flex justify-between font-bold">
                  <span>{bankAccount.bankName} ({bankAccount.bankId})</span>
                  <span className="font-mono">{bankAccount.accountNo}</span>
                </div>
                <div className="text-[11px] text-emerald-800 uppercase tracking-wider font-semibold">
                  Chủ TK: {bankAccount.accountName}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold">Chưa cập nhật tài khoản ngân hàng!</p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Vui lòng cập nhật số tài khoản để nhận chuyển khoản hoa hồng định kỳ ngày 05 & 20.
                </p>
              </div>
            )}
          </div>

          {/* Card Tóm tắt 4 Tầng Hoa Hồng */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Chính sách 4 tầng hoa hồng
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Tầng 1 (Setup trả phí lần đầu):</span>
                <span className="font-black text-amber-700">{policy.setupCommissionRate}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Tầng 2 (Duy trì tái ký hằng năm):</span>
                <span className="font-black text-emerald-700">{policy.renewalCommissionRate}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Tầng 3 (Thưởng mở mới vận hành):</span>
                <span className="font-black text-blue-700">{policy.activationBonusAmount.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Tầng 4 (Thưởng phát triển CTV):</span>
                <span className="font-black text-purple-700">{policy.teamBonusAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
