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
        href: '/staff',
        icon: Building2,
      },
    ],
  },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { isMobile, isSidebarOpen, isCollapsed, toggleCollapsed, closeSidebar } = useSidebar();
  const [restaurant, setRestaurant] = useState<any>(storageService.getRestaurant());
  const [user, setUser] = useState<any>(storageService.getCurrentUser());
  const [permissions, setPermissions] = useState<string[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(storageService.getSelectedRestaurantId());

  useEffect(() => {
    setRestaurant(storageService.getRestaurant());
    setUser(storageService.getCurrentUser());
    setSelectedRestaurantId(storageService.getSelectedRestaurantId());
    setPermissions(storageService.getPermissions() || []);

    const handleRestaurantChanged = (e: any) => {
      setSelectedRestaurantId(e.detail?.restaurantId ?? null);
      setRestaurant(storageService.getRestaurant());
    };

    window.addEventListener('imenu:restaurant_changed', handleRestaurantChanged);
    return () => {
      window.removeEventListener('imenu:restaurant_changed', handleRestaurantChanged);
    };
  }, []);

  const roleSlug = String(user?.role || '').toLowerCase();
  const isSuperAdmin = roleSlug === 'system_admin' || roleSlug === 'super_admin';
  const isOwner = roleSlug === 'restaurant_admin';
  const isSalesRep = roleSlug === 'sales_rep';
  const isMainBranchUser = isSuperAdmin || Boolean(user?.isMainBranch);

  let visibleGroups: NavGroupConfig[] = [];

  if (isSuperAdmin) {
    // AUD-14.2: Superadmin chỉ hiển thị duy nhất không gian Platform Control Center
    visibleGroups = SUPERADMIN_NAV_GROUPS;
  } else if (isSalesRep) {
    visibleGroups = [SALES_NAV_GROUP_CONFIG];
  } else {
    // Chế độ Quản trị nội bộ một Nhà hàng
    visibleGroups = NAV_GROUPS_CONFIG.map((group) => {
      const filteredItems = group.items
        .filter((item) => {
          // 1. Chủ Nhà Hàng (HQ) có toàn quyền
          if (isOwner) {
            if (item.requireMainBranch && !isMainBranchUser) return false;
            return true;
          }

          // 2. Kiểm tra điều kiện Chi nhánh chính
          if (item.requireMainBranch && !isMainBranchUser) {
            return false;
          }

          // 3. Kiểm tra permission của người dùng
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
    ? '👑 Quản Trị Hệ Thống'
    : isSalesRep
    ? user?.fullName || 'Chuyên viên Kinh doanh'
    : user?.branchName || restaurant?.branches?.[0]?.name || 'Chi nhánh chính';

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
              {restaurantInitials}
            </div>
            <div className="min-w-0 flex-1">
              <strong className="text-xs text-white block truncate">{restaurantName}</strong>
              <small className="text-[10px] text-emerald-400 block truncate">{branchName}</small>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Groups & Links */}
      <nav className="flex-1 px-2.5 py-2 space-y-3 overflow-y-auto overflow-x-hidden">
        {visibleGroups.map((group, groupIdx) => {
          return (
            <div key={group.id} className="space-y-1">
              {/* Tiêu đề nhóm khi mở rộng hoặc đường kẻ phân cách khi thu gọn */}
              {(!isCollapsed || isMobile) ? (
                <div className={`px-3 ${groupIdx > 0 ? 'pt-2' : 'pt-1'} pb-1 text-[10px] font-bold tracking-wider text-[#637d72] uppercase select-none`}>
                  {group.label}
                </div>
              ) : (
                groupIdx > 0 && <div className="my-2 border-t border-white/10 mx-2" />
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isCollapsed && !isMobile ? 'justify-center px-0' : ''
                    } ${
                      isActive
                        ? 'bg-white/10 text-white shadow-xs font-bold border-l-[3px] border-[#eab867] pl-2.5'
                        : 'text-[#9eb2aa] hover:bg-white/5 hover:text-white border-l-[3px] border-transparent'
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
            </div>
          );
        })}
      </nav>

      {/* Footer & Collapse Toggle Button */}
      <div className="p-3 border-t border-[#183a2e] space-y-2">
        {!isSuperAdmin && (
          (!isCollapsed || isMobile) ? (
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
          )
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
