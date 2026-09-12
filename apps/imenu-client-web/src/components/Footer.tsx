'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@imenu/ui';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          <div className="md:col-span-2 space-y-4">
            <Logo light size="lg" />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Hệ sinh thái số hóa F&B toàn diện: Menu điện tử QR tại bàn, POS phục vụ, màn hình bếp KDS và thanh toán VietQR tự động.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-xs font-semibold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gói Cơ bản 0đ · Miễn phí vĩnh viễn
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Sản phẩm</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/#features" className="text-slate-400 hover:text-emerald-400 transition-colors">Menu điện tử QR</Link></li>
              <li><Link href="/#features" className="text-slate-400 hover:text-emerald-400 transition-colors">POS tại quầy & bàn</Link></li>
              <li><Link href="/#features" className="text-slate-400 hover:text-emerald-400 transition-colors">Màn hình Bếp KDS</Link></li>
              <li><Link href="/#pricing" className="text-slate-400 hover:text-emerald-400 transition-colors">Bảng giá dịch vụ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Trải nghiệm</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/huong-dan" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">📖 Hướng dẫn vận hành (7 bước)</Link></li>
              <li><a href="http://localhost:3005/menu/bep-nha/ban-08" target="_blank" className="text-slate-400 hover:text-emerald-400 transition-colors">Demo Menu Khách QR ↗</a></li>
              <li><a href="http://localhost:3003" target="_blank" className="text-slate-400 hover:text-emerald-400 transition-colors">Demo Admin & POS ↗</a></li>
              <li><Link href="/dang-ky" className="text-slate-400 hover:text-emerald-400 transition-colors">Tạo quán mới</Link></li>
              <li><Link href="/dang-nhap" className="text-slate-400 hover:text-emerald-400 transition-colors">Đăng nhập</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Hỗ trợ & Pháp lý</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Trung tâm hỗ trợ</a></li>
              <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Hotline: 1900 xxxx</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 iMenu Platform. Đồng hành cùng nhà hàng Việt.</p>
          <div className="flex gap-6">
            <span>Việt Nam · Tiếng Việt</span>
            <span>Bảo mật dữ liệu đám mây</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
