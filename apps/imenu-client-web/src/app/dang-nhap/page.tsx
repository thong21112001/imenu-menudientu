'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo, Button } from '@imenu/ui';
import { CheckCircle2, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@imenu/utils';

const DEFAULT_DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || '';

export default function LoginPage() {
  const [email, setEmail] = useState('owner@sample.vn');
  const [password, setPassword] = useState(DEFAULT_DEMO_PASSWORD);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.auth.login({
        email,
        password,
        rememberMe,
      });

      const token = res.data?.accessToken;
      const refreshToken = res.data?.refreshToken;
      const redirectUrl = token
        ? `http://localhost:3003?token=${encodeURIComponent(token)}&refreshToken=${encodeURIComponent(refreshToken || '')}`
        : 'http://localhost:3003';

      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || 'Email hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        
        <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-zinc-200/90 grid grid-cols-1 md:grid-cols-12">
          
          {/* Aside Banner */}
          <div className="md:col-span-5 bg-zinc-950 text-white p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800">
            <div>
              <Link href="/">
                <Logo light size="lg" />
              </Link>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-10 mb-3 tracking-tight leading-snug">
                Nền tảng vận hành <br />
                <span className="text-emerald-400 font-semibold">chuẩn xác & tức thì.</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Đăng nhập để quản lý bàn, theo dõi màn hình bếp và phân tích báo cáo doanh thu theo thời gian thực.
              </p>
            </div>

            <div className="space-y-3 pt-10 border-t border-zinc-800/80">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Đơn hàng cập nhật Real-time</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Bếp và phục vụ đồng bộ tức thì</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Thanh toán VietQR chính xác từng đồng</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="md:col-span-7 p-8 sm:p-10">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Chào mừng trở lại</h1>
            <p className="text-xs text-zinc-500 mt-1 mb-6">
              Nhập thông tin tài khoản để vào trang quản lý nhà hàng.
            </p>

            {/* Demo Credentials Hint */}
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-700 mb-5">
              <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">
                Tài khoản trải nghiệm sẵn có
              </div>
              <div className="font-mono text-xs font-semibold text-zinc-900 tabular-nums">
                owner@sample.vn {DEFAULT_DEMO_PASSWORD ? `· ${DEFAULT_DEMO_PASSWORD}` : ''}
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-rose-50/80 border border-rose-200/90 rounded-md flex items-center gap-2.5 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Email đăng nhập
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@nhahang.vn"
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="font-medium text-zinc-900 hover:text-emerald-700 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full mt-2 h-9 flex items-center justify-center gap-2 text-xs font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập vào hệ thống <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-zinc-500 mt-6 pt-5 border-t border-zinc-100">
              Chưa có tài khoản nhà hàng?{' '}
              <Link href="/dang-ky" className="font-semibold text-zinc-900 hover:text-emerald-700 transition-colors">
                Tạo miễn phí ngay
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
