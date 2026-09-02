import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="vi" className="scroll-smooth">
      <body className="min-h-screen antialiased selection:bg-[#ddf4e8] selection:text-[#09271d]">
        {children}
      </body>
    </html>
  );
}
