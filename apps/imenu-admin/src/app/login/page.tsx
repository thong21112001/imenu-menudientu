'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo, Tilt3DCard, CinematicScrollProgress, AmbientCinematicStage } from '@imenu/ui';
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
  ChefHat,
  Smartphone,
  BarChart3,
  Briefcase,
  CreditCard,
  UtensilsCrossed,
  Sparkles,
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
    badgeColor: 'bg-[#1b2b22] text-[#34a87a] border-[#294a38]',
    iconColor: 'text-[#34a87a]',
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
    badgeColor: 'bg-[#19242d] text-[#60a5fa] border-[#263e52]',
    iconColor: 'text-[#60a5fa]',
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
    badgeColor: 'bg-[#162725] text-[#2dd4bf] border-[#224440]',
    iconColor: 'text-[#2dd4bf]',
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
    badgeColor: 'bg-[#292214] text-[#dfa035] border-[#45371c]',
    iconColor: 'text-[#dfa035]',
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
    badgeColor: 'bg-[#1c221e] text-[#a1aba4] border-[#2d3731]',
    iconColor: 'text-[#a1aba4]',
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
    <div className="relative min-h-screen bg-gradient-to-br from-[#080c0a] via-[#0d1411] to-[#121c17] text-[#ede7da] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden selection:bg-[#dfa035]/25 selection:text-[#ede7da]">
      {/* 3D Motion Primitives: Cinematic Progress & Ambient Stage */}
      <CinematicScrollProgress />
      <AmbientCinematicStage variant="dark" />

      <div className="relative z-10 w-full max-w-5xl">
        <Tilt3DCard glareColor="rgba(223, 160, 53, 0.2)">
          <div className="w-full bg-[#151f1b] rounded-2xl shadow-2xl overflow-hidden border border-[#26352e] grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Side: Brand Showcase & 3D Depth Layers */}
            <div
              className="lg:col-span-5 bg-gradient-to-b from-[#070b09] to-[#0f1714] text-[#ede7da] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#24332b]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div>
                <div
                  className="flex items-center gap-2.5 transition-transform duration-300"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <Logo light size="sm" />
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#1b2620] text-[#34a87a] border border-[#2b4436] rounded-md">
                    Admin POS 3D
                  </span>
                </div>

                <div
                  className="transition-transform duration-300"
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c221a] border border-[#39341f] text-[11px] font-medium text-[#dfa035] mt-8 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CẢNH 01 · PHÒNG ĐIỀU HÀNH TRUNG TÂM</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-[#f5f1e8] mb-2.5 tracking-tight leading-snug">
                    Trung tâm Quản trị & <br />
                    <span className="text-[#34a87a] font-semibold">
                      Vận hành iMenu
                    </span>
                  </h1>

                  <p className="text-xs text-[#98a69e] leading-relaxed font-normal">
                    Kiểm soát sơ đồ bàn thông minh, điều phối màn hình bếp KDS thời gian thực và quản lý doanh thu minh bạch.
                  </p>
                </div>

                {/* Core Feature Highlights with 3D Depth */}
                <div
                  className="mt-7 space-y-2.5 transition-transform duration-300"
                  style={{ transform: 'translateZ(24px)' }}
                >
                  <div className="flex items-center gap-3 text-xs text-[#c5cfc9] bg-[#121c17] border border-[#23332a] rounded-lg p-3 hover:border-[#34a87a]/40 transition-colors">
                    <div className="w-7 h-7 rounded-md bg-[#192620] border border-[#283d31] flex items-center justify-center shrink-0">
                      <Smartphone className="w-3.5 h-3.5 text-[#34a87a]" />
                    </div>
                    <span>POS bán hàng tại bàn & mã QR VietQR tự động</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#c5cfc9] bg-[#121c17] border border-[#23332a] rounded-lg p-3 hover:border-[#dfa035]/40 transition-colors">
                    <div className="w-7 h-7 rounded-md bg-[#231e15] border border-[#3d331f] flex items-center justify-center shrink-0">
                      <ChefHat className="w-3.5 h-3.5 text-[#dfa035]" />
                    </div>
                    <span>Màn hình bếp KDS đồng bộ tức thì, không sót món</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#c5cfc9] bg-[#121c17] border border-[#23332a] rounded-lg p-3 hover:border-[#c85a32]/40 transition-colors">
                    <div className="w-7 h-7 rounded-md bg-[#241a17] border border-[#3f2721] flex items-center justify-center shrink-0">
                      <BarChart3 className="w-3.5 h-3.5 text-[#c85a32]" />
                    </div>
                    <span>Báo cáo doanh thu & phân quyền nhân sự chi tiết</span>
                  </div>
                </div>
              </div>

              <div
                className="pt-6 mt-6 border-t border-[#1f2d25] flex items-center justify-between text-[11px] text-[#8e9d94] transition-transform duration-300"
                style={{ transform: 'translateZ(16px)' }}
              >
                <span>Bảo mật JWT đa tầng</span>
                <span className="flex items-center gap-1.5 text-[#34a87a] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sẵn sàng kết nối
                </span>
              </div>
            </div>

            {/* Right Side: Login Console Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-[#151f1b]">
              <div className="max-w-md w-full mx-auto">
                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#f5f1e8] tracking-tight">
                      Đăng nhập quản trị
                    </h2>
                    <span className="text-[10px] font-mono text-[#dfa035] bg-[#dfa035]/15 px-2 py-0.5 rounded border border-[#dfa035]/30">
                      3D CONTROL ROOM
                    </span>
                  </div>
                  <p className="text-xs text-[#8e9d94] mt-1">
                    Vui lòng chọn vai trò trải nghiệm hoặc nhập tài khoản
                  </p>
                </div>

                {/* Error Notification Alert */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-[#2d1618] border border-[#52252a] flex items-start gap-2.5 text-xs text-[#fca5a5] animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0 mt-0.5" />
                    <div className="leading-relaxed flex-1">{error}</div>
                  </div>
                )}

                {/* Quick Demo Accounts Selection (5 Tactile 3D Cards) */}
                <div className="mb-5 p-3.5 rounded-xl bg-[#101815] border border-[#24332b]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#ede7da] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#34a87a] animate-pulse inline-block" />
                      5 Demo Roles Vận Hành
                    </span>
                    <span className="text-[10px] text-[#dfa035] font-mono">1 chạm đổi quyền</span>
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
                          className={`p-2.5 rounded-lg border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#1a2821] border-[#dfa035] shadow-lg shadow-[#dfa035]/10 ring-1 ring-[#dfa035]'
                              : 'bg-[#121c17] border-[#223027] hover:border-[#34a87a]/50 hover:bg-[#16231c]'
                          }`}
                          title={`${acc.name} - ${acc.desc}`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-[11px] font-semibold text-[#f5f1e8] flex items-center gap-1.5 truncate">
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${acc.iconColor}`} />
                              <span className="truncate">{acc.role}</span>
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#dfa035] shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-[#8e9d94] font-mono truncate block tabular-nums">
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
                      <div className="mt-2.5 pt-2 border-t border-[#1e2a23] flex items-center gap-2 text-[11px] text-[#c5cfc9]">
                        <span className="font-semibold text-[#ede7da] flex items-center gap-1 shrink-0">
                          <Icon className={`w-3.5 h-3.5 ${currentAcc.iconColor}`} />
                          {currentAcc.name}:
                        </span>
                        <span className="text-[#8e9d94] truncate">{currentAcc.desc}</span>
                      </div>
                    );
                  })()}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email / Username Input */}
                  <div>
                    <label className="block text-xs font-medium text-[#c5cfc9] mb-1.5">
                      Email hoặc Tên đăng nhập <span className="text-[#dfa035]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e7d74]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@sample.vn"
                        className="w-full h-10 pl-10 pr-3.5 text-xs bg-[#0d1310] border border-[#2b3a32] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors placeholder:text-[#65756c] text-[#ede7da]"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#c5cfc9]">
                        Mật khẩu <span className="text-[#dfa035]">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6e7d74]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-10 pl-10 pr-10 text-xs bg-[#0d1310] border border-[#2b3a32] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors placeholder:text-[#65756c] text-[#ede7da]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6e7d74] hover:text-[#ede7da] transition-colors cursor-pointer"
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
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-[#2b3a32] bg-[#0d1310] text-[#34a87a] focus:ring-[#34a87a] transition-colors"
                      />
                      <span className="text-xs text-[#8e9d94]">
                        Ghi nhớ đăng nhập
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 mt-1 px-5 bg-[#dfa035] hover:bg-[#c98a22] text-[#0d1310] text-xs font-semibold rounded-lg shadow-lg shadow-[#dfa035]/20 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed border-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang xác thực thông tin...</span>
                      </>
                    ) : (
                      <>
                        <span>Đăng nhập hệ thống</span>
                        <ArrowRight className="w-4 h-4 stroke-[2]" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </Tilt3DCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080c0a] flex items-center justify-center text-[#ede7da]">
          <Loader2 className="w-7 h-7 animate-spin text-[#dfa035]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
