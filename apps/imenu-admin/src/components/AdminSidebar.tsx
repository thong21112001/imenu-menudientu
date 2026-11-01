'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@imenu/ui';
import { storageService } from '@imenu/utils';
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
  Star,
  Users,
  Building2,
  Settings,
  Store,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface NavItemConfig {
  name: string;
  href: string;
  icon: any;
  permissions?: string[];
  requireMainBranch?: boolean;
}

interface NavGroupConfig {
  id: string;
  label: string;
  items: NavItemConfig[];
}

const NAV_GROUPS_CONFIG: NavGroupConfig[] = [
  {
    id: 'operations',
    label: 'Vận hành trực tiếp',
    items: [
      {
        name: 'Sơ đồ Bàn',
        href: '/tables',
        icon: Grid3X3,
        permissions: ['perm-pos-view'],
      },
      {
        name: 'POS Bán hàng',
        href: '/pos',
        icon: Smartphone,
        permissions: ['perm-pos-order', 'perm-pos-view'],
      },
      {
        name: 'Màn hình Bếp KDS',
        href: '/kitchen',
        icon: ChefHat,
        permissions: ['perm-kds-view', 'perm-kds-cook'],
      },
      {
        name: 'Hóa đơn & In Bill',
        href: '/bills',
        icon: Receipt,
        permissions: ['perm-pos-pay'],
      },
    ],
  },
  {
    id: 'menu_qr',
    label: 'Thực đơn & Mã QR',
    items: [
      {
        name: 'Quản lý Thực đơn',
        href: '/menu',
        icon: UtensilsCrossed,
        permissions: ['perm-menu-view'],
      },
      {
        name: 'Tạo mã QR Bàn',
        href: '/qr-codes',
        icon: QrCode,
        permissions: ['perm-qr-print', 'perm-pos-table'],
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Phân tích & Doanh thu',
    items: [
      {
        name: 'Tổng quan',
        href: '/',
        icon: LayoutDashboard,
        permissions: ['perm-rep-view', 'perm-dash-view'],
      },
      {
        name: 'Báo cáo & Doanh thu',
        href: '/reports',
        icon: BarChart3,
        permissions: ['perm-rep-view'],
      },
      {
        name: 'Đánh giá Khách hàng',
        href: '/reviews',
        icon: Star,
        permissions: ['perm-review-view'],
      },
    ],
  },
  {
    id: 'system',
    label: 'Quản trị hệ thống',
    items: [
      {
        name: 'Nhân viên & Phân quyền',
        href: '/staff',
        icon: Users,
        permissions: ['perm-staff-manage', 'perm-role-manage'],
      },
      {
        name: 'Quản lý Chi nhánh',
        href: '/branches',
        icon: Building2,
        requireMainBranch: true,
        permissions: ['perm-settings', 'perm-staff-manage'],
      },
      {
        name: 'Cài đặt Nhà hàng',
        href: '/settings',
        icon: Settings,
        permissions: ['perm-settings'],
      },
    ],
  },
];

const SALES_NAV_GROUP_CONFIG: NavGroupConfig = {
  id: 'sales_portal',
  label: 'Cổng Đối Tác Kinh Doanh',
  items: [
    {
      name: 'Bảng điều khiển & KPI',
      href: '/sales/dashboard',
      icon: LayoutDashboard,
      permissions: ['perm-sales-view'],
    },
    {
      name: 'Quản lý Nhà hàng & Tạo mới',
      href: '/sales/restaurants',
      icon: Store,
      permissions: ['perm-sales-view', 'perm-sales-create-restaurant'],
    },
    {
      name: 'Sổ cái Hoa hồng & Đối soát',
      href: '/sales/commissions',
      icon: Receipt,
      permissions: ['perm-sales-view'],
    },
    {
      name: 'Đội ngũ CTV cấp dưới',
      href: '/sales/team',
      icon: Users,
      permissions: ['perm-sales-view'],
    },
  ],
};

const SUPERADMIN_NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'platform_control',
    label: 'Quản trị Nền tảng iMenu',
    items: [
      {
        name: 'Tổng quan Hệ thống',
        href: '/platform/dashboard',
        icon: LayoutDashboard,
      },
      {
        name: 'Danh sách Nhà hàng',
        href: '/platform/restaurants',
        icon: Store,
      },
      {
        name: 'Doanh thu Hệ thống',
        href: '/platform/revenues',
        icon: BarChart3,
      },
      {
        name: 'Nhân viên Kinh doanh',
        href: '/platform/sales',
        icon: Users,
      },
      {
        name: 'Tài khoản & Phân quyền',
        href: '/platform/admins',
        icon: Settings,
      },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { isMobile, isSidebarOpen, isCollapsed, toggleCollapsed, closeSidebar } = useSidebar();
  const [user, setUser] = useState<any>(storageService.getCurrentUser());
  const [restaurant, setRestaurant] = useState<any>(storageService.getRestaurant());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(storageService.getCurrentUser());
      setRestaurant(storageService.getRestaurant());
    };
    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []);

  const isSuperAdmin = Boolean(
    user?.isSuperAdmin ||
      user?.role === 'SYSTEM_ADMIN' ||
      user?.role === 'system_admin' ||
      user?.role === 'super_admin'
  );

  const isSalesRep = Boolean(
    user?.role === 'SALES_REP' ||
      user?.role === 'SALES_LEADER' ||
      user?.role === 'sales_rep' ||
      user?.role === 'sales_leader'
  );

  const isMainBranchUser = isSuperAdmin || Boolean(user?.isMainBranch);
  const permissions: string[] = user?.permissions || [];

  let visibleGroups: NavGroupConfig[] = [];

  if (isSuperAdmin) {
    visibleGroups = SUPERADMIN_NAV_GROUPS;
  } else if (isSalesRep) {
    visibleGroups = [SALES_NAV_GROUP_CONFIG];
  } else {
    visibleGroups = NAV_GROUPS_CONFIG.map((group) => {
      const filteredItems = group.items
        .filter((item) => {
          if (item.requireMainBranch && !isMainBranchUser) return false;

          if (
            user?.role === 'RESTAURANT_ADMIN' ||
            user?.role === 'restaurant_admin' ||
            user?.role === 'OWNER' ||
            user?.role === 'owner'
          ) {
            return true;
          }

          if (item.permissions && item.permissions.length > 0) {
            const hasPerm = item.permissions.some((p) => permissions.includes(p));
            if (!hasPerm) return false;
          }

          return true;
        })
        .map((item) => {
          if (item.href === '/settings' && !isMainBranchUser) {
            return { ...item, name: 'Cài đặt Chi nhánh' };
          }
          return item;
        });

      return {
        ...group,
        items: filteredItems,
      };
    }).filter((group) => group.items.length > 0);
  }

  const restaurantName = isSuperAdmin
    ? 'iMenu Platform Control Center'
    : isSalesRep
    ? 'iMenu Partner Portal'
    : restaurant?.name || 'Bếp Nhà';

  const restaurantInitials = isSuperAdmin
    ? 'SA'
    : isSalesRep
    ? 'SL'
    : restaurantName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w: string) => w[0].toUpperCase())
        .join('') || 'IM';

  const branchName = isSuperAdmin
    ? 'Quản Trị Hệ Thống'
    : isSalesRep
    ? user?.fullName || 'Chuyên viên Kinh doanh'
    : user?.branchName || restaurant?.branches?.[0]?.name || 'Chi nhánh chính';

  const sidebarWidthClass = isMobile
    ? 'w-72'
    : isCollapsed
    ? 'w-16'
    : 'w-60';

  const transformClass = isMobile
    ? isSidebarOpen
      ? 'translate-x-0 shadow-xl'
      : '-translate-x-full pointer-events-none'
    : 'translate-x-0';

  return (
    <aside
      className={`bg-zinc-950 text-zinc-400 flex flex-col min-h-screen fixed inset-y-0 left-0 z-50 border-r border-zinc-800/80 transition-all duration-200 ease-in-out ${sidebarWidthClass} ${transformClass}`}
    >
      {/* Brand Header */}
      <div className={`px-4 border-b border-zinc-850 flex items-center justify-between h-14 ${isCollapsed && !isMobile ? 'justify-center px-2' : ''}`}>
        {isCollapsed && !isMobile ? (
          <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 text-white grid place-items-center font-bold text-xs">
            i
          </div>
        ) : (
          <Logo light size="sm" />
        )}

        {/* Close button on mobile */}
        {isMobile && (
          <button
            onClick={closeSidebar}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Restaurant Branch Indicator */}
      {(!isCollapsed || isMobile) && (
        <div className="px-3 py-2.5">
          <div className="p-2 rounded-md bg-zinc-900/80 border border-zinc-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700/60 grid place-items-center font-bold text-[11px] shrink-0 tabular-nums">
              {restaurantInitials}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="text-xs text-zinc-200 block truncate font-medium">{restaurantName}</strong>
              <small className="text-[10px] text-zinc-400 block truncate">{branchName}</small>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Groups & Links */}
      <nav className="flex-1 px-2.5 py-2 space-y-3 overflow-y-auto overflow-x-hidden">
        {visibleGroups.map((group, groupIdx) => {
          return (
            <div key={group.id} className="space-y-0.5">
              {/* Tiêu đề nhóm khi mở rộng hoặc đường kẻ phân cách khi thu gọn */}
              {(!isCollapsed || isMobile) ? (
                <div className={`px-2.5 ${groupIdx > 0 ? 'pt-2' : 'pt-0.5'} pb-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase select-none`}>
                  {group.label}
                </div>
              ) : (
                groupIdx > 0 && <div className="my-1.5 border-t border-zinc-850 mx-1.5" />
              )}

              {/* Danh sách các mục trong nhóm */}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobile) closeSidebar();
                    }}
                    title={isCollapsed && !isMobile ? `${group.label}: ${item.name}` : undefined}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors group ${
                      isCollapsed && !isMobile ? 'justify-center px-0' : ''
                    } ${
                      isActive
                        ? 'bg-zinc-800/90 text-white font-medium border-l-2 border-emerald-500 pl-2'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border-l-2 border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 stroke-[1.5] ${
                        isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-300'
                      }`}
                    />
                    {(!isCollapsed || isMobile) && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer & Collapse Toggle Button */}
      <div className="p-2.5 border-t border-zinc-850 space-y-1.5">
        {!isSuperAdmin && (
          (!isCollapsed || isMobile) ? (
            <a
              href="http://localhost:3005"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 text-[11px] text-zinc-300 transition-colors"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Store className="w-3.5 h-3.5 text-zinc-400" /> Menu QR Khách
              </span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          ) : (
            <a
              href="http://localhost:3005"
              target="_blank"
              rel="noopener noreferrer"
              title="Menu QR Khách"
              className="flex items-center justify-center p-1.5 rounded-md bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
            </a>
          )
        )}

        {/* Desktop Collapse / Expand Toggle Button */}
        {!isMobile && (
          <button
            onClick={toggleCollapsed}
            className={`w-full py-1.5 px-2.5 rounded-md bg-zinc-900/60 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-xs flex items-center transition-colors cursor-pointer border border-zinc-850 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
            title={isCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
          >
            {!isCollapsed && <span className="text-[11px] font-medium">Thu gọn</span>}
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </aside>
  );
};
