'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  HeroSystemPreview,
  InteractiveTableMenuSimulator,
} from '../components/InteractiveShowcases';
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
  UserCheck,
  ShoppingBag,
  CreditCard,
  Printer,
  ChevronDown,
  HelpCircle,
  Clock,
  Layers,
  Check,
  X,
  Flame,
  ArrowUpRight,
  Gift,
  Laptop,
  CheckCircle,
  AlertCircle,
  RotateCw,
  Bell,
  Sliders,
  DollarSign,
  Coffee,
  FileText,
} from 'lucide-react';

export default function LandingPage() {
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'Gói Cơ bản 0đ có bị giới hạn thời gian hay số lượng đơn hàng không?',
      a: 'Hoàn toàn KHÔNG! Gói Cơ bản 0đ của iMenu là miễn phí vĩnh viễn, không giới hạn thời gian sử dụng, không giới hạn số lượng món ăn và không giới hạn số bàn. Chúng tôi cam kết đồng hành dài lâu cùng các quán ăn, quán cà phê khởi nghiệp số hóa quy trình vận hành thiết yếu.',
    },
    {
      q: 'Quán của tôi cần mua thêm thiết bị phần cứng chuyên dụng gì để bắt đầu dùng iMenu?',
      a: 'Hoàn toàn không cần mua thêm máy POS đắt đỏ! iMenu hoạt động 100% trên nền tảng Cloud Web. Bạn có thể sử dụng bất kỳ điện thoại thông minh, máy tính bảng (iPad/Android) hoặc laptop sẵn có của quán. Khách hàng cũng chỉ cần dùng điện thoại cá nhân quét mã QR để gọi món.',
    },
    {
      q: 'Khách hàng có bắt buộc phải tải app hay đăng ký tài khoản để quét QR gọi món không?',
      a: 'Tuyệt đối KHÔNG! Khách hàng chỉ cần mở camera điện thoại (iPhone, Samsung, Xiaomi...) hoặc ứng dụng Zalo quét mã QR tại bàn là menu điện tử mở ra ngay tức thì trên trình duyệt web, trải nghiệm mượt mà không cần cài đặt bất kỳ ứng dụng nào.',
    },
    {
      q: 'Mất bao lâu để thiết lập xong thực đơn và đưa iMenu vào phục vụ tại quán?',
      a: 'Chỉ từ 3 đến 5 phút! Sau khi đăng ký tài khoản, hệ thống cung cấp sẵn bộ thực đơn mẫu phong phú (Cơm, Phở, Lẩu nướng, Cà phê, Trà sữa). Bạn có thể áp dụng ngay hoặc tải ảnh món, điều chỉnh giá và in bộ mã QR bàn tự động chỉ với vài cú nhấp chuột.',
    },
    {
      q: 'iMenu phù hợp với những mô hình kinh doanh F&B nào?',
      a: 'iMenu được tối ưu hóa cho đa dạng mô hình: Nhà hàng phục vụ tại bàn, Quán ăn gia đình, Quán nhậu & Lẩu nướng, Quán Cà phê & Trà sữa, Tiệm bánh ngọt, và các mô hình Bán mang đi (Takeaway). Từng phân hệ (Menu QR, POS, KDS) có thể bật/tắt linh hoạt tùy nhu cầu.',
    },
    {
      q: 'Sự khác biệt của gói Nâng cao dành cho chuỗi nhà hàng là gì?',
      a: 'Gói Nâng cao cung cấp khả năng Quản trị Đa chi nhánh (Multi-Branch) tập trung: Thiết lập menu, giá bán và tài khoản ngân hàng VietQR riêng cho từng cơ sở, phân quyền 5 cấp độ nghiêm ngặt, cùng hệ thống báo cáo doanh thu chuỗi hợp nhất theo thời gian thực.',
    },
    {
      q: 'Khi hết hạn dùng thử 1 tháng hoặc hạ gói thì dữ liệu của quán có bị mất không?',
      a: 'Toàn bộ 100% dữ liệu thực đơn, danh mục, thông tin bàn ăn và lịch sử doanh thu của quán được bảo toàn nguyên vẹn. Hệ thống tự động chuyển về gói Cơ bản 0đ mà không khóa tài khoản, không yêu cầu nhập thông tin thẻ ngân hàng.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      {/* =========================================================================
       * PHÂN KHU 1: HERO SECTION & CAM KẾT KHỞI ĐẦU
       * ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/30 to-white pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Định vị giải pháp */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/90 text-xs font-bold text-emerald-800 uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Giải pháp số hóa cho Nhà hàng, Quán ăn, Cafe & Trà sữa Việt
              </div>

              {/* Tiêu đề ấn tượng */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Vận hành nhanh gọn, <br />
                <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  phục vụ trọn vẹn.
                </span>
              </h1>

              {/* Mô tả giải pháp */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Giải pháp số hóa toàn diện giúp khách chủ động quét mã QR gọi món tại bàn hoặc đặt mang đi, đơn tự động chuyển vào màn hình bếp KDS và thanh toán VietQR Napas 247 tức thì.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                <Link href="/dang-ky">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-lg shadow-emerald-700/25 px-6 py-3"
                  >
                    Sử dụng miễn phí 0đ <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Link href="/#workflow">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-5 py-3"
                  >
                    Xem cách hoạt động
                  </Button>
                </Link>

                <Link href="/huong-dan">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-emerald-600/30 text-emerald-800 hover:bg-emerald-50 font-bold px-5 py-3"
                  >
                    📖 Hướng dẫn 7 bước
                  </Button>
                </Link>
              </div>

              {/* 3 Cam kết vàng */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Không cần thẻ ngân hàng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Thiết lập trong 5 phút</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Chạy thẳng trên trình duyệt — Không cần mua máy POS</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Interactive 3-Screen Live Simulator */}
            <div className="lg:col-span-5 relative w-full">
              <HeroSystemPreview />
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 2: ĐỊNH VỊ "iMENU LÀ GÌ?" & LỐI TẮT GIẢI PHÁP (ECOSYSTEM OVERVIEW)
       * ========================================================================= */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Overview Heading */}
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Định Vị Nền Tảng
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              iMenu là gì? Hệ sinh thái F&B thông minh trên nền tảng đám mây
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              iMenu kết nối 5 trụ cột quan trọng nhất trong vận hành nhà hàng: <strong>Thực đơn QR điện tử</strong>, <strong>POS phục vụ tại bàn</strong>, <strong>Màn hình Bếp KDS</strong>, <strong>Thanh toán VietQR Napas 247</strong> và <strong>Báo cáo doanh thu thời gian thực</strong> — tất cả gói gọn trong một đường link web duy nhất, không cần cài đặt phần mềm.
            </p>
          </div>

          {/* 3 Thẻ Giá Trị Cốt Lõi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 grid place-items-center font-bold text-base">
                <Laptop className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Không cần cài đặt hay mua phần cứng riêng
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tận dụng tối đa điện thoại cá nhân, máy tính bảng hoặc máy tính có sẵn. Khách hàng dùng ngay trình duyệt, không bắt tải app hay tốn dung lượng bộ nhớ.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 grid place-items-center font-bold text-base">
                <RotateCw className="w-5 h-5 text-teal-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Một nhịp vận hành liền mạch thời gian thực
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Khách gọi món tại bàn, máy thu ngân reo chuông thông báo, bếp nhận phiếu chế biến theo chuẩn FIFO và khách thanh toán VietQR — toàn bộ khớp lệnh trong chớp mắt qua WebSocket.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 grid place-items-center font-bold text-base">
                <Sparkles className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Miễn phí lâu dài ở gói Cơ bản 0đ
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Cam kết hỗ trợ các chủ quán ăn, quán cà phê Việt chuyển đổi số với gói Cơ bản 0đ vĩnh viễn, không ép buộc nâng cấp, an tâm mở rộng kinh doanh mà không lo gánh nặng chi phí.
              </p>
            </div>
          </div>

          {/* Dải thương hiệu đồng hành */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-400 text-xs sm:text-sm font-semibold">
            <span className="text-slate-800 font-bold">Quán Việt tin dùng:</span>
            <span className="text-slate-600 hover:text-emerald-700 transition-colors">Bếp Nhà Restaurant</span>
            <span className="text-slate-600 hover:text-emerald-700 transition-colors">Coffee Anh Hiền</span>
            <span className="text-slate-600 hover:text-emerald-700 transition-colors">Mộc Quán Bistro</span>
            <span className="text-slate-600 hover:text-emerald-700 transition-colors">An Nhiên Tea & Coffee</span>
            <span className="text-slate-600 hover:text-emerald-700 transition-colors">Phở Vương Hà Nội</span>
          </div>

        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 3: SPOTLIGHT MỚI: BÁN MANG ĐI & ĐẶT TRƯỚC ONLINE (ID="TAKEAWAY")
       * ========================================================================= */}
      <section id="takeaway" className="py-20 bg-gradient-to-b from-amber-50/40 via-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Cột trái: Giải bài toán Takeaway & 3 bước */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Spotlight Mới · Giải pháp đột phá cho bán mang đi
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Bán Mang Đi & Đặt Trước Online — <br />
                <span className="text-amber-700">Tiền về trước, món làm sau.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Chấm dứt hoàn toàn tình trạng khách nhắn tin gọi món qua Zalo, Messenger làm nhân viên rối loạn giờ cao điểm, quên đơn hoặc bị bom hàng. Quy trình 3 bước tự động hóa khép kín:
              </p>

              <div className="space-y-4 pt-1">
                {/* Bước 1 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 grid place-items-center flex-shrink-0 font-bold text-xs mt-0.5">
                    01
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Mã QR & Link Menu không gắn bàn</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Chia sẻ đường link lên Zalo OA, Fanpage Facebook, Bio TikTok hoặc in standee trước cửa quán. Khách tự truy cập xem thực đơn mọi lúc mọi nơi.
                    </p>
                  </div>
                </div>

                {/* Bước 2 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 grid place-items-center flex-shrink-0 font-bold text-xs mt-0.5">
                    02
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Khách chọn giờ lấy & Thanh toán VietQR trước</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Hệ thống tự động sinh mã VietQR Napas 247 chính xác từng đồng kèm nội dung đơn hàng. Khách quét chuyển khoản ngay từ ứng dụng ngân hàng bất kỳ.
                    </p>
                  </div>
                </div>

                {/* Bước 3 */}
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 grid place-items-center flex-shrink-0 font-bold text-xs mt-0.5">
                    03
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Đơn đã trả tiền tự chuyển thẳng vào Bếp</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Quán chỉ bắt đầu chế biến khi đã chắc chắn nhận đủ tiền vào tài khoản, hoàn toàn xóa bỏ nỗi lo khách đặt rồi không đến lấy (bom hàng).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/dang-ky">
                  <Button variant="primary" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm py-3 px-6 shadow-md shadow-amber-600/20">
                    Kích hoạt kênh mang đi miễn phí ngay <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cột phải: Thẻ giao diện mô phỏng trực quan đơn Bán Mang Đi */}
            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 bg-white rounded-3xl border-2 border-amber-200/90 shadow-xl space-y-6">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Mô phỏng đơn hàng mang đi thời gian thực
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Kênh Takeaway
                  </span>
                </div>

                {/* Thẻ đơn hàng #TW-108 */}
                <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono text-amber-400 font-bold block">
                        ĐƠN MANG ĐI #TW-108
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        Khách: Anh Minh Hoàng (0912.888.xxx)
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Giờ hẹn lấy</span>
                      <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 font-mono">
                        Sau 15 phút (11:45)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 py-2 border-t border-b border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>2x Cơm Gà Xối Mỡ Da Giòn (Thêm cơm)</span>
                      <span className="font-mono text-white font-semibold">110.000₫</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>2x Trà Đào Cam Sả (Ít ngọt, 100% đá)</span>
                      <span className="font-mono text-white font-semibold">55.000₫</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Trạng thái thanh toán</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Đã thanh toán VietQR (165.000₫)
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-amber-400 bg-amber-900/60 px-3 py-1 rounded-xl border border-amber-700/80 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      Tự động chuyển Bếp KDS
                    </span>
                  </div>
                </div>

                {/* Lợi thế không chiết khấu */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white grid place-items-center font-bold text-xs flex-shrink-0">
                      0%
                    </div>
                    <div>
                      <strong className="block font-bold">Không mất 25% – 30% phí chiết khấu</strong>
                      <span className="text-[11px] text-emerald-800">Quán nhận trọn 100% doanh thu trực tiếp từ khách hàng.</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Tiết kiệm tối đa</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 4: TẤT CẢ TRONG MỘT — MỘT NHỊP VẬN HÀNH LIỀN MẠCH (ID="FEATURES")
       * ========================================================================= */}
      <section id="features" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Tất Cả Trong Một
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Một nhịp vận hành liền mạch, từ bàn ăn đến gian bếp
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              6 phân hệ cốt lõi liên kết chặt chẽ giúp nhân viên giảm bớt thao tác chân tay, đầu bếp không bị sót vé và thực khách hài lòng tuyệt đối.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Thẻ 1 */}
            <Card hoverable className="p-7 space-y-4 border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center text-xl font-bold border border-emerald-100">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Thực đơn điện tử đa biến thể</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Thiết lập danh mục linh hoạt, ảnh món sắc nét, quản lý biến thể (Size L/M, Đường/Đá, Topping) và bật tắt trạng thái hết món (86) tức thì.
                </p>
              </div>
              <Link href="/huong-dan" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2">
                Khám phá tính năng <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* Thẻ 2 */}
            <Card hoverable className="p-7 space-y-4 border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center text-xl font-bold border border-amber-100">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Order bằng mã QR tại bàn</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Khách quét camera điện thoại để tự xem menu và gửi đơn theo từng đợt (Rounds). Tích hợp nút gọi nhân viên và gọi thanh toán ngay trên màn hình.
                </p>
              </div>
              <a href="http://localhost:3005/menu/bep-nha/ban-08" target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2">
                Dùng thử menu bàn 08 ↗
              </a>
            </Card>

            {/* Thẻ 3 */}
            <Card hoverable className="p-7 space-y-4 border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center text-xl font-bold border border-emerald-100">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">POS phục vụ & Gộp/Chuyển bàn</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sơ đồ bàn trực quan theo tầng/khu vực. Hỗ trợ thu ngân duyệt đợt gọi món QR của khách, chuyển bàn, gộp bàn và chuyển món giữa các bàn an toàn.
                </p>
              </div>
              <Link href="/dang-ky" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2">
                Trải nghiệm miễn phí <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* Thẻ 4 */}
            <Card hoverable className="p-7 space-y-4 border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 grid place-items-center text-xl font-bold border border-teal-100">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Màn hình Bếp KDS thời gian thực</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Giao diện Dark Mode chuẩn công nghiệp, tự động phân luồng đơn theo thứ tự FIFO (Vào trước ra trước), đếm ngược SLA và chuông báo khi món nấu xong.
                </p>
              </div>
              <Link href="/huong-dan" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2">
                Xem quy trình bếp KDS <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* Thẻ 5 */}
            <Card hoverable className="p-7 space-y-4 border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center text-xl font-bold border border-amber-100">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Thanh toán VietQR & In nhiệt 80mm</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sinh mã VietQR động chuẩn Napas 247 đúng số tiền từng hóa đơn. In phiếu tạm tính chuẩn máy in nhiệt 80mm (ESC/POS) qua mạng LAN hoặc Bluetooth.
                </p>
              </div>
              <Link href="/#pricing" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2">
                Xem ưu đãi tặng máy in ↗
              </Link>
            </Card>

            {/* Thẻ 6 */}
            <Card hoverable className="p-7 space-y-4 border-slate-200/80 bg-white shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 grid place-items-center text-xl font-bold border border-blue-100">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Báo cáo doanh thu & Chi nhánh tức thì</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Theo dõi biểu đồ doanh thu theo giờ, phân tích top món bán chạy, quản lý danh sách đơn đã thanh toán và so sánh hiệu quả giữa các chi nhánh.
                </p>
              </div>
              <Link href="/dang-ky" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-2">
                Bắt đầu theo dõi doanh thu <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 5: TRẢI NGHIỆM TẠI BÀN — KHÁCH CHỦ ĐỘNG, NHÂN VIÊN THẢNH THƠI (ID="WORKFLOW")
       * ========================================================================= */}
      <section id="workflow" className="py-20 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Trải Nghiệm Tại Bàn
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Khách chủ động chọn món. Nhân viên thảnh thơi phục vụ.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Quy trình 4 bước khép kín giúp quán vận hành nhẹ nhàng, giảm tối đa nhầm lẫn món và gia tăng tốc độ quay vòng bàn vào giờ cao điểm:
            </p>
          </div>

          {/* 4 Bước Quy Trình Khép Kín */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-sm grid place-items-center shadow-xs">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Quét mã & Chọn món</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mỗi bàn ăn có mã QR riêng biệt. Khách quét camera để xem thực đơn, chọn size, topping, thêm ghi chú và gửi order.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-sm grid place-items-center shadow-xs">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Nhân viên xác nhận</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Chuông thông báo reo trên máy thu ngân; nhân viên đối soát nhanh và bấm duyệt để đơn được chuyển sang bếp.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-sm grid place-items-center shadow-xs">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Bếp chuẩn bị & Phục vụ</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Màn hình KDS hiển thị món theo thứ tự FIFO; đầu bếp hoàn thành bấm báo xong để phục vụ mang ra bàn cho khách.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-sm grid place-items-center shadow-xs">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900">Tạm tính & Thanh toán VietQR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Khách tự xem phiếu tạm tính trên điện thoại, quét mã VietQR chuyển khoản chính xác từng đồng hoặc gọi thu ngân mang tiền thừa.
              </p>
            </div>
          </div>

          {/* Dẫn sang trang Hướng dẫn 7 bước */}
          <div className="text-center pt-2">
            <Link href="/huong-dan">
              <Button variant="secondary" size="md" className="font-bold inline-flex items-center gap-2">
                Xem cẩm nang vận hành chi tiết 7 bước (kèm hình ảnh minh họa thực tế) <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Nhúng InteractiveTableMenuSimulator */}
          <div className="pt-6">
            <InteractiveTableMenuSimulator />
          </div>

        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 6: BẢNG SO SÁNH TRUNG THỰC (ID="COMPARISON")
       * ========================================================================= */}
      <section id="comparison" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Bảng So Sánh Trung Thực
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              iMenu Cloud vs. Phần Mềm POS Truyền Thống
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Những khác biệt mang tính quyết định giúp nhà hàng tinh gọn chi phí, giảm thiểu sai sót và tăng tốc phục vụ.
            </p>
          </div>

          {/* Bảng so sánh responsive */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200/90 shadow-xl bg-white">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-4 sm:p-5 font-bold text-slate-700 w-1/3">Tiêu chí vận hành</th>
                  <th className="p-4 sm:p-5 font-bold text-slate-500 w-1/3">Phần mềm POS cũ & Menu giấy</th>
                  <th className="p-4 sm:p-5 font-extrabold text-emerald-900 bg-emerald-50/80 w-1/3 border-l border-r border-emerald-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Nền tảng iMenu Cloud</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* 1. Thiết bị */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Thiết bị & Phần cứng</td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    Bắt buộc mua máy POS cảm ứng chuyên dụng đắt đỏ (8–15 triệu đồng/máy).
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/30 border-l border-r border-emerald-200">
                    Tận dụng ngay điện thoại, tablet, laptop sẵn có của quán (Chi phí thiết bị 0đ).
                  </td>
                </tr>

                {/* 2. Khách quét QR */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Khách quét QR tự gọi món</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    Thường tính thêm phí module riêng hoặc không có tính năng gọi món đa đợt (Rounds).
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/30 border-l border-r border-emerald-200">
                    Tích hợp sẵn; quét camera là vào menu ngay, không cần cài đặt thêm bất kỳ app nào.
                  </td>
                </tr>

                {/* 3. Bếp KDS & 86 */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Màn hình Bếp KDS & Báo hết món (86)</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    Phụ thuộc máy in phiếu giấy dễ kẹt, dễ ướt rách; báo hết món chậm trễ gây bực bội.
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/30 border-l border-r border-emerald-200">
                    Đồng bộ thời gian thực qua WebSocket; 1 chạm ẩn món hết hàng trên toàn hệ thống.
                  </td>
                </tr>

                {/* 4. VietQR động */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Thanh toán VietQR động</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    Dán mã QR tĩnh, khách phải tự gõ số tiền và nội dung, dễ thừa thiếu hoặc nhầm lẫn.
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/30 border-l border-r border-emerald-200">
                    Tự động tạo mã VietQR Napas 247 khớp đúng số tiền của từng bàn và chi nhánh.
                  </td>
                </tr>

                {/* 5. Thời gian làm quen */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Thời gian làm quen của nhân viên</td>
                  <td className="p-4 sm:p-5 text-slate-500">
                    Giao diện nhiều tầng lớp phức tạp, mất 2–3 ngày đào tạo khi có nhân viên mới.
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/30 border-l border-r border-emerald-200">
                    Giao diện tối giản trực quan, nhân viên nắm bắt và thành thạo chỉ trong dưới 5 phút.
                  </td>
                </tr>

                {/* 6. Gói miễn phí lâu dài */}
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-slate-900">Gói miễn phí lâu dài</td>
                  <td className="p-4 sm:p-5 text-rose-600">
                    Chỉ cho dùng thử từ 7 đến 15 ngày rồi khóa tài khoản, ép mua hợp đồng dài hạn.
                  </td>
                  <td className="p-4 sm:p-5 font-bold text-emerald-700 bg-emerald-50/30 border-l border-r border-emerald-200">
                    Gói Cơ bản 0đ vĩnh viễn, không ép nâng cấp, dữ liệu bảo toàn 100%.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 7: BẢNG GIÁ LINH HOẠT & ƯU ĐÃI TẶNG MÁY IN HÓA ĐƠN (ID="PRICING")
       * ========================================================================= */}
      <section id="pricing" className="py-20 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Bảng Giá Linh Hoạt
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Bắt đầu miễn phí 0đ. Nâng cấp khi quán sẵn sàng.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Mọi tài khoản tạo mới đều được tặng ngay 1 tháng trải nghiệm toàn bộ tính năng cao cấp.
            </p>
          </div>

          {/* Banner đầu mục */}
          <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-center shadow-xs">
            <span className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ✦ Tặng 1 tháng trải nghiệm miễn phí gói Nâng cao cho mọi nhà hàng mới — Hết hạn tự chuyển về gói Cơ bản 0đ, không cần thẻ thanh toán.
            </span>
          </div>

          {/* 3 Gói Dịch Vụ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Gói 1: Cơ bản */}
            <Card className="p-8 flex flex-col justify-between border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-xs">
              <div className="space-y-4">
                <Badge variant="neutral">CƠ BẢN</Badge>
                <h3 className="text-xl font-bold text-slate-900">Vận hành thiết yếu</h3>
                <p className="text-xs text-slate-500">Dành cho quán ăn, quán nước nhỏ mới mở cần số hóa quy trình cơ bản.</p>
                <div className="pt-2">
                  <span className="text-4xl font-extrabold text-slate-900">0đ</span>
                  <span className="text-xs text-slate-500 ml-1">/ vĩnh viễn</span>
                </div>
                <hr className="border-slate-100" />
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Quản lý danh mục & thực đơn món</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Nhân viên ghi order POS tại bàn</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Màn hình Bếp KDS cơ bản</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sơ đồ quản lý bàn ăn & trạng thái</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> In phiếu tạm tính chuẩn 80mm</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-8">
                <Button variant="outline" className="w-full font-bold">
                  Bắt đầu miễn phí 0đ
                </Button>
              </Link>
            </Card>

            {/* Gói 2: Tiêu chuẩn (Khuyên dùng) */}
            <Card className="p-8 flex flex-col justify-between border-2 border-emerald-600 shadow-xl relative bg-white ring-4 ring-emerald-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-700 to-teal-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                Khuyên Dùng
              </div>
              <div className="space-y-4">
                <Badge variant="brand">TIÊU CHUẨN</Badge>
                <h3 className="text-xl font-bold text-slate-900">Phục vụ thông minh</h3>
                <p className="text-xs text-slate-500">Tự động hóa trải nghiệm gọi món, giảm bớt nhân lực chạy bàn.</p>
                <div className="pt-2">
                  <span className="text-4xl font-extrabold text-emerald-700">250.000đ</span>
                  <span className="text-xs text-slate-500 ml-1">/ tháng</span>
                </div>
                <hr className="border-slate-100" />
                <strong className="text-xs text-slate-800 block">Tất cả gói Cơ bản, cộng thêm:</strong>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Menu điện tử QR trên điện thoại khách</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Khách tự chọn món & gửi đơn nhiều đợt</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kênh Bán mang đi & Đặt trước online (Takeaway)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đồng bộ Real-time Bàn - Bếp - Thu ngân</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Phân quyền nhân viên theo ca trực</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-8">
                <Button variant="primary" className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold shadow-md shadow-emerald-700/20">
                  Dùng thử 1 tháng miễn phí
                </Button>
              </Link>
            </Card>

            {/* Gói 3: Nâng cao (Đề xuất cho chuỗi) */}
            <Card className="p-8 flex flex-col justify-between border-2 border-amber-300 bg-gradient-to-b from-white to-amber-50/20 shadow-md">
              <div className="space-y-4">
                <Badge variant="amber">NÂNG CAO</Badge>
                <h3 className="text-xl font-bold text-slate-900">Quản trị chuỗi</h3>
                <p className="text-xs text-slate-500">Kiểm soát tập trung và báo cáo doanh thu toàn chuỗi F&B.</p>
                <div className="pt-2">
                  <span className="text-4xl font-extrabold text-amber-600">500.000đ</span>
                  <span className="text-xs text-slate-500 ml-1">/ tháng</span>
                </div>
                <hr className="border-slate-100" />
                <strong className="text-xs text-slate-800 block">Tất cả gói Tiêu chuẩn, cộng thêm:</strong>
                <ul className="space-y-3 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Thanh toán VietQR động tự động nhận tiền</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Quản lý chuỗi nhiều chi nhánh tập trung (Multi-Branch)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Menu, giá bán & tài khoản ngân hàng riêng từng quán</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Báo cáo hợp nhất doanh thu toàn hệ thống</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Ưu tiên hỗ trợ kỹ thuật trực tiếp 24/7</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-8">
                <Button variant="amber" className="w-full font-bold">
                  Trải nghiệm đầy đủ
                </Button>
              </Link>
            </Card>

          </div>

          {/* ================= KHỐI ƯU ĐÃI ĐĂNG KÝ (HARDWARE GIFT CARD) ================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100/50 to-emerald-50 border-2 border-amber-300 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white grid place-items-center flex-shrink-0 shadow-md">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-extrabold uppercase tracking-wide">
                  Ưu đãi phần cứng độc quyền
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  🎁 Ưu đãi đăng ký gói trả phí: Tặng ngay Máy In Hóa Đơn Nhiệt 80mm trị giá 1.500.000đ
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  Áp dụng khi đăng ký gói <strong>Tiêu chuẩn</strong> hoặc <strong>Nâng cao</strong>. Máy in khổ giấy 80mm chuẩn ESC/POS, tốc độ in cao 200mm/s, tự động cắt giấy, kết nối mạng LAN / USB / Bluetooth cắm là chạy ngay!
                </p>
              </div>
            </div>

            <Link href="/dang-ky" className="flex-shrink-0 w-full md:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-6 py-3 shadow-md shadow-amber-600/20"
              >
                Nhận ưu đãi máy in ngay <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 8: PHÂN QUYỀN RÕ RÀNG Ở MỌI CẤP ĐỘ (ID="ROLES")
       * ========================================================================= */}
      <section id="roles" className="py-20 sm:py-24 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Phân Quyền Chặt Chẽ
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Phân quyền 5 cấp độ bảo mật nghiêm ngặt
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Đảm bảo đúng người, đúng việc và ngăn chặn thất thoát dữ liệu ở từng chi nhánh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Vai trò 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center mx-auto border border-emerald-100">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Quản trị hệ thống</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kiểm soát toàn bộ nền tảng, quản lý tài nguyên và cấu hình bảo mật toàn cục.
              </p>
            </div>

            {/* Vai trò 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 grid place-items-center mx-auto border border-teal-100">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Quản trị chuỗi HQ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Theo dõi chỉ số toàn chuỗi, điều phối danh mục thực đơn chung và xem báo cáo hợp nhất.
              </p>
            </div>

            {/* Vai trò 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 grid place-items-center mx-auto border border-blue-100">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Quản lý chi nhánh</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quản trị thực đơn, giá bán, bàn ăn và tài khoản ngân hàng nhận tiền riêng của cơ sở.
              </p>
            </div>

            {/* Vai trò 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center mx-auto border border-amber-100">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Thu ngân & Phục vụ POS</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vận hành sơ đồ bàn, duyệt đợt gọi món QR, gộp/chuyển bàn và in phiếu tính tiền cho khách.
              </p>
            </div>

            {/* Vai trò 5 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 grid place-items-center mx-auto border border-purple-100">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Đầu bếp KDS</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Xem vé bếp theo thứ tự gọi món FIFO, đánh dấu món hoàn thành và báo hết hàng (86).
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 9: CÂU HỎI THƯỜNG GẶP (ID="FAQ") & CTA CUỐI TRANG
       * ========================================================================= */}
      <section id="faq" className="py-20 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Giải Đáp Thắc Mắc
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Câu hỏi thường gặp của chủ quán
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Những điều các chủ nhà hàng, quán ăn và cà phê quan tâm nhất khi chuyển đổi sang iMenu.
            </p>
          </div>

          {/* Accordion 7 Câu Hỏi */}
          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-emerald-800 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-700 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= CTA BANNER CUỐI TRANG ================= */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border border-emerald-800/80 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center lg:justify-start gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Miễn phí 0đ trọn đời gói Cơ bản
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Sẵn sàng để nhà hàng vận hành nhẹ nhàng hơn?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
                Đăng ký ngay hôm nay để trải nghiệm miễn phí toàn bộ tính năng cao cấp trong 1 tháng. Không cần thẻ tín dụng, đưa vào phục vụ khách chỉ sau 5 phút.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link href="/dang-ky" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full whitespace-nowrap bg-white text-emerald-950 hover:bg-emerald-50 shadow-lg border-0 font-bold px-6 py-3"
                >
                  Tạo quán ngay bây giờ <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/huong-dan" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full whitespace-nowrap border-emerald-500/50 text-emerald-100 hover:bg-emerald-900 font-bold px-5 py-3"
                >
                  Xem hướng dẫn 7 bước
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
