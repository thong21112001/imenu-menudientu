'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Button } from '@imenu/ui';
import {
  Trash2,
  ChevronRight,
  ShieldAlert,
  Download,
  QrCode,
  LogOut,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lock,
  FileSpreadsheet,
  Mail,
  HelpCircle,
  FileCheck,
  Building,
  KeyRound,
} from 'lucide-react';

export default function XoaDuLieuPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const [restaurantSlug, setRestaurantSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [deleteType, setDeleteType] = useState('full');
  const [reason, setReason] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !restaurantSlug || !isConfirmed) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = `DEL-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket(ticketId);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-rose-100 selection:text-rose-900">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-rose-50/20 to-slate-50 pt-10 pb-16 sm:pb-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-rose-700 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-rose-800 font-bold">Hướng dẫn & Yêu cầu xóa dữ liệu</span>
          </nav>

          {/* Title Area */}
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-xs font-extrabold">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Quyền Làm Chủ & Xóa Dữ Liệu Cá Nhân</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
              Hướng dẫn & Yêu cầu xóa dữ liệu người dùng / nhà hàng
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              iMenu cam kết tôn trọng tuyệt đối quyền riêng tư và quyền được lãng quên (Right to be Forgotten). Bạn hoàn toàn có quyền tải về toàn bộ báo cáo doanh thu và yêu cầu xóa vĩnh viễn dữ liệu tài khoản, nhà hàng hoặc lịch sử thực đơn.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                Thời gian xử lý: <strong>Tối đa 30 ngày làm việc</strong>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Xác thực danh tính chính chủ: <strong>Bắt buộc qua email quản trị</strong>
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 4 BƯỚC HƯỚNG DẪN XÓA DỮ LIỆU BÀI BẢN ================= */}
      <section className="py-14 sm:py-18 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">
              Quy Trình 4 Bước Chuẩn
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Các bước cần thực hiện trước và khi xóa dữ liệu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Vui lòng hoàn thành bước sao lưu để tránh mất mát các dữ liệu hóa đơn đối soát kế toán quan trọng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bước 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 grid place-items-center font-black text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Sao lưu dữ liệu & Thu hồi mã QR bàn
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đăng nhập vào trang Admin, truy cập mục <strong>Báo cáo doanh thu</strong> để tải file Excel/CSV (UTF-8) về máy. Sau đó vào mục <strong>Quản lý Bàn</strong> để vô hiệu hóa các mã QR đang dán tại quán.
              </p>
            </div>

            {/* Bước 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 grid place-items-center font-black text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Đăng xuất thiết bị & Ngắt kết nối
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thực hiện đăng xuất tài khoản trên các thiết bị máy tính bảng, màn hình Bếp KDS và điện thoại của nhân viên thu ngân để hủy các phiên làm việc mã hóa (JWT Tokens).
              </p>
            </div>

            {/* Bước 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 grid place-items-center font-black text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Gửi yêu cầu trực tuyến trên biểu mẫu
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Điền đầy đủ thông tin vào <strong>Biểu mẫu gửi yêu cầu xóa dữ liệu</strong> bên dưới. Hệ thống sẽ tạo một Phiếu yêu cầu (Ticket ID) và gửi thư xác nhận bảo mật đến email của bạn.
              </p>
            </div>

            {/* Bước 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-rose-300 transition-all space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center font-black text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                Xác minh chính chủ & Xử lý (30 ngày)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chuyên viên an toàn dữ liệu sẽ đối chiếu thông tin chủ nhà hàng, tiến hành hủy tài khoản và xóa/ẩn danh hóa dữ liệu cá nhân theo đúng cam kết bảo mật.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= BIỂU MẪU GỬI YÊU CẦU XÓA DỮ LIỆU TRỰC TUYẾN ================= */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2.5">
            <span className="text-xs font-bold text-rose-700 tracking-widest uppercase">
              Biểu Mẫu Chính Thức
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Gửi yêu cầu xóa dữ liệu hệ thống
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Vui lòng cung cấp chính xác email và mã Slug của nhà hàng cần xử lý.
            </p>
          </div>

          {/* Hộp Cảnh Báo An Toàn Tuyệt Đối */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 text-xs sm:text-sm space-y-1.5 flex items-start gap-3.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-black text-amber-900 block">
                CẢNH BÁO AN TOÀN BẢO MẬT:
              </span>
              <p>
                <strong>Tuyệt đối KHÔNG BAO GIỜ nhập mật khẩu, mã Access Token hay mã OTP ngân hàng</strong> vào biểu mẫu này. iMenu không bao giờ yêu cầu bạn cung cấp mật khẩu để xác minh xóa tài khoản.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl">
            {submittedTicket ? (
              <div className="text-center py-8 space-y-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 grid place-items-center mx-auto border-2 border-rose-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Đã tiếp nhận yêu cầu xóa dữ liệu!
                </h3>
                <div className="inline-block p-3 rounded-xl bg-slate-100 font-mono text-sm font-bold text-rose-800">
                  Mã phiếu xử lý: {submittedTicket}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Hệ thống đã gửi thư xác nhận bảo mật tới địa chỉ email <strong>{adminEmail}</strong>. Bạn vui lòng kiểm tra hộp thư (kể cả mục Spam) và bấm vào liên kết xác nhận để hoàn tất thủ tục.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setAdminEmail('');
                      setRestaurantSlug('');
                      setPhone('');
                      setReason('');
                      setIsConfirmed(false);
                    }}
                    className="text-xs font-bold"
                  >
                    Gửi yêu cầu cho nhà hàng khác
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Email tài khoản quản trị (restaurant_admin) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@tenquan.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Tên Nhà Hàng / Mã Slug <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="coffee-anh-hien hoặc Bếp Nhà"
                      value={restaurantSlug}
                      onChange={(e) => setRestaurantSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Số điện thoại liên hệ xác thực
                  </label>
                  <input
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Loại dữ liệu yêu cầu xóa */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Phạm vi dữ liệu yêu cầu xử lý xóa <span className="text-rose-500">*</span>
                  </label>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteType"
                        value="full"
                        checked={deleteType === 'full'}
                        onChange={(e) => setDeleteType(e.target.value)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <strong className="text-slate-900 block">Xóa toàn bộ nhà hàng & tài khoản</strong>
                        <span className="text-slate-500 text-[11px]">
                          Xóa vĩnh viễn cấu hình nhà hàng, toàn bộ thực đơn, bàn ăn và tài khoản người dùng liên kết.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteType"
                        value="menu_only"
                        checked={deleteType === 'menu_only'}
                        onChange={(e) => setDeleteType(e.target.value)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <strong className="text-slate-900 block">Chỉ xóa danh mục thực đơn & ảnh món</strong>
                        <span className="text-slate-500 text-[11px]">
                          Làm sạch toàn bộ món ăn và ảnh đã tải lên để quán thiết lập lại menu từ đầu, giữ nguyên tài khoản.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="radio"
                        name="deleteType"
                        value="history_only"
                        checked={deleteType === 'history_only'}
                        onChange={(e) => setDeleteType(e.target.value)}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <strong className="text-slate-900 block">Ẩn danh hóa lịch sử đơn hàng & ActivityLog</strong>
                        <span className="text-slate-500 text-[11px]">
                          Ẩn danh toàn bộ tên khách hàng, mã bàn và nhật ký thao tác cũ sau khi đã kết thúc năm tài chính.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Lý do yêu cầu xóa hoặc ghi chú bổ sung
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Quán ngừng kinh doanh, chuyển đổi mô hình, hoặc chuyển quyền sở hữu quán..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Checkbox Cam Kết */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>
                      Tôi xác nhận là chủ sở hữu hợp pháp của tài khoản nhà hàng này và hiểu rằng dữ liệu sau khi xóa sẽ <strong>KHÔNG THỂ KHÔI PHỤC</strong>. Tôi đã chủ động tải về các báo cáo cần thiết.
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting || !isConfirmed}
                    className="w-full bg-rose-700 hover:bg-rose-800 text-white font-black text-xs py-3 shadow-md shadow-rose-700/20"
                  >
                    {isSubmitting ? 'Đang gửi yêu cầu xác thực...' : 'Gửi Yêu Cầu Xóa Dữ Liệu →'}
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ================= CÂU HỎI THƯỜNG GẶP VỀ XÓA DỮ LIỆU ================= */}
      <section className="py-14 sm:py-18 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-widest">
              Thông Tin Hữu Ích
            </span>
            <h2 className="text-2xl font-black text-slate-950">
              Câu hỏi thường gặp về thủ tục xóa dữ liệu
            </h2>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">
                Sau khi xóa dữ liệu, khách quét mã QR cũ tại bàn sẽ nhìn thấy gì?
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Toàn bộ mã QR bàn cũ sẽ lập tức bị hủy hiệu lực. Khi khách hàng quét mã, màn hình sẽ thông báo: &ldquo;Mã QR không còn hiệu lực hoặc nhà hàng đã dừng hoạt động&rdquo;, không để lộ bất kỳ thông tin thực đơn hay dữ liệu cũ nào.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">
                Tôi có thể yêu cầu xóa dữ liệu của từng chi nhánh riêng lẻ được không?
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Được! Nếu bạn vận hành chuỗi đa chi nhánh và một cơ sở ngừng hoạt động, Quản trị viên Chuỗi HQ có thể vào mục Cài đặt Chi nhánh để xóa hoặc tạm đóng cơ sở đó mà không ảnh hưởng đến các chi nhánh còn lại.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-slate-900">
                Các chứng từ giao dịch thanh toán cũ được xử lý như thế nào theo quy định thuế?
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Thông tin cá nhân (họ tên, email, số điện thoại chủ quán) sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu định danh. Các bản ghi chứng từ thanh toán đã phát sinh mã hóa đơn Bill sẽ được ẩn danh hóa (Anonymized) và lưu trữ theo thời hạn quy định của Luật Kế toán trước khi tự động hủy vật lý.
              </p>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
