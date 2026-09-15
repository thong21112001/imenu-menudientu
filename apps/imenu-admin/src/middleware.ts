import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const accessToken = request.cookies.get('imenu_access_token')?.value;
  const refreshToken = request.cookies.get('imenu_refresh_token')?.value;

  const hasValidToken = Boolean(accessToken && !isTokenExpired(accessToken));
  const hasRefreshToken = Boolean(refreshToken && !isTokenExpired(refreshToken));
  const isAuthenticated = hasValidToken || hasRefreshToken;

  // 1. Neu da dang nhap va dang vao trang /login -> Dieu huong ve dashboard trang chu
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 2. Kiem tra route bao ve: Neu chua dang nhap -> Da vang ve /login
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(pathname + search);
    const loginUrl = new URL(`/login?returnUrl=${returnUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tat ca cac request paths ngoai tru:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - cac file anh/font cong khai: svg, png, jpg, jpeg, gif, webp, woff, woff2
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)$).*)',
  ],
};
