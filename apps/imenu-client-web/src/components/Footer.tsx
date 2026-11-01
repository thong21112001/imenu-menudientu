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

const MENU_DEMO_URL = process.env.NEXT_PUBLIC_MENU_DEMO_URL || 'http://localhost:3005/menu/bep-nha/ban-08';
const ADMIN_DEMO_URL = process.env.NEXT_PUBLIC_ADMIN_DEMO_URL || 'http://localhost:3003';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-14 pb-10 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 pb-12 border-b border-zinc-800/80">
          {/* Cột 1 (4 cols trên lg): Thương hiệu & Tín nhiệm */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
              <Logo light size="lg" />
            </Link>

            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Hệ sinh thái số hóa F&B toàn diện cho nhà hàng, quán ăn, cà phê và trà sữa Việt Nam: Menu QR tại bàn, Đặt món mang đi trả trước VietQR, POS phục vụ, Màn hình Bếp KDS và báo cáo doanh thu hợp nhất.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Gói Cơ bản 0đ · Miễn phí không giới hạn thời gian</span>
            </div>

            {/* Trust Metrics Pill Strip */}
            <div className="space-y-1.5 pt-1 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0 stroke-[1.5]" />
                <span>Hoạt động 100% trên trình duyệt — Khách không cần cài app</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400 shrink-0 stroke-[1.5]" />
                <span>Chuẩn VietQR Napas 247 — Tiền về thẳng tài khoản chủ quán</span>
              </div>
              <div className="flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 text-zinc-400 shrink-0 stroke-[1.5]" />
                <span>Hỗ trợ in nhiệt 80mm — Tương thích ESC/POS qua LAN / Bluetooth</span>
              </div>
            </div>
          </div>

          {/* Cột 2 (3 cols trên lg): Sản phẩm & Giải pháp */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              Sản phẩm & Giải pháp
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Menu điện tử QR tại bàn
                </Link>
              </li>
              <li>
                <Link href="/#takeaway" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Bán mang đi trả trước</span>
                  <span className="text-[9px] font-semibold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1 py-0.2 rounded">Mới</span>
                </Link>
              </li>
              <li>
                <Link href="/#workflow" className="hover:text-white transition-colors">
                  Phần mềm POS & Bếp KDS
                </Link>
              </li>
              <li>
                <Link href="/#comparison" className="hover:text-white transition-colors">
                  So sánh giải pháp
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-white transition-colors">
                  Bảng giá & Ưu đãi máy in
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3 (3 cols trên lg): Kiến thức & Hợp tác */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              Kiến thức & Hợp tác
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/huong-dan" className="hover:text-white transition-colors">
                  Hướng dẫn vận hành (7 bước)
                </Link>
              </li>
              <li>
                <Link href="/kien-thuc" className="hover:text-white transition-colors">
                  Cẩm nang kiến thức F&B
                </Link>
              </li>
              <li>
                <Link href="/tuyen-dung-nhan-vien-kinh-doanh" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span>Tuyển dụng kinh doanh</span>
                  <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                    Hoa hồng 50%
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href={MENU_DEMO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>Thử nghiệm Menu QR Khách</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors stroke-[1.5]" />
                </a>
              </li>
              <li>
                <a
                  href={ADMIN_DEMO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1 group"
                >
                  <span>Thử nghiệm Admin POS</span>
                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-white transition-colors stroke-[1.5]" />
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4 (2 cols trên lg): Bảo mật & Pháp lý */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white">
              Bảo mật & Pháp lý
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/chinh-sach-quyen-rieng-tu" className="hover:text-white transition-colors">
                  Chính sách quyền riêng tư
                </Link>
              </li>
              <li>
                <Link href="/xoa-du-lieu" className="hover:text-white transition-colors">
                  Hướng dẫn xóa dữ liệu
                </Link>
              </li>
              <li>
                <Link href="/#roles" className="hover:text-white transition-colors">
                  Phân quyền & Bảo mật RBAC
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền dưới đáy */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span>© 2026 iMenu Cloud Platform. Mọi quyền được bảo lưu.</span>
            <span>·</span>
            <Link href="/chinh-sach-quyen-rieng-tu" className="hover:text-zinc-300 transition-colors">
              Quyền riêng tư
            </Link>
            <span>·</span>
            <Link href="/xoa-du-lieu" className="hover:text-zinc-300 transition-colors">
              Xóa dữ liệu
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1 text-zinc-400">
              <Lock className="w-3 h-3 text-emerald-500 stroke-[1.5]" />
              Mã hóa TLS 1.3 / AES-256
            </span>
            <span>·</span>
            <span>Hạ tầng WebSocket Realtime</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
