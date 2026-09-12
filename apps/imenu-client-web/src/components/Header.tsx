'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo, Button } from '@imenu/ui';
import { Menu, X, ArrowRight } from 'lucide-react';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <Logo size="lg" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">
            Tính năng
          </Link>
          <Link href="/#workflow" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">
            Cách hoạt động
          </Link>
          <Link href="/#roles" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">
            Phân quyền
          </Link>
          <Link href="/#pricing" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors">
            Bảng giá
          </Link>
          <Link href="/huong-dan" className="text-sm font-bold text-emerald-800 hover:text-emerald-600 transition-colors flex items-center gap-1.5">
            Hướng dẫn
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-200">
              Mới
            </span>
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dang-nhap" className="text-sm font-bold text-slate-700 hover:text-emerald-600 px-3 py-2 transition-colors">
            Đăng nhập
          </Link>
          <Link href="/dang-ky">
            <Button variant="primary" size="md">
              Bắt đầu miễn phí <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 animate-fadeIn">
          <Link
            href="/#features"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-1"
          >
            Tính năng
          </Link>
          <Link
            href="/#workflow"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-1"
          >
            Cách hoạt động
          </Link>
          <Link
            href="/#roles"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-1"
          >
            Phân quyền
          </Link>
          <Link
            href="/#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-medium text-slate-700 py-1"
          >
            Bảng giá
          </Link>
          <Link
            href="/huong-dan"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-base font-bold text-emerald-800 py-1 flex items-center justify-between"
          >
            <span>Hướng dẫn vận hành</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Mới</span>
          </Link>
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <Link href="/dang-nhap" className="w-full">
              <Button variant="outline" className="w-full">
                Đăng nhập
              </Button>
            </Link>
            <Link href="/dang-ky" className="w-full">
              <Button variant="primary" className="w-full">
                Bắt đầu miễn phí
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
