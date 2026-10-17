'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@imenu/ui';
import {
  Globe,
  ShieldCheck,
  Printer,
  QrCode,
  Zap,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Laptop,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-slate-800/80">
          
          {/* Column 1-2 (5 cols on lg): Brand & Trust Signals */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <Logo light size="lg" />
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Hệ sinh thái số hóa F&B toàn diện dành riêng cho nhà hàng, quán ăn, cà phê và trà sữa Việt Nam: Menu điện tử QR tại bàn, Đặt món mang đi trả trước, POS phục vụ, Màn hình Bếp KDS và thanh toán VietQR Napas 247.
            </p>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/70 text-xs font-semibold text-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gói Cơ bản 0đ · Miễn phí không giới hạn thời gian</span>
            </div>

            {/* Trust Metrics Pill Strip */}
            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span><strong>Chạy trên trình duyệt</strong> — Khách không cần cài app, mở ngay trên camera/Zalo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span><strong>Chuẩn VietQR Napas 247</strong> — Tiền về thẳng tài khoản ngân hàng của chủ quán</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Printer className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span><strong>Hỗ trợ in nhiệt 80mm</strong> — Tương thích máy in hóa đơn & vé bếp ESC/POS</span>
              </div>
            </div>
          </div>

          {/* Column 3 (2.5 cols on lg): Giải pháp F&B */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded bg-emerald-500" />
              Giải pháp F&B
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/#workflow" className="hover:text-emerald-400 transition-colors flex items-center justify-between group">
                  <span>Menu QR tại bàn</span>
                  <span className="text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">Khuyên dùng</span>
                </Link>
              </li>
              <li>
                <Link href="/#takeaway" className="hover:text-emerald-400 transition-colors flex items-center justify-between group">
                  <span>Bán mang đi trả trước</span>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.2 rounded">Mới</span>
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-emerald-400 transition-colors">
                  Phần mềm POS & Sơ đồ bàn
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-emerald-400 transition-colors">
                  Màn hình Bếp KDS (FIFO)
                </Link>
              </li>
              <li>
                <Link href="/#roles" className="hover:text-emerald-400 transition-colors">
                  Quản trị chuỗi đa chi nhánh
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 (2.5 cols on lg): Khám phá & Trải nghiệm */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded bg-amber-500" />
              Khám phá & Trải nghiệm
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/huong-dan" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1.5">
                  <span>📖 Hướng dẫn vận hành 7 bước</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/80">Hot</span>
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:3005/menu/bep-nha/ban-08"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                >
                  <span>Mở thử Menu Khách QR</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:3003"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                >
                  <span>Mở thử Quản trị POS / KDS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </li>
              <li>
                <Link href="/#pricing" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Bảng giá & Ưu đãi máy in
                </Link>
              </li>
              <li>
                <Link href="/#comparison" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  So sánh giải pháp
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5 (2 cols on lg): Hỗ trợ & Bảo mật */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded bg-teal-500" />
              Hỗ trợ & Bảo mật
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/#faq" className="hover:text-emerald-400 transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link href="/#roles" className="hover:text-emerald-400 transition-colors">
                  Phân quyền & Bảo mật dữ liệu
                </Link>
              </li>
              <li>
                <Link href="/dang-ky" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-300">
                  Đăng ký quán mới
                </Link>
              </li>
              <li>
                <Link href="/dang-nhap" className="hover:text-emerald-400 transition-colors">
                  Đăng nhập hệ thống
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span>© 2026 iMenu Platform. Đồng hành cùng nhà hàng Việt.</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              Mã hóa dữ liệu chuẩn AES-256
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-slate-400">Hạ tầng Cloud Realtime WebSocket</span>
            <span className="text-slate-400">Hỗ trợ kỹ thuật 24/7</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
