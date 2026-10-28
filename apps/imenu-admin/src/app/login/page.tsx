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
  Store,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  ChefHat,
  Smartphone,
  BarChart3,
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

const DEFAULT_DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || '';

const DEMO_ACCOUNTS: DemoAccountItem[] = [
  {
    key: 'owner',
    role: 'Chủ Quán (HQ)',
    email: 'owner@sample.vn',
    pass: DEFAULT_DEMO_PASSWORD,
    name: 'Nguyễn Minh An',
    desc: 'Toàn quyền quản trị chi nhánh chính & toàn chuỗi',
    icon: Store,
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    iconColor: 'text-emerald-600',
    targetRoute: '/',
  },
  {
    key: 'manager',
    role: 'Quản Lý Ca',
    email: 'manager@sample.vn',
    pass: DEFAULT_DEMO_PASSWORD,
    name: 'Trần Quốc Bảo',
    desc: 'Quản lý vận hành ca, sơ đồ bàn, KDS và nhân sự',
    icon: Briefcase,
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600',
    targetRoute: '/',
  },
  {
    key: 'cashier',
    role: 'Thu Ngân POS',
    email: 'cashier@sample.vn',
    pass: DEFAULT_DEMO_PASSWORD,
    name: 'Lê Thu Thảo',
    desc: 'Order bàn, thu tiền VietQR/tiền mặt & in bill 80mm',
    icon: CreditCard,
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    iconColor: 'text-teal-600',
    targetRoute: '/pos',
  },
  {
    key: 'kitchen',
    role: 'Bếp KDS',
    email: 'kitchen@sample.vn',
    pass: DEFAULT_DEMO_PASSWORD,
    name: 'Hoàng Văn Bếp',
    desc: 'Màn hình KDS nhận vé chế biến & báo hết món tức thì',
    icon: ChefHat,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    iconColor: 'text-amber-600',
    targetRoute: '/kitchen',
  },
  {
    key: 'waiter',
    role: 'Phục Vụ',
    email: 'waiter@sample.vn',
    pass: DEFAULT_DEMO_PASSWORD,
    name: 'Phạm Văn Phục',
    desc: 'Hỗ trợ khách tại bàn, mở bàn, kiểm tra món và gọi đồ',
    icon: UtensilsCrossed,
    badgeColor: 'bg-zinc-50 text-zinc-800 border-zinc-200',
    iconColor: 'text-zinc-600',
    targetRoute: '/tables',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';
  const isExpired = searchParams.get('expired') === '1';

  const [email, setEmail] = useState('owner@sample.vn');
  const [password, setPassword] = useState(DEFAULT_DEMO_PASSWORD);
  const [selectedAccountKey, setSelectedAccountKey] = useState<string>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    isExpired ? 'Phiên làm việc đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại để tiếp tục.' : '',
  );

  // Neu da co token hop le thi tu dong chuyen ve trang nghiep vu theo role
  useEffect(() => {
    const token = storageService.getAccessToken();
    if (token && !storageService.isTokenExpired(token)) {
      if (returnUrl === '/' || !returnUrl) {
        const currentUser = storageService.getCurrentUser();
        const roleSlug = String(currentUser?.role || '').toLowerCase();
        if (roleSlug === 'kitchen') {
          router.replace('/kitchen');
          return;
        }
        if (roleSlug === 'cashier') {
          router.replace('/pos');
          return;
        }
        if (roleSlug === 'waiter') {
          router.replace('/tables');
          return;
        }
      }
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
        const roleSlug = String(userRole || '').toLowerCase();
        const isSuperAdmin =
          roleSlug === 'system_admin' ||
          roleSlug === 'super_admin' ||
          Boolean((res.data.user as any)?.isSuperAdmin);

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
          if (isSuperAdmin) {
            targetUrl = '/platform/dashboard';
          } else if (roleSlug === 'sales_rep') {
            targetUrl = '/sales/dashboard';
          } else if (roleSlug === 'kitchen') {
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-xs overflow-hidden border border-zinc-200/90 grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Brand Showcase & Highlights */}
        <div className="lg:col-span-5 bg-zinc-950 text-white p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo light size="sm" />
              <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md">
                Admin POS
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white mt-10 mb-2.5 tracking-tight leading-snug">
              Trung tâm Quản trị & <br />
              <span className="text-emerald-400 font-semibold">
                Vận hành iMenu
              </span>
            </h1>

            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Kiểm soát sơ đồ bàn thông minh, điều phối màn hình bếp KDS thời gian thực và quản lý doanh thu minh bạch.
            </p>

            {/* Core Feature Highlights */}
            <div className="mt-8 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md p-2.5">
                <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>POS bán hàng tại bàn & mã QR VietQR tự động</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md p-2.5">
                <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                  <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Màn hình bếp KDS đồng bộ tức thì, không sót món</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md p-2.5">
                <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Báo cáo doanh thu & phân quyền nhân sự chi tiết</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Bảo mật chuẩn JWT đa tầng</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Hệ thống sẵn sàng
            </span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                Đăng nhập quản trị
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Vui lòng nhập tài khoản để vào hệ thống vận hành nhà hàng
              </p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-rose-50/80 border border-rose-200/90 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed flex-1">{error}</div>
              </div>
            )}

            {/* Quick Demo Accounts Selection */}
            <div className="mb-5 p-3 rounded-md bg-zinc-50 border border-zinc-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                  Tài khoản mẫu 5 Roles Vận Hành:
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">Tự điền pass</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = selectedAccountKey === acc.key;
                  return (
                    <button
                      key={acc.key}
                      type="button"
                      onClick={() => handleSelectAccount(acc)}
                      className={`p-2 rounded-md border text-left transition-colors cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-white shadow-xs border-zinc-900 ring-1 ring-zinc-900'
                          : 'bg-white border-zinc-200/80 hover:border-zinc-300'
                      }`}
                      title={`${acc.name} - ${acc.desc}`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[11px] font-semibold text-zinc-900 flex items-center gap-1 truncate">
                          <Icon className={`w-3 h-3 shrink-0 ${acc.iconColor}`} />
                          <span className="truncate">{acc.role}</span>
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono truncate block tabular-nums">
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
                  <div className="mt-2 pt-2 border-t border-zinc-200/60 flex items-center gap-1.5 text-[11px] text-zinc-600">
                    <span className="font-semibold text-zinc-900 flex items-center gap-1 shrink-0">
                      <Icon className={`w-3 h-3 ${currentAcc.iconColor}`} />
                      {currentAcc.name}:
                    </span>
                    <span className="text-zinc-500 truncate">{currentAcc.desc}</span>
                  </div>
                );
              })()}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Email / Username Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Email hoặc Tên đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@sample.vn"
                    className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors placeholder:text-zinc-400 text-zinc-900"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-700">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 pl-9 pr-9 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors placeholder:text-zinc-400 text-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                  />
                  <span className="text-xs text-zinc-600">
                    Ghi nhớ đăng nhập
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-9 mt-1 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xác thực thông tin...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập hệ thống</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-zinc-900">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-700" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
