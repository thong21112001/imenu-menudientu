import type { Metadata } from 'next';
import './globals.css';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminHeader } from '../components/AdminHeader';

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
        <AdminSidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="p-6 flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
