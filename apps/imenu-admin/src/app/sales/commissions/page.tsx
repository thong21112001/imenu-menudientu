'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@imenu/utils';
import { CommissionItem, PayoutBankAccount } from '@imenu/types';
import {
  DollarSign,
  CreditCard,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  Save,
} from 'lucide-react';

export default function SalesCommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [commissionType, setCommissionType] = useState('');
  const [status, setStatus] = useState('');
  const [payoutPeriod, setPayoutPeriod] = useState('');

  // Bank Form State
  const [bankId, setBankId] = useState('MB');
  const [bankName, setBankName] = useState('MBBank');
  const [accountNo, setAccountNo] = useState('');
  const [accountName, setAccountName] = useState('');
  const [savingBank, setSavingBank] = useState(false);
  const [bankMsg, setBankMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCommissions();
    loadDashboardBank();
  }, [page, commissionType, status, payoutPeriod]);

  const loadDashboardBank = async () => {
    try {
      const res = await apiClient.sales.getDashboard();
      if (res.data?.bankAccount) {
        const b = res.data.bankAccount;
        if (b.bankId) setBankId(b.bankId);
        if (b.bankName) setBankName(b.bankName);
        if (b.accountNo) setAccountNo(b.accountNo);
        if (b.accountName) setAccountName(b.accountName);
      }
    } catch {}
  };

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const res = await apiClient.sales.getCommissions({
        commissionType: commissionType || undefined,
        status: status || undefined,
        payoutPeriod: payoutPeriod || undefined,
        page,
        limit,
      });

      if (res.data) {
        setCommissions(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch {
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNo || !accountName) {
      setBankMsg({ type: 'error', text: 'Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản' });
      return;
    }

    setSavingBank(true);
    setBankMsg(null);

    try {
      const res = await apiClient.sales.updatePayoutBank({
        bankId,
        bankName,
        accountNo: accountNo.trim(),
        accountName: accountName.trim().toUpperCase(),
      });

      if (res.data?.success) {
        setBankMsg({ type: 'success', text: 'Đã lưu thông tin tài khoản ngân hàng nhận hoa hồng!' });
      } else {
        setBankMsg({ type: 'error', text: res.message || 'Cập nhật tài khoản thất bại' });
      }
    } catch (err: any) {
      setBankMsg({ type: 'error', text: err.message || 'Cập nhật thất bại' });
    } finally {
      setSavingBank(false);
    }
  };

  const bankOptions = [
    { id: 'MB', name: 'MBBank (Ngân hàng Quân Đội)' },
    { id: 'VCB', name: 'Vietcombank (Ngoại thương VN)' },
    { id: 'TCB', name: 'Techcombank (Kỹ thương)' },
    { id: 'ACB', name: 'ACB (Á Châu)' },
    { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
    { id: 'BIDV', name: 'BIDV (Đầu tư & Phát triển)' },
    { id: 'CTG', name: 'VietinBank (Công thương VN)' },
    { id: 'TPB', name: 'TPBank (Tiên Phong)' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Sổ Cái Hoa Hồng & Đối Soát ({total})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Minh bạch từng đồng thu nhập với công thức diễn giải chi tiết. Đối soát và chuyển khoản ngày 05 & 20 hằng tháng.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= SỔ CÁI HOA HỒNG (8 cols) ================= */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <select
                value={commissionType}
                onChange={(e) => {
                  setCommissionType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="">Tất cả 4 tầng hoa hồng</option>
                <option value="SETUP_COMMISSION">Tầng 1 — 50% Phí Setup</option>
                <option value="RENEWAL_COMMISSION">Tầng 2 — 20% Phí Duy Trì</option>
                <option value="ACTIVATION_BONUS">Tầng 3 — Thưởng Mở Mới 250K</option>
                <option value="TEAM_OVERRIDE_BONUS">Tầng 4 — Thưởng CTV 250K</option>
              </select>
            </div>

            <div>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="APPROVED">Đã ghi nhận (APPROVED)</option>
                <option value="PAID">Đã thanh toán (PAID)</option>
                <option value="PENDING">Chờ duyệt (PENDING)</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="Lọc theo kỳ: 2026-10-K1..."
                value={payoutPeriod}
                onChange={(e) => {
                  setPayoutPeriod(e.target.value.toUpperCase());
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Mã Chứng Từ</th>
                    <th className="py-3 px-4">Loại Hoa Hồng</th>
                    <th className="py-3 px-4 text-right">Số Tiền</th>
                    <th className="py-3 px-4">Diễn Giải Công Thức</th>
                    <th className="py-3 px-4">Kỳ Đối Soát</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                        Đang tải sổ cái hoa hồng...
                      </td>
                    </tr>
                  ) : commissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Chưa phát sinh bản ghi hoa hồng nào trong kỳ đối soát này.
                      </td>
                    </tr>
                  ) : (
                    commissions.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-[11px]">
                          {item.ledgerCode}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.commissionType === 'SETUP_COMMISSION'
                                ? 'bg-amber-100 text-amber-900'
                                : item.commissionType === 'RENEWAL_COMMISSION'
                                ? 'bg-emerald-100 text-emerald-900'
                                : item.commissionType === 'ACTIVATION_BONUS'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-purple-100 text-purple-900'
                            }`}
                          >
                            {item.commissionType === 'SETUP_COMMISSION'
                              ? '50% Setup'
                              : item.commissionType === 'RENEWAL_COMMISSION'
                              ? '20% Duy Trì'
                              : item.commissionType === 'ACTIVATION_BONUS'
                              ? 'Thưởng 250K Mở Mới'
                              : 'Thưởng 250K CTV'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900">
                          +{item.commissionAmount.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-xs leading-relaxed">
                          {item.formulaSnapshot}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 font-semibold">
                          {item.payoutPeriod}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'APPROVED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status === 'PAID' ? 'Đã chi trả' : 'Đã duyệt'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Trang {page} / {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= FORM CÀI ĐẶT TÀI KHOẢN NGÂN HÀNG (4 cols) ================= */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <span>Ngân Hàng Nhận Tiền</span>
            </h3>
            <p className="text-xs text-slate-500">
              Hoa hồng được chuyển tự động vào tài khoản chính chủ vào ngày 05 và ngày 20 hằng tháng.
            </p>
          </div>

          {bankMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                bankMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              {bankMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{bankMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateBank} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ngân hàng nhận tiền *</label>
              <select
                value={bankId}
                onChange={(e) => {
                  const b = bankOptions.find((x) => x.id === e.target.value);
                  if (b) {
                    setBankId(b.id);
                    setBankName(b.name.split(' (')[0]);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                {bankOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Số tài khoản ngân hàng *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 0908888999"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Tên chủ tài khoản (Viết hoa không dấu) *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: NGUYEN VAN A"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl uppercase focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingBank}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingBank ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{savingBank ? 'Đang lưu...' : 'Lưu Tài Khoản Ngân Hàng'}</span>
              </button>
            </div>
          </form>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block">Lịch đối soát Napas 247:</span>
            <p>• Kỳ 1 (ngày 05): Đối soát giao dịch từ ngày 16 đến ngày cuối tháng trước.</p>
            <p>• Kỳ 2 (ngày 20): Đối soát giao dịch từ ngày 01 đến ngày 15 trong tháng.</p>
          </div>
        </div>

      </div>

    </div>
  );
}
