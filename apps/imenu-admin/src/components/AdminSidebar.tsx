'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@imenu/ui';
import { useSidebar } from './AdminLayoutShell';
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
  ChevronLeft,
  ChevronRight,
  X,
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
  const { isMobile, isSidebarOpen, isCollapsed, toggleCollapsed, closeSidebar } = useSidebar();

  const sidebarWidthClass = isMobile
    ? 'w-72'
    : isCollapsed
    ? 'w-20'
    : 'w-64';

  const transformClass = isMobile
    ? isSidebarOpen
      ? 'translate-x-0 shadow-2xl'
      : '-translate-x-full pointer-events-none'
    : 'translate-x-0';

  return (
    <aside
      className={`bg-[#09271d] text-[#9eb2aa] flex flex-col min-h-screen fixed inset-y-0 left-0 z-50 border-r border-[#153e30] transition-all duration-300 ease-in-out ${sidebarWidthClass} ${transformClass}`}
    >
      {/* Brand Header */}
      <div className={`p-4 border-b border-[#183a2e] flex items-center justify-between min-h-[64px] ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}`}>
        {isCollapsed && !isMobile ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 grid place-items-center font-black text-lg shadow-md">
            i
          </div>
        ) : (
          <Logo light size="md" />
        )}

        {/* Close button on mobile */}
        {isMobile && (
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Restaurant Branch Indicator */}
      {(!isCollapsed || isMobile) && (
        <div className="px-3.5 py-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#eab867] text-[#09271d] grid place-items-center font-bold text-xs shrink-0">
              BN
            </div>
            <div className="min-w-0 flex-1">
              <strong className="text-xs text-white block truncate">Bếp Nhà - Q.1</strong>
              <small className="text-[10px] text-emerald-400 block truncate">Chi nhánh chính</small>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) closeSidebar();
              }}
              title={isCollapsed && !isMobile ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isCollapsed && !isMobile ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'bg-white/10 text-white shadow-xs font-bold'
                  : 'text-[#9eb2aa] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-[#eab867]' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {(!isCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer & Collapse Toggle Button */}
      <div className="p-3 border-t border-[#183a2e] space-y-2">
        {(!isCollapsed || isMobile) ? (
          <a
            href="http://localhost:3005"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/40 text-[11px] text-emerald-300 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Store className="w-3.5 h-3.5" /> Menu QR Khách
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <a
            href="http://localhost:3005"
            target="_blank"
            rel="noopener noreferrer"
            title="Menu QR Khách"
            className="flex items-center justify-center p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 transition-colors"
          >
            <Store className="w-4 h-4" />
          </a>
        )}

        {/* Desktop Collapse / Expand Toggle Button */}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            className={`w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[#9eb2aa] hover:text-white text-xs flex items-center transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          >
            {!isCollapsed && <span className="text-[11px] font-medium">Thu gọn</span>}
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>
    </aside>
  );
};
