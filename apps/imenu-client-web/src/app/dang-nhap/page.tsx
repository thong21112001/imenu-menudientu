'use client';

import React, { useEffect } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { Logo } from '@imenu/ui';

const ADMIN_LOGIN_URL = process.env.NEXT_PUBLIC_ADMIN_DEMO_URL
  ? `${process.env.NEXT_PUBLIC_ADMIN_DEMO_URL}/login`
  : 'http://localhost:3003/login';

export default function LoginPage() {
  useEffect(() => {
    window.location.replace(ADMIN_LOGIN_URL);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c0a] text-[#ede7da] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <Logo light size="lg" />
      </div>

      <div className="p-8 rounded-2xl bg-[#131c18] border border-[#24332b] shadow-2xl max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#18261f] border border-[#2b3e32] text-[#dfa035] grid place-items-center mx-auto">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#f5f1e8]">
            Đang chuyển hướng sang Đăng nhập Quản trị
          </h2>
          <p className="text-xs text-[#8e9d94] leading-relaxed">
            Hệ thống đang kết nối trực tiếp đến Trung tâm Điều hành Admin iMenu...
          </p>
        </div>

        <div className="pt-2">
          <a
            href={ADMIN_LOGIN_URL}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#dfa035] hover:bg-[#c98a22] text-[#0d1310] text-xs font-semibold shadow-md transition-colors"
          >
            <span>Vào trang Đăng nhập Admin ngay</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </a>
        </div>
      </div>
    </div>
  );
}
