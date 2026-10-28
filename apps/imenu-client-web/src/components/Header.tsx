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
  ExternalLink,
  Laptop,
  Smartphone,
  BookOpen,
  HelpCircle,
  Briefcase,
  ShieldCheck,
  Trash2,
  Layers,
} from 'lucide-react';

const MENU_DEMO_URL = process.env.NEXT_PUBLIC_MENU_DEMO_URL || 'http://localhost:3005/menu/bep-nha/ban-08';
const ADMIN_DEMO_URL = process.env.NEXT_PUBLIC_ADMIN_DEMO_URL || 'http://localhost:3003';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsOpen, setIsSolutionsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isMobileSolutionsExpanded, setIsMobileSolutionsExpanded] = useState(true);

  const solutionsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resourcesTimerRef = useRef<NodeJS.Timeout | null>(null);
  const demoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdowns on outside click
  const solutionsRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) {
        setIsSolutionsOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setIsResourcesOpen(false);
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
    }, 150);
  };

  const handleResourcesMouseEnter = () => {
    if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
    setIsResourcesOpen(true);
  };

  const handleResourcesMouseLeave = () => {
    resourcesTimerRef.current = setTimeout(() => {
      setIsResourcesOpen(false);
    }, 150);
  };

  const handleDemoMouseEnter = () => {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    setIsDemoDropdownOpen(true);
  };

  const handleDemoMouseLeave = () => {
    demoTimerRef.current = setTimeout(() => {
      setIsDemoDropdownOpen(false);
    }, 150);
  };

  const solutions = [
    {
      title: 'Menu Điện Tử QR Tại Bàn',
      tag: 'Phổ biến',
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      description: 'Khách quét mã tự chọn món, gửi đơn nhiều đợt không cần cài app.',
      icon: QrCode,
      href: '/#features',
    },
    {
      title: 'Bán Mang Đi & Trả Trước VietQR',
      tag: 'Mới',
      tagColor: 'bg-amber-50 text-amber-900 border-amber-200/80',
      description: 'Khách đặt từ xa, thanh toán VietQR chính xác, đơn tự vào bếp.',
      icon: ShoppingBag,
      href: '/#takeaway',
    },
    {
      title: 'Hệ Thống POS, Bếp KDS & In 80mm',
      tag: 'FIFO',
      tagColor: 'bg-zinc-100 text-zinc-800 border-zinc-200',
      description: 'Sơ đồ bàn realtime, điều phối bếp chuẩn FIFO và in bill nhiệt.',
      icon: ChefHat,
      href: '/#workflow',
    },
    {
      title: 'Quản Trị Chuỗi & Báo Cáo',
      tag: 'Đa cơ sở',
      tagColor: 'bg-blue-50 text-blue-800 border-blue-200/80',
      description: 'Phân quyền 5 cấp độ bảo mật và báo cáo doanh thu chuỗi hợp nhất.',
      icon: Building2,
      href: '/#comparison',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 border-b border-zinc-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Desktop Nav Group */}
        <div className="flex items-center gap-6 xl:gap-8 min-w-0">
          <Link
            href="/"
            className="hover:opacity-95 transition-opacity flex items-center shrink-0 whitespace-nowrap"
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 shrink-0">
            {/* Mục 1: Dropdown Giải pháp */}
            <div
              ref={solutionsRef}
              className="relative shrink-0"
              onMouseEnter={handleSolutionsMouseEnter}
              onMouseLeave={handleSolutionsMouseLeave}
            >
              <button
                type="button"
                onClick={() => setIsSolutionsOpen(!isSolutionsOpen)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors py-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  isSolutionsOpen ? 'text-emerald-700' : 'text-zinc-700 hover:text-zinc-950'
                }`}
                aria-expanded={isSolutionsOpen}
              >
                <span>Giải pháp</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 stroke-[1.5] ${
                    isSolutionsOpen ? 'rotate-180 text-emerald-700' : 'text-zinc-400'
                  }`}
                />
              </button>

              {/* Mega Dropdown Popover */}
              {isSolutionsOpen && (
                <div className="absolute top-full left-0 mt-1 w-[520px] bg-white rounded-lg border border-zinc-200/90 shadow-lg p-4 animate-scaleUp z-50">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-zinc-100">
                    <span className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-700 stroke-[1.5]" />
                      Hệ sinh thái giải pháp F&B
                    </span>
                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                      Realtime WebSocket
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {solutions.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          onClick={() => setIsSolutionsOpen(false)}
                          className="group p-2.5 rounded-md border border-transparent hover:border-zinc-200 hover:bg-zinc-50/80 transition-colors flex items-start gap-2.5"
                        >
                          <div className="w-8 h-8 rounded-md bg-zinc-100 text-zinc-800 grid place-items-center shrink-0 border border-zinc-200/80 group-hover:border-zinc-300">
                            <Icon className="w-4 h-4 stroke-[1.5]" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-emerald-800 transition-colors truncate">
                                {item.title}
                              </h4>
                              {item.tag && (
                                <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border shrink-0 ${item.tagColor}`}>
                                  {item.tag}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                    <span>Nền tảng Cloud Web · Không bắt buộc mua máy POS</span>
                    <Link
                      href="/huong-dan"
                      onClick={() => setIsSolutionsOpen(false)}
                      className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
                    >
                      Hướng dẫn 7 bước <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mục 2: Link Cách hoạt động */}
            <Link
              href="/#workflow"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
            >
              Cách hoạt động
            </Link>

            {/* Mục 3: Link Bảng giá */}
            <Link
              href="/#pricing"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0"
            >
              Bảng giá
            </Link>

            {/* Mục 4: Link Kiến thức F&B */}
            <Link
              href="/kien-thuc"
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
              <span>Kiến thức F&B</span>
            </Link>

            {/* Mục 5: Dropdown Tài nguyên & Hợp tác */}
            <div
              ref={resourcesRef}
              className="relative shrink-0"
              onMouseEnter={handleResourcesMouseEnter}
              onMouseLeave={handleResourcesMouseLeave}
            >
              <button
                type="button"
                onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors py-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  isResourcesOpen ? 'text-emerald-700' : 'text-zinc-700 hover:text-zinc-950'
                }`}
                aria-expanded={isResourcesOpen}
              >
                <span>Tài nguyên</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 stroke-[1.5] ${
                    isResourcesOpen ? 'rotate-180 text-emerald-700' : 'text-zinc-400'
                  }`}
                />
              </button>

              {/* Dropdown Popover */}
              {isResourcesOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-lg border border-zinc-200/90 shadow-lg p-3 animate-scaleUp z-50 space-y-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 block">
                      Cẩm nang chủ quán
                    </span>

                    <Link
                      href="/huong-dan"
                      onClick={() => setIsResourcesOpen(false)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-100/70 transition-colors text-xs font-medium text-zinc-800"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                        <span>Hướng dẫn vận hành</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-1.5 py-0.2 rounded border border-zinc-200">
                        7 bước
                      </span>
                    </Link>

                    <Link
                      href="/kien-thuc"
                      onClick={() => setIsResourcesOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-zinc-100/70 transition-colors text-xs font-medium text-zinc-800"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                      <span>Cẩm nang kiến thức F&B</span>
                    </Link>

                    <Link
                      href="/#faq"
                      onClick={() => setIsResourcesOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-zinc-100/70 transition-colors text-xs font-medium text-zinc-800"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                      <span>Câu hỏi thường gặp (FAQ)</span>
                    </Link>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-2 block">
                      Đối tác & Pháp lý
                    </span>

                    <Link
                      href="/tuyen-dung-nhan-vien-kinh-doanh"
                      onClick={() => setIsResourcesOpen(false)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-100/70 transition-colors text-xs font-medium text-zinc-800"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                        <span>Tuyển dụng kinh doanh</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                        50%
                      </span>
                    </Link>

                    <Link
                      href="/chinh-sach-quyen-rieng-tu"
                      onClick={() => setIsResourcesOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-zinc-100/70 transition-colors text-xs font-medium text-zinc-800"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                      <span>Chính sách quyền riêng tư</span>
                    </Link>

                    <Link
                      href="/xoa-du-lieu"
                      onClick={() => setIsResourcesOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-zinc-100/70 transition-colors text-xs font-medium text-zinc-800"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                      <span>Hướng dẫn xóa dữ liệu</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right Action Controls */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {/* Hybrid Demo Dropdown */}
          <div
            ref={demoRef}
            className="relative shrink-0"
            onMouseEnter={handleDemoMouseEnter}
            onMouseLeave={handleDemoMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
              className="inline-flex items-center gap-1.5 h-8 text-xs font-medium text-zinc-800 bg-white hover:bg-zinc-50 border border-zinc-200/90 px-3 rounded-md transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-700 stroke-[1.5]" />
              <span>Demo</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 stroke-[1.5] transition-transform ${isDemoDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDemoDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg border border-zinc-200 shadow-md p-1.5 animate-scaleUp z-50">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Môi trường thử nghiệm
                </div>

                <a
                  href={MENU_DEMO_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDemoDropdownOpen(false)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-100 text-zinc-800 transition-colors text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-700 stroke-[1.5]" />
                    <span>Menu Khách QR</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
                </a>

                <a
                  href={ADMIN_DEMO_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsDemoDropdownOpen(false)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-100 text-zinc-800 transition-colors text-xs font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-zinc-700 stroke-[1.5]" />
                    <span>Admin POS & Bếp</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
                </a>

                <Link
                  href="/huong-dan"
                  onClick={() => setIsDemoDropdownOpen(false)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-100 text-zinc-800 transition-colors text-xs font-medium border-t border-zinc-100 mt-1"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-zinc-700 stroke-[1.5]" />
                    <span>Hướng dẫn 7 bước</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/dang-nhap"
            className="text-xs font-medium text-zinc-700 hover:text-zinc-950 px-2.5 py-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            Đăng nhập
          </Link>

          <Link href="/dang-ky" className="whitespace-nowrap shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="h-8 text-xs font-medium px-3.5 whitespace-nowrap"
            >
              Bắt đầu miễn phí →
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle Button (< lg) */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <Link href="/dang-ky" className="sm:inline-block hidden whitespace-nowrap shrink-0">
            <Button variant="primary" size="sm" className="h-8 text-xs font-medium px-3 whitespace-nowrap">
              Dùng thử 0đ
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors border border-zinc-200 shrink-0 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-zinc-200/90 shadow-lg px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Nhóm 1: Giải pháp Accordion */}
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-3 space-y-2">
            <button
              type="button"
              onClick={() => setIsMobileSolutionsExpanded(!isMobileSolutionsExpanded)}
              className="w-full flex items-center justify-between text-xs font-semibold text-zinc-900 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700 stroke-[1.5]" />
                Giải pháp F&B toàn diện
              </span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 stroke-[1.5] transition-transform ${
                  isMobileSolutionsExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMobileSolutionsExpanded && (
              <div className="space-y-1 pt-1.5 border-t border-zinc-200/60">
                {solutions.map((sol, idx) => {
                  const Icon = sol.icon;
                  return (
                    <Link
                      key={idx}
                      href={sol.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-start gap-2.5 p-2 rounded-md hover:bg-white transition-colors"
                    >
                      <div className="w-7 h-7 rounded bg-white text-zinc-700 grid place-items-center shrink-0 border border-zinc-200">
                        <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-zinc-900 truncate">
                            {sol.title}
                          </span>
                          {sol.tag && (
                            <span className={`text-[8px] font-semibold px-1 py-0.2 rounded border ${sol.tagColor}`}>
                              {sol.tag}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 leading-snug line-clamp-1 mt-0.5">
                          {sol.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Nhóm 2: Lối tắt điều hướng */}
          <div className="space-y-1 text-xs font-medium text-zinc-700">
            <Link
              href="/#workflow"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 hover:text-zinc-950 transition-colors"
            >
              Cách hoạt động
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 hover:text-zinc-950 transition-colors"
            >
              Bảng giá dịch vụ
            </Link>
            <Link
              href="/huong-dan"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 hover:text-zinc-950 transition-colors"
            >
              Hướng dẫn vận hành 7 bước
            </Link>
            <Link
              href="/kien-thuc"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 hover:text-zinc-950 transition-colors"
            >
              Cẩm nang kiến thức F&B
            </Link>
            <Link
              href="/tuyen-dung-nhan-vien-kinh-doanh"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-1.5 hover:text-zinc-950 transition-colors"
            >
              Tuyển dụng kinh doanh (Hoa hồng 50%)
            </Link>
          </div>

          {/* Trải nghiệm thực tế */}
          <div className="pt-2 border-t border-zinc-100">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
              Trải nghiệm thực tế
            </span>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={MENU_DEMO_URL}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200 text-center hover:bg-zinc-100 transition-colors"
              >
                <Smartphone className="w-4 h-4 text-emerald-700 stroke-[1.5] mx-auto mb-1" />
                <span className="text-xs font-semibold text-zinc-900 block">Menu Khách QR</span>
                <span className="text-[10px] text-zinc-500">Mở thử nghiệm ↗</span>
              </a>
              <a
                href={ADMIN_DEMO_URL}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-md bg-zinc-50 border border-zinc-200 text-center hover:bg-zinc-100 transition-colors"
              >
                <Laptop className="w-4 h-4 text-zinc-700 stroke-[1.5] mx-auto mb-1" />
                <span className="text-xs font-semibold text-zinc-900 block">Admin & POS</span>
                <span className="text-[10px] text-zinc-500">Quản lý quán ↗</span>
              </a>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2">
            <Link href="/dang-nhap" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
              <Button variant="outline" className="w-full text-xs font-medium h-9">
                Đăng nhập hệ thống
              </Button>
            </Link>
            <Link href="/dang-ky" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
              <Button variant="primary" className="w-full text-xs font-medium h-9">
                Bắt đầu miễn phí 0đ →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
