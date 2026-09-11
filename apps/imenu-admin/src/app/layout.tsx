import type { Metadata } from 'next';
import './globals.css';
import { AdminLayoutShell } from '../components/AdminLayoutShell';

export const metadata: Metadata = {
  title: 'iMenu Admin · Quản trị & Vận hành POS',
  description: 'Trung tâm quản trị nhà hàng, sơ đồ bàn, màn hình bếp KDS và báo cáo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#f4f6f4] antialiased">
        <AdminLayoutShell>{children}</AdminLayoutShell>
      </body>
    </html>
  );
}
