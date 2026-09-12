'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo, Button } from '@imenu/ui';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { storageService, SEED_RESTAURANT } from '@imenu/utils';

export default function RegisterPage() {
  const [restaurantName, setRestaurantName] = useState('Bếp Nhà - Ẩm Thực Việt');
  const [restaurantPhone, setRestaurantPhone] = useState('0908 123 456');
  const [address, setAddress] = useState('Số 68 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM');
  const [ownerName, setOwnerName] = useState('Nguyễn Minh An');
  const [ownerPhone, setOwnerPhone] = useState('0901 234 567');
  const [email, setEmail] = useState('owner@sample.vn');
  const [password, setPassword] = useState('Demo@123');
  const [confirmPassword, setConfirmPassword] = useState('Demo@123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Save custom restaurant config into localStorage
    const newRest = {
      ...SEED_RESTAURANT,
      name: restaurantName,
      phone: restaurantPhone,
      address: address,
    };
    storageService.saveRestaurant(newRest);

    alert('Đăng ký nhà hàng thành công! Đang chuyển hướng vào bảng quản trị...');
    window.location.href = 'http://localhost:3003';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-5xl px-4">
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 md:grid-cols-12">
          
          {/* Aside Banner */}
          <div className="md:col-span-4 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <Link href="/">
                <Logo light size="lg" />
              </Link>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-10 mb-4 leading-tight">
                Mở cửa quán <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">thật thông minh.</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thiết lập không gian vận hành số hóa riêng cho quán ăn của bạn chỉ trong 5 phút.
              </p>
            </div>

            <div className="space-y-4 pt-10">
              <div className="flex items-center gap-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Tặng 1 tháng trải nghiệm gói Nâng cao
              </div>
              <div className="flex items-center gap-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Tạo menu & mã QR bàn tự động
              </div>
              <div className="flex items-center gap-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Không cần thẻ ngân hàng
              </div>
            </div>
          </div>

          {/* Register Form */}
          <div className="md:col-span-8 p-8 sm:p-12">
            <h1 className="text-2xl font-extrabold text-slate-900">Tạo nhà hàng của bạn</h1>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Bạn có thể dễ dàng tùy chỉnh mọi thông tin và thực đơn sau khi đăng ký.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Restaurant Info */}
              <div>
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                  1. Thông tin Nhà hàng / Quán ăn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tên nhà hàng *</label>
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="Ví dụ: Bếp Nhà Quán"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Hotline quán *</label>
                    <input
                      type="tel"
                      required
                      value={restaurantPhone}
                      onChange={(e) => setRestaurantPhone(e.target.value)}
                      placeholder="0901 234 567"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ chi nhánh *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
                  2. Tài khoản Chủ quán
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên chủ quán *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Nguyễn Minh An"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại cá nhân *</label>
                    <input
                      type="tel"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="0901 234 567"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email đăng nhập *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@nhahang.vn"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3">
                Tạo nhà hàng & Dùng thử miễn phí <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              Đã có tài khoản?{' '}
              <Link href="/dang-nhap" className="font-bold text-emerald-700 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
