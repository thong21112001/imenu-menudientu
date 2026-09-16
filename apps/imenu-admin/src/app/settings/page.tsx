'use client';

import React, { useState, useEffect } from 'react';
import { storageService, apiClient } from '@imenu/utils';
import { Restaurant } from '@imenu/types';
import { Card, Button, useToast } from '@imenu/ui';
import { Store, CreditCard, Save, CheckCircle2, AlertCircle, Loader2, Shield } from 'lucide-react';

export default function SettingsPage() {
  const toast = useToast();
  const currentUser = storageService.getCurrentUser();
  const isDemo = Boolean(currentUser?.isDemo || currentUser?.email === 'owner@sample.vn');
  const [rest, setRest] = useState<Restaurant>(storageService.getRestaurant());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRestaurant = async () => {
      setLoading(true);
      try {
        const res = await apiClient.restaurant.getCurrent();
        if (isMounted && res.data) {
          setRest(res.data);
        }
      } catch (err: any) {
        // Fallback silently to localStorage seed if not logged in or backend offline
        console.warn('Không thể tải dữ liệu từ backend API, sử dụng dữ liệu cục bộ:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRestaurant();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể sửa thông tin cài đặt nhà hàng.');
      return;
    }
    setSaving(true);
    setStatusMessage(null);

    try {
      // 1. Luu len backend API
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

      // 2. Dong bo localStorage
      storageService.saveRestaurant(rest);
      toast.success('Đã lưu cấu hình nhà hàng thành công lên máy chủ!');
      setStatusMessage({ type: 'success', text: 'Đã lưu cấu hình nhà hàng thành công lên máy chủ!' });
    } catch (err: any) {
      // Neu loi backend van luu vao localStorage de khong gian doan trai nghiem
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
      <div>
        <h1 className="text-2xl font-extrabold text-[#09271d]">Cài Đặt Nhà Hàng</h1>
        <p className="text-xs text-[#66736d] mt-0.5">
          Cấu hình thông tin nhà hàng, tài khoản ngân hàng nhận tiền VietQR và giờ mở cửa
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
                Bạn đang xem cấu hình nhà hàng ở chế độ xem thử. Các thao tác cập nhật tên, địa chỉ, số tài khoản nhận tiền đã được khóa bảo vệ.
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

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#176044]" /> Thông tin chung
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tên nhà hàng</label>
              <input
                type="text"
                value={rest.name || ''}
                onChange={(e) => setRest({ ...rest, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hotline</label>
              <input
                type="text"
                value={rest.phone || ''}
                onChange={(e) => setRest({ ...rest, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ</label>
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
            <CreditCard className="w-4 h-4 text-[#176044]" /> Tài khoản VietQR nhận tiền
          </h3>

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
          {saving ? 'Đang lưu lên máy chủ...' : 'Lưu thay đổi cài đặt'}
        </Button>
      </form>
    </div>
  );
}
