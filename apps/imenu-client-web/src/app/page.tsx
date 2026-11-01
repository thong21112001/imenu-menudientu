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
  Clock,
  Layers,
  Check,
  Laptop,
  RotateCw,
  BookOpen,
  Briefcase,
  HelpCircle,
  Tag,
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
      a: 'Hoàn toàn không. Gói Cơ bản 0đ của iMenu là miễn phí lâu dài, không giới hạn thời gian sử dụng, không giới hạn số lượng món ăn và không giới hạn số bàn. Chúng tôi cam kết đồng hành cùng các quán ăn, quán cà phê khởi nghiệp số hóa quy trình vận hành thiết yếu.',
    },
    {
      q: 'Quán của tôi cần mua thêm thiết bị phần cứng chuyên dụng gì để bắt đầu dùng iMenu?',
      a: 'Hoàn toàn không cần mua thêm máy POS đắt đỏ. iMenu hoạt động 100% trên nền tảng Cloud Web. Bạn có thể sử dụng bất kỳ điện thoại thông minh, máy tính bảng (iPad/Android) hoặc laptop sẵn có của quán. Khách hàng cũng chỉ cần dùng điện thoại cá nhân quét mã QR để gọi món.',
    },
    {
      q: 'Khách hàng có bắt buộc phải tải app hay đăng ký tài khoản để quét QR gọi món không?',
      a: 'Tuyệt đối không. Khách hàng chỉ cần mở camera điện thoại (iPhone, Samsung, Xiaomi...) hoặc ứng dụng Zalo quét mã QR tại bàn là menu điện tử mở ra ngay tức thì trên trình duyệt web, trải nghiệm mượt mà không cần cài đặt bất kỳ ứng dụng nào.',
    },
    {
      q: 'Mất bao lâu để thiết lập xong thực đơn và đưa iMenu vào phục vụ tại quán?',
      a: 'Chỉ từ 3 đến 5 phút. Sau khi đăng ký tài khoản, hệ thống cung cấp sẵn bộ thực đơn mẫu phong phú (Cơm, Phở, Lẩu nướng, Cà phê, Trà sữa). Bạn có thể áp dụng ngay hoặc tải ảnh món, điều chỉnh giá và in bộ mã QR bàn tự động chỉ với vài cú nhấp chuột.',
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
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-100 selection:text-zinc-900">
      <Header />

      {/* =========================================================================
       * PHÂN KHU 1: HERO SECTION & ĐỊNH VỊ GIẢI PHÁP
       * ========================================================================= */}
      <section className="relative overflow-hidden bg-zinc-50/60 pt-12 pb-16 lg:pt-16 lg:pb-24 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-zinc-200/90 text-xs font-semibold text-zinc-800 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Nền tảng số hóa F&B cho Nhà hàng, Quán ăn & Cà phê Việt
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-zinc-950 tracking-tight leading-[1.12]">
                Vận hành nhanh gọn, <br />
                <span className="text-emerald-700">phục vụ trọn vẹn.</span>
              </h1>

              <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Giải pháp toàn diện giúp khách chủ động quét mã QR gọi món tại bàn hoặc đặt mang đi, đơn tự động đồng bộ vào màn hình bếp KDS và thanh toán VietQR Napas 247 tức thì.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link href="/dang-ky">
                  <Button variant="primary" size="lg" className="h-10 px-5 text-sm font-medium">
                    Sử dụng miễn phí 0đ <ArrowRight className="w-4 h-4 ml-1.5 stroke-[1.5]" />
                  </Button>
                </Link>

                <Link href="/#workflow">
                  <Button variant="outline" size="lg" className="h-10 px-4 text-sm font-medium">
                    Xem cách hoạt động
                  </Button>
                </Link>

                <Link href="/huong-dan">
                  <Button variant="outline" size="lg" className="h-10 px-4 text-sm font-medium border-emerald-700/30 text-emerald-900 hover:bg-emerald-50/50">
                    <BookOpen className="w-4 h-4 mr-1.5 stroke-[1.5] text-emerald-700" /> Hướng dẫn 7 bước
                  </Button>
                </Link>
              </div>

              {/* 3 Cam kết */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs font-medium text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 stroke-[1.5]" />
                  <span>Không cần thẻ ngân hàng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 stroke-[1.5]" />
                  <span>Thiết lập trong 5 phút</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 stroke-[1.5]" />
                  <span>Chạy thẳng trên trình duyệt</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Live Simulator */}
            <div className="lg:col-span-5 relative w-full">
              <HeroSystemPreview />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 2: HỆ SINH THÁI ĐỒNG BỘ THỜI GIAN THỰC
       * ========================================================================= */}
      <section className="py-16 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-2">
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">
              Định vị nền tảng
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              iMenu là gì? Hệ sinh thái F&B trên nền tảng đám mây
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              Kết nối 5 mắt xích quan trọng nhất trong vận hành quán: <strong>Thực đơn QR điện tử</strong>, <strong>POS phục vụ tại bàn</strong>, <strong>Màn hình Bếp KDS</strong>, <strong>Thanh toán VietQR Napas 247</strong> và <strong>Báo cáo doanh thu thời gian thực</strong> — tất cả gói gọn trong một đường link web duy nhất, không cần cài đặt phần mềm.
            </p>
          </div>

          {/* 3 Thẻ Giá Trị Cốt Lõi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center">
                <Laptop className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Không cần phần cứng chuyên dụng
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Tận dụng tối đa điện thoại cá nhân, máy tính bảng hoặc laptop có sẵn. Khách hàng dùng ngay camera/Zalo, không bắt tải app hay tốn dung lượng bộ nhớ.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center">
                <RotateCw className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Vận hành đồng bộ thời gian thực
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Khách gọi món tại bàn, máy thu ngân phát chuông thông báo, bếp nhận phiếu chế biến theo chuẩn FIFO và khách thanh toán VietQR — toàn bộ khớp lệnh tức thì qua WebSocket.
              </p>
            </div>

            <div className="p-5 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-2.5">
              <div className="w-8 h-8 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center">
                <ShieldCheck className="w-4 h-4 stroke-[1.5] text-emerald-700" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Miễn phí lâu dài ở gói Cơ bản 0đ
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Cam kết hỗ trợ các chủ quán ăn, quán cà phê Việt chuyển đổi số với gói Cơ bản 0đ vĩnh viễn, không ép buộc nâng cấp, an tâm mở rộng kinh doanh mà không lo gánh nặng chi phí.
              </p>
            </div>
          </div>

          {/* Dải thương hiệu tin dùng */}
          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-zinc-400 text-xs font-medium">
            <span className="text-zinc-700 font-semibold">Quán Việt tin dùng:</span>
            <span>Bếp Nhà Restaurant</span>
            <span>Coffee Anh Hiền</span>
            <span>Mộc Quán Bistro</span>
            <span>An Nhiên Tea & Coffee</span>
            <span>Phở Vương Hà Nội</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 3: BÁN MANG ĐI & ĐẶT TRƯỚC ONLINE (ID="TAKEAWAY")
       * ========================================================================= */}
      <section id="takeaway" className="py-16 bg-zinc-50/50 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Cột trái: 3 bước */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-xs font-semibold text-zinc-800">
                <ShoppingBag className="w-3.5 h-3.5 text-amber-700 stroke-[1.5]" />
                Kênh Bán Mang Đi & Đặt Trước Online
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight leading-snug">
                Tiền về trước, món làm sau. <br />
                <span className="text-amber-800 font-semibold">Chấm dứt nỗi lo bom hàng.</span>
              </h2>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Chấm dứt hoàn toàn tình trạng khách nhắn tin gọi món qua Zalo, Messenger làm nhân viên rối loạn giờ cao điểm, quên đơn hoặc bị bom hàng. Quy trình 3 bước tự động hóa khép kín:
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 grid place-items-center shrink-0 font-mono text-xs font-semibold mt-0.5">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900">Mã QR & Link Menu không gắn bàn</h4>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      Chia sẻ đường link lên Zalo OA, Fanpage Facebook, Bio TikTok hoặc in standee trước cửa quán. Khách tự xem thực đơn mọi lúc.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 grid place-items-center shrink-0 font-mono text-xs font-semibold mt-0.5">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900">Khách chọn giờ lấy & Thanh toán VietQR trước</h4>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      Hệ thống tự động sinh mã VietQR Napas 247 chính xác từng đồng kèm nội dung đơn hàng. Khách quét chuyển khoản ngay từ app ngân hàng.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-zinc-100 border border-zinc-200 text-zinc-800 grid place-items-center shrink-0 font-mono text-xs font-semibold mt-0.5">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900">Đơn đã thanh toán tự chuyển thẳng vào Bếp</h4>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                      Quán chỉ bắt đầu chế biến khi đã chắc chắn nhận đủ tiền vào tài khoản, hoàn toàn xóa bỏ nỗi lo khách đặt rồi không đến lấy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <Link href="/dang-ky">
                  <Button variant="primary" size="md" className="h-9 px-4 text-xs font-medium">
                    Kích hoạt kênh mang đi miễn phí ngay <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cột phải: Mô phỏng đơn Takeaway */}
            <div className="lg:col-span-6">
              <div className="p-5 sm:p-6 bg-white rounded-lg border border-zinc-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="font-semibold text-zinc-900">
                      Mô phỏng đơn hàng mang đi thời gian thực
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    Kênh Takeaway
                  </span>
                </div>

                {/* Thẻ đơn hàng */}
                <div className="p-4 rounded-md bg-zinc-900 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 block font-medium">
                        ĐƠN MANG ĐI #TW-108
                      </span>
                      <h4 className="text-xs font-semibold text-white mt-0.5">
                        Khách: Anh Minh Hoàng (0912.888.xxx)
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">Giờ hẹn lấy</span>
                      <span className="text-xs font-medium text-amber-300 font-mono tabular-nums">
                        Sau 15 phút (11:45)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 py-2 border-t border-b border-zinc-800 text-xs">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>2x Cơm Gà Xối Mỡ Da Giòn</span>
                      <span className="font-mono text-white tabular-nums">110.000₫</span>
                    </div>
                    <div className="flex justify-between items-center text-zinc-300">
                      <span>2x Trà Đào Cam Sả (Ít ngọt)</span>
                      <span className="font-mono text-white tabular-nums">55.000₫</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Trạng thái thanh toán</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
                        Đã thanh toán VietQR (165.000₫)
                      </span>
                    </div>
                    <span className="text-xs font-medium text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                      Tự động vào Bếp KDS
                    </span>
                  </div>
                </div>

                {/* 0% Phí chiết khấu */}
                <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-950 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-mono font-bold text-[10px]">
                      0%
                    </span>
                    <div>
                      <strong className="block font-semibold">Không mất 25% – 30% phí chiết khấu</strong>
                      <span className="text-[11px] text-emerald-800">Quán nhận trọn 100% doanh thu trực tiếp từ khách.</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 whitespace-nowrap">Tiết kiệm tối đa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 4: TẤT CẢ TRONG MỘT (ID="FEATURES")
       * ========================================================================= */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">
              Tất cả trong một
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Một nhịp vận hành liền mạch, từ bàn ăn đến gian bếp
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              6 phân hệ cốt lõi liên kết chặt chẽ giúp nhân viên giảm thao tác thủ công, đầu bếp không bị sót vé và thực khách hài lòng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Thẻ 1 */}
            <Card hoverable className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-md bg-zinc-100 text-zinc-800 grid place-items-center border border-zinc-200">
                  <UtensilsCrossed className="w-4 h-4 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Thực đơn điện tử đa biến thể</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Thiết lập danh mục linh hoạt, quản lý biến thể (Size L/M, Đường/Đá, Topping) và bật tắt trạng thái hết món (86) tức thì.
                </p>
              </div>
              <Link href="/huong-dan" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-1">
                Khám phá tính năng <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </Link>
            </Card>

            {/* Thẻ 2 */}
            <Card hoverable className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-md bg-zinc-100 text-zinc-800 grid place-items-center border border-zinc-200">
                  <QrCode className="w-4 h-4 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Order bằng mã QR tại bàn</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Khách quét camera điện thoại để tự xem menu và gửi đơn theo từng đợt (Rounds). Tích hợp nút gọi nhân viên và gọi thanh toán.
                </p>
              </div>
              <Link href="/huong-dan" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-1">
                Xem quy trình tại bàn <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </Link>
            </Card>

            {/* Thẻ 3 */}
            <Card hoverable className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-md bg-zinc-100 text-zinc-800 grid place-items-center border border-zinc-200">
                  <Smartphone className="w-4 h-4 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">POS phục vụ & Chuyển bàn</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Sơ đồ bàn trực quan theo tầng/khu vực. Hỗ trợ thu ngân duyệt đợt gọi món QR của khách, chuyển bàn, gộp bàn an toàn.
                </p>
              </div>
              <Link href="/dang-ky" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-1">
                Trải nghiệm miễn phí <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </Link>
            </Card>

            {/* Thẻ 4 */}
            <Card hoverable className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-md bg-zinc-100 text-zinc-800 grid place-items-center border border-zinc-200">
                  <ChefHat className="w-4 h-4 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Màn hình Bếp KDS chuẩn FIFO</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Giao diện tối ưu công nghiệp, tự động phân luồng đơn vào trước ra trước, đếm ngược SLA và chuông báo khi món nấu xong.
                </p>
              </div>
              <Link href="/huong-dan" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-1">
                Xem quy trình bếp KDS <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </Link>
            </Card>

            {/* Thẻ 5 */}
            <Card hoverable className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-md bg-zinc-100 text-zinc-800 grid place-items-center border border-zinc-200">
                  <Receipt className="w-4 h-4 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Thanh toán VietQR & In nhiệt 80mm</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Sinh mã VietQR động chuẩn Napas 247 đúng số tiền từng hóa đơn. In phiếu tạm tính chuẩn máy in nhiệt 80mm (ESC/POS) qua LAN/Bluetooth.
                </p>
              </div>
              <Link href="/#pricing" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-1">
                Xem ưu đãi máy in <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </Link>
            </Card>

            {/* Thẻ 6 */}
            <Card hoverable className="p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-md bg-zinc-100 text-zinc-800 grid place-items-center border border-zinc-200">
                  <TrendingUp className="w-4 h-4 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">Báo cáo doanh thu & Đa chi nhánh</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Theo dõi biểu đồ doanh thu theo giờ, phân tích top món bán chạy, quản lý danh sách đơn đã thanh toán và so sánh hiệu quả giữa các cơ sở.
                </p>
              </div>
              <Link href="/dang-ky" className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-1">
                Bắt đầu theo dõi doanh thu <ArrowRight className="w-3 h-3 stroke-[1.5]" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 5: TRẢI NGHIỆM TẠI BÀN (ID="WORKFLOW")
       * ========================================================================= */}
      <section id="workflow" className="py-16 sm:py-20 bg-zinc-50/50 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">
              Trải nghiệm tại bàn
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Khách chủ động chọn món. Nhân viên thảnh thơi phục vụ.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              Quy trình 4 bước khép kín giúp quán vận hành nhẹ nhàng, giảm tối đa nhầm lẫn món và gia tăng tốc độ quay vòng bàn:
            </p>
          </div>

          {/* 4 Bước Quy Trình */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-800 font-mono text-xs font-bold grid place-items-center border border-zinc-200">
                01
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Quét mã & Chọn món</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Mỗi bàn ăn có mã QR riêng biệt. Khách quét camera xem menu, chọn size, topping, thêm ghi chú và gửi order.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-800 font-mono text-xs font-bold grid place-items-center border border-zinc-200">
                02
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Nhân viên xác nhận</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Chuông thông báo reo trên POS thu ngân; nhân viên đối soát nhanh và bấm duyệt để đơn được chuyển sang bếp.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-800 font-mono text-xs font-bold grid place-items-center border border-zinc-200">
                03
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Bếp chuẩn bị & Phục vụ</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Màn hình KDS hiển thị món theo thứ tự FIFO; đầu bếp hoàn thành bấm báo xong để phục vụ mang ra bàn cho khách.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-zinc-200 space-y-2">
              <div className="w-7 h-7 rounded bg-zinc-100 text-zinc-800 font-mono text-xs font-bold grid place-items-center border border-zinc-200">
                04
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Tạm tính & Thanh toán VietQR</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Khách tự xem phiếu tạm tính trên điện thoại, quét mã VietQR chuyển khoản chính xác từng đồng hoặc gọi thu ngân.
              </p>
            </div>
          </div>

          <div className="text-center pt-1">
            <Link href="/huong-dan">
              <Button variant="secondary" size="md" className="h-9 px-4 text-xs font-medium">
                Xem cẩm nang vận hành chi tiết 7 bước <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
              </Button>
            </Link>
          </div>

          {/* InteractiveTableMenuSimulator */}
          <div className="pt-4">
            <InteractiveTableMenuSimulator />
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 6: BẢNG SO SÁNH (ID="COMPARISON")
       * ========================================================================= */}
      <section id="comparison" className="py-16 sm:py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">
              Bảng so sánh
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              iMenu Cloud vs. Phần Mềm POS Truyền Thống
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              Những khác biệt mang tính quyết định giúp nhà hàng tinh gọn chi phí và tăng tốc phục vụ.
            </p>
          </div>

          {/* Bảng so sánh */}
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/80">
                  <th className="p-3.5 sm:p-4 font-semibold text-zinc-700 w-1/3">Tiêu chí vận hành</th>
                  <th className="p-3.5 sm:p-4 font-semibold text-zinc-500 w-1/3">POS truyền thống & Menu giấy</th>
                  <th className="p-3.5 sm:p-4 font-semibold text-emerald-900 bg-emerald-50/50 w-1/3 border-l border-emerald-200">
                    Nền tảng iMenu Cloud
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-700">
                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-900">Thiết bị & Phần cứng</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">
                    Bắt buộc mua máy POS cảm ứng chuyên dụng (8–15 triệu đồng/máy).
                  </td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-800 bg-emerald-50/20 border-l border-emerald-200">
                    Tận dụng ngay điện thoại, tablet, laptop sẵn có của quán (Chi phí thiết bị 0đ).
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-900">Khách quét QR tự gọi món</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">
                    Thường tính thêm phí module riêng hoặc không có tính năng gọi món đa đợt (Rounds).
                  </td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-800 bg-emerald-50/20 border-l border-emerald-200">
                    Tích hợp sẵn; quét camera là vào menu ngay, không cần cài đặt thêm app.
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-900">Màn hình Bếp KDS & Báo hết món (86)</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">
                    Phụ thuộc máy in phiếu giấy dễ kẹt; báo hết món chậm trễ gây bực bội.
                  </td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-800 bg-emerald-50/20 border-l border-emerald-200">
                    Đồng bộ thời gian thực qua WebSocket; 1 chạm ẩn món hết hàng trên toàn hệ thống.
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-900">Thanh toán VietQR động</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">
                    Dán mã QR tĩnh, khách phải tự gõ số tiền và nội dung, dễ thừa thiếu hoặc nhầm lẫn.
                  </td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-800 bg-emerald-50/20 border-l border-emerald-200">
                    Tự động tạo mã VietQR Napas 247 khớp đúng số tiền của từng bàn và chi nhánh.
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-900">Thời gian làm quen của nhân viên</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">
                    Giao diện nhiều tầng lớp phức tạp, mất 2–3 ngày đào tạo khi có nhân viên mới.
                  </td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-800 bg-emerald-50/20 border-l border-emerald-200">
                    Giao diện tối giản trực quan, nhân viên nắm bắt và thành thạo chỉ trong 5 phút.
                  </td>
                </tr>

                <tr>
                  <td className="p-3.5 sm:p-4 font-medium text-zinc-900">Gói miễn phí lâu dài</td>
                  <td className="p-3.5 sm:p-4 text-zinc-500">
                    Chỉ cho dùng thử từ 7 đến 15 ngày rồi khóa tài khoản, ép mua hợp đồng dài hạn.
                  </td>
                  <td className="p-3.5 sm:p-4 font-medium text-emerald-800 bg-emerald-50/20 border-l border-emerald-200">
                    Gói Cơ bản 0đ vĩnh viễn, không ép nâng cấp, dữ liệu bảo toàn 100%.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 7: BẢNG GIÁ (ID="PRICING")
       * ========================================================================= */}
      <section id="pricing" className="py-16 sm:py-20 bg-zinc-50/50 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">
              Bảng giá linh hoạt
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Bắt đầu miễn phí 0đ. Nâng cấp khi quán sẵn sàng.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              Mọi tài khoản tạo mới đều được tặng ngay 1 tháng trải nghiệm toàn bộ tính năng cao cấp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Gói 1: Cơ bản */}
            <Card className="p-6 flex flex-col justify-between bg-white border border-zinc-200">
              <div className="space-y-3">
                <Badge variant="neutral">CƠ BẢN</Badge>
                <h3 className="text-base font-bold text-zinc-900">Vận hành thiết yếu</h3>
                <p className="text-xs text-zinc-500">Dành cho quán ăn, quán nước nhỏ mới mở cần số hóa quy trình cơ bản.</p>
                <div className="pt-1">
                  <span className="text-3xl font-bold text-zinc-900 tabular-nums">0đ</span>
                  <span className="text-xs text-zinc-500 ml-1">/ vĩnh viễn</span>
                </div>
                <hr className="border-zinc-100" />
                <ul className="space-y-2 text-xs text-zinc-600">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Quản lý danh mục & thực đơn món</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Nhân viên ghi order POS tại bàn</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Màn hình Bếp KDS cơ bản</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Sơ đồ quản lý bàn ăn & trạng thái</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> In phiếu tạm tính chuẩn 80mm</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-6">
                <Button variant="outline" className="w-full text-xs font-medium h-9">
                  Bắt đầu miễn phí 0đ
                </Button>
              </Link>
            </Card>

            {/* Gói 2: Tiêu chuẩn */}
            <Card className="p-6 flex flex-col justify-between bg-white border border-emerald-700/80 relative shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="brand">TIÊU CHUẨN</Badge>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Khuyên dùng
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900">Phục vụ thông minh</h3>
                <p className="text-xs text-zinc-500">Tự động hóa trải nghiệm gọi món, giảm bớt nhân lực chạy bàn.</p>
                <div className="pt-1">
                  <span className="text-3xl font-bold text-emerald-700 tabular-nums">250.000đ</span>
                  <span className="text-xs text-zinc-500 ml-1">/ tháng</span>
                </div>
                <hr className="border-zinc-100" />
                <ul className="space-y-2 text-xs text-zinc-600">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Menu điện tử QR trên điện thoại khách</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Khách tự chọn món & gửi đơn nhiều đợt</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Kênh Bán mang đi & Đặt trước VietQR</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Đồng bộ Realtime Bàn - Bếp - Thu ngân</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Phân quyền nhân viên theo ca trực</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-6">
                <Button variant="primary" className="w-full text-xs font-medium h-9">
                  Dùng thử 1 tháng miễn phí
                </Button>
              </Link>
            </Card>

            {/* Gói 3: Nâng cao */}
            <Card className="p-6 flex flex-col justify-between bg-white border border-zinc-200">
              <div className="space-y-3">
                <Badge variant="amber">NÂNG CAO</Badge>
                <h3 className="text-base font-bold text-zinc-900">Quản trị chuỗi</h3>
                <p className="text-xs text-zinc-500">Kiểm soát tập trung và báo cáo doanh thu toàn chuỗi F&B.</p>
                <div className="pt-1">
                  <span className="text-3xl font-bold text-amber-700 tabular-nums">500.000đ</span>
                  <span className="text-xs text-zinc-500 ml-1">/ tháng</span>
                </div>
                <hr className="border-zinc-100" />
                <ul className="space-y-2 text-xs text-zinc-600">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Thanh toán VietQR động tự động nhận tiền</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Quản lý chuỗi nhiều chi nhánh (Multi-Branch)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Menu, giá bán & tài khoản ngân hàng riêng từng quán</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Báo cáo hợp nhất doanh thu toàn hệ thống</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" /> Ưu tiên hỗ trợ kỹ thuật trực tiếp 24/7</li>
                </ul>
              </div>
              <Link href="/dang-ky" className="mt-6">
                <Button variant="outline" className="w-full text-xs font-medium h-9">
                  Trải nghiệm đầy đủ
                </Button>
              </Link>
            </Card>
          </div>

          {/* Ưu đãi máy in */}
          <div className="p-5 sm:p-6 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center shrink-0">
                <Printer className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-900">
                  Ưu đãi phần cứng: Tặng Máy In Hóa Đơn Nhiệt 80mm khi đăng ký gói trả phí
                </h3>
                <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed">
                  Áp dụng khi đăng ký gói <strong>Tiêu chuẩn</strong> hoặc <strong>Nâng cao</strong>. Máy in khổ 80mm chuẩn ESC/POS, tốc độ in 200mm/s, tự động cắt giấy, cắm là chạy.
                </p>
              </div>
            </div>

            <Link href="/dang-ky" className="shrink-0 w-full md:w-auto">
              <Button variant="primary" size="md" className="w-full md:w-auto text-xs font-medium h-9 px-4">
                Nhận ưu đãi máy in <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 8: PHÂN QUYỀN RBAC (ID="ROLES")
       * ========================================================================= */}
      <section id="roles" className="py-16 sm:py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">
              Phân quyền chặt chẽ
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Phân quyền 5 cấp độ bảo mật nghiêm ngặt
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              Đảm bảo đúng người, đúng việc và ngăn chặn thất thoát dữ liệu ở từng chi nhánh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2 text-center">
              <div className="w-9 h-9 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center mx-auto">
                <Zap className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Quản trị hệ thống</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Kiểm soát toàn bộ nền tảng, quản lý tài nguyên và cấu hình bảo mật toàn cục.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2 text-center">
              <div className="w-9 h-9 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center mx-auto">
                <Building2 className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Quản trị chuỗi HQ</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Theo dõi chỉ số toàn chuỗi, điều phối danh mục thực đơn và xem báo cáo hợp nhất.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2 text-center">
              <div className="w-9 h-9 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center mx-auto">
                <Store className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Quản lý chi nhánh</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Quản trị thực đơn, giá bán, bàn ăn và tài khoản ngân hàng nhận tiền riêng của cơ sở.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2 text-center">
              <div className="w-9 h-9 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center mx-auto">
                <UserCheck className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Thu ngân & Phục vụ POS</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Vận hành sơ đồ bàn, duyệt đợt gọi món QR, gộp/chuyển bàn và in phiếu tính tiền.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2 text-center">
              <div className="w-9 h-9 rounded-md bg-white border border-zinc-200 text-zinc-800 grid place-items-center mx-auto">
                <Users className="w-4 h-4 stroke-[1.5]" />
              </div>
              <h3 className="text-xs font-semibold text-zinc-900">Đầu bếp KDS</h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Xem vé bếp theo thứ tự gọi món FIFO, đánh dấu món hoàn thành và báo hết hàng (86).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 9: KIẾN THỨC VẬN HÀNH & HỢP TÁC KINH DOANH (BENTO)
       * ========================================================================= */}
      <section className="py-16 bg-zinc-50/50 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">
              Tài nguyên & Hợp tác
            </span>
            <h2 className="text-2xl font-bold text-zinc-950 tracking-tight">
              Kiến thức vận hành thực chiến & Cơ hội hợp tác
            </h2>
            <p className="text-xs text-zinc-600">
              Giải pháp quản trị bài bản cho chủ quán F&B và chính sách thu nhập hấp dẫn cho đối tác phát triển thị trường.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Card 1: Cẩm nang */}
            <div className="p-6 rounded-lg bg-white border border-zinc-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-900">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-700 stroke-[1.5]" />
                    Dành Cho Chủ Quán F&B
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">2026</span>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                  Cẩm nang & Kiến thức vận hành F&B thực chiến
                </h3>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  Cách tính giá vốn (Food Cost), ghi sổ doanh thu bỏ thuế khoán 2026, chống nhân viên &ldquo;đá bill&rdquo;, thất thoát nguyên liệu và tối ưu quy trình gọi món QR tại bàn.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-zinc-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                    <span>Quản trị Food Cost</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                    <span>Chống thất thoát bill</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                    <span>Bếp FIFO không tắc nghẽn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                    <span>Kinh nghiệm marketing quán</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/kien-thuc">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                    Đọc cẩm nang chủ quán <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 2: Tuyển dụng */}
            <div className="p-6 rounded-lg bg-white border border-zinc-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900">
                    <Briefcase className="w-3.5 h-3.5 text-amber-700 stroke-[1.5]" />
                    Cơ Hội Hợp Tác & Tuyển Dụng
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Hoa hồng 50%
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                  Tuyển Nhân viên Kinh doanh & Đối tác Thị trường
                </h3>

                <p className="text-xs text-zinc-600 leading-relaxed">
                  Làm việc linh hoạt toàn quốc, nhận ngay <strong>50% phí triển khai (tối thiểu 500K/quán)</strong> cùng <strong>20% hoa hồng duy trì hằng năm</strong> cho mỗi khách hàng tái ký.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-zinc-700 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                    <span>Hoa hồng 50% thanh toán nhanh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                    <span>20% doanh thu tái ký hằng năm</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                    <span>Chủ động thời gian toàn quốc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                    <span>Hỗ trợ tài liệu & đào tạo bài bản</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/tuyen-dung-nhan-vien-kinh-doanh">
                  <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                    Xem chính sách thu nhập & Ứng tuyển <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
       * PHÂN KHU 10: FAQ & CTA CHÂN TRANG
       * ========================================================================= */}
      <section id="faq" className="py-16 sm:py-20 bg-white border-b border-zinc-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-semibold text-emerald-700 tracking-wider uppercase">
              Giải đáp thắc mắc
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-950 tracking-tight">
              Câu hỏi thường gặp của chủ quán
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Những điều các chủ nhà hàng, quán ăn và cà phê quan tâm nhất khi chuyển đổi sang iMenu.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-lg border border-zinc-200 bg-white overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-900 hover:text-emerald-800 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 stroke-[1.5] flex-shrink-0 transition-transform duration-150 ${
                        isOpen ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3 animate-fadeIn font-normal">
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
      <section className="py-16 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-lg bg-zinc-900 text-white border border-zinc-800 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Miễn phí 0đ trọn đời gói Cơ bản
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Sẵn sàng để nhà hàng vận hành nhẹ nhàng hơn?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Đăng ký ngay hôm nay để trải nghiệm miễn phí toàn bộ tính năng cao cấp trong 1 tháng. Không cần thẻ tín dụng, đưa vào phục vụ khách chỉ sau 5 phút.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <Link href="/dang-ky" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full whitespace-nowrap h-10 px-5 text-sm font-medium"
                >
                  Tạo quán ngay bây giờ <ArrowRight className="w-4 h-4 ml-1.5 stroke-[1.5]" />
                </Button>
              </Link>
              <Link href="/huong-dan" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full whitespace-nowrap h-10 px-4 text-sm font-medium bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700"
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
