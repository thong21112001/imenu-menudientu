'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Button } from '@imenu/ui';
import {
  ShieldCheck,
  ChevronRight,
  Lock,
  Database,
  EyeOff,
  Server,
  FileText,
  Building,
  CreditCard,
  Trash2,
  PhoneCall,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function ChinhSachQuyenRiengTuPage() {
  const [activeSection, setActiveSection] = useState<string>('muc-1');

  const TOC_ITEMS = [
    { id: 'muc-1', title: '1. Tổng quan & Cam kết bảo mật' },
    { id: 'muc-2', title: '2. Các loại dữ liệu thu thập' },
    { id: 'muc-3', title: '3. Mục đích xử lý & Sử dụng dữ liệu' },
    { id: 'muc-4', title: '4. Cô lập dữ liệu Đa nhà hàng & Chi nhánh' },
    { id: 'muc-5', title: '5. Bảo mật thông tin Ngân hàng & VietQR' },
    { id: 'muc-6', title: '6. Lưu trữ, Mã hóa mật khẩu & WebSocket' },
    { id: 'muc-7', title: '7. Quyền của Chủ nhà hàng & Người dùng' },
    { id: 'muc-8', title: '8. Phạm vi dịch vụ cho Hộ KD & Doanh nghiệp' },
    { id: 'muc-9', title: '9. Cập nhật chính sách & Liên hệ hỗ trợ' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const item of TOC_ITEMS) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-teal-50/30 to-slate-50 pt-10 pb-16 sm:pb-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-teal-700 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-teal-800 font-bold">Chính sách quyền riêng tư</span>
          </nav>

          {/* Title Area */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 text-xs font-extrabold">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Chính Sách Quyền Riêng Tư & An Toàn Dữ Liệu</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Chính sách quyền riêng tư & Bảo mật dữ liệu iMenu Platform
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Cam kết minh bạch về phương thức thu thập, mã hóa, cô lập đa khách thuê (Multi-tenant) và quyền kiểm soát dữ liệu tài chính của nhà hàng, quán ăn theo tiêu chuẩn an toàn thông tin hiện đại.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Phiên bản hiệu lực: <strong>Tháng 10/2026</strong>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Mã hóa đường truyền: <strong>TLS 1.3 / WebSocket WSS</strong>
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= MAIN CONTENT WITH STICKY TOC ================= */}
      <section className="py-14 sm:py-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Sticky Sidebar TOC (4 cols on lg) */}
            <aside className="lg:col-span-4 sticky top-28 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-1 border-b border-slate-100">
                  Mục lục chính sách
                </span>

                <nav className="space-y-1 text-xs">
                  {TOC_ITEMS.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left p-2.5 rounded-xl font-semibold transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-teal-50 text-teal-900 border border-teal-200/80 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-700 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Box: Request Deletion */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 text-xs">
                <span className="font-bold flex items-center gap-1.5 text-rose-300">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Yêu cầu xóa dữ liệu?
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Chủ nhà hàng có quyền yêu cầu xóa toàn bộ thông tin tài khoản và danh mục thực đơn bất cứ lúc nào.
                </p>
                <Link href="/xoa-du-lieu" className="inline-block text-teal-300 hover:text-teal-200 font-bold underline text-[11px]">
                  Xem thủ tục & gửi yêu cầu xóa dữ liệu →
                </Link>
              </div>
            </aside>

            {/* Document Body (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-12 bg-white rounded-3xl border border-slate-200/90 p-7 sm:p-12 shadow-sm">
              
              {/* Mục 1 */}
              <article id="muc-1" className="space-y-3.5 scroll-mt-28">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  1. Tổng quan & Cam kết bảo mật của Hệ sinh thái iMenu
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    Chào mừng bạn đến với <strong>Hệ sinh thái Nền tảng Quản lý Nhà hàng iMenu</strong>. Chúng tôi hiểu rằng thông tin thực đơn, sơ đồ bàn, doanh số bán hàng và danh tính khách hàng là tài sản quý giá nhất của mỗi nhà hàng, quán ăn, quán cà phê và trà sữa.
                  </p>
                  <p>
                    Chính sách quyền riêng tư này mô tả chi tiết cách thức iMenu thu thập, xử lý, lưu trữ và bảo vệ dữ liệu khi bạn truy cập trang web, sử dụng phần mềm quản lý POS, màn hình Bếp KDS hoặc khi khách hàng của bạn quét mã QR gọi món tại bàn.
                  </p>
                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-xs font-medium space-y-1">
                    <strong>Cam kết cốt lõi:</strong>
                    <ul className="list-disc list-inside space-y-1 text-teal-900">
                      <li>Tuyệt đối KHÔNG bán, cho thuê hay trao đổi dữ liệu kinh doanh của quán cho bất kỳ bên thứ ba nào nhằm mục đích quảng cáo.</li>
                      <li>Khách hàng quét mã QR gọi món KHÔNG bắt buộc phải cài đặt ứng dụng hay đăng ký tài khoản cá nhân.</li>
                      <li>Dòng tiền thanh toán VietQR Napas 247 chuyển thẳng vào tài khoản ngân hàng của chủ quán, iMenu không giữ tiền hay đóng vai trò ví trung gian.</li>
                    </ul>
                  </div>
                </div>
              </article>

              {/* Mục 2 */}
              <article id="muc-2" className="space-y-3.5 scroll-mt-28 pt-8 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  2. Các loại dữ liệu hệ thống thu thập
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>Để hệ thống vận hành chính xác và đồng bộ thời gian thực giữa các phân hệ, iMenu thu thập các nhóm thông tin sau:</p>
                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="font-bold text-slate-900 text-xs">a) Dữ liệu tài khoản & Phân quyền quản trị (RBAC):</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Họ tên chủ tài khoản, địa chỉ email, số điện thoại đăng ký, mật khẩu đã mã hóa (hashed), vai trò được phân quyền (System Admin, Chain HQ, Branch Manager, POS Staff, Kitchen Staff).
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="font-bold text-slate-900 text-xs">b) Dữ liệu cấu hình nhà hàng & Chi nhánh:</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Tên nhà hàng, mã định danh đường dẫn (Restaurant Slug), địa chỉ cơ sở, danh sách khu vực bàn ăn, danh mục thực đơn, giá bán, topping và hình ảnh món ăn do quán đăng tải.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="font-bold text-slate-900 text-xs">c) Dữ liệu đơn hàng, Hóa đơn bất biến (Bill) & Nhật ký kiểm toán (ActivityLog):</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Lịch sử các đợt gọi món (Order Rounds), thời gian tạo, trạng thái nấu của bếp, tổng tiền thanh toán, hình thức thanh toán (Cash / VietQR), và lịch sử thao tác của nhân viên để phục vụ đối soát tài chính chống gian lận.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="font-bold text-slate-900 text-xs">d) Dữ liệu kỹ thuật & Phiên xác thực QR (`qrToken`):</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Khi khách quét mã QR tại bàn, hệ thống tạo phiên làm việc mã hóa thông qua token định danh bàn (`qrToken`). Chúng tôi chỉ ghi nhận User-Agent trình duyệt và địa chỉ IP tạm thời để chống tấn công Spam DoS, không theo dõi định vị GPS của khách hàng.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Mục 3 */}
              <article id="muc-3" className="space-y-3.5 scroll-mt-28 pt-8 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  3. Mục đích xử lý và sử dụng dữ liệu
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>Dữ liệu chỉ được sử dụng cho các mục đích kỹ thuật và nghiệp vụ nội bộ phục vụ nhà hàng:</p>
                  <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm">
                    <li><strong>Đồng bộ thời gian thực:</strong> Truyền tải ngay lập tức đợt gọi món từ bàn khách sang màn hình Thu ngân POS và Màn hình Bếp KDS qua giao thức WebSocket bảo mật.</li>
                    <li><strong>Sinh mã thanh toán VietQR Napas 247:</strong> Tự động nhúng số tiền hóa đơn và nội dung chuyển khoản chuẩn mực vào mã QR ngân hàng để khách thanh toán chính xác, không nhầm lẫn số tiền.</li>
                    <li><strong>Tổng hợp báo cáo kinh doanh:</strong> Trực quan hóa doanh thu theo ca, doanh thu theo ngày và danh sách món bán chạy nhất để chủ quán ra quyết định nhập nguyên liệu.</li>
                    <li><strong>Bảo vệ an toàn tài chính:</strong> Lưu vết lịch sử hủy món, giảm giá hoặc gộp bàn nhằm ngăn chặn tình trạng nhân viên gian lận nội bộ.</li>
                  </ul>
                </div>
              </article>

              {/* Mục 4 */}
              <article id="muc-4" className="space-y-3.5 scroll-mt-28 pt-8 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  4. Cô lập dữ liệu Đa nhà hàng & Đa chi nhánh (Multi-Tenant Isolation)
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    Hệ thống iMenu được thiết kế theo kiến trúc cô lập dữ liệu nhiều tầng (Multi-Tenant Architecture). Mỗi nhà hàng được gán một mã định danh duy nhất (`restaurantId` và `branchId`).
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                      <Database className="w-4 h-4 text-teal-700" />
                      Cơ chế lọc truy vấn ở tầng lõi (Core Query Filtering):
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Mọi câu lệnh truy xuất cơ sở dữ liệu trên Backend API đều bắt buộc kiểm tra điều kiện `tenant_id = current_tenant`. Tuyệt đối không bao giờ xảy ra tình trạng nhà hàng A nhìn thấy thực đơn, hóa đơn hay báo cáo doanh thu của nhà hàng B.
                    </p>
                  </div>
                </div>
              </article>

              {/* Mục 5 */}
              <article id="muc-5" className="space-y-3.5 scroll-mt-28 pt-8 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  5. Bảo mật thông tin Ngân hàng & Giao dịch
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    Để hỗ trợ tính năng thanh toán quét mã VietQR Napas 247, chủ nhà hàng cung cấp Tên ngân hàng, Số tài khoản thụ hưởng và Tên chủ tài khoản trong mục Cài đặt Nhà hàng.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        Không lưu số thẻ / mã CVV
                      </div>
                      <p className="text-[11px] text-slate-500">
                        iMenu hoàn toàn không lưu trữ số thẻ tín dụng quốc tế (Visa/Mastercard) hay mã bí mật CVV của người dùng.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
                        <EyeOff className="w-4 h-4 text-teal-600" />
                        Tự động che mặt nạ (Masking)
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Trong toàn bộ Nhật ký Hoạt động (ActivityLog) và biên lai in ấn, các số tài khoản ngân hàng đều được che mặt nạ tự động dạng `***1234` để bảo vệ quyền riêng tư.
                      </p>
                    </div>
                  </div>
                </div>
              </article>

              {/* Mục 6 */}
              <article id="muc-6" className="space-y-3.5 scroll-mt-28 pt-8 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  6. Lưu trữ dữ liệu, Mã hóa mật khẩu & An toàn kết nối WebSocket
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
                    <li><strong>Mã hóa mật khẩu:</strong> 100% mật khẩu tài khoản người dùng được băm mã hóa một chiều bằng thuật toán `bcrypt` với muối ngẫu nhiên (salt). Nhân viên kỹ thuật của iMenu không thể đọc hay giải mã mật khẩu gốc của bạn.</li>
                    <li><strong>Kênh truyền dữ liệu an toàn:</strong> Toàn bộ lưu lượng truy cập web và dữ liệu WebSocket thời gian thực đều được mã hóa bằng giao thức HTTPS và WSS (TLS 1.3), chống nghe lén và giả mạo gói tin (Man-in-the-Middle).</li>
                    <li><strong>Sao lưu định kỳ:</strong> Cơ sở dữ liệu đám mây được sao lưu tự động hàng ngày và lưu trữ tại các trung tâm dữ liệu đạt chuẩn Tier-3 với độ khả dụng 99.9%.</li>
                  </ul>
                </div>
              </article>

              {/* Mục 7 */}
              <article id="muc-7" className="space-y-3.5 scroll-mt-28 pt-8 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  7. Quyền của Chủ nhà hàng & Người dùng
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>Bạn luôn là người làm chủ dữ liệu của mình trên iMenu:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200">
                      <strong>• Quyền truy cập & Chỉnh sửa:</strong> Xem và cập nhật danh mục, giá bán, thông tin cơ sở bất cứ lúc nào trên trang Admin.
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200">
                      <strong>• Quyền trích xuất (Data Portability):</strong> Xuất toàn bộ dữ liệu báo cáo doanh thu, danh mục hóa đơn ra file CSV/Excel định dạng UTF-8.
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200">
                      <strong>• Quyền thu hồi mã QR:</strong> Hủy hiệu lực tức thì của mã QR bàn cũ và sinh mã QR mới trong mục Quản lý Bàn ăn.
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200">
                      <strong>• Quyền yêu cầu xóa dữ liệu:</strong> Yêu cầu xóa vĩnh viễn dữ liệu tài khoản và thực đơn tại trang <Link href="/xoa-du-lieu" className="text-teal-700 font-bold underline">/xoa-du-lieu</Link>.
                    </div>
                  </div>
                </div>
              </article>

              {/* Mục 8 */}
              <article id="muc-8" className="space-y-3.5 scroll-mt-28 pt-8 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  8. Phạm vi dịch vụ dành cho Hộ kinh doanh & Doanh nghiệp F&B
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    Dịch vụ của iMenu được tối ưu hóa cho các mô hình kinh doanh ăn uống tại Việt Nam, tuân thủ các quy định hiện hành về thương mại điện tử, an toàn thông tin mạng và quy định quản lý thuế hóa đơn bán lẻ 2026.
                  </p>
                  <p>
                    Đối với các dữ liệu chứng từ hóa đơn kế toán bắt buộc phải lưu trữ theo Luật Kế toán Việt Nam, iMenu bảo lưu quyền lưu trữ ẩn danh các bản ghi giao dịch đã phát sinh trong thời hạn luật định trước khi thực hiện xóa hủy vật lý.
                  </p>
                </div>
              </article>

              {/* Mục 9 */}
              <article id="muc-9" className="space-y-3.5 scroll-mt-28 pt-8 border-t border-slate-100">
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
                  <span className="w-2 h-6 rounded bg-teal-600 inline-block" />
                  9. Cập nhật chính sách & Thông tin liên hệ hỗ trợ
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    iMenu có thể cập nhật chính sách này theo thời gian để phản ánh các cải tiến về tính năng hoặc thay đổi trong quy định pháp luật. Mọi thay đổi quan trọng sẽ được thông báo trực tiếp trên trang chủ hoặc gửi thư thông báo tới email quản trị của nhà hàng.
                  </p>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <span className="font-bold text-slate-900 block">Ban An Toàn Dữ Liệu & Hỗ Trợ Kỹ Thuật iMenu:</span>
                    <div>• Email tiếp nhận yêu cầu bảo mật: <strong>privacy@imenu.vn</strong></div>
                    <div>• Cổng gửi yêu cầu xóa dữ liệu: <Link href="/xoa-du-lieu" className="text-teal-700 font-bold underline">https://imenu.vn/xoa-du-lieu</Link></div>
                    <div>• Hỗ trợ kỹ thuật: Phục vụ 24/7 cho các cơ sở nhà hàng đang vận hành</div>
                  </div>
                </div>
              </article>

            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
