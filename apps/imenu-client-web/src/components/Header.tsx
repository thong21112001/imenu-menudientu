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
  BookOpen,
  HelpCircle,
  Briefcase,
  ShieldCheck,
  Trash2,
  Layers,
} from 'lucide-react';

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
    }, 180);
  };

  const handleResourcesMouseEnter = () => {
    if (resourcesTimerRef.current) clearTimeout(resourcesTimerRef.current);
    setIsResourcesOpen(true);
  };

  const handleResourcesMouseLeave = () => {
    resourcesTimerRef.current = setTimeout(() => {
      setIsResourcesOpen(false);
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
      description: 'Khách quét mã tự chọn món, tùy chỉnh size/topping.',
      icon: QrCode,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      href: '/#features',
    },
    {
      title: 'Bán Mang Đi & Trả Trước VietQR',
      tag: 'Mới',
      tagColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Khách đặt từ xa, tiền về trước qua VietQR, đơn tự vào bếp.',
      icon: ShoppingBag,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      href: '/#takeaway',
    },
    {
      title: 'Hệ Thống POS, Bếp KDS & In Nhiệt 80mm',
      tag: 'Chuẩn FIFO',
      tagColor: 'bg-teal-100 text-teal-800 border-teal-200',
      description: 'Sơ đồ bàn thời gian thực, điều phối bếp FIFO & xuất hóa đơn.',
      icon: ChefHat,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
      href: '/#workflow',
    },
    {
      title: 'Quản Trị Chuỗi, Phân Quyền & So Sánh',
      tag: 'Doanh nghiệp',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Phân quyền 5 cấp độ & bảng so sánh trung thực với POS truyền thống.',
      icon: Building2,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      href: '/#comparison',
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Desktop Nav Group */}
        <div className="flex items-center gap-6 xl:gap-8 min-w-0">
          <Link
            href="/"
            className="hover:opacity-95 transition-opacity flex items-center shrink-0 whitespace-nowrap"
          >
            <Logo size="lg" />
          </Link>

          {/* Desktop Navigation (Gọn gàng 5 mục, 1 dòng duy nhất, không xuống hàng) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 shrink-0">
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
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 whitespace-nowrap shrink-0 ${
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

              {/* Mega Dropdown Popover (w-[560px] 2 cột) */}
              {isSolutionsOpen && (
                <div className="absolute top-full left-0 mt-1 w-[560px] bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-5 animate-scaleUp z-50">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                      <Layers className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Hệ sinh thái giải pháp F&B
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 whitespace-nowrap shrink-0">
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
                          className="group p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all flex items-start gap-3"
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex-shrink-0 grid place-items-center border ${item.iconBg} group-hover:scale-105 transition-transform`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                                {item.title}
                              </h4>
                              {item.tag && (
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border shrink-0 ${item.tagColor}`}
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
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 -mx-5 -mb-5 px-5 py-2.5 rounded-b-2xl">
                    <div className="flex items-center gap-2 text-slate-600 min-w-0 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">Chạy trên web, không bắt buộc mua máy POS.</span>
                    </div>
                    <Link
                      href="/huong-dan"
                      onClick={() => setIsSolutionsOpen(false)}
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline shrink-0 whitespace-nowrap ml-3"
                    >
                      Hướng dẫn 7 bước <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mục 2: Link Cách hoạt động */}
            <Link
              href="/#workflow"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Cách hoạt động
            </Link>

            {/* Mục 3: Link Bảng giá */}
            <Link
              href="/#pricing"
              className="text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors whitespace-nowrap shrink-0"
            >
              Bảng giá
            </Link>

            {/* Mục 4: Link Kiến thức F&B (Trang mới dành cho chủ quán) */}
            <Link
              href="/kien-thuc"
              className="text-sm font-semibold text-emerald-800 hover:text-emerald-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 whitespace-nowrap shrink-0 ${
                  isResourcesOpen ? 'text-emerald-800' : 'text-slate-700 hover:text-emerald-700'
                }`}
                aria-expanded={isResourcesOpen}
              >
                <span>Tài nguyên & Hợp tác</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isResourcesOpen ? 'rotate-180 text-emerald-700' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Mega Dropdown Popover w-[360px] 3 nhóm */}
              {isResourcesOpen && (
                <div className="absolute top-full left-0 mt-1 w-[360px] bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-4 animate-scaleUp z-50 space-y-3">
                  
                  {/* Nhóm 1: Cẩm nang & Hỗ trợ chủ quán */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                      <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                      Cẩm nang & Hỗ trợ chủ quán
                    </span>

                    <Link
                      href="/huong-dan"
                      onClick={() => setIsResourcesOpen(false)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 transition-colors">
                          📖 Hướng dẫn vận hành
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        7 bước
                      </span>
                    </Link>

                    <Link
                      href="/kien-thuc"
                      onClick={() => setIsResourcesOpen(false)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/60 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 transition-colors">
                        📚 Cẩm nang & Kiến thức F&B
                      </span>
                    </Link>

                    <Link
                      href="/#faq"
                      onClick={() => setIsResourcesOpen(false)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/60 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-900 transition-colors">
                        ❓ Câu hỏi thường gặp (FAQ)
                      </span>
                    </Link>
                  </div>

                  {/* Nhóm 2: Phát triển thị trường */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                      <Briefcase className="w-3 h-3 text-amber-600 shrink-0" />
                      Phát triển thị trường
                    </span>

                    <Link
                      href="/tuyen-dung-nhan-vien-kinh-doanh"
                      onClick={() => setIsResourcesOpen(false)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-900 transition-colors">
                          💼 Tuyển nhân viên kinh doanh
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                        Hoa hồng 50%
                      </span>
                    </Link>
                  </div>

                  {/* Nhóm 3: Bảo mật & Quyền dữ liệu */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 px-2">
                      <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                      Bảo mật & Quyền dữ liệu
                    </span>

                    <Link
                      href="/chinh-sach-quyen-rieng-tu"
                      onClick={() => setIsResourcesOpen(false)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-teal-900 transition-colors">
                        🛡️ Chính sách quyền riêng tư
                      </span>
                    </Link>

                    <Link
                      href="/xoa-du-lieu"
                      onClick={() => setIsResourcesOpen(false)}
                      className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-rose-700 transition-colors">
                        🗑️ Hướng dẫn xóa dữ liệu
                      </span>
                    </Link>
                  </div>

                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Cụm nút hành động bên phải (100% không rớt dòng: whitespace-nowrap shrink-0) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {/* Demo Dropdown Button */}
          <div
            ref={demoRef}
            className="relative shrink-0"
            onMouseEnter={handleDemoMouseEnter}
            onMouseLeave={handleDemoMouseLeave}
          >
            <button
              type="button"
              onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all shadow-sm whitespace-nowrap shrink-0"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Demo Thực Tế</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isDemoDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDemoDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 animate-scaleUp z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Chọn môi trường trải nghiệm
                </div>
                
                {/* Lựa chọn 1: Menu Khách QR (Port 3005) */}
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
                      Mở Menu Khách QR (Port 3005)
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500">Khách quét QR chọn món tại bàn</div>
                  </div>
                </a>

                {/* Lựa chọn 2: Quản Trị POS & Bếp KDS (Port 3003) */}
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
                      Mở Quản trị POS & Bếp KDS (Port 3003)
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500">Thu ngân, sơ đồ bàn & điều phối bếp</div>
                  </div>
                </a>

                {/* Lựa chọn 3: Xem Hướng dẫn vận hành 7 bước (/huong-dan) */}
                <Link
                  href="/huong-dan"
                  onClick={() => setIsDemoDropdownOpen(false)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 transition-colors group"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1">
                      Xem Hướng dẫn vận hành 7 bước
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500">Quy trình triển khai bài bản cho quán</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/dang-nhap"
            className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 transition-colors whitespace-nowrap shrink-0"
          >
            Đăng nhập
          </Link>

          <Link href="/dang-ky" className="whitespace-nowrap shrink-0">
            <Button
              variant="primary"
              size="md"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20 text-xs px-4 whitespace-nowrap shrink-0"
            >
              Bắt đầu miễn phí →
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle Button (< lg) */}
        <div className="flex items-center gap-2 lg:hidden shrink-0">
          <Link href="/dang-ky" className="sm:inline-block hidden whitespace-nowrap shrink-0">
            <Button variant="primary" size="sm" className="text-xs font-bold px-3 py-1.5 whitespace-nowrap">
              Dùng thử 0đ
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 shrink-0"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu (< lg) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-2xl px-5 py-6 space-y-5 animate-slideUp max-h-[85vh] overflow-y-auto">
          {/* Nhóm 1: Giải pháp Accordion */}
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

          {/* Nhóm 2: Lối tắt điều hướng */}
          <div className="space-y-2 text-sm font-semibold text-slate-700 divide-y divide-slate-100">
            <Link
              href="/#workflow"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block pt-2 hover:text-emerald-700 transition-colors"
            >
              Cách hoạt động
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block pt-2 hover:text-emerald-700 transition-colors"
            >
              Bảng giá dịch vụ
            </Link>
          </div>

          {/* Nhóm 3: Tài nguyên & Cẩm nang chủ quán */}
          <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-3.5 space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
              Tài nguyên & Cẩm nang
            </span>
            <div className="space-y-1.5 text-xs font-semibold">
              <Link
                href="/huong-dan"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-lg bg-white/80 hover:bg-white text-emerald-900 transition-colors"
              >
                <span>📖 Hướng dẫn vận hành 7 bước</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  7 bước
                </span>
              </Link>
              <Link
                href="/kien-thuc"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-lg bg-white/80 hover:bg-white text-emerald-900 transition-colors"
              >
                <span>📚 Cẩm nang & Kiến thức F&B</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
              </Link>
              <Link
                href="/#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2 rounded-lg bg-white/80 hover:bg-white text-slate-700 transition-colors"
              >
                <span>❓ Câu hỏi thường gặp (FAQ)</span>
              </Link>
            </div>
          </div>

          {/* Nhóm 4: Cơ hội hợp tác */}
          <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-3.5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-amber-700" />
              Cơ hội hợp tác kinh doanh
            </span>
            <Link
              href="/tuyen-dung-nhan-vien-kinh-doanh"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between p-2 rounded-lg bg-white/80 hover:bg-white text-amber-950 font-semibold text-xs transition-colors"
            >
              <span>💼 Tuyển nhân viên kinh doanh</span>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                Hoa hồng 50%
              </span>
            </Link>
          </div>

          {/* Nhóm 5: Bảo mật & Pháp lý */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
              Bảo mật & Quyền riêng tư
            </span>
            <div className="flex flex-col gap-1 text-xs text-slate-600">
              <Link
                href="/chinh-sach-quyen-rieng-tu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:text-emerald-700 transition-colors"
              >
                🛡️ Chính sách quyền riêng tư
              </Link>
              <Link
                href="/xoa-du-lieu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 hover:text-rose-600 transition-colors"
              >
                🗑️ Hướng dẫn & Yêu cầu xóa dữ liệu
              </Link>
            </div>
          </div>

          {/* Trải nghiệm thực tế */}
          <div className="pt-1">
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
                <span className="text-[10px] text-slate-500">Port 3005 ↗</span>
              </a>
              <a
                href="http://localhost:3003"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center hover:bg-emerald-50 transition-colors"
              >
                <Laptop className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                <span className="text-xs font-bold text-slate-800 block">Admin & POS</span>
                <span className="text-[10px] text-slate-500">Port 3003 ↗</span>
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
