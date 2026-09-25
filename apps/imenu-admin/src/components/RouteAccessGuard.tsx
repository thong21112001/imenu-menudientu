'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { storageService } from '@imenu/utils';
import { ShieldAlert, ArrowLeft, LogOut, Lock, Store, ChefHat, Smartphone, Grid3X3 } from 'lucide-react';

interface RouteAccessGuardProps {
  children: React.ReactNode;
}

// Map dinh nghia quyen han yeu cau cho tung route
const ROUTE_PERMISSIONS_MAP: Record<string, { permissions: string[]; name: string; requireMainBranch?: boolean }> = {
  '/': {
    permissions: ['perm-rep-view'],
    name: 'Dashboard Tổng Quan',
  },
  '/tables': {
    permissions: ['perm-pos-view'],
    name: 'Sơ Đồ Bàn Ăn',
  },
  '/pos': {
    permissions: ['perm-pos-order', 'perm-pos-view'],
    name: 'POS Bán Hàng',
  },
  '/kitchen': {
    permissions: ['perm-kds-view', 'perm-kds-cook'],
    name: 'Màn Hình Bếp KDS',
  },
  '/menu': {
    permissions: ['perm-menu-view'],
    name: 'Quản Lý Thực Đơn',
  },
  '/qr-codes': {
    permissions: ['perm-qr-print', 'perm-pos-table'],
    name: 'Tạo & In Mã QR Bàn',
  },
  '/bills': {
    permissions: ['perm-pos-pay'],
    name: 'Hóa Đơn & In Bill',
  },
  '/reports': {
    permissions: ['perm-rep-view'],
    name: 'Báo Cáo & Doanh Thu',
  },
  '/staff': {
    permissions: ['perm-staff-manage', 'perm-role-manage'],
    name: 'Nhân Viên & Phân Quyền',
  },
  '/branches': {
    permissions: ['perm-settings', 'perm-staff-manage'],
    name: 'Quản Lý Chi Nhánh',
    requireMainBranch: true,
  },
  '/settings': {
    permissions: ['perm-settings'],
    name: 'Cài Đặt Nhà Hàng',
  },
};

export const RouteAccessGuard: React.FC<RouteAccessGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const usr = storageService.getCurrentUser();
    const perms = storageService.getPermissions() || [];
    setCurrentUser(usr);
    setPermissions(perms);
    setIsReady(true);
  }, [pathname]);

  if (!isReady || !currentUser) {
    return <>{children}</>;
  }

  const roleSlug = String(currentUser?.role || '').toLowerCase();
  const isSuperAdmin = roleSlug === 'system_admin' || roleSlug === 'super_admin';
  const isOwner = roleSlug === 'restaurant_admin';
  const isMainBranchUser = isSuperAdmin || Boolean(currentUser?.isMainBranch);

  // 1. Tự động điều hướng trang chủ '/' về trang nghiệp vụ chuyên trách cho các vai trò vận hành
  if (pathname === '/') {
    if (roleSlug === 'kitchen') {
      router.replace('/kitchen');
      return null;
    }
    if (roleSlug === 'waiter') {
      router.replace('/tables');
      return null;
    }
    if (roleSlug === 'cashier') {
      router.replace('/pos');
      return null;
    }
  }

  // 2. Super Admin và Chủ Nhà Hàng (HQ) có toàn quyền truy cập
  if (isSuperAdmin || isOwner) {
    // Riêng trang /branches yêu cầu tài khoản thuộc Trụ sở chính (HQ)
    if (pathname === '/branches' && !isMainBranchUser) {
      return renderForbidden(currentUser, 'Quản Lý Chi Nhánh', 'Chức năng chỉ dành cho tài khoản thuộc Trụ sở chính (HQ)', '/');
    }
    return <>{children}</>;
  }

  // 3. Tìm cấu hình phân quyền cho route hiện tại
  const routeConfig = ROUTE_PERMISSIONS_MAP[pathname];

  // Nếu route không nằm trong danh mục bảo vệ đặc thù thì cho phép tiếp tục
  if (!routeConfig) {
    return <>{children}</>;
  }

  // Kiểm tra điều kiện chi nhánh chính
  if (routeConfig.requireMainBranch && !isMainBranchUser) {
    return renderForbidden(currentUser, routeConfig.name, 'Chức năng chỉ dành cho tài khoản thuộc Trụ sở chính (HQ)', getDefaultRoute(roleSlug));
  }

  // Kiểm tra permission
  const hasRequiredPermission = routeConfig.permissions.some((p) => permissions.includes(p));

  if (!hasRequiredPermission) {
    return renderForbidden(
      currentUser,
      routeConfig.name,
      `Yêu cầu một trong các quyền: ${routeConfig.permissions.join(', ')}`,
      getDefaultRoute(roleSlug),
    );
  }

  return <>{children}</>;

  function getDefaultRoute(slug: string): string {
    if (slug === 'kitchen') return '/kitchen';
    if (slug === 'cashier') return '/pos';
    if (slug === 'waiter') return '/tables';
    return '/';
  }

  function renderForbidden(user: any, pageName: string, reason: string, defaultHome: string) {
    const roleDisplay = user?.role || 'Nhân viên';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          {/* Decorative Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center mb-5 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Lock className="w-3.5 h-3.5" /> 403 - Giới hạn phân quyền
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Không có quyền truy cập
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Tài khoản <strong className="text-slate-900">{user?.fullName || user?.email}</strong> (Vai trò: <span className="font-bold text-emerald-700">{roleDisplay}</span>) chưa được cấp quyền để truy cập vào phân hệ <strong className="text-slate-900">{pageName}</strong>.
          </p>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 text-left text-xs text-slate-500 mb-6 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-slate-200/80 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
              i
            </div>
            <div className="leading-relaxed">
              <span className="font-semibold text-slate-700 block mb-0.5">Lý do giới hạn:</span>
              <span>{reason}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push(defaultHome)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#09271d] hover:bg-[#0c3527] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Quay về trang làm việc chính
            </button>

            <button
              onClick={() => {
                storageService.clearAuth();
                window.location.href = '/login';
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Đổi tài khoản khác
            </button>
          </div>
        </div>
      </div>
    );
  }
};
