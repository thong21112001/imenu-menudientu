'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo, Button } from '@imenu/ui';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('owner@sample.vn');
  const [password, setPassword] = useState('Demo@123');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to Admin App on port 3003
    window.location.href = 'http://localhost:3003';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 md:grid-cols-12">
          
          {/* Aside Banner */}
          <div className="md:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <Link href="/">
                <Logo light size="lg" />
              </Link>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-10 mb-4 leading-tight">
                Một ca phục vụ <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">thật trọn vẹn.</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Đăng nhập để quản lý bàn, theo dõi màn hình bếp và xem báo cáo doanh thu theo thời gian thực.
              </p>
            </div>

            <div className="space-y-4 pt-10">
              <div className="flex items-center gap-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Đơn hàng cập nhật Real-time
              </div>
              <div className="flex items-center gap-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Bếp và phục vụ luôn cùng một nhịp
              </div>
              <div className="flex items-center gap-3 text-xs text-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                Thanh toán VietQR chính xác từng đồng
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="md:col-span-7 p-8 sm:p-12">
            <h1 className="text-2xl font-extrabold text-slate-900">Chào mừng trở lại</h1>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Nhập thông tin tài khoản để vào trang quản lý nhà hàng.
            </p>

            {/* Demo Credentials Hint */}
            <div className="p-3.5 bg-emerald-50 border border-dashed border-emerald-200 rounded-xl text-xs text-emerald-800 mb-6">
              <strong>Tài khoản trải nghiệm sẵn có:</strong>
              <div className="font-mono mt-1 font-semibold">owner@sample.vn · Demo@123</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email đăng nhập
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@nhahang.vn"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-600"
                  />
                  Ghi nhớ đăng nhập
                </label>
                <a href="#" className="font-semibold text-emerald-700 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3 mt-4">
                Đăng nhập vào hệ thống <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-6">
              Chưa có tài khoản nhà hàng?{' '}
              <Link href="/dang-ky" className="font-bold text-emerald-700 hover:underline">
                Tạo miễn phí ngay
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
