'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, formatCurrencyVND } from '@imenu/utils';
import { PlatformSalesRepItem } from '@imenu/types';
import { useToast } from '@imenu/ui';
import {
  Users,
  UserPlus,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  X,
  Edit2,
  Lock,
  Unlock,
} from 'lucide-react';

export default function PlatformSalesPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'REPS' | 'APPLICATIONS' | 'PAYOUT'>('REPS');

  // Reps state
  const [salesReps, setSalesReps] = useState<PlatformSalesRepItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    referralCode: '',
    setupCommissionRate: 50,
    renewalCommissionRate: 20,
  });
  const [creating, setCreating] = useState(false);

  // Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Payout Batch state
  const [commissions, setCommissions] = useState<any[]>([]);
  const [selectedLedgerIds, setSelectedLedgerIds] = useState<string[]>([]);
  const [payoutReference, setPayoutReference] = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'REPS') {
        const res = await apiClient.platform.getSalesReps();
        if (res && res.data) {
          setSalesReps(res.data);
        }
      } else if (activeTab === 'APPLICATIONS') {
        const res = await apiClient.platform.getSalesApplications();
        if (res && res.data) {
          setApplications(res.data);
        }
      } else if (activeTab === 'PAYOUT') {
        const res = await apiClient.sales.getCommissions({ limit: 100 });
        if (res && res.data) {
          const list = (res.data as any).data || res.data;
          setCommissions(Array.isArray(list) ? list : []);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // 1. Tạo NVKD mới
  const handleCreateSalesRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName || !createForm.email || !createForm.phone) {
      toast.error('Vui lòng điền đầy đủ họ tên, email và số điện thoại');
      return;
    }

    try {
      setCreating(true);
      await apiClient.platform.createSalesRep({
        fullName: createForm.fullName,
        email: createForm.email,
        phone: createForm.phone,
        referralCode: createForm.referralCode || undefined,
        setupCommissionRate: Number(createForm.setupCommissionRate),
        renewalCommissionRate: Number(createForm.renewalCommissionRate),
      });

      toast.success(`Đã tạo tài khoản NVKD cho "${createForm.fullName}" thành công!`);
      setShowCreateModal(false);
      setCreateForm({
        fullName: '',
        email: '',
        phone: '',
        referralCode: '',
        setupCommissionRate: 50,
        renewalCommissionRate: 20,
      });
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi tạo NVKD');
    } finally {
      setCreating(false);
    }
  };

  // 2. Khóa / Mở khóa NVKD
  const handleToggleSalesRepStatus = async (rep: PlatformSalesRepItem) => {
    try {
      const newStatus = rep.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await apiClient.platform.updateSalesRep(rep.id, {
        status: newStatus,
      });
      toast.success(
        newStatus === 'ACTIVE'
          ? `Đã kích hoạt lại tài khoản NVKD "${rep.fullName}"`
          : `Đã tạm khóa tài khoản NVKD "${rep.fullName}"`,
      );
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi cập nhật trạng thái NVKD');
    }
  };

  // 3. Duyệt đơn ứng tuyển
  const handleApproveApplication = async (id: string) => {
    try {
      setApprovingId(id);
      const res = await apiClient.platform.approveSalesApplication(id);
      toast.success(res.message || 'Đã phê duyệt đơn ứng tuyển thành công!');
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi phê duyệt đơn');
    } finally {
      setApprovingId(null);
    }
  };

  // 4. Batch Select Commissions
  const toggleSelectAll = () => {
    const pendingIds = commissions
      .filter((c) => c.status === 'PENDING' || c.status === 'APPROVED')
      .map((c) => c.id || c._id);
    if (selectedLedgerIds.length === pendingIds.length) {
      setSelectedLedgerIds([]);
    } else {
      setSelectedLedgerIds(pendingIds);
    }
  };

  const toggleSelectLedger = (id: string) => {
    setSelectedLedgerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // 5. Phê duyệt hàng loạt
  const handleApproveBatch = async () => {
    if (selectedLedgerIds.length === 0) return;
    try {
      setPayoutSubmitting(true);
      const res = await apiClient.platform.executePayoutBatch({
        ledgerIds: selectedLedgerIds,
        action: 'APPROVE',
      });
      toast.success(res.message || 'Đã phê duyệt các khoản hoa hồng thành công!');
      setSelectedLedgerIds([]);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi phê duyệt hoa hồng');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  // 6. Thanh toán hàng loạt (Chốt kỳ đối soát)
  const handleConfirmPayout = async () => {
    if (selectedLedgerIds.length === 0) return;
    try {
      setPayoutSubmitting(true);
      const res = await apiClient.platform.executePayoutBatch({
        ledgerIds: selectedLedgerIds,
        action: 'PAY',
        payoutReference: payoutReference.trim() || undefined,
      });
      toast.success(
        res.message || 'Đã xác nhận chi trả các khoản hoa hồng thành công!',
      );
      setShowPayoutModal(false);
      setPayoutReference('');
      setSelectedLedgerIds([]);
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi xác nhận chi trả hoa hồng');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Quản Trị Nhân Sự & Đối Soát
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Đội Ngũ Nhân Viên Kinh Doanh & Chi Trả Hoa Hồng
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản trị nhân sự phát triển thị trường, phê duyệt đơn ứng tuyển và chốt kỳ đối soát thanh toán ngày 05 & 20.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'REPS' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition shadow-2xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm NVKD Mới</span>
            </button>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('REPS')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'REPS'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Đội Ngũ NVKD ({salesReps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'APPLICATIONS'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Đơn Ứng Tuyển Tuyển Dụng ({applications.filter((a) => a.status === 'PENDING').length} chờ duyệt)</span>
        </button>

        <button
          onClick={() => setActiveTab('PAYOUT')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 cursor-pointer transition ${
            activeTab === 'PAYOUT'
              ? 'border-purple-600 text-purple-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Đối Soát Hoa Hồng (Kỳ 05 & 20)</span>
        </button>
      </div>

      {/* TAB 1: SALES REPS LIST */}
      {activeTab === 'REPS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nhân Viên Kinh Doanh</th>
                  <th className="py-3 px-4">Mã Giới Thiệu</th>
                  <th className="py-3 px-4 text-center">Quán Đã Mời</th>
                  <th className="py-3 px-4 text-right">Tổng GMV Đóng Góp</th>
                  <th className="py-3 px-4 text-right">Doanh Thu SaaS</th>
                  <th className="py-3 px-4 text-right">Tổng Hoa Hồng</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesReps.length > 0 ? (
                  salesReps.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{rep.fullName}</div>
                        <div className="text-[11px] text-slate-400">{rep.email} • {rep.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold border border-purple-200 text-[11px]">
                          {rep.referralCode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-slate-800">
                          {rep.stats?.referredCount || 0} quán
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {rep.stats?.paidCount || 0} trả phí • {rep.stats?.qualifiedCount || 0} chuẩn
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                        {formatCurrencyVND(rep.stats?.totalGmv || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-indigo-700">
                        {formatCurrencyVND(rep.stats?.totalSaaSRevenue || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-amber-800">
                        {formatCurrencyVND(rep.stats?.commissions?.total || 0)}
                        <div className="text-[10px] text-slate-400 font-normal">
                          Đã trả: {formatCurrencyVND(rep.stats?.commissions?.paid || 0)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {rep.status === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Tạm khóa
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleSalesRepStatus(rep)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            rep.status === 'ACTIVE'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={rep.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                        >
                          {rep.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      {loading ? 'Đang tải danh sách NVKD...' : 'Chưa có nhân viên kinh doanh nào'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATIONS */}
      {activeTab === 'APPLICATIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ứng Viên</th>
                  <th className="py-3 px-4">Khu Vực</th>
                  <th className="py-3 px-4">Người Giới Thiệu</th>
                  <th className="py-3 px-4">Ngày Đăng Ký</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Phê Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{app.fullName}</div>
                        <div className="text-[11px] text-slate-400">{app.email} • {app.phone}</div>
                        {app.note && <div className="text-[11px] text-slate-500 mt-0.5 italic">"{app.note}"</div>}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {app.city || 'Toàn quốc'}
                      </td>
                      <td className="py-3.5 px-4">
                        {app.parentReferralCode ? (
                          <span className="font-mono text-purple-700 font-bold">
                            {app.parentReferralCode}
                          </span>
                        ) : (
                          <span className="text-slate-400">Trực tiếp</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {app.status === 'APPROVED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Đã Duyệt
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Chờ Duyệt
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {app.status === 'PENDING' ? (
                          <button
                            onClick={() => handleApproveApplication(app._id)}
                            disabled={approvingId === app._id}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-2xs"
                          >
                            {approvingId === app._id ? 'Đang duyệt...' : 'Phê duyệt & Cấp mã'}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Đã có tài khoản</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {loading ? 'Đang tải đơn ứng tuyển...' : 'Chưa có đơn ứng tuyển nào'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PAYOUT BATCHES */}
      {activeTab === 'PAYOUT' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Đã chọn: <strong className="text-purple-700">{selectedLedgerIds.length}</strong> khoản hoa hồng
              </span>
              <span className="text-xs text-slate-400">• Kỳ đối soát: Ngày 05 & 20 hằng tháng</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApproveBatch}
                disabled={selectedLedgerIds.length === 0 || payoutSubmitting}
                className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border border-indigo-200"
              >
                Phê duyệt hàng loạt
              </button>
              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={selectedLedgerIds.length === 0 || payoutSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                Chốt thanh toán ({selectedLedgerIds.length})
              </button>
            </div>
          </div>

          {/* Commissions Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={
                          selectedLedgerIds.length > 0 &&
                          selectedLedgerIds.length ===
                            commissions.filter((c) => c.status !== 'PAID').length
                        }
                        className="cursor-pointer rounded"
                      />
                    </th>
                    <th className="py-3 px-4">Mã Hoa Hồng</th>
                    <th className="py-3 px-4">NVKD Thụ Hưởng</th>
                    <th className="py-3 px-4">Loại Hoa Hồng & Công Thức</th>
                    <th className="py-3 px-4">Kỳ Đối Soát</th>
                    <th className="py-3 px-4 text-right">Số Tiền (VND)</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissions.length > 0 ? (
                    commissions.map((c) => {
                      const id = c.id || c._id;
                      const isSelected = selectedLedgerIds.includes(id);
                      return (
                        <tr
                          key={id}
                          className={`hover:bg-slate-50/60 transition ${
                            isSelected ? 'bg-purple-50/40' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={c.status === 'PAID'}
                              onChange={() => toggleSelectLedger(id)}
                              className="cursor-pointer rounded disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                            {c.ledgerCode}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">
                              {c.salesId?.fullName || 'NVKD'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Mã: {c.salesId?.referralCode || 'N/A'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{c.formulaSnapshot}</div>
                            <div className="text-[10px] text-slate-400 uppercase mt-0.5">
                              {c.commissionType}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-600">
                            {c.payoutPeriod}
                          </td>
                          <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                            {formatCurrencyVND(c.commissionAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {c.status === 'PAID' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Đã chi trả
                              </span>
                            ) : c.status === 'APPROVED' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                Đã duyệt
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Chờ duyệt
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        {loading ? 'Đang tải sổ cái hoa hồng...' : 'Chưa có bản ghi hoa hồng nào'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Thêm NVKD mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSalesRep}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Thêm Nhân Viên Kinh Doanh
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 text-xs space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn Kinh Doanh"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="sales@imenu.vn"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="0901234567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">
                  Mã Giới Thiệu (Tùy chọn, tự sinh nếu để trống)
                </label>
                <input
                  type="text"
                  value={createForm.referralCode}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, referralCode: e.target.value.toUpperCase() })
                  }
                  placeholder="VD: SALESVIP, THONG_123"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:border-purple-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">% Hoa hồng Setup:</label>
                  <input
                    type="number"
                    value={createForm.setupCommissionRate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, setupCommissionRate: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-purple-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">% Hoa hồng Duy trì:</label>
                  <input
                    type="number"
                    value={createForm.renewalCommissionRate}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, renewalCommissionRate: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-purple-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition cursor-pointer shadow-2xs"
              >
                {creating ? 'Đang tạo...' : 'Tạo tài khoản NVKD'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: Chốt Thanh Toán Hoa Hồng */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Xác Nhận Chi Trả Hoa Hồng Kỳ Đối Soát
              </h3>
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 text-xs space-y-3">
              <p>
                Bạn đang thực hiện chốt thanh toán cho{' '}
                <strong className="text-purple-700 font-bold">{selectedLedgerIds.length}</strong> khoản hoa hồng.
              </p>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">
                  Mã giao dịch ngân hàng / Tham chiếu chuyển khoản:
                </label>
                <input
                  type="text"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  placeholder="VD: MB_20261020_0099, VCB_BATCH_05"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                Hệ thống sẽ cập nhật trạng thái các khoản hoa hồng thành <strong>PAID</strong> bằng thao tác nguyên tử chống thanh toán đúp.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmPayout}
                disabled={payoutSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition cursor-pointer shadow-2xs"
              >
                {payoutSubmitting ? 'Đang xử lý...' : 'Xác nhận đã chuyển khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
