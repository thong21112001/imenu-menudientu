'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@imenu/utils';
import { SalesTeamMember, SalesDashboardData } from '@imenu/types';
import {
  Users,
  Copy,
  Check,
  ExternalLink,
  Award,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Share2,
  ArrowUpRight,
} from 'lucide-react';

export default function SalesTeamPage() {
  const [members, setMembers] = useState<SalesTeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [dashboardData, setDashboardData] = useState<SalesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [teamRes, dashRes] = await Promise.all([
        apiClient.sales.getSubTeam(),
        apiClient.sales.getDashboard().catch(() => null),
      ]);

      if (teamRes.data) {
        setMembers(teamRes.data.members || []);
        setTotal(teamRes.data.total || 0);
      }

      if (dashRes && dashRes.data) {
        setDashboardData(dashRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đội ngũ CTV');
    } finally {
      setLoading(false);
    }
  };

  const recruitUrl =
    dashboardData?.affiliate?.recruitAffiliateUrl ||
    (dashboardData?.affiliate?.referralCode
      ? `${typeof window !== 'undefined' ? window.location.origin : 'https://imenu.vn'}/tuyen-dung-nhan-vien-kinh-doanh?parentRef=${dashboardData.affiliate.referralCode}`
      : '');

  const handleCopyLink = () => {
    if (recruitUrl && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(recruitUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const filteredMembers = members.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(term) ||
      m.email?.toLowerCase().includes(term) ||
      m.phone?.toLowerCase().includes(term) ||
      m.referralCode?.toLowerCase().includes(term)
    );
  });

  // KPI calculations
  const totalReferredByTeam = members.reduce(
    (acc, m) => acc + (m.performance?.totalReferred || 0),
    0,
  );
  const totalQualifiedByTeam = members.reduce(
    (acc, m) => acc + (m.performance?.totalQualified || 0),
    0,
  );
  const totalOverrideEarned = members.filter(
    (m) => (m.performance?.totalQualified || 0) > 0,
  ).length * 250000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600" />
            Đội ngũ Cộng tác viên (Tuyến dưới)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Phát triển mạng lưới CTV kinh doanh và nhận hoa hồng thưởng lãnh đạo 250.000đ khi CTV có nhà hàng đầu tiên kích hoạt
          </p>
        </div>

        {recruitUrl && (
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Đã sao chép link' : 'Lấy link mời CTV'}</span>
          </button>
        )}
      </div>

      {/* Recruitment Invite Banner */}
      {recruitUrl && (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Chính sách Tuyển dụng & Thưởng Lãnh đạo
              </div>
              <h2 className="text-xl font-bold">Mời Đối tác tham gia Đội ngũ</h2>
              <p className="text-sm text-indigo-100">
                Gửi liên kết tuyển dụng này cho bạn bè/CTV. Khi họ đăng ký thành công qua mã giới thiệu của bạn, họ sẽ trở thành CTV tuyến dưới. Bạn nhận ngay <strong className="text-yellow-300">250.000đ</strong> khi CTV đó có nhà hàng đầu tiên phát sinh 5 hóa đơn thanh toán.
              </p>
            </div>
            <div className="w-full md:w-auto flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
              <input
                type="text"
                readOnly
                value={recruitUrl}
                className="bg-transparent text-white text-xs px-3 py-1.5 focus:outline-none w-full md:w-80 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs rounded-lg shadow-sm transition shrink-0 flex items-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng CTV tuyến dưới</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{total}</div>
          <p className="text-xs text-slate-500 mt-1">Cộng tác viên đang trực thuộc</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Nhà hàng CTV giới thiệu</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalReferredByTeam}</div>
          <p className="text-xs text-slate-500 mt-1">Tổng điểm bán do mạng lưới mang lại</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Nhà hàng Kích hoạt</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{totalQualifiedByTeam}</div>
          <p className="text-xs text-slate-500 mt-1">Đã phát sinh ≥ 5 hóa đơn thanh toán</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Thưởng Lãnh đạo CTV</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {totalOverrideEarned.toLocaleString('vi-VN')} đ
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {members.filter((m) => (m.performance?.totalQualified || 0) > 0).length} CTV đã mang lại thưởng
          </p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên CTV, email, SĐT, mã giới thiệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Hiển thị {filteredMembers.length} / {total} Cộng tác viên
          </div>
        </div>

        {/* State Views */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm">Đang tải danh sách đội ngũ...</p>
          </div>
        ) : error ? (
          <div className="p-6 m-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto stroke-1 mb-3 text-slate-300" />
            <p className="text-base font-semibold text-slate-700">Chưa có Cộng tác viên nào trong đội ngũ</p>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
              Hãy sao chép liên kết tuyển dụng ở trên và gửi cho đối tác tiềm năng để bắt đầu xây dựng đội ngũ của bạn!
            </p>
            {recruitUrl && (
              <button
                onClick={handleCopyLink}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-medium text-sm rounded-xl hover:bg-indigo-100 transition"
              >
                <Copy className="w-4 h-4" />
                Sao chép liên kết tuyển dụng
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Cộng tác viên</th>
                  <th className="py-3.5 px-4">Mã giới thiệu</th>
                  <th className="py-3.5 px-4">Ngày gia nhập</th>
                  <th className="py-3.5 px-4 text-center">Nhà hàng đã tạo</th>
                  <th className="py-3.5 px-4 text-center">Kích hoạt (≥5 đơn)</th>
                  <th className="py-3.5 px-4 text-center">Thưởng Override</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {filteredMembers.map((member) => {
                  const isQualified = (member.performance?.totalQualified || 0) > 0;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{member.fullName}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          {member.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {member.email}
                            </span>
                          )}
                          {member.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                          {member.referralCode || 'CHƯA TẠO'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {member.performance?.totalReferred || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isQualified
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {member.performance?.totalQualified || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isQualified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            +250.000 đ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            Đang tích lũy
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {member.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
