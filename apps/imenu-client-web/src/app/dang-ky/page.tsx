'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Logo, Button, Tilt3DCard, CinematicScrollProgress, AmbientCinematicStage } from '@imenu/ui';
import { CheckCircle2, ArrowRight, AlertCircle, Loader2, UserCheck, ShieldCheck, Sparkles } from 'lucide-react';
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
    <div className="relative min-h-screen bg-[#0d1310] text-[#ede7da] py-12 sm:px-6 lg:px-8 selection:bg-[#dfa035]/25 selection:text-[#ede7da]">
      {/* 3D Motion Primitives */}
      <CinematicScrollProgress />
      <AmbientCinematicStage variant="dark" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-5xl px-4">
        <Tilt3DCard glareColor="rgba(223, 160, 53, 0.18)">
          <div className="bg-[#151f1b] rounded-2xl shadow-2xl overflow-hidden border border-[#26352e] grid grid-cols-1 md:grid-cols-12">
            
            {/* Aside Banner */}
            <div className="md:col-span-4 bg-gradient-to-b from-[#090e0c] to-[#101815] text-[#ede7da] p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#26352e]">
              <div>
                <Link href="/" className="inline-block">
                  <Logo light size="lg" />
                </Link>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#16241d] border border-[#263f30] text-[11px] font-medium text-[#34a87a] mt-8 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#dfa035]" />
                  <span>Đăng ký nhà hàng mới</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#f5f1e8] mb-3 tracking-tight leading-snug">
                  Mở cửa quán <br />
                  <span className="text-[#34a87a] font-semibold">chuẩn xác & tức thì.</span>
                </h2>
                <p className="text-xs text-[#98a69e] leading-relaxed">
                  Thiết lập không gian vận hành số hóa riêng cho quán ăn của bạn chỉ trong 5 phút.
                </p>
              </div>

              <div className="space-y-3.5 pt-8 border-t border-[#202e26]">
                <div className="flex items-center gap-2.5 text-xs text-[#c5cfc9]">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] shrink-0" />
                  <span>Tặng 1 tháng trải nghiệm gói Nâng cao</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#c5cfc9]">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] shrink-0" />
                  <span>Tạo menu & mã QR bàn tự động</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#c5cfc9]">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] shrink-0" />
                  <span>Không cần thẻ ngân hàng</span>
                </div>
              </div>
            </div>

            {/* Register Form Console */}
            <div className="md:col-span-8 p-8 sm:p-10 bg-[#151f1b]">
              <div className="flex items-center justify-between mb-1">
                <h1 className="text-xl font-bold tracking-tight text-[#f5f1e8]">Tạo nhà hàng của bạn</h1>
                <span className="text-[10px] font-mono uppercase text-[#dfa035] bg-[#dfa035]/15 px-2 py-0.5 rounded border border-[#dfa035]/30">
                  CẢNH 01 · ĐĂNG KÝ
                </span>
              </div>
              <p className="text-xs text-[#8e9d94] mb-6">
                Bạn có thể dễ dàng tùy chỉnh mọi thông tin và thực đơn sau khi đăng ký.
              </p>

              {error && (
                <div className="mb-6 p-3 bg-[#2d1618] border border-[#52252a] rounded-lg flex items-center gap-2.5 text-xs text-[#fca5a5] font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#f87171]" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Restaurant Info */}
                <div>
                  <h3 className="text-xs font-semibold text-[#dfa035] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    1. Thông tin Nhà hàng / Quán ăn
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-[#c5cfc9] mb-1">Tên nhà hàng *</label>
                      <input
                        type="text"
                        required
                        value={restaurantName}
                        onChange={(e) => setRestaurantName(e.target.value)}
                        placeholder="Ví dụ: Bếp Nhà Quán"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#c5cfc9] mb-1">Hotline quán *</label>
                      <input
                        type="tel"
                        required
                        value={restaurantPhone}
                        onChange={(e) => setRestaurantPhone(e.target.value)}
                        placeholder="0901 234 567"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#c5cfc9] mb-1">Địa chỉ chi nhánh *</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Owner Info */}
                <div>
                  <h3 className="text-xs font-semibold text-[#dfa035] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    2. Tài khoản Chủ quán
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-[#c5cfc9] mb-1">Họ và tên chủ quán *</label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Nguyễn Minh An"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#c5cfc9] mb-1">Số điện thoại cá nhân *</label>
                      <input
                        type="tel"
                        required
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        placeholder="0901 234 567"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-[#c5cfc9] mb-1">Email đăng nhập *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="owner@nhahang.vn"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#c5cfc9] mb-1">Mật khẩu *</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#c5cfc9] mb-1">Xác nhận mật khẩu *</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Nhập lại mật khẩu"
                        className="w-full h-10 px-3.5 rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] placeholder:text-[#67776e] focus:outline-none focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Referral & Partner Code */}
                <div className="p-4 rounded-xl bg-[#101815] border border-[#24332b] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#ede7da] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#dfa035]" />
                      3. Chuyên viên hỗ trợ / Mã giới thiệu (Tùy chọn)
                    </h3>
                    {isFromAffiliateLink && (
                      <span className="text-[10px] font-medium text-[#34a87a] bg-[#34a87a]/15 border border-[#34a87a]/30 px-2 py-0.5 rounded-md">
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
                      className="w-full h-10 px-3.5 uppercase font-mono tracking-wider rounded-lg border border-[#2b3a32] bg-[#0d1310] text-xs text-[#ede7da] focus:ring-1 focus:ring-[#dfa035] focus:border-[#dfa035] focus:outline-none tabular-nums placeholder:text-[#67776e]"
                    />
                    {validatingRef && (
                      <div className="absolute right-3.5 top-3">
                        <Loader2 className="w-4 h-4 animate-spin text-[#dfa035]" />
                      </div>
                    )}
                  </div>

                  {salesRep && (
                    <div className="p-2.5 rounded-lg bg-[#14261d] border border-[#254b35] flex items-center gap-2 text-xs text-[#a2d8b8] font-medium">
                      <UserCheck className="w-4 h-4 text-[#34a87a] shrink-0" />
                      <span>
                        Chuyên viên đồng hành: <strong className="text-[#e1f5eb]">{salesRep.fullName}</strong> ({salesRep.referralCode})
                      </span>
                    </div>
                  )}

                  {refError && !validatingRef && (
                    <p className="text-xs text-[#f87171] font-medium">
                      {refError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="w-full h-10 flex items-center justify-center gap-2 text-xs font-semibold bg-[#dfa035] text-[#0d1310] hover:bg-[#c98a22] border-none shadow-lg shadow-[#dfa035]/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang khởi tạo tài khoản & nhà hàng...
                    </>
                  ) : (
                    <>
                      Tạo nhà hàng & Dùng thử miễn phí <ArrowRight className="w-4 h-4 ml-1 stroke-[2]" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-[#8e9d94] mt-6 pt-5 border-t border-[#202e26]">
                Đã có tài khoản?{' '}
                <a href="http://localhost:3003/login" className="font-semibold text-[#dfa035] hover:underline transition-colors">
                  Đăng nhập ngay
                </a>
              </p>
            </div>

          </div>
        </Tilt3DCard>
      </div>

      {/* Registration Success Overlay Modal */}
      {successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#151f1b] rounded-2xl max-w-md w-full p-7 shadow-2xl border border-[#2b3e34] text-center space-y-5 animate-in zoom-in-95 duration-200 text-[#ede7da]">
            
            <div className="mx-auto w-14 h-14 rounded-full bg-[#182d22] text-[#34a87a] border border-[#2b4d3a] grid place-items-center shadow-lg">
              <CheckCircle2 className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-[#1a2f24] text-[#34a87a] border border-[#2e523e]">
                Khởi tạo thành công
              </span>
              <h3 className="text-lg font-bold text-[#f5f1e8] tracking-tight">
                Chào mừng đến với iMenu
              </h3>
              <p className="text-xs text-[#98a69e] leading-relaxed">
                Nhà hàng <strong className="text-[#f5f1e8]">{successData.restaurantName}</strong> và tài khoản quản trị đã sẵn sàng vận hành.
              </p>
            </div>

            {/* Countdown / progress bar */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] text-[#8e9d94] font-medium">
                <span>Đang kết nối trung tâm quản trị...</span>
                <span className="font-semibold text-[#dfa035]">Tự động chuyển</span>
              </div>
              <div className="w-full h-1.5 bg-[#101815] rounded-full overflow-hidden border border-[#212f27]">
                <div className="h-full bg-gradient-to-r from-[#34a87a] to-[#dfa035] rounded-full w-2/3 animate-pulse" />
              </div>
            </div>

            <a
              href={successData.redirectUrl}
              className="w-full h-10 px-5 bg-[#dfa035] hover:bg-[#c98a22] text-[#0d1310] text-xs font-semibold rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Vào Bảng Quản Trị Ngay</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
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
        <div className="min-h-screen bg-[#0d1310] flex items-center justify-center text-[#ede7da]">
          <Loader2 className="w-7 h-7 animate-spin text-[#dfa035]" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
