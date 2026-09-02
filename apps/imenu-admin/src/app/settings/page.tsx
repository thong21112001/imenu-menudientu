'use client';

import React, { useState, useEffect } from 'react';
import { storageService } from '@imenu/utils';
import { Restaurant } from '@imenu/types';
import { Card, Button } from '@imenu/ui';
import { Store, CreditCard, Save } from 'lucide-react';

export default function SettingsPage() {
  const [rest, setRest] = useState<Restaurant>(storageService.getRestaurant());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveRestaurant(rest);
    alert('Đã lưu cấu hình nhà hàng thành công!');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#09271d]">Cài Đặt Nhà Hàng</h1>
        <p className="text-xs text-[#66736d] mt-0.5">
          Cấu hình thông tin nhà hàng, tài khoản ngân hàng nhận tiền VietQR và giờ mở cửa
        </p>
      </div>

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
                value={rest.name}
                onChange={(e) => setRest({ ...rest, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hotline</label>
              <input
                type="text"
                value={rest.phone}
                onChange={(e) => setRest({ ...rest, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                value={rest.address}
                onChange={(e) => setRest({ ...rest, address: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ngân hàng</label>
              <input
                type="text"
                value={rest.bankAccount?.bankId || 'MB'}
                onChange={(e) =>
                  setRest({
                    ...rest,
                    bankAccount: { ...rest.bankAccount!, bankId: e.target.value, bankName: e.target.value },
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
                    bankAccount: { ...rest.bankAccount!, accountNo: e.target.value },
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
                    bankAccount: { ...rest.bankAccount!, accountName: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
              />
            </div>
          </div>
        </Card>

        <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
          Lưu thay đổi cài đặt
        </Button>
      </form>
    </div>
  );
}
