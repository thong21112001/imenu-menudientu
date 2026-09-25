'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo, Button } from '@imenu/ui';
import { CheckCircle2, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { apiClient } from '@imenu/utils';

export default function RegisterPage() {
  const [restaurantName, setRestaurantName] = useState('Bếp Nhà - Ẩm Thực Việt');
  const [restaurantPhone, setRestaurantPhone] = useState('0908 123 456');
  const [address, setAddress] = useState('Số 68 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM');
  const [ownerName, setOwnerName] = useState('Nguyễn Minh An');
  const [ownerPhone, setOwnerPhone] = useState('0901 234 567');
  const [email, setEmail] = useState('owner@sample.vn');
  const [password, setPassword] = useState('Demo@123');
  const [confirmPassword, setConfirmPassword] = useState('Demo@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [successData, setSuccessData] = useState<{ restaurantName: string; redirectUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu phải có tối thiểu 8 ký tự!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiClient.auth.register({
        restaurant: {
          name: restaurantName,
          phone: restaurantPhone,
          address: address,
        },
        owner: {
          fullName: ownerName,
          phone: ownerPhone,
          email: email,
          password: password,
        },
      });

      const token = res.data?.accessToken;
      const refreshToken = res.data?.refreshToken;
      const redirectUrl = token
        ? `http://localhost:3003?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken || '')}`
        : 'http://localhost:3003';

      setSuccessData({
        restaurantName: restaurantName.trim(),
        redirectUrl,
      });

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
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

            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

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

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang khởi tạo tài khoản & nhà hàng...
                  </>
                ) : (
                  <>
                    Tạo nhà hàng & Dùng thử miễn phí <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
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

      {/* Registration Success Overlay Modal */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-emerald-100 text-center space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Ambient glow decoration */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white grid place-items-center shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-400 text-amber-950 grid place-items-center shadow-xs">
                <Sparkles className="w-4 h-4 fill-amber-950" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                🎉 Khởi Tạo Thành Công
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Chào Mừng Đến Với iMenu!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhà hàng <strong className="text-emerald-800">{successData.restaurantName}</strong> và tài khoản quản trị đã sẵn sàng vận hành.
              </p>
            </div>

            {/* Countdown / progress bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Đang kết nối trung tâm quản trị...</span>
                <span className="font-bold text-emerald-700">Tự động chuyển</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
              </div>
            </div>

            <a
              href={successData.redirectUrl}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Vào Bảng Quản Trị Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
