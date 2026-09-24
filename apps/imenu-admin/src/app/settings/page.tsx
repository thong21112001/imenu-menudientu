'use client';

import React, { useState, useEffect } from 'react';
import { storageService, apiClient } from '@imenu/utils';
import { Restaurant, RestaurantBranch } from '@imenu/types';
import { Card, Button, useToast } from '@imenu/ui';
import {
  Store,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Building2,
  Clock,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const toast = useToast();
  const [currentUser, setCurrentUser] = useState<any>(storageService.getCurrentUser());
  const isSuperAdmin =
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'system_admin' ||
    currentUser?.role === 'super_admin' ||
    Boolean(currentUser?.isSuperAdmin);
  const isMainBranchUser = isSuperAdmin || Boolean(currentUser?.isMainBranch);
  const isDemo = Boolean(currentUser?.isDemo || currentUser?.email === 'owner@sample.vn');

  const [rest, setRest] = useState<Restaurant>(storageService.getRestaurant());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cấu hình riêng dành cho chi nhánh con
  const [branch, setBranch] = useState<Partial<RestaurantBranch>>({
    name: '',
    address: '',
    phone: '',
    openingHours: '08:00 - 22:00',
    tagline: '',
    bankAccount: {
      bankId: 'MB',
      bankName: 'MBBank',
      accountNo: '',
      accountName: '',
      template: 'compact',
    },
  });

  useEffect(() => {
    let isMounted = true;
    const user = storageService.getCurrentUser();
    setCurrentUser(user);

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.restaurant.getCurrent();
        if (isMounted && res.data) {
          setRest(res.data);
          // Nếu là tài khoản chi nhánh con, tìm thông tin chi nhánh đó
          const isMain = isSuperAdmin || Boolean(user?.isMainBranch);
          if (!isMain && user?.branchId && Array.isArray(res.data.branches)) {
            const found = res.data.branches.find(
              (b: any) => (b._id || b.id) === user.branchId,
            );
            if (found) {
              setBranch({
                name: found.name || '',
                address: found.address || '',
                phone: found.phone || '',
                openingHours: found.openingHours || '08:00 - 22:00',
                tagline: found.tagline || '',
                bankAccount: found.bankAccount || {
                  bankId: 'MB',
                  bankName: 'MBBank',
                  accountNo: '',
                  accountName: '',
                  template: 'compact',
                },
              });
            }
          }
        }
      } catch (err: any) {
        console.warn('Không thể tải dữ liệu từ backend API:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isSuperAdmin]);

  // Lưu cấu hình dành cho chi nhánh con
  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể sửa thông tin cài đặt chi nhánh.');
      return;
    }
    if (!currentUser?.branchId) {
      toast.error('Không tìm thấy mã chi nhánh của tài khoản');
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await apiClient.branches.update(currentUser.branchId, {
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        openingHours: branch.openingHours,
        tagline: branch.tagline,
        bankAccount: branch.bankAccount,
      });

      if (res.data) {
        setBranch(res.data);
      }

      toast.success('Đã lưu cấu hình chi nhánh thành công lên máy chủ!');
      setStatusMessage({ type: 'success', text: 'Đã lưu cấu hình chi nhánh thành công lên máy chủ!' });
    } catch (err: any) {
      toast.error(`Lỗi cập nhật cấu hình chi nhánh: ${err.message}`);
      setStatusMessage({
        type: 'error',
        text: `Lỗi cập nhật cấu hình chi nhánh: ${err.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Lưu cấu hình dành cho trụ sở chính / toàn chuỗi
  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể sửa thông tin cài đặt nhà hàng.');
      return;
    }
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await apiClient.restaurant.updateCurrent({
        name: rest.name,
        phone: rest.phone,
        address: rest.address,
        bankAccount: rest.bankAccount,
        isOpen: rest.isOpen,
        openingHours: rest.openingHours,
        tagline: rest.tagline,
      });

      if (res.data) {
        setRest(res.data);
      }

      storageService.saveRestaurant(rest);
      toast.success('Đã lưu cấu hình nhà hàng thành công lên máy chủ!');
      setStatusMessage({ type: 'success', text: 'Đã lưu cấu hình nhà hàng thành công lên máy chủ!' });
    } catch (err: any) {
      storageService.saveRestaurant(rest);
      toast.error(`Lỗi cập nhật cấu hình: ${err.message}`);
      setStatusMessage({
        type: 'error',
        text: `Lưu cục bộ thành công. Lỗi kết nối API: ${err.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#09271d] flex items-center gap-2">
          {!isMainBranchUser ? (
            <>
              <Building2 className="w-6 h-6 text-[#176044]" />
              Cài Đặt Chi Nhánh: {branch.name || currentUser?.branchName || 'Chi nhánh con'}
            </>
          ) : (
            <>
              <Store className="w-6 h-6 text-[#176044]" />
              Cài Đặt Nhà Hàng
            </>
          )}
        </h1>
        <p className="text-xs text-[#66736d] mt-0.5">
          {!isMainBranchUser
            ? 'Cấu hình thông tin hoạt động, hotline, giờ mở cửa và tài khoản VietQR nhận tiền riêng biệt của chi nhánh này'
            : 'Cấu hình thông tin thương hiệu nhà hàng, tài khoản ngân hàng nhận tiền VietQR và giờ mở cửa'}
        </p>
      </div>

      {/* Demo Account Notice */}
      {isDemo && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 grid place-items-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Chế độ trải nghiệm (Demo Account)</p>
              <p className="text-xs text-amber-700/90">
                Bạn đang xem cấu hình ở chế độ xem thử. Các thao tác cập nhật tên, địa chỉ, số tài khoản nhận tiền đã được khóa bảo vệ.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200/70 text-amber-900">
            Chỉ xem (View Only)
          </span>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#176044]" /> Đang đồng bộ thông tin từ máy chủ...
        </div>
      )}

      {/* ================= FORM CHI NHÁNH CON ================= */}
      {!isMainBranchUser ? (
        <form onSubmit={handleSaveBranch} className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#176044]" /> Thông tin chi nhánh
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chi nhánh *</label>
                <input
                  type="text"
                  required
                  value={branch.name || ''}
                  onChange={(e) => setBranch({ ...branch, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hotline chi nhánh *</label>
                <input
                  type="text"
                  required
                  value={branch.phone || ''}
                  onChange={(e) => setBranch({ ...branch, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ chi nhánh *</label>
                <input
                  type="text"
                  required
                  value={branch.address || ''}
                  onChange={(e) => setBranch({ ...branch, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ mở cửa phục vụ</label>
                <input
                  type="text"
                  value={branch.openingHours || '08:00 - 22:00'}
                  onChange={(e) => setBranch({ ...branch, openingHours: e.target.value })}
                  placeholder="08:00 - 22:00"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú / Khẩu hiệu chi nhánh</label>
                <input
                  type="text"
                  value={branch.tagline || ''}
                  onChange={(e) => setBranch({ ...branch, tagline: e.target.value })}
                  placeholder="Ví dụ: Phục vụ tận tâm, món ngon tròn vị"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#176044]" /> Tài khoản VietQR nhận tiền riêng của chi nhánh
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#124a36] font-bold">
                Tài khoản độc lập
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Khách hàng quét mã VietQR tại các bàn thuộc chi nhánh này sẽ thanh toán trực tiếp vào số tài khoản ngân hàng dưới đây.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã ngân hàng (MB, VCB, TCB...)</label>
                <input
                  type="text"
                  value={branch.bankAccount?.bankId || 'MB'}
                  onChange={(e) =>
                    setBranch({
                      ...branch,
                      bankAccount: {
                        bankId: e.target.value,
                        bankName: branch.bankAccount?.bankName || e.target.value,
                        accountNo: branch.bankAccount?.accountNo || '',
                        accountName: branch.bankAccount?.accountName || '',
                        template: 'compact',
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số tài khoản ngân hàng</label>
                <input
                  type="text"
                  value={branch.bankAccount?.accountNo || ''}
                  onChange={(e) =>
                    setBranch({
                      ...branch,
                      bankAccount: {
                        bankId: branch.bankAccount?.bankId || 'MB',
                        bankName: branch.bankAccount?.bankName || 'MBBank',
                        accountNo: e.target.value,
                        accountName: branch.bankAccount?.accountName || '',
                        template: 'compact',
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chủ tài khoản ngân hàng</label>
                <input
                  type="text"
                  value={branch.bankAccount?.accountName || ''}
                  onChange={(e) =>
                    setBranch({
                      ...branch,
                      bankAccount: {
                        bankId: branch.bankAccount?.bankId || 'MB',
                        bankName: branch.bankAccount?.bankName || 'MBBank',
                        accountNo: branch.bankAccount?.accountNo || '',
                        accountName: e.target.value,
                        template: 'compact',
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {saving ? 'Đang lưu lên máy chủ...' : 'Lưu thay đổi cài đặt chi nhánh'}
          </Button>
        </form>
      ) : (
        /* ================= FORM TRỤ SỞ CHÍNH / TOÀN CHUỖI ================= */
        <form onSubmit={handleSaveRestaurant} className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#176044]" /> Thông tin thương hiệu chung
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên thương hiệu nhà hàng</label>
                <input
                  type="text"
                  value={rest.name || ''}
                  onChange={(e) => setRest({ ...rest, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hotline tổng đài</label>
                <input
                  type="text"
                  value={rest.phone || ''}
                  onChange={(e) => setRest({ ...rest, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ trụ sở chính</label>
                <input
                  type="text"
                  value={rest.address || ''}
                  onChange={(e) => setRest({ ...rest, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Khẩu hiệu (Slogan / Tagline)</label>
                <input
                  type="text"
                  value={rest.tagline || ''}
                  onChange={(e) => setRest({ ...rest, tagline: e.target.value })}
                  placeholder="Ví dụ: Hương vị truyền thống, phục vụ hiện đại"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#176044]" /> Tài khoản VietQR mặc định toàn chuỗi
            </h3>
            <p className="text-xs text-slate-500">
              Tài khoản này được sử dụng làm tài khoản nhận tiền mặc định của toàn bộ chuỗi nhà hàng (trừ các chi nhánh có cấu hình tài khoản riêng).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mã ngân hàng (MB, VCB, TCB...)</label>
                <input
                  type="text"
                  value={rest.bankAccount?.bankId || 'MB'}
                  onChange={(e) =>
                    setRest({
                      ...rest,
                      bankAccount: {
                        bankId: e.target.value,
                        bankName: rest.bankAccount?.bankName || e.target.value,
                        accountNo: rest.bankAccount?.accountNo || '',
                        accountName: rest.bankAccount?.accountName || '',
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số tài khoản</label>
                <input
                  type="text"
                  value={rest.bankAccount?.accountNo || ''}
                  onChange={(e) =>
                    setRest({
                      ...rest,
                      bankAccount: {
                        bankId: rest.bankAccount?.bankId || 'MB',
                        bankName: rest.bankAccount?.bankName || 'MBBank',
                        accountNo: e.target.value,
                        accountName: rest.bankAccount?.accountName || '',
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chủ tài khoản</label>
                <input
                  type="text"
                  value={rest.bankAccount?.accountName || ''}
                  onChange={(e) =>
                    setRest({
                      ...rest,
                      bankAccount: {
                        bankId: rest.bankAccount?.bankId || 'MB',
                        bankName: rest.bankAccount?.bankName || 'MBBank',
                        accountNo: rest.bankAccount?.accountNo || '',
                        accountName: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
                />
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            icon={saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {saving ? 'Đang lưu lên máy chủ...' : 'Lưu thay đổi cài đặt nhà hàng'}
          </Button>
        </form>
      )}
    </div>
  );
}
