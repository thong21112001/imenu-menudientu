'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@imenu/ui';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#081f18] text-[#aabbb4] pt-16 pb-10 border-t border-[#183a2e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#183a2e]">
          <div className="md:col-span-2 space-y-4">
            <Logo light size="lg" />
            <p className="text-sm text-[#8fa59b] max-w-sm leading-relaxed">
              Hệ sinh thái số hóa F&B toàn diện: Menu điện tử QR tại bàn, POS phục vụ, màn hình bếp KDS và thanh toán VietQR tự động.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#123628] border border-[#23523f] text-xs font-semibold text-[#f1c773]">
              ✦ Gói Cơ bản 0đ · Miễn phí vĩnh viễn
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Sản phẩm</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Menu điện tử QR</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">POS tại quầy & bàn</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Màn hình Bếp KDS</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Bảng giá dịch vụ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Trải nghiệm</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="http://localhost:3005/menu/bep-nha/ban-08" target="_blank" className="hover:text-white transition-colors">Demo Menu Khách QR ↗</a></li>
              <li><a href="http://localhost:3003" target="_blank" className="hover:text-white transition-colors">Demo Admin & POS ↗</a></li>
              <li><Link href="/dang-ky" className="hover:text-white transition-colors">Tạo quán mới</Link></li>
              <li><Link href="/dang-nhap" className="hover:text-white transition-colors">Đăng nhập</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Hỗ trợ & Pháp lý</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Trung tâm hỗ trợ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hotline: 1900 xxxx</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#667c73] gap-4">
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
