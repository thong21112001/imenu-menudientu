import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'iMenu — Nền tảng quản lý nhà hàng & Menu điện tử thế hệ mới',
  description: 'Nền tảng số hóa nhà hàng từ order QR tại bàn, màn hình bếp KDS, thanh toán VietQR đến quản trị chuỗi. Bắt đầu miễn phí 0đ.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`scroll-smooth ${plusJakartaSans.variable}`}>
      <body className={`${plusJakartaSans.className} min-h-screen antialiased selection:bg-emerald-100 selection:text-emerald-950`}>
        {children}
      </body>
    </html>
  );
}
