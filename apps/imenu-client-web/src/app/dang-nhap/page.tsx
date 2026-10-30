'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo, Button, Tilt3DCard, CinematicScrollProgress, AmbientCinematicStage } from '@imenu/ui';
import { CheckCircle2, ArrowRight, AlertCircle, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
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
    <div className="relative min-h-screen bg-[#0d1310] text-[#ede7da] flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden selection:bg-[#dfa035]/25 selection:text-[#ede7da]">
      {/* 3D Motion Primitives */}
      <CinematicScrollProgress />
      <AmbientCinematicStage variant="dark" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-4xl px-4">
        <Tilt3DCard glareColor="rgba(223, 160, 53, 0.18)">
          <div className="bg-[#151f1b] rounded-2xl shadow-2xl overflow-hidden border border-[#26352e] grid grid-cols-1 md:grid-cols-12">
            
            {/* Aside Banner */}
            <div className="md:col-span-5 bg-gradient-to-b from-[#090e0c] to-[#101815] text-[#ede7da] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#26352e]">
              <div>
                <Link href="/" className="inline-block">
                  <Logo light size="lg" />
                </Link>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#16241d] border border-[#263f30] text-[11px] font-medium text-[#34a87a] mt-8 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#dfa035]" />
                  <span>Trung tâm vận hành F&B</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#f5f1e8] mb-3 tracking-tight leading-snug">
                  Nền tảng vận hành <br />
                  <span className="text-[#34a87a] font-semibold">chuẩn xác & tức thì.</span>
                </h2>
                <p className="text-xs text-[#98a69e] leading-relaxed">
                  Đăng nhập để quản lý bàn, theo dõi màn hình bếp và phân tích báo cáo doanh thu theo thời gian thực.
                </p>
              </div>

              <div className="space-y-3.5 pt-8 border-t border-[#202e26]">
                <div className="flex items-center gap-2.5 text-xs text-[#c5cfc9]">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] shrink-0" />
                  <span>Đơn hàng cập nhật Real-time</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#c5cfc9]">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] shrink-0" />
                  <span>Bếp và phục vụ đồng bộ tức thì</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#c5cfc9]">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] shrink-0" />
                  <span>Thanh toán VietQR chính xác từng đồng</span>
                </div>
              </div>
            </div>

            {/* Login Form Console */}
            <div className="md:col-span-7 p-8 sm:p-10 bg-[#151f1b]">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-xl font-bold tracking-tight text-[#f5f1e8]">Chào mừng trở lại</h1>
                <span className="text-[10px] font-mono uppercase text-[#dfa035] bg-[#dfa035]/15 px-2 py-0.5 rounded border border-[#dfa035]/30">
                  CẢNH 01 · ĐĂNG NHẬP
                </span>
              </div>
              <p className="text-xs text-[#8e9d94] mb-6">
                Nhập thông tin tài khoản để vào trang quản lý nhà hàng.
              </p>

              {/* Demo Credentials Hint */}
              <div className="p-3.5 bg-[#101815] border border-[#24332b] rounded-lg text-xs text-[#c5cfc9] mb-5">
                <div className="text-[11px] font-medium text-[#dfa035] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Tài khoản trải nghiệm sẵn có
                </div>
                <div className="font-mono text-xs font-semibold text-[#f5f1e8] tabular-nums">
                  owner@sample.vn {DEFAULT_DEMO_PASSWORD ? `· ${DEFAULT_DEMO_PASSWORD}` : ''}
                </div>
              </div>

              {error && (
                <div className="mb-5 p-3 bg-[#2d1618] border border-[#52252a] rounded-lg flex items-center gap-2.5 text-xs text-[#fca5a5] font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#f87171]" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#c5cfc9] mb-1.5">
                    Email đăng nhập
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@nhahang.vn"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#c5cfc9] mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#8e9d94]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-[#2b3a32] bg-[#0d1310] text-[#34a87a] focus:ring-[#34a87a]"
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="#" className="font-medium text-[#dfa035] hover:underline transition-colors">
                    Quên mật khẩu?
                  </a>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="w-full mt-2 h-10 flex items-center justify-center gap-2 text-xs font-semibold bg-[#dfa035] text-[#0d1310] hover:bg-[#c98a22] border-none shadow-lg shadow-[#dfa035]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      Đăng nhập vào hệ thống <ArrowRight className="w-3.5 h-3.5 ml-1 stroke-[2]" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-[#8e9d94] mt-6 pt-5 border-t border-[#202e26]">
                Chưa có tài khoản nhà hàng?{' '}
                <Link href="/dang-ky" className="font-semibold text-[#dfa035] hover:underline transition-colors">
                  Tạo miễn phí ngay
                </Link>
              </p>
            </div>

          </div>
        </Tilt3DCard>
      </div>
    </div>
  );
}
