import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Menu Điện Tử · Gọi Món Tại Bàn',
  description: 'Thực đơn điện tử QR thông minh, gọi món và thanh toán trực tiếp tại bàn',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#f7f5ef] antialiased pb-28">
        {children}
      </body>
    </html>
  );
}
