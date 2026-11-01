'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Logo, Button } from '@imenu/ui';
import { CheckCircle2, ArrowRight, AlertCircle, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import { apiClient } from '@imenu/utils';

function RegisterForm() {
  const searchParams = useSearchParams();
  const [restaurantName, setRestaurantName] = useState('Bếp Nhà - Ẩm Thực Việt');
  const [restaurantPhone, setRestaurantPhone] = useState('0908 123 456');
  const [address, setAddress] = useState('Số 68 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM');
  const [ownerName, setOwnerName] = useState('Nguyễn Minh An');
  const [ownerPhone, setOwnerPhone] = useState('0901 234 567');
  const [email, setEmail] = useState('owner@sample.vn');
  const [password, setPassword] = useState(process.env.NEXT_PUBLIC_DEMO_PASSWORD || '');
  const [confirmPassword, setConfirmPassword] = useState(process.env.NEXT_PUBLIC_DEMO_PASSWORD || '');
  
  // Affiliate & Referral State
  const [referralCode, setReferralCode] = useState('');
  const [isFromAffiliateLink, setIsFromAffiliateLink] = useState(false);
  const [salesRep, setSalesRep] = useState<{ fullName: string; phone?: string; referralCode: string } | null>(null);
  const [validatingRef, setValidatingRef] = useState(false);
  const [refError, setRefError] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{ restaurantName: string; redirectUrl: string } | null>(null);

  useEffect(() => {
    const urlRef = searchParams.get('ref');
    const storedRef = typeof window !== 'undefined' ? localStorage.getItem('imenu_ref_code') : null;
    const initialCode = urlRef || storedRef || '';

    if (initialCode) {
      setReferralCode(initialCode.toUpperCase());
      if (urlRef) {
        setIsFromAffiliateLink(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('imenu_ref_code', urlRef.toUpperCase());
        }
      }
      validateCode(initialCode.toUpperCase());
    }
  }, [searchParams]);

  const validateCode = async (code: string) => {
    if (!code.trim()) {
      setSalesRep(null);
      setRefError('');
      return;
    }
    setValidatingRef(true);
    setRefError('');
    try {
      const res = await apiClient.referrals.validateCode(code.trim());
      if (res.data?.valid) {
        setSalesRep(res.data);
      } else {
        setSalesRep(null);
        setRefError('Mã giới thiệu không hợp lệ hoặc đã hết hạn');
      }
    } catch {
      setSalesRep(null);
      setRefError('Mã giới thiệu không tồn tại trên hệ thống');
    } finally {
      setValidatingRef(false);
    }
  };

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
      const cleanRef = referralCode.trim().toUpperCase();
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
        referralCode: cleanRef || undefined,
        acquisitionChannel: isFromAffiliateLink
          ? 'AFFILIATE_LINK'
          : cleanRef
          ? 'REFERRAL_CODE'
          : 'ORGANIC',
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
        
        <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-zinc-200/90 grid grid-cols-1 md:grid-cols-12">
          
          {/* Aside Banner */}
          <div className="md:col-span-4 bg-zinc-950 text-white p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800">
            <div>
              <Link href="/">
                <Logo light size="lg" />
              </Link>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-10 mb-3 tracking-tight leading-snug">
                Mở cửa quán <br />
                <span className="text-emerald-400 font-semibold">chuẩn xác & tức thì.</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Thiết lập không gian vận hành số hóa riêng cho quán ăn của bạn chỉ trong 5 phút.
              </p>
            </div>

            <div className="space-y-3 pt-10 border-t border-zinc-800/80">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tặng 1 tháng trải nghiệm gói Nâng cao</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Tạo menu & mã QR bàn tự động</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Không cần thẻ ngân hàng</span>
              </div>
            </div>
          </div>

          {/* Register Form */}
          <div className="md:col-span-8 p-8 sm:p-10">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Tạo nhà hàng của bạn</h1>
            <p className="text-xs text-zinc-500 mt-1 mb-6">
              Bạn có thể dễ dàng tùy chỉnh mọi thông tin và thực đơn sau khi đăng ký.
            </p>

            {error && (
              <div className="mb-6 p-3 bg-rose-50/80 border border-rose-200/90 rounded-md flex items-center gap-2.5 text-xs text-rose-700 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Restaurant Info */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                  1. Thông tin Nhà hàng / Quán ăn
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Tên nhà hàng *</label>
                    <input
                      type="text"
                      required
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      placeholder="Ví dụ: Bếp Nhà Quán"
                      className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Hotline quán *</label>
                    <input
                      type="tel"
                      required
                      value={restaurantPhone}
                      onChange={(e) => setRestaurantPhone(e.target.value)}
                      placeholder="0901 234 567"
                      className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Địa chỉ chi nhánh *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                      className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">
                  2. Tài khoản Chủ quán
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Họ và tên chủ quán *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Nguyễn Minh An"
                      className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Số điện thoại cá nhân *</label>
                    <input
                      type="tel"
                      required
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="0901 234 567"
                      className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Email đăng nhập *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@nhahang.vn"
                      className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Mật khẩu *</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự"
                      className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">Xác nhận mật khẩu *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full h-9 px-3 rounded-md border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Referral & Partner Code (Phase 12) */}
              <div className="p-3.5 rounded-md bg-zinc-50 border border-zinc-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
                    3. Chuyên viên hỗ trợ / Mã giới thiệu (Tùy chọn)
                  </h3>
                  {isFromAffiliateLink && (
                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Link đối tác
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setReferralCode(val);
                      validateCode(val);
                    }}
                    placeholder="Ví dụ: IMENU-DEMO88"
                    className="w-full h-9 px-3 uppercase font-mono tracking-wider rounded-md border border-zinc-200 text-xs focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 focus:outline-none bg-white tabular-nums"
                  />
                  {validatingRef && (
                    <div className="absolute right-3 top-2.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    </div>
                  )}
                </div>

                {salesRep && (
                  <div className="p-2 rounded-md bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>
                      Chuyên viên đồng hành: <strong>{salesRep.fullName}</strong> ({salesRep.referralCode})
                    </span>
                  </div>
                )}

                {refError && !validatingRef && (
                  <p className="text-xs text-rose-600 font-medium">
                    {refError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full h-9 flex items-center justify-center gap-2 text-xs font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang khởi tạo tài khoản & nhà hàng...
                  </>
                ) : (
                  <>
                    Tạo nhà hàng & Dùng thử miễn phí <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-zinc-500 mt-6 pt-5 border-t border-zinc-100">
              Đã có tài khoản?{' '}
              <Link href="/dang-nhap" className="font-semibold text-zinc-900 hover:text-emerald-700 transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Registration Success Overlay Modal */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-zinc-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                Khởi tạo thành công
              </span>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">
                Chào mừng đến với iMenu
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Nhà hàng <strong className="text-zinc-900">{successData.restaurantName}</strong> và tài khoản quản trị đã sẵn sàng vận hành.
              </p>
            </div>

            {/* Countdown / progress bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                <span>Đang kết nối trung tâm quản trị...</span>
                <span className="font-semibold text-emerald-700">Tự động chuyển</span>
              </div>
              <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full w-2/3 animate-pulse" />
              </div>
            </div>

            <a
              href={successData.redirectUrl}
              className="w-full h-9 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Vào Bảng Quản Trị Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-700" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
