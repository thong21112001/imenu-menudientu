'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@imenu/ui';
import {
  LayoutDashboard,
  Grid3X3,
  Smartphone,
  ChefHat,
  UtensilsCrossed,
  QrCode,
  Receipt,
  BarChart3,
  Users,
  Settings,
  Store,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Sơ đồ Bàn', href: '/tables', icon: Grid3X3 },
  { name: 'POS Bán hàng', href: '/pos', icon: Smartphone },
  { name: 'Màn hình Bếp KDS', href: '/kitchen', icon: ChefHat },
  { name: 'Quản lý Thực đơn', href: '/menu', icon: UtensilsCrossed },
  { name: 'Tạo mã QR Bàn', href: '/qr-codes', icon: QrCode },
  { name: 'Hóa đơn & In Bill', href: '/bills', icon: Receipt },
  { name: 'Báo cáo & Doanh thu', href: '/reports', icon: BarChart3 },
  { name: 'Nhân viên & Phân quyền', href: '/staff', icon: Users },
  { name: 'Cài đặt Nhà hàng', href: '/settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#09271d] text-[#9eb2aa] flex flex-col min-h-screen fixed inset-y-0 left-0 z-50 border-r border-[#153e30]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#183a2e] flex items-center justify-between">
        <Logo light size="md" />
      </div>

      {/* Restaurant Branch Indicator */}
      <div className="px-4 py-3">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#eab867] text-[#09271d] grid place-items-center font-bold text-xs">
            BN
          </div>
          <div className="min-w-0 flex-1">
            <strong className="text-xs text-white block truncate">Bếp Nhà - Q.1</strong>
            <small className="text-[10px] text-emerald-400 block truncate">Chi nhánh chính</small>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm font-bold'
                  : 'text-[#9eb2aa] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#eab867]' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Quick links */}
      <div className="p-4 border-t border-[#183a2e] space-y-2">
        <a
          href="http://localhost:3005/menu/bep-nha/ban-08"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 text-[11px] text-emerald-300 transition-colors"
        >
          <span className="flex items-center gap-1.5 font-medium">
            <Store className="w-3.5 h-3.5" /> Menu QR Khách
          </span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};
