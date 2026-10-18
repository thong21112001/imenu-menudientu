'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@imenu/utils';
import { ReferredRestaurantItem } from '@imenu/types';
import {
  Store,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function SalesRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<ReferredRestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [isQualified, setIsQualified] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState<any>(null);

  // Assisted Creation Form Fields
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [ownerFullName, setOwnerFullName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('MatKhau@123');
  const [seedDemoTables, setSeedDemoTables] = useState(true);
  const [seedDemoMenu, setSeedDemoMenu] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, [page, subscriptionStatus, isQualified]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const res = await apiClient.sales.getRestaurants({
        search: search.trim() || undefined,
        subscriptionStatus: subscriptionStatus || undefined,
        isActivationQualified: isQualified !== '' ? isQualified : undefined,
        page,
        limit,
      });

      if (res.data) {
        setRestaurants(res.data.data || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRestaurants();
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const res = await apiClient.sales.createRestaurant({
        restaurant: {
          name: restaurantName.trim(),
          phone: restaurantPhone.trim(),
          address: restaurantAddress.trim(),
        },
        owner: {
          fullName: ownerFullName.trim(),
          phone: ownerPhone.trim(),
          email: ownerEmail.trim().toLowerCase(),
          password: ownerPassword,
        },
        seedDemoTables,
        seedDemoMenu,
      });

      if (res.data?.success) {
        setFormSuccess(res.data);
        loadRestaurants();
      } else {
        setFormError(res.message || 'Khởi tạo nhà hàng thất bại');
      }
    } catch (err: any) {
      setFormError(err.message || 'Khởi tạo nhà hàng thất bại. Vui lòng kiểm tra lại email hoặc số điện thoại.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setFormSuccess(null);
    setFormError('');
    setRestaurantName('');
    setRestaurantPhone('');
    setRestaurantAddress('');
    setOwnerFullName('');
    setOwnerPhone('');
    setOwnerEmail('');
    setOwnerPassword('MatKhau@123');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Nhà Hàng Của Bạn ({total})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách các quán ăn do bạn giới thiệu hoặc tạo giúp trực tiếp trên hệ thống.
          </p>
        </div>

        <button
          onClick={() => {
            resetModal();
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo giúp Nhà hàng mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên quán, hotline, địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={subscriptionStatus}
              onChange={(e) => {
                setSubscriptionStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="">Tất cả trạng thái gói</option>
              <option value="TRIAL">Dùng thử (TRIAL)</option>
              <option value="ACTIVE_PAID">Đã trả phí (PAID)</option>
              <option value="ACTIVE_FREE">Miễn phí (FREE)</option>
              <option value="SUSPENDED">Tạm ngưng</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={isQualified}
              onChange={(e) => {
                setIsQualified(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              <option value="">Tất cả tiến độ thưởng</option>
              <option value="true">Đã đạt chuẩn 250K</option>
              <option value="false">Đang vận hành tích lũy</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Lọc
            </button>
          </div>
        </form>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nhà Hàng</th>
                <th className="py-3.5 px-4">Hotline & Địa chỉ</th>
                <th className="py-3.5 px-4">Kênh Thu Hút</th>
                <th className="py-3.5 px-4">Gói SaaS</th>
                <th className="py-3.5 px-4">Tiến Độ Vận Hành</th>
                <th className="py-3.5 px-4">Thưởng 250K</th>
                <th className="py-3.5 px-4">Ngày Tham Gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    Đang tải danh sách nhà hàng...
                  </td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có nhà hàng nào trong danh sách. Hãy gửi link tiếp thị hoặc bấm "Tạo giúp Nhà hàng mới".
                  </td>
                </tr>
              ) : (
                restaurants.map((rest) => {
                  const percent = Math.min(
                    100,
                    Math.round((rest.activationPaidBillsCount / (rest.activationTargetBills || 5)) * 100),
                  );

                  return (
                    <tr key={rest.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>{rest.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 space-y-0.5">
                        <div className="font-mono text-slate-800">{rest.phone}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{rest.address}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {rest.acquisitionChannel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rest.subscriptionStatus === 'ACTIVE_PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {rest.plan} ({rest.subscriptionStatus})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 w-44">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                            <span>{rest.activationPaidBillsCount}/{rest.activationTargetBills || 5} bill</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                rest.isActivationQualified ? 'bg-blue-600' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {rest.isActivationQualified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                            Đã nhận 250K
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            Còn {Math.max(0, (rest.activationTargetBills || 5) - rest.activationPaidBillsCount)} bill
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(rest.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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

      {/* ================= MODAL TẠO GIÚP NHÀ HÀNG ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Tạo Giúp Nhà Hàng Mới Cho Đối Tác</h3>
                <p className="text-xs text-slate-500">Tự động gắn mã attribution của bạn và kích hoạt tài khoản chủ quán.</p>
              </div>
              <button
                onClick={resetModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formSuccess ? (
              <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">Khởi Tạo Quán Thành Công!</h4>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-left space-y-2">
                  <p><strong>Nhà hàng:</strong> {formSuccess.restaurant?.name}</p>
                  <p><strong>Hotline:</strong> {formSuccess.restaurant?.phone}</p>
                  <p><strong>Email chủ quán:</strong> {formSuccess.owner?.email}</p>
                  <p><strong>Mật khẩu đăng nhập:</strong> <span className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-bold">{ownerPassword}</span></p>
                  <p className="text-[11px] text-emerald-700 pt-1">
                    ✓ Đã tự động tạo 12 bàn ăn & thực đơn mẫu để quán có thể demo quét mã QR ngay!
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Hoàn tất & Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateRestaurant} className="space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Phần 1: Thông tin quán */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider block">1. Thông tin Nhà hàng</span>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Tên nhà hàng / quán ăn *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Phở Bò Gia Truyền Nam Định"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Hotline quán *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0912 345 678"
                        value={restaurantPhone}
                        onChange={(e) => setRestaurantPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Địa chỉ chi nhánh *</label>
                      <input
                        type="text"
                        required
                        placeholder="Số nhà, đường, quận/huyện..."
                        value={restaurantAddress}
                        onChange={(e) => setRestaurantAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Phần 2: Thông tin chủ quán */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider block">2. Tài khoản Chủ quán</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Họ tên chủ quán *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={ownerFullName}
                        onChange={(e) => setOwnerFullName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Số điện thoại cá nhân *</label>
                      <input
                        type="tel"
                        required
                        placeholder="0901 234 567"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Email đăng nhập *</label>
                      <input
                        type="email"
                        required
                        placeholder="owner@nhahang.vn"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Mật khẩu thiết lập *</label>
                      <input
                        type="text"
                        required
                        value={ownerPassword}
                        onChange={(e) => setOwnerPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Phần 3: Tùy chọn seed dữ liệu */}
                <div className="space-y-2 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-950">
                    <input
                      type="checkbox"
                      checked={seedDemoTables}
                      onChange={(e) => setSeedDemoTables(e.target.checked)}
                      className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                    />
                    <span>Tự động tạo sẵn 12 bàn ăn mẫu (Bàn 01 - Bàn 12)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-950">
                    <input
                      type="checkbox"
                      checked={seedDemoMenu}
                      onChange={(e) => setSeedDemoMenu(e.target.checked)}
                      className="rounded accent-emerald-600 w-4 h-4 cursor-pointer"
                    />
                    <span>Tự động tạo sẵn 4 món ăn & đồ uống mẫu để demo ngay</span>
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {formSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{formSubmitting ? 'Đang khởi tạo...' : 'Tạo Nhà Hàng Ngay'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
