'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button, Card, Badge } from '@imenu/ui';
import {
  QrCode,
  Smartphone,
  UtensilsCrossed,
  ChefHat,
  Receipt,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  Store,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f7f5ef] via-[#faf9f5] to-[#edf6f1] pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-[#e4e8e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ddf4e8] border border-[#b8e5cf] text-xs font-bold text-[#124a36] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#eab867]" />
                Nền tảng quản lý nhà hàng thế hệ mới
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#09271d] tracking-tight leading-[1.12]">
                Vận hành nhanh gọn, <br />
                <span className="font-serif italic font-normal text-[#a66d12]">phục vụ trọn vẹn.</span>
              </h1>

              <p className="text-lg text-[#5c6963] max-w-xl leading-relaxed">
                Giải pháp số hóa toàn diện cho nhà hàng, quán ăn, cà phê và trà sữa. Khách chủ động gọi món qua mã QR tại bàn, đơn tự động gửi tới màn hình bếp và xuất hóa đơn VietQR tức thì.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/dang-ky">
                  <Button variant="primary" size="lg" className="shadow-lg shadow-[#124a36]/20">
                    Sử dụng miễn phí 0đ <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="#workflow">
                  <Button variant="outline" size="lg">
                    Xem cách hoạt động
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-[#66736d]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1f7a55]" />
                  Không cần thẻ tín dụng
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1f7a55]" />
                  Thiết lập trong 5 phút
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1f7a55]" />
                  Dùng trên mọi điện thoại / tablet
                </div>
              </div>
            </div>

            {/* Hero Right Visual Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-[#09271d] overflow-hidden p-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-[#176044]">Bếp Nhà · Bàn 08</span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f7f5ef] border border-[#e4e8e5]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 grid place-items-center text-lg">🍲</div>
                      <div>
                        <strong className="text-xs text-slate-800 block">Phở Bò Tái Nạm (x2)</strong>
                        <small className="text-[10px] text-amber-700">Ít hành lá, thêm ớt</small>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#176044]">138.000₫</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#f7f5ef] border border-[#e4e8e5]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 grid place-items-center text-lg">🧋</div>
                      <div>
                        <strong className="text-xs text-slate-800 block">Trà Đào Cam Sả (x2)</strong>
                        <small className="text-[10px] text-slate-500">70% đường, 100% đá</small>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#176044]">78.000₫</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#09271d] text-white flex items-center justify-between mt-2">
                  <div>
                    <span className="text-[10px] text-slate-300 block">Trạng thái Bếp:</span>
                    <strong className="text-xs text-[#f1c773] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#f1c773] animate-ping" />
                      Đang chế biến (4:12s)
                    </strong>
                  </div>
                  <span className="text-base font-extrabold text-white">216.000₫</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= TRUSTED STRIP ================= */}
      <div className="border-b border-[#e4e8e5] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-slate-400 text-sm font-semibold">
          <span className="text-slate-700 font-bold">Đồng hành cùng quán Việt:</span>
          <span className="font-serif italic text-base text-slate-600">Bếp Nhà Restaurant</span>
          <span className="font-serif italic text-base text-slate-600">Mộc Quán Bistro</span>
          <span className="font-serif italic text-base text-slate-600">An Nhiên Tea & Coffee</span>
          <span className="font-serif italic text-base text-slate-600">Phở Vương Hà Nội</span>
        </div>
      </div>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-24 bg-[#f7f5ef]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-[#176044] tracking-widest uppercase">Tất cả trong một</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09271d]">
              Một nhịp vận hành liền mạch, <br />từ bàn ăn đến gian bếp
            </h2>
            <p className="text-sm sm:text-base text-[#66736d]">
              iMenu kết nối mọi mắt xích để nhân viên giảm thao tác, thực khách bớt chờ đợi và chủ quán luôn nắm chắc doanh thu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card hoverable className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#edf6f1] text-[#176044] grid place-items-center text-xl font-bold">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d3628]">Thực đơn điện tử</h3>
              <p className="text-sm text-[#66736d] leading-relaxed">
                Tạo danh mục, ảnh món sắc nét, tùy chọn size/topping và bật tắt trạng thái hết món tức thì chỉ với 1 chạm.
              </p>
            </Card>

            <Card hoverable className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff2dc] text-[#a66d12] grid place-items-center text-xl font-bold">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d3628]">Order bằng mã QR</h3>
              <p className="text-sm text-[#66736d] leading-relaxed">
                Khách chỉ cần quét camera điện thoại tại bàn là có thể xem menu, chọn món, ghi chú và gửi order không cần cài app.
              </p>
            </Card>

            <Card hoverable className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#edf6f1] text-[#176044] grid place-items-center text-xl font-bold">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d3628]">POS phục vụ tại bàn</h3>
              <p className="text-sm text-[#66736d] leading-relaxed">
                Nhân viên ghi nhận đơn nhanh trên điện thoại hoặc máy tính bảng, chuyển bàn, gộp bàn và tách hóa đơn linh hoạt.
              </p>
            </Card>

            <Card hoverable className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#edf6f1] text-[#176044] grid place-items-center text-xl font-bold">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d3628]">Màn hình Bếp (KDS)</h3>
              <p className="text-sm text-[#66736d] leading-relaxed">
                Sắp xếp phiếu món theo thời gian gọi, cảnh báo âm thanh khi có đơn mới và bấm báo món đã nấu xong cho phục vụ.
              </p>
            </Card>

            <Card hoverable className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#fff2dc] text-[#a66d12] grid place-items-center text-xl font-bold">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d3628]">Thanh toán VietQR & In bill</h3>
              <p className="text-sm text-[#66736d] leading-relaxed">
                Tự động sinh mã VietQR chính xác từng đồng, khách quét chuyển khoản ngay và in phiếu tạm tính chuẩn máy in nhiệt 80mm.
              </p>
            </Card>

            <Card hoverable className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#edf6f1] text-[#176044] grid place-items-center text-xl font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d3628]">Báo cáo doanh thu tức thì</h3>
              <p className="text-sm text-[#66736d] leading-relaxed">
                Theo dõi doanh thu theo thời gian thực, biểu đồ khung giờ cao điểm, top 10 món bán chạy và so sánh hiệu quả chi nhánh.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ================= WORKFLOW SECTION ================= */}
      <section id="workflow" className="py-24 bg-white border-b border-[#e4e8e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold text-[#176044] tracking-widest uppercase">Trải nghiệm tại bàn</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09271d]">
                Khách chủ động. <br />Nhân viên thảnh thơi.
              </h2>
              <p className="text-sm text-[#66736d] leading-relaxed">
                Một quy trình tự nhiên và khép kín mang lại sự tiện nghi cao nhất cho khách hàng và giảm áp lực giờ cao điểm cho quán.
              </p>

              <div className="space-y-6 pt-4">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#124a36] text-white flex-shrink-0 grid place-items-center font-bold text-sm">
                    01
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0d3628]">Quét mã & Chọn món</h3>
                    <p className="text-xs text-[#66736d] mt-1">Mỗi bàn có mã QR riêng. Khách quét để xem menu, tùy chỉnh món và gửi yêu cầu.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#124a36] text-white flex-shrink-0 grid place-items-center font-bold text-sm">
                    02
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0d3628]">Nhân viên xác nhận</h3>
                    <p className="text-xs text-[#66736d] mt-1">Thông báo đến máy thu ngân/phục vụ tức thì; nhân viên đối soát trước khi chuyển bếp.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#124a36] text-white flex-shrink-0 grid place-items-center font-bold text-sm">
                    03
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0d3628]">Bếp chuẩn bị & Phục vụ</h3>
                    <p className="text-xs text-[#66736d] mt-1">Màn hình KDS hiển thị món theo thứ tự, đầu bếp hoàn thành bấm báo phục vụ mang ra bàn.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#124a36] text-white flex-shrink-0 grid place-items-center font-bold text-sm">
                    04
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0d3628]">Tạm tính & Thanh toán VietQR</h3>
                    <p className="text-xs text-[#66736d] mt-1">Khách xem lại phiếu tạm tính ngay trên điện thoại, bấm gọi thanh toán hoặc quét mã QR chuyển khoản.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-md bg-[#f7f5ef] p-6 rounded-3xl border border-[#e4e8e5] shadow-xl text-center space-y-5">
                <Badge variant="amber">Thử nghiệm thực tế</Badge>
                <h3 className="text-xl font-bold text-[#09271d]">Trải nghiệm gọi món bàn 08 ngay bây giờ</h3>
                <p className="text-xs text-[#66736d]">
                  Mở trực tiếp giao diện Web App gọi món dành cho khách hàng trên điện thoại hoặc trình duyệt của bạn:
                </p>
                <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=http://localhost:3005/menu/bep-nha/ban-08"
                    alt="Demo QR"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                  <span className="text-xs font-bold text-[#176044] mt-3">Bàn 08 - Bếp Nhà</span>
                </div>
                <a
                  href="http://localhost:3005/menu/bep-nha/ban-08"
                  target="_blank"
                  className="block"
                >
                  <Button variant="primary" className="w-full">
                    Mở Demo QR Menu Khách Hàng ↗
                  </Button>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= PRICING SECTION ================= */}
      <section id="pricing" className="py-24 bg-[#faf9f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-[#176044] tracking-widest uppercase">Gói dịch vụ linh hoạt</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09271d]">
              Bắt đầu miễn phí 0đ. <br />Nâng cấp khi quán sẵn sàng.
            </h2>
            <p className="text-sm sm:text-base text-[#66736d]">
              Mọi nhà hàng mới đều được tặng 1 tháng dùng thử toàn bộ tính năng gói Nâng cao. Hết hạn tự động về gói Cơ bản miễn phí.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Plan 1: Free */}
            <Card className="p-8 flex flex-col justify-between border-2 border-slate-200">
              <div className="space-y-4">
                <Badge variant="neutral">CƠ BẢN</Badge>
                <h3 className="text-xl font-bold text-slate-800">Vận hành thiết yếu</h3>
                <p className="text-xs text-slate-500">Dành cho quán mới bắt đầu số hóa quy trình phục vụ.</p>
                <div className="pt-2">
                  <span className="text-4xl font-extrabold text-[#09271d]">0đ</span>
                  <span className="text-xs text-slate-500 ml-1">/ vĩnh viễn</span>
                </div>
                <hr className="border-slate-100" />
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Quản lý thực đơn và danh mục</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Nhân viên order POS tại bàn</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Màn hình Bếp KDS cơ bản</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sơ đồ quản lý bàn và trạng thái</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> In phiếu tạm tính và hóa đơn 80mm</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-8">
                <Button variant="outline" className="w-full">
                  Bắt đầu miễn phí
                </Button>
              </Link>
            </Card>

            {/* Plan 2: Standard */}
            <Card className="p-8 flex flex-col justify-between border-2 border-[#124a36] shadow-xl relative bg-white">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#124a36] text-white text-[10px] font-bold tracking-wider uppercase">
                Khuyên Dùng
              </div>
              <div className="space-y-4">
                <Badge variant="brand">TIÊU CHUẨN</Badge>
                <h3 className="text-xl font-bold text-[#09271d]">Phục vụ thông minh</h3>
                <p className="text-xs text-slate-500">Tự động hóa trải nghiệm gọi món và giảm tải cho nhân viên.</p>
                <div className="pt-2">
                  <span className="text-4xl font-extrabold text-[#124a36]">250.000đ</span>
                  <span className="text-xs text-slate-500 ml-1">/ tháng</span>
                </div>
                <hr className="border-slate-100" />
                <strong className="text-xs text-slate-800 block">Tất cả gói Cơ bản, cộng thêm:</strong>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Menu điện tử trên điện thoại khách</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Khách quét QR tự chọn món & gửi đơn</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đồng bộ Real-time Bàn - Bếp - Thu ngân</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Khách xem tạm tính & gọi thanh toán</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tạo tài khoản và phân quyền nhân viên</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-8">
                <Button variant="primary" className="w-full">
                  Dùng thử 1 tháng miễn phí
                </Button>
              </Link>
            </Card>

            {/* Plan 3: Advanced */}
            <Card className="p-8 flex flex-col justify-between border-2 border-amber-300 bg-gradient-to-b from-white to-[#fffcf7]">
              <div className="space-y-4">
                <Badge variant="amber">NÂNG CAO</Badge>
                <h3 className="text-xl font-bold text-slate-800">Quản trị toàn diện</h3>
                <p className="text-xs text-slate-500">Kiểm soát tập trung, tối ưu hiệu quả toàn chuỗi nhà hàng.</p>
                <div className="pt-2">
                  <span className="text-4xl font-extrabold text-[#a66d12]">500.000đ</span>
                  <span className="text-xs text-slate-500 ml-1">/ tháng</span>
                </div>
                <hr className="border-slate-100" />
                <strong className="text-xs text-slate-800 block">Tất cả gói Tiêu chuẩn, cộng thêm:</strong>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Thanh toán VietQR động tự động</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Quản lý nhiều chi nhánh tập trung</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Báo cáo hợp nhất doanh thu toàn chuỗi</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Phân tích món bán chạy & giờ cao điểm</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Ưu tiên hỗ trợ kỹ thuật 24/7</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-8">
                <Button variant="amber" className="w-full">
                  Trải nghiệm đầy đủ
                </Button>
              </Link>
            </Card>

          </div>
        </div>
      </section>

      {/* ================= ROLES SECTION ================= */}
      <section id="roles" className="py-24 bg-white border-b border-[#e4e8e5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-[#176044] tracking-widest uppercase">Đúng người · Đúng quyền</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#09271d]">
              Phân quyền chặt chẽ ở mọi cấp độ
            </h2>
            <p className="text-sm sm:text-base text-[#66736d]">
              Từ toàn hệ thống, chuỗi chi nhánh, quản lý ca đến nhân viên phục vụ và đầu bếp.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            <Card className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#edf6f1] text-[#176044] grid place-items-center mx-auto">
                <Zap className="w-6 h-6" />
              </div>
              <strong className="text-sm text-slate-900 block">Quản trị hệ thống</strong>
              <small className="text-xs text-slate-500 block">Toàn nền tảng SaaS</small>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#edf6f1] text-[#176044] grid place-items-center mx-auto">
                <Building2 className="w-6 h-6" />
              </div>
              <strong className="text-sm text-slate-900 block">Quản trị chuỗi</strong>
              <small className="text-xs text-slate-500 block">Mọi chi nhánh F&B</small>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#edf6f1] text-[#176044] grid place-items-center mx-auto">
                <Store className="w-6 h-6" />
              </div>
              <strong className="text-sm text-slate-900 block">Chủ nhà hàng</strong>
              <small className="text-xs text-slate-500 block">Quản lý chi nhánh</small>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#edf6f1] text-[#176044] grid place-items-center mx-auto">
                <UserCheck className="w-6 h-6" />
              </div>
              <strong className="text-sm text-slate-900 block">Quản lý ca</strong>
              <small className="text-xs text-slate-500 block">Vận hành & Duyệt món</small>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#edf6f1] text-[#176044] grid place-items-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <strong className="text-sm text-slate-900 block">Nhân viên & Bếp</strong>
              <small className="text-xs text-slate-500 block">Phục vụ theo ca</small>
            </Card>
          </div>

          {/* CTA Banner */}
          <div className="mt-20 p-10 sm:p-14 rounded-3xl bg-[#edf6f1] border border-[#d9ece3] flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#09271d]">
                Sẵn sàng để nhà hàng vận hành nhẹ hơn?
              </h3>
              <p className="text-sm text-[#5c6963] mt-2">
                Đăng ký ngay hôm nay để trải nghiệm miễn phí toàn bộ tính năng cao cấp trong 1 tháng.
              </p>
            </div>
            <Link href="/dang-ky">
              <Button variant="primary" size="lg" className="whitespace-nowrap">
                Bắt đầu miễn phí ngay <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
