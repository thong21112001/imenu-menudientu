'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@imenu/ui';
import {
  Globe,
  Printer,
  CreditCard,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  Trash2,
  Briefcase,
  BookOpen,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-slate-800/80">
          
          {/* Cột 1 (4 cols trên lg): Thương hiệu & Tín nhiệm */}
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

          {/* Cột 2 (3 cols trên lg): Sản phẩm & Giải pháp */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded bg-emerald-500" />
              Sản phẩm & Giải pháp
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/#features" className="hover:text-emerald-400 transition-colors flex items-center justify-between group">
                  <span>Menu điện tử QR tại bàn</span>
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
                <Link href="/#workflow" className="hover:text-emerald-400 transition-colors">
                  Phần mềm POS & Bếp KDS
                </Link>
              </li>
              <li>
                <Link href="/#comparison" className="hover:text-emerald-400 transition-colors">
                  So sánh giải pháp
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-emerald-400 transition-colors">
                  Bảng giá & Ưu đãi máy in
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3 (3 cols trên lg): Kiến thức & Hợp tác */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded bg-amber-500" />
              Kiến thức & Hợp tác
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/huong-dan" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors flex items-center gap-1.5">
                  <span>📖 Hướng dẫn sử dụng (7 bước)</span>
                </Link>
              </li>
              <li>
                <Link href="/kien-thuc" className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>📚 Kiến thức quản lý quán F&B</span>
                </Link>
              </li>
              <li>
                <Link href="/tuyen-dung-nhan-vien-kinh-doanh" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors flex items-center justify-between group">
                  <span>💼 Tuyển nhân viên kinh doanh</span>
                  <span className="text-[10px] font-bold text-amber-950 bg-amber-400 px-1.5 py-0.2 rounded">
                    Đang tuyển
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:3005/menu/bep-nha/ban-08"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                >
                  <span>📱 Trải nghiệm Demo Menu QR</span>
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
                  <span>🖥️ Trải nghiệm Demo Admin POS</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4 (2 cols trên lg): Bảo mật & Pháp lý */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-3.5 rounded bg-teal-500" />
              Bảo mật & Pháp lý
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/chinh-sach-quyen-rieng-tu" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>🛡️ Chính sách quyền riêng tư</span>
                </Link>
              </li>
              <li>
                <Link href="/xoa-du-lieu" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <span>🗑️ Hướng dẫn xóa dữ liệu</span>
                </Link>
              </li>
              <li>
                <Link href="/#roles" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>🔐 Phân quyền & Bảo mật RBAC</span>
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>❓ Câu hỏi thường gặp</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Dòng bản quyền dưới đáy */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <span>© 2026 Hệ sinh thái Nền tảng Quản lý Nhà hàng iMenu. Mọi quyền được bảo lưu.</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <Link href="/chinh-sach-quyen-rieng-tu" className="hover:text-emerald-400 transition-colors underline">
              Chính sách quyền riêng tư
            </Link>
            <span className="hidden sm:inline text-slate-700">·</span>
            <Link href="/xoa-du-lieu" className="hover:text-rose-400 transition-colors underline">
              Yêu cầu xóa dữ liệu
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              Mã hóa dữ liệu chuẩn AES-256
            </span>
            <span className="hidden md:inline text-slate-700">·</span>
            <span>Hạ tầng Cloud Realtime WebSocket</span>
            <span className="hidden md:inline text-slate-700">·</span>
            <span>Hỗ trợ kỹ thuật 24/7</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
