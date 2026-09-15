'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { storageService, apiClient } from '@imenu/utils';
import { Logo } from '@imenu/ui';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // 1. Neu la trang login thi khong can chan
    if (pathname === '/login') {
      setIsChecking(false);
      setIsAuthenticated(true);
      return;
    }

    let isMounted = true;

    const verifyAuthentication = async () => {
      try {
        const token = storageService.getAccessToken();

        // Neu khong co token hoac token da het han
        if (!token || storageService.isTokenExpired(token)) {
          const refreshToken = storageService.getRefreshToken();
          if (refreshToken && !storageService.isTokenExpired(refreshToken)) {
            // Thu tu dong refresh
            try {
              const refreshRes = await apiClient.auth.refresh(refreshToken);
              if (refreshRes?.data?.accessToken) {
                storageService.setAccessToken(refreshRes.data.accessToken);
              } else {
                throw new Error('Refresh failed');
              }
            } catch {
              storageService.clearAuth();
              kickToLogin('expired=1');
              return;
            }
          } else {
            storageService.clearAuth();
            kickToLogin();
            return;
          }
        }

        // 2. Kiem tra tinh toan ven thuc te voi Backend qua /api/auth/me
        try {
          const meRes = await apiClient.auth.getMe();
          if (meRes?.data?.user) {
            const user = meRes.data.user;
            if (user.status && user.status !== 'ACTIVE') {
              storageService.clearAuth();
              kickToLogin('banned=1');
              return;
            }
            storageService.setCurrentUser(user);
          }
        } catch (apiErr: any) {
          // Neu backend bao loi 401/403: token bi revoke hoac khong hop le
          if (apiErr?.status === 401 || apiErr?.status === 403) {
            storageService.clearAuth();
            kickToLogin('expired=1');
            return;
          }
          // Neu loi mang tam thoi thi van cho phep tiep tuc neu token con han
        }

        if (isMounted) {
          setIsAuthenticated(true);
          setIsChecking(false);
        }
      } catch {
        if (isMounted) {
          storageService.clearAuth();
          kickToLogin();
        }
      }
    };

    const kickToLogin = (reasonParam?: string) => {
      if (typeof window === 'undefined') return;
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      const query = reasonParam ? `?returnUrl=${currentUrl}&${reasonParam}` : `?returnUrl=${currentUrl}`;
      window.location.href = `/login${query}`;
    };

    verifyAuthentication();

    // 3. Lang nghe su kien bat loi 401 toan cuc tu api-client de da vang lap tuc
    const handleUnauthorizedEvent = () => {
      storageService.clearAuth();
      kickToLogin('expired=1');
    };

    window.addEventListener('imenu:unauthorized', handleUnauthorizedEvent);

    return () => {
      isMounted = false;
      window.removeEventListener('imenu:unauthorized', handleUnauthorizedEvent);
    };
  }, [pathname, router]);

  // Man hinh Loading cao cap chong nhap nhay du lieu (Zero Flash of Protected Content)
  if (isChecking) {
    return (
      <div className="min-h-screen w-full bg-[#09271d] flex flex-col items-center justify-center text-white select-none">
        <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="relative flex items-center justify-center">
            {/* Spinning decorative glowing ring */}
            <div className="absolute w-20 h-20 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Logo light size="sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white tracking-wide">
              Xác thực quyền quản trị iMenu
            </h3>
            <p className="text-xs text-emerald-200/60 font-normal">
              Đang kiểm tra thông tin phiên làm việc bảo mật...
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Đang nạp dữ liệu an toàn</span>
          </div>
        </div>
      </div>
    );
  }

  // Neu khong hop le thi khong render bat cu gi de cho chuyen huong
  if (!isAuthenticated && pathname !== '/login') {
    return (
      <div className="min-h-screen w-full bg-[#09271d] flex items-center justify-center text-white">
        <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/50 p-4 rounded-2xl border border-rose-800/40">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Phiên làm việc không hợp lệ. Đang chuyển về màn hình đăng nhập...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
