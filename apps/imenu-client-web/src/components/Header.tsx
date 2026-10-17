'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Logo, Button } from '@imenu/ui';
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  QrCode,
  ShoppingBag,
  ChefHat,
  Building2,
  Sparkles,
  ExternalLink,
  Laptop,
  Smartphone,
  CheckCircle2,
  Layers,
  HelpCircle,
  BookOpen,
} from 'lucide-react';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isMobileSolutionsExpanded, setIsMobileSolutionsExpanded] = useState(true);

  const solutionsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns on outside click
  const solutionsRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) {
        setIsSolutionsOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setIsDemoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSolutionsMouseEnter = () => {
    if (solutionsTimerRef.current) clearTimeout(solutionsTimerRef.current);
    setIsSolutionsOpen(true);
  };

  const handleSolutionsMouseLeave = () => {
    solutionsTimerRef.current = setTimeout(() => {
      setIsSolutionsOpen(false);
    }, 180);
  };

  const handleDemoMouseEnter = () => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setIsDemoDropdownOpen(true);
  };

  const handleDemoMouseLeave = () => {
    demoTimerRef.current = setTimeout(() => {
      setIsDemoDropdownOpen(false);
    }, 180);
  };

  const solutions = [
    {
      title: 'Menu Điện Tử QR Tại Bàn',
      tag: 'Phổ biến',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Khách quét mã tự chọn món, tùy chỉnh size/topping, gửi order và gọi nhân viên tức thì.',
      icon: QrCode,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      href: '/#workflow',
    },
    {
      title: 'Đặt Món Mang Đi & Trả Trước',
      tag: 'Mới · Hot',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Chia sẻ link/QR lên Zalo, Fanpage; khách thanh toán VietQR trước, đơn vào thẳng màn hình bếp.',
      icon: ShoppingBag,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      href: '/#takeaway',
    },
    {
      title: 'Hệ Thống Vận Hành POS & Bếp KDS',
      tag: 'Chuẩn FIFO',
      tagColor: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'Sơ đồ bàn thời gian thực, gộp/chuyển bàn, điều phối bếp FIFO tự động và in nhiệt 80mm.',
      icon: ChefHat,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
      href: '/#features',
    },
    {
      title: 'Quản Trị Chuỗi Đa Chi Nhánh',
      tag: 'Doanh nghiệp',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Phân quyền 5 cấp độ, menu & giá bán theo từng cơ sở, báo cáo doanh thu chuỗi hợp nhất.',
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      href: '/#roles',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="hover:opacity-95 transition-opacity flex items-center">
            <Logo size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {/* Solutions Popover */}
            <div
              ref={solutionsRef}
              className="relative"
              onMouseEnter={handleSolutionsMouseEnter}
              onMouseLeave={handleSolutionsMouseLeave}
            >
              <button
                type="button"
                onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 ${
                  isSolutionsOpen ? 'text-emerald-800' : 'text-slate-700 hover:text-emerald-700'
                }`}
                aria-expanded={isSolutionsOpen}
              >
                <span>Giải pháp</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isSolutionsOpen ? 'rotate-180 text-emerald-700' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Mega Dropdown Popover */}
              {isSolutionsOpen && (
                <div className="absolute top-full left-0 mt-1 w-[680px] bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-5 animate-scaleUp z-50">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      Hệ sinh thái chuyển đổi số F&B toàn diện
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      Đồng bộ thời gian thực
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {solutions.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          onClick={() => setIsSolutionsOpen(false)}
                          className="group p-3.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all flex items-start gap-3.5"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex-shrink-0 grid place-items-center border ${item.iconBg} group-hover:scale-105 transition-transform`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                                {item.title}
                              </h4>
                              {item.tag && (
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border flex-shrink-0 ${item.tagColor}`}
                                >
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Popover Footer Banner */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 -mx-5 -mb-5 px-5 py-3 rounded-b-2xl">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Chạy trực tiếp trên trình duyệt, không bắt buộc mua máy POS đắt tiền.</span>
                    </div>
                    <Link
                      href="/huong-dan"
                      onClick={() => setIsSolutionsOpen(false)}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline"
                    >
                      Hướng dẫn 7 bước <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/#features"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Tính năng
            </Link>

            <Link
              href="/#takeaway"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
            >
              Bán mang đi
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-200">
                Mới
              </span>
            </Link>

            <Link
              href="/#workflow"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Cách hoạt động
            </Link>

            <Link
              href="/#comparison"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              So sánh
            </Link>

            <Link
              href="/#pricing"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Bảng giá
            </Link>

            <Link
              href="/#faq"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              Hỏi đáp
            </Link>

            <Link
              href="/huong-dan"
              className="text-sm font-bold text-emerald-800 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              Hướng dẫn
              <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full border border-emerald-200">
                7 bước
              </span>
            </Link>
          </nav>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden lg:flex items-center gap-3 xl:gap-3.5">
          {/* Demo Dropdown Button */}
          <div
            ref={demoRef}
            className="relative"
            onMouseEnter={handleDemoMouseEnter}
            onMouseLeave={handleDemoMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Demo Thực Tế</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isDemoDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDemoDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 animate-scaleUp z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Chọn môi trường trải nghiệm
                </div>
                <a
                  href="http://localhost:3005/menu/bep-nha/ban-08"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDemoDropdownOpen(false)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition-colors group"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1">
                      Menu Khách QR (Bàn 08)
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500">Khách quét QR chọn món tại bàn</div>
                  </div>
                </a>
                <a
                  href="http://localhost:3003"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDemoDropdownOpen(false)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition-colors group"
                >
                  <Laptop className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1">
                      Quản Trị POS & Bếp KDS
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500">Thu ngân, sơ đồ bàn & bếp</div>
                  </div>
                </a>
              </div>
            )}
          </div>

          <Link
            href="/dang-nhap"
            className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 transition-colors"
          >
            Đăng nhập
          </Link>

          <Link href="/dang-ky">
            <Button
              variant="primary"
              size="md"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20 text-xs px-4"
            >
              Bắt đầu miễn phí <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/dang-ky" className="sm:inline-block hidden">
            <Button variant="primary" size="sm" className="text-xs font-bold px-3 py-1.5">
              Dùng thử 0đ
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-2xl px-5 py-6 space-y-5 animate-slideUp max-h-[85vh] overflow-y-auto">
          {/* Solutions Accordion */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-3">
            <button
              type="button"
              onClick={() => setIsMobileSolutionsExpanded(!isMobileSolutionsExpanded)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-900"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                Giải pháp F&B toàn diện
              </span>
              <ChevronDown
                className={`w-4 h-4 text-emerald-700 transition-transform ${
                  isMobileSolutionsExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMobileSolutionsExpanded && (
              <div className="space-y-2 pt-1 border-t border-slate-200/60">
                {solutions.map((sol, idx) => {
                  const Icon = sol.icon;
                  return (
                    <Link
                      key={idx}
                      href={sol.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex-shrink-0 grid place-items-center border ${sol.iconBg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {sol.title}
                          </span>
                          {sol.tag && (
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border ${sol.tagColor}`}>
                              {sol.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mt-0.5">
                          {sol.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Core Navigation Links */}
          <div className="space-y-2 text-sm font-semibold text-slate-700 divide-y divide-slate-100">
            <Link
              href="/#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block pt-2 hover:text-emerald-700 transition-colors"
            >
              Tính năng
            </Link>
            <Link
              href="/#takeaway"
              onClick={() => setIsMobileMenuOpen(false)}
              className="pt-2 hover:text-emerald-700 transition-colors flex items-center justify-between"
            >
              <span>Bán mang đi trả trước</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                Mới
              </span>
            </Link>
            <Link
              href="/#workflow"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block pt-2 hover:text-emerald-700 transition-colors"
            >
              Cách hoạt động
            </Link>
            <Link
              href="/#comparison"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block pt-2 hover:text-emerald-700 transition-colors"
            >
              So sánh giải pháp
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block pt-2 hover:text-emerald-700 transition-colors"
            >
              Bảng giá dịch vụ
            </Link>
            <Link
              href="/#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block pt-2 hover:text-emerald-700 transition-colors"
            >
              Hỏi đáp thường gặp
            </Link>
            <Link
              href="/huong-dan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="pt-2 font-bold text-emerald-800 hover:text-emerald-600 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Hướng dẫn vận hành (7 bước)
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold border border-emerald-200">
                Chi tiết
              </span>
            </Link>
          </div>

          {/* Quick Real Demos */}
          <div className="pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Trải nghiệm thực tế
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="http://localhost:3005/menu/bep-nha/ban-08"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center hover:bg-emerald-50 transition-colors"
              >
                <Smartphone className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Menu Khách QR</span>
                <span className="text-[10px] text-slate-500">Bàn 08 ↗</span>
              </a>
              <a
                href="http://localhost:3003"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center hover:bg-emerald-50 transition-colors"
              >
                <Laptop className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Admin & POS</span>
                <span className="text-[10px] text-slate-500">Màn hình Bếp ↗</span>
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <Link href="/dang-nhap" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" className="w-full text-xs font-bold py-2.5 border-slate-300">
                Đăng nhập hệ thống
              </Button>
            </Link>
            <Link href="/dang-ky" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
              <Button
                variant="primary"
                className="w-full text-xs font-bold py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20"
              >
                Bắt đầu miễn phí 0đ <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
