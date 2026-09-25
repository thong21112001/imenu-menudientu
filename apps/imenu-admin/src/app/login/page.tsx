'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@imenu/ui';
import { apiClient, storageService } from '@imenu/utils';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Store,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  ChefHat,
  Smartphone,
  BarChart3,
  Crown,
  Briefcase,
  CreditCard,
  UtensilsCrossed,
} from 'lucide-react';

interface DemoAccountItem {
  key: string;
  role: string;
  email: string;
  pass: string;
  name: string;
  desc: string;
  icon: any;
  badgeColor: string;
  iconColor: string;
  targetRoute: string;
}

const DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    key: 'owner',
    role: 'Chủ Quán (HQ)',
    email: 'owner@sample.vn',
    pass: 'Demo@123',
    name: 'Nguyễn Minh An',
    desc: 'Toàn quyền quản trị chi nhánh chính & toàn chuỗi',
    icon: Store,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/70',
    iconColor: 'text-emerald-600',
    targetRoute: '/',
  },
  {
    key: 'manager',
    role: 'Quản Lý Ca',
    email: 'manager@sample.vn',
    pass: 'Demo@123',
    name: 'Trần Quốc Bảo',
    desc: 'Quản lý vận hành ca, sơ đồ bàn, KDS và nhân sự',
    icon: Briefcase,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200 hover:border-blue-400 hover:bg-blue-100/70',
    iconColor: 'text-blue-600',
    targetRoute: '/',
  },
  {
    key: 'cashier',
    role: 'Thu Ngân POS',
    email: 'cashier@sample.vn',
    pass: 'Demo@123',
    name: 'Lê Thu Thảo',
    desc: 'Order bàn, thu tiền VietQR/tiền mặt & in bill 80mm',
    icon: CreditCard,
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200 hover:border-teal-400 hover:bg-teal-100/70',
    iconColor: 'text-teal-600',
    targetRoute: '/pos',
  },
  {
    key: 'kitchen',
    role: 'Bếp KDS',
    email: 'kitchen@sample.vn',
    pass: 'Demo@123',
    name: 'Hoàng Văn Bếp',
    desc: 'Màn hình KDS nhận vé chế biến & báo hết món tức thì',
    icon: ChefHat,
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200 hover:border-orange-400 hover:bg-orange-100/70',
    iconColor: 'text-orange-600',
    targetRoute: '/kitchen',
  },
  {
    key: 'waiter',
    role: 'Phục Vụ',
    email: 'waiter@sample.vn',
    pass: 'Demo@123',
    name: 'Phạm Văn Phục',
    desc: 'Hỗ trợ khách tại bàn, mở bàn, kiểm tra món và gọi đồ',
    icon: UtensilsCrossed,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-400 hover:bg-amber-100/70',
    iconColor: 'text-amber-600',
    targetRoute: '/tables',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const isExpired = searchParams.get('expired') === '1';

  const [email, setEmail] = useState('owner@sample.vn');
  const [password, setPassword] = useState('Demo@123');
  const [selectedAccountKey, setSelectedAccountKey] = useState<string>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    isExpired ? 'Phiên làm việc đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại để tiếp tục.' : '',
  );

  // Neu da co token hop le thi tu dong chuyen ve dashboard
  useEffect(() => {
    const token = storageService.getAccessToken();
    if (token && !storageService.isTokenExpired(token)) {
      router.replace(returnUrl);
    }
  }, [router, returnUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiClient.auth.login({
        email: email.trim(),
        password,
        rememberMe,
      });

      if (res?.data?.accessToken) {
        const userRole = (res.data.user as any)?.role;
        const isSuperAdmin = userRole === 'SYSTEM_ADMIN' || userRole === 'system_admin';

        // Neu khong phai Super Admin -> lay thong tin nha hang hien tai
        if (!isSuperAdmin) {
          try {
            const restRes = await apiClient.restaurant.getCurrent();
            if (restRes?.data && !restRes.data.isPlatformAdmin) {
              storageService.saveRestaurant(restRes.data);
            }
          } catch {
            // Khong lam gian doan qua trinh dang nhap neu loi nha hang
          }
        }

        // Chuyen huong thong minh dua tren role neu nguoi dung vao goc '/'
        let targetUrl = returnUrl.startsWith('/') ? returnUrl : `/${returnUrl}`;
        if (targetUrl === '/' || targetUrl === '') {
          const roleSlug = String(userRole || '').toLowerCase();
          if (roleSlug === 'kitchen') {
            targetUrl = '/kitchen';
          } else if (roleSlug === 'cashier') {
            targetUrl = '/pos';
          } else if (roleSlug === 'waiter') {
            targetUrl = '/tables';
          } else {
            targetUrl = '/';
          }
        }
        window.location.href = targetUrl;
      } else {
        throw new Error('Đăng nhập không thành công, vui lòng thử lại');
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Email/Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (acc: DemoAccountItem) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setSelectedAccountKey(acc.key);
    setError('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#061b14] via-[#09271d] to-[#04120d] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Glow Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Side: Brand Showcase & Highlights */}
        <div className="lg:col-span-5 bg-linear-to-br from-[#09271d] via-[#0c3527] to-[#061b14] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3">
              <Logo light size="lg" />
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                Admin POS
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-10 mb-3 leading-tight tracking-tight">
              Trung tâm Quản trị & <br />
              <span className="bg-linear-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Vận hành iMenu
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed font-normal">
              Kiểm soát sơ đồ bàn thông minh, điều phối màn hình bếp KDS thời gian thực và quản lý doanh thu minh bạch.
            </p>

            {/* Core Feature Highlights */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3 text-xs text-emerald-100/90 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                </div>
                <span>POS bán hàng tại bàn & mã QR VietQR tự động</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-emerald-100/90 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ChefHat className="w-4 h-4 text-teal-400" />
                </div>
                <span>Màn hình bếp KDS đồng bộ tức thì, không sót món</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-emerald-100/90 bg-white/5 border border-white/10 rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                </div>
                <span>Báo cáo doanh thu & phân quyền nhân sự chi tiết</span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300/60">
            <span>Bảo mật chuẩn JWT đa tầng</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Hệ thống sẵn sàng
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Đăng nhập quản trị
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Vui lòng nhập tài khoản để vào hệ thống vận hành nhà hàng
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 flex items-start gap-3 text-xs text-rose-700 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed flex-1">{error}</div>
              </div>
            )}

            {/* Quick Demo Accounts Selection */}
            <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tài khoản mẫu 5 Roles Vận Hành (Bấm để thử):
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Tự động điền mật khẩu</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = selectedAccountKey === acc.key;
                  return (
                    <button
                      key={acc.key}
                      type="button"
                      onClick={() => handleSelectAccount(acc)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white shadow-xs border-slate-400 ring-2 ring-emerald-500/40'
                          : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300'
                      }`}
                      title={`${acc.name} - ${acc.desc}`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${acc.iconColor}`} />
                          <span className="truncate">{acc.role}</span>
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono truncate block">
                        {acc.email}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Account Info Banner */}
              {(() => {
                const currentAcc = DEMO_ACCOUNTS.find((a) => a.key === selectedAccountKey);
                if (!currentAcc) return null;
                const Icon = currentAcc.icon;
                return (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800 flex items-center gap-1 shrink-0">
                      <Icon className={`w-3.5 h-3.5 ${currentAcc.iconColor}`} />
                      {currentAcc.name}:
                    </span>
                    <span className="text-slate-500 truncate">{currentAcc.desc}</span>
                  </div>
                );
              })()}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email hoặc Tên đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@sample.vn"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all placeholder:text-slate-400 font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-700/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xác thực thông tin...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09271d] flex items-center justify-center text-white">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
