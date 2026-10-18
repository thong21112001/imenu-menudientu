'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, formatCurrencyVND, storageService } from '@imenu/utils';
import { PlatformRestaurantItem } from '@imenu/types';
import { useToast } from '@imenu/ui';
import {
  Store,
  Search,
  Filter,
  Lock,
  Unlock,
  CreditCard,
  ExternalLink,
  Crown,
  AlertTriangle,
  RefreshCw,
  Building2,
  Users,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function PlatformRestaurantsPage() {
  const router = useRouter();
  const toast = useToast();

  const [items, setItems] = useState<PlatformRestaurantItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isSuspendedFilter, setIsSuspendedFilter] = useState('');

  // Modals state
  const [selectedRestaurant, setSelectedRestaurant] = useState<PlatformRestaurantItem | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const [showSubModal, setShowSubModal] = useState(false);
  const [newPlan, setNewPlan] = useState('Pro');
  const [billingCycle, setBillingCycle] = useState('YEARLY');
  const [transactionType, setTransactionType] = useState<'INITIAL_SETUP' | 'RENEWAL'>('INITIAL_SETUP');
  const [netAmount, setNetAmount] = useState(4800000);
  const [subSubmitting, setSubSubmitting] = useState(false);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await apiClient.platform.getRestaurants({
        search: search.trim() || undefined,
        plan: planFilter || undefined,
        subscriptionStatus: statusFilter || undefined,
        isSuspended: isSuspendedFilter !== '' ? isSuspendedFilter : undefined,
        page,
        limit,
      });

      if (res && res.data) {
        setItems(res.data.items || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tải danh sách nhà hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [page, planFilter, statusFilter, isSuspendedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants();
  };

  // 1. Vào quản trị quán (Impersonate Context)
  const handleImpersonate = (restaurant: PlatformRestaurantItem) => {
    storageService.setSelectedRestaurantId(restaurant.id);
    window.dispatchEvent(
      new CustomEvent('imenu:restaurant_changed', {
        detail: { restaurantId: restaurant.id },
      }),
    );
    toast.success(`Đã chuyển ngữ cảnh sang hỗ trợ nhà hàng: "${restaurant.name}"`);
    router.push('/tables');
  };

  // 2. Xử lý Khóa / Mở khóa
  const handleToggleStatus = async () => {
    if (!selectedRestaurant) return;
    try {
      setStatusSubmitting(true);
      const newSuspendedState = !selectedRestaurant.isSuspended;
      await apiClient.platform.updateRestaurantStatus(selectedRestaurant.id, {
        isSuspended: newSuspendedState,
        suspendReason: newSuspendedState ? suspendReason : undefined,
      });

      toast.success(
        newSuspendedState
          ? `Đã tạm khóa nhà hàng "${selectedRestaurant.name}" thành công`
          : `Đã mở khóa nhà hàng "${selectedRestaurant.name}" thành công`,
      );

      setShowStatusModal(false);
      setSelectedRestaurant(null);
      setSuspendReason('');
      fetchRestaurants();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi cập nhật trạng thái nhà hàng');
    } finally {
      setStatusSubmitting(false);
    }
  };

  // 3. Xử lý Nâng cấp / Gia hạn Gói cước
  const handleUpdateSubscription = async () => {
    if (!selectedRestaurant) return;
    try {
      setSubSubmitting(true);
      const res = await apiClient.platform.updateRestaurantSubscription(selectedRestaurant.id, {
        plan: newPlan,
        billingCycle,
        transactionType,
        netAmount: Number(netAmount),
      });

      toast.success(
        `Đã gia hạn/nâng cấp gói ${newPlan} cho "${selectedRestaurant.name}" thành công!`,
      );

      if (res.data?.commissionGenerated) {
        toast.info(
          `Đã tự động tính hoa hồng ${formatCurrencyVND(
            res.data.commissionGenerated.commissionAmount,
          )} cho NVKD phụ trách (${res.data.commissionGenerated.salesName})`,
        );
      }

      setShowSubModal(false);
      setSelectedRestaurant(null);
      fetchRestaurants();
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi khi cập nhật gói cước');
    } finally {
      setSubSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Quản Trị Nhà Hàng
            </span>
            <span className="text-xs text-slate-400">• Tổng cộng: {total} cơ sở</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Danh Sách Toàn Bộ Nhà Hàng & Vòng Đời Gói Cước
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản trị thông tin cơ sở, kiểm soát khóa/mở khóa tạm thời, nâng cấp gói cước và trực tiếp vào hỗ trợ kỹ thuật.
          </p>
        </div>

        <button
          onClick={fetchRestaurants}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên nhà hàng, slug, số điện thoại..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="">Tất cả Gói cước</option>
              <option value="Basic">Basic (Miễn phí)</option>
              <option value="Standard">Standard</option>
              <option value="Advanced">Advanced</option>
              <option value="Pro">Pro (Chuyên nghiệp)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="">Tất cả Trạng thái</option>
              <option value="TRIAL">Dùng thử (TRIAL)</option>
              <option value="ACTIVE_PAID">Đang trả phí (ACTIVE_PAID)</option>
              <option value="ACTIVE_FREE">Miễn phí (ACTIVE_FREE)</option>
              <option value="SUSPENDED">Đang khóa (SUSPENDED)</option>
            </select>

            <select
              value={isSuspendedFilter}
              onChange={(e) => {
                setIsSuspendedFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-purple-500 transition cursor-pointer"
            >
              <option value="">Tất cả Hoạt động</option>
              <option value="false">Đang hoạt động</option>
              <option value="true">Đã khóa tạm thời</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition shadow-2xs cursor-pointer"
            >
              Tìm kiếm
            </button>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Nhà Hàng & Địa Chỉ</th>
                <th className="py-3 px-4">Chủ Quán</th>
                <th className="py-3 px-4 text-center">Quy Mô</th>
                <th className="py-3 px-4 text-right">Doanh Thu GMV</th>
                <th className="py-3 px-4">Gói Cước & Hạn Dùng</th>
                <th className="py-3 px-4">NVKD Phụ Trách</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length > 0 ? (
                items.map((r) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-50/60 transition ${
                      r.isSuspended ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    {/* Nhà hàng */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <span>{r.name}</span>
                        {r.isSuspended && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Đã Khóa
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">slug: {r.slug}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{r.address}</div>
                    </td>

                    {/* Chủ quán */}
                    <td className="py-3.5 px-4">
                      {r.owner ? (
                        <div>
                          <div className="font-semibold text-slate-800">{r.owner.fullName}</div>
                          <div className="text-[11px] text-slate-400">{r.owner.email}</div>
                          <div className="text-[11px] text-slate-500">{r.owner.phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa liên kết</span>
                      )}
                    </td>

                    {/* Quy mô */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-semibold text-slate-700">
                        {r.branchesCount} chi nhánh
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {r.staffCount} nhân sự • {r.paidOrdersCount} đơn
                      </div>
                    </td>

                    {/* Doanh thu GMV */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                      {formatCurrencyVND(r.totalGmvRevenue)}
                    </td>

                    {/* Gói cước */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {r.plan}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {r.planExpiresAt
                          ? `Hết hạn: ${new Date(r.planExpiresAt).toLocaleDateString('vi-VN')}`
                          : 'Vĩnh viễn'}
                      </div>
                    </td>

                    {/* NVKD */}
                    <td className="py-3.5 px-4">
                      {r.referredBySales ? (
                        <div>
                          <div className="font-semibold text-indigo-700">
                            {r.referredBySales.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Mã: <span className="font-mono">{r.referredBySales.referralCode}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Tự nhiên (Organic)</span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center">
                      {r.isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <Lock className="w-3 h-3" /> Tạm khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Hoạt động
                        </span>
                      )}
                    </td>

                    {/* Hành động */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Vào Quản trị Quán */}
                        <button
                          onClick={() => handleImpersonate(r)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-lg transition text-[11px] flex items-center gap-1 cursor-pointer border border-purple-200"
                          title="Chuyển sang chế độ hỗ trợ kỹ thuật trực tiếp cho quán này"
                        >
                          <Crown className="w-3 h-3 text-purple-600" />
                          <span>Hỗ trợ</span>
                        </button>

                        {/* Gia hạn Gói */}
                        <button
                          onClick={() => {
                            setSelectedRestaurant(r);
                            setNewPlan(r.plan || 'Pro');
                            setShowSubModal(true);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer border border-transparent hover:border-indigo-200"
                          title="Nâng cấp / Gia hạn gói cước SaaS"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        {/* Khóa / Mở khóa */}
                        <button
                          onClick={() => {
                            setSelectedRestaurant(r);
                            setShowStatusModal(true);
                          }}
                          className={`p-1.5 rounded-lg transition cursor-pointer border border-transparent ${
                            r.isSuspended
                              ? 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
                              : 'text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                          }`}
                          title={r.isSuspended ? 'Mở khóa nhà hàng' : 'Tạm khóa nhà hàng'}
                        >
                          {r.isSuspended ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {loading ? 'Đang tải danh sách nhà hàng...' : 'Không tìm thấy nhà hàng nào phù hợp'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Trang {page} / {totalPages} (Tổng cộng {total} nhà hàng)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Khóa / Mở Khóa */}
      {showStatusModal && selectedRestaurant && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                {selectedRestaurant.isSuspended ? (
                  <>
                    <Unlock className="w-5 h-5 text-emerald-600" />
                    Mở Khóa Nhà Hàng
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 text-rose-600" />
                    Tạm Khóa Hoạt Động Nhà Hàng
                  </>
                )}
              </h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 text-xs text-slate-600 space-y-3">
              <p>
                Bạn đang thao tác với nhà hàng:{' '}
                <strong className="text-slate-900 font-bold">{selectedRestaurant.name}</strong>
              </p>

              {!selectedRestaurant.isSuspended ? (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Khi tạm khóa: Mọi nhân viên của quán sẽ bị thu hồi phiên đăng nhập tức thì và khách hàng không thể quét QR đặt món mới.
                    </span>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700">
                      Lý do tạm khóa:
                    </label>
                    <textarea
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Nhập lý do khóa (vd: Vi phạm điều khoản, nợ cước, nghi vấn gian lận...)"
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                  Nhà hàng sẽ được phục hồi quyền truy cập bình thường và nhân sự có thể đăng nhập lại.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusSubmitting}
                className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition cursor-pointer ${
                  selectedRestaurant.isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {statusSubmitting ? 'Đang xử lý...' : selectedRestaurant.isSuspended ? 'Xác nhận mở khóa' : 'Xác nhận khóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Nâng cấp / Gia hạn Gói cước */}
      {showSubModal && selectedRestaurant && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                Nâng Cấp / Gia Hạn Gói Cước SaaS
              </h3>
              <button
                onClick={() => setShowSubModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 text-xs space-y-4">
              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl">
                <div className="font-bold text-purple-950 text-sm">{selectedRestaurant.name}</div>
                <div className="text-purple-700 text-[11px] mt-0.5">
                  Gói hiện tại: <strong>{selectedRestaurant.plan}</strong> • Hạn:{' '}
                  {selectedRestaurant.planExpiresAt
                    ? new Date(selectedRestaurant.planExpiresAt).toLocaleDateString('vi-VN')
                    : 'Chưa có'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Chọn gói cước mới:</label>
                  <select
                    value={newPlan}
                    onChange={(e) => {
                      setNewPlan(e.target.value);
                      if (e.target.value === 'Pro') setNetAmount(4800000);
                      else if (e.target.value === 'Advanced') setNetAmount(3200000);
                      else if (e.target.value === 'Standard') setNetAmount(1800000);
                      else setNetAmount(0);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="Standard">Standard (1.800.000₫/năm)</option>
                    <option value="Advanced">Advanced (3.200.000₫/năm)</option>
                    <option value="Pro">Pro Chuyên Nghiệp (4.800.000₫/năm)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Chu kỳ gia hạn:</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="YEARLY">Hằng năm (12 Tháng)</option>
                    <option value="MONTHLY">Hằng tháng (1 Tháng)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Loại giao dịch:</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    <option value="INITIAL_SETUP">Ký mới (Setup - Hoa hồng NVKD 50%)</option>
                    <option value="RENEWAL">Tái ký (Duy trì - Hoa hồng NVKD 20%)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700">Số tiền thu thực tế (VNĐ):</label>
                  <input
                    type="number"
                    value={netAmount}
                    onChange={(e) => setNetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-purple-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {selectedRestaurant.referredBySales && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center justify-between">
                  <div>
                    <span>NVKD thụ hưởng hoa hồng: </span>
                    <strong>{selectedRestaurant.referredBySales.fullName}</strong>
                  </div>
                  <span className="font-bold text-emerald-700">
                    Dự kiến hoa hồng: +
                    {formatCurrencyVND(
                      Math.round(netAmount * (transactionType === 'INITIAL_SETUP' ? 0.5 : 0.2)),
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleUpdateSubscription}
                disabled={subSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition cursor-pointer shadow-2xs"
              >
                {subSubmitting ? 'Đang lưu...' : 'Xác nhận kích hoạt gói'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
