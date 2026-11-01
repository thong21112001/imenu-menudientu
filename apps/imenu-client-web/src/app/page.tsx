'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  HeroSystemPreview,
  InteractiveTableMenuSimulator,
} from '../components/InteractiveShowcases';
import {
  Button,
  Card,
  Badge,
  CinematicSection,
  CinematicScrollProgress,
  AmbientCinematicStage,
  Tilt3DCard,
} from '@imenu/ui';
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
  Printer,
  ChevronDown,
  Check,
  Laptop,
  RotateCw,
  BookOpen,
  Briefcase,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scenes = [
    { id: 'hero', label: 'Mở màn', badge: 'CẢNH 01' },
    { id: 'ecosystem', label: 'Hệ sinh thái', badge: 'CẢNH 02' },
    { id: 'takeaway', label: 'Mang đi & Online', badge: 'CẢNH 03' },
    { id: 'features', label: 'Tính năng', badge: 'CẢNH 04' },
    { id: 'workflow', label: 'Trải nghiệm tại bàn', badge: 'CẢNH 05' },
    { id: 'comparison', label: 'So sánh', badge: 'CẢNH 06' },
    { id: 'pricing', label: 'Bảng giá', badge: 'CẢNH 07' },
    { id: 'roles', label: 'Phân quyền RBAC', badge: 'CẢNH 08' },
    { id: 'knowledge', label: 'Kiến thức & Hợp tác', badge: 'CẢNH 09' },
    { id: 'faq', label: 'Hỏi đáp & Mở quán', badge: 'CẢNH 10' },
  ];

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
    <div className="relative min-h-screen bg-[#0d1310] text-[#ede7da] selection:bg-[#dfa035]/25 selection:text-[#ede7da]">
      {/* 3D Motion Primitives: Scroll Progress HUD & Ambient Lighting */}
      <CinematicScrollProgress scenes={scenes} />
      <AmbientCinematicStage variant="dark" />

      <Header />

      {/* =========================================================================
       * CẢNH 01: HERO SECTION & ĐỊNH VỊ GIẢI PHÁP
       * ========================================================================= */}
      <CinematicSection
        id="hero"
        sceneBadge="CẢNH 01 · KHAI MÀN"
        sceneTitle="Nền Tảng Vận Hành F&B Chiều Sâu 3D"
        sceneSubtitle="Tự động đồng bộ Realtime từ bàn ăn, gian bếp đến máy thu ngân"
        className="pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#151f1b] border border-[#2b3a32] text-xs font-semibold text-[#ede7da] shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#34a87a] animate-pulse" />
                <span className="text-[#dfa035] font-mono">2026</span>
                <span className="text-[#7d8c83]">|</span>
                <span>Nền tảng số hóa F&B cho Nhà hàng & Quán Việt</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#f5f1e8] tracking-tight leading-[1.12]">
                Vận hành nhanh gọn, <br />
                <span className="text-[#34a87a]">phục vụ trọn vẹn.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#98a69e] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Giải pháp toàn diện giúp khách chủ động quét mã QR gọi món tại bàn hoặc đặt mang đi, đơn tự động đồng bộ vào màn hình bếp KDS và thanh toán VietQR Napas 247 tức thì.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/dang-ky">
                  <Button variant="primary" size="lg" className="h-11 px-6 text-sm font-semibold bg-[#dfa035] hover:bg-[#c98a22] text-[#0d1310] border-none shadow-lg shadow-[#dfa035]/20">
                    Sử dụng miễn phí 0đ <ArrowRight className="w-4 h-4 ml-2 stroke-[2]" />
                  </Button>
                </Link>

                <Link href="/#workflow">
                  <Button variant="outline" size="lg" className="h-11 px-5 text-sm font-medium bg-[#151f1b]/80 border-[#2a3a32] text-[#ede7da] hover:bg-[#1a2621]">
                    Xem cách hoạt động
                  </Button>
                </Link>

                <Link href="/huong-dan">
                  <Button variant="outline" size="lg" className="h-11 px-4 text-sm font-medium border-[#34a87a]/40 text-[#48c792] hover:bg-[#34a87a]/10">
                    <BookOpen className="w-4 h-4 mr-2 stroke-[1.5] text-[#34a87a]" /> Hướng dẫn 7 bước
                  </Button>
                </Link>
              </div>

              {/* 3 Cam kết */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-3 text-xs font-medium text-[#8d9c93]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] flex-shrink-0 stroke-[1.5]" />
                  <span>Không cần thẻ ngân hàng</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] flex-shrink-0 stroke-[1.5]" />
                  <span>Thiết lập trong 5 phút</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#34a87a] flex-shrink-0 stroke-[1.5]" />
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
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 02: HỆ SINH THÁI ĐỒNG BỘ THỜI GIAN THỰC
       * ========================================================================= */}
      <CinematicSection
        id="ecosystem"
        sceneBadge="CẢNH 02 · HỆ SINH THÁI"
        sceneTitle="iMenu là gì? Hệ sinh thái F&B trên nền tảng đám mây"
        sceneSubtitle="Kết nối 5 mắt xích cốt lõi: Thực đơn QR, POS tại bàn, Bếp KDS, VietQR và Báo cáo Realtime"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* 3 Thẻ Giá Trị Cốt Lõi với 3D Tilt */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Tilt3DCard glareColor="rgba(52, 168, 122, 0.16)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3.5 h-full flex flex-col justify-between hover:border-[#34a87a]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#18241f] border border-[#2d3d34] text-[#ede7da] grid place-items-center shadow-inner">
                    <Laptop className="w-5 h-5 stroke-[1.5] text-[#34a87a]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">
                    Không cần phần cứng chuyên dụng
                  </h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Tận dụng tối đa điện thoại cá nhân, máy tính bảng hoặc laptop có sẵn. Khách hàng dùng ngay camera/Zalo, không bắt tải app hay tốn dung lượng bộ nhớ.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-[#34a87a] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34a87a]" /> 100% Web Cloud
                </div>
              </div>
            </Tilt3DCard>

            <Tilt3DCard glareColor="rgba(223, 160, 53, 0.16)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3.5 h-full flex flex-col justify-between hover:border-[#dfa035]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#18241f] border border-[#2d3d34] text-[#ede7da] grid place-items-center shadow-inner">
                    <RotateCw className="w-5 h-5 stroke-[1.5] text-[#dfa035]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">
                    Vận hành đồng bộ thời gian thực
                  </h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Khách gọi món tại bàn, máy thu ngân phát chuông thông báo, bếp nhận phiếu chế biến theo chuẩn FIFO và khách thanh toán VietQR — toàn bộ khớp lệnh tức thì qua WebSocket.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-[#dfa035] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#dfa035]" /> Realtime WebSocket Hub
                </div>
              </div>
            </Tilt3DCard>

            <Tilt3DCard glareColor="rgba(200, 90, 50, 0.16)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3.5 h-full flex flex-col justify-between hover:border-[#c85a32]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#18241f] border border-[#2d3d34] text-[#ede7da] grid place-items-center shadow-inner">
                    <ShieldCheck className="w-5 h-5 stroke-[1.5] text-[#c85a32]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">
                    Miễn phí lâu dài ở gói Cơ bản 0đ
                  </h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Cam kết hỗ trợ các chủ quán ăn, quán cà phê Việt chuyển đổi số với gói Cơ bản 0đ vĩnh viễn, không ép buộc nâng cấp, an tâm mở rộng kinh doanh mà không lo gánh nặng chi phí.
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-mono text-[#c85a32] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c85a32]" /> Không thẻ ngân hàng
                </div>
              </div>
            </Tilt3DCard>
          </div>

          {/* Dải thương hiệu tin dùng */}
          <div className="pt-4 border-t border-[#1e2a24] flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[#718077] text-xs font-medium">
            <span className="text-[#ede7da] font-semibold">Quán Việt tin dùng:</span>
            <span className="hover:text-[#ede7da] transition-colors">Bếp Nhà Restaurant</span>
            <span className="hover:text-[#ede7da] transition-colors">Coffee Anh Hiền</span>
            <span className="hover:text-[#ede7da] transition-colors">Mộc Quán Bistro</span>
            <span className="hover:text-[#ede7da] transition-colors">An Nhiên Tea & Coffee</span>
            <span className="hover:text-[#ede7da] transition-colors">Phở Vương Hà Nội</span>
          </div>
        </div>
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 03: BÁN MANG ĐI & ĐẶT TRƯỚC ONLINE (ID="TAKEAWAY")
       * ========================================================================= */}
      <CinematicSection
        id="takeaway"
        sceneBadge="CẢNH 03 · MANG ĐI & ONLINE"
        sceneTitle="Tiền Về Trước, Món Làm Sau. Chấm Dứt Nỗi Lo Bom Hàng"
        sceneSubtitle="Tự động sinh mã VietQR Napas 247 chính xác từng đồng, tiền vào tài khoản mới chuyển lệnh chế biến"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Cột trái: 3 bước */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b1e18] border border-[#3b3420] text-xs font-semibold text-[#e8c67c]">
                <ShoppingBag className="w-3.5 h-3.5 text-[#dfa035] stroke-[1.5]" />
                Kênh Bán Mang Đi & Đặt Trước Online
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f1e8] tracking-tight leading-snug">
                Tiền về trước, món làm sau. <br />
                <span className="text-[#dfa035] font-semibold">Chấm dứt nỗi lo bom hàng.</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#98a69e] leading-relaxed">
                Chấm dứt hoàn toàn tình trạng khách nhắn tin gọi món qua Zalo, Messenger làm nhân viên rối loạn giờ cao điểm, quên đơn hoặc bị bom hàng. Quy trình 3 bước tự động hóa khép kín:
              </p>

              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3.5 p-3 rounded-lg bg-[#131c18]/80 border border-[#223129]">
                  <div className="w-7 h-7 rounded bg-[#18231e] border border-[#2b3a32] text-[#dfa035] grid place-items-center shrink-0 font-mono text-xs font-bold">
                    01
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#ede7da]">Mã QR & Link Menu không gắn bàn</h4>
                    <p className="text-xs text-[#8e9d94] mt-0.5 leading-relaxed">
                      Chia sẻ đường link lên Zalo OA, Fanpage Facebook, Bio TikTok hoặc in standee trước cửa quán. Khách tự xem thực đơn mọi lúc.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-lg bg-[#131c18]/80 border border-[#223129]">
                  <div className="w-7 h-7 rounded bg-[#18231e] border border-[#2b3a32] text-[#dfa035] grid place-items-center shrink-0 font-mono text-xs font-bold">
                    02
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#ede7da]">Khách chọn giờ lấy & Thanh toán VietQR trước</h4>
                    <p className="text-xs text-[#8e9d94] mt-0.5 leading-relaxed">
                      Hệ thống tự động sinh mã VietQR Napas 247 chính xác từng đồng kèm nội dung đơn hàng. Khách quét chuyển khoản ngay từ app ngân hàng.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-lg bg-[#131c18]/80 border border-[#223129]">
                  <div className="w-7 h-7 rounded bg-[#18231e] border border-[#2b3a32] text-[#dfa035] grid place-items-center shrink-0 font-mono text-xs font-bold">
                    03
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-[#ede7da]">Đơn đã thanh toán tự chuyển thẳng vào Bếp</h4>
                    <p className="text-xs text-[#8e9d94] mt-0.5 leading-relaxed">
                      Quán chỉ bắt đầu chế biến khi đã chắc chắn nhận đủ tiền vào tài khoản, hoàn toàn xóa bỏ nỗi lo khách đặt rồi không đến lấy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/dang-ky">
                  <Button variant="primary" size="md" className="h-10 px-5 text-xs font-semibold bg-[#dfa035] text-[#0d1310] border-none hover:bg-[#c98a22]">
                    Kích hoạt kênh mang đi miễn phí ngay <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[2]" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cột phải: Mô phỏng đơn Takeaway trong 3D Tilt Card */}
            <div className="lg:col-span-6">
              <Tilt3DCard glareColor="rgba(223, 160, 53, 0.18)">
                <div className="p-6 bg-[#131c18] rounded-xl border border-[#26352e] shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#212e27] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#34a87a] animate-pulse" />
                      <span className="font-semibold text-[#ede7da]">
                        Mô phỏng đơn hàng mang đi thời gian thực
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-[#dfa035] bg-[#dfa035]/15 px-2.5 py-0.5 rounded border border-[#dfa035]/30">
                      Kênh Takeaway
                    </span>
                  </div>

                  {/* Thẻ đơn hàng warm dark */}
                  <div className="p-4 rounded-lg bg-[#0d1310] text-[#ede7da] space-y-3 border border-[#212d27]">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-[#8a9990] block font-medium">
                          ĐƠN MANG ĐI #TW-108
                        </span>
                        <h4 className="text-xs font-semibold text-[#f5f1e8] mt-0.5">
                          Khách: Anh Minh Hoàng (0912.888.xxx)
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-[#8a9990] block">Giờ hẹn lấy</span>
                        <span className="text-xs font-medium text-[#dfa035] font-mono tabular-nums">
                          Sau 15 phút (11:45)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 py-2.5 border-t border-b border-[#212d27] text-xs">
                      <div className="flex justify-between items-center text-[#c5cfc9]">
                        <span>2x Cơm Gà Xối Mỡ Da Giòn</span>
                        <span className="font-mono text-[#f5f1e8] tabular-nums font-medium">110.000₫</span>
                      </div>
                      <div className="flex justify-between items-center text-[#c5cfc9]">
                        <span>2x Trà Đào Cam Sả (Ít ngọt)</span>
                        <span className="font-mono text-[#f5f1e8] tabular-nums font-medium">55.000₫</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <div>
                        <span className="text-[10px] text-[#8a9990] block">Trạng thái thanh toán</span>
                        <span className="text-[#34a87a] font-medium flex items-center gap-1.5 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#34a87a] stroke-[1.5]" />
                          Đã thanh toán VietQR (165.000₫)
                        </span>
                      </div>
                      <span className="text-xs font-medium text-[#ede7da] bg-[#18241f] px-2.5 py-1 rounded border border-[#2b3a32]">
                        Tự động vào Bếp KDS
                      </span>
                    </div>
                  </div>

                  {/* 0% Phí chiết khấu */}
                  <div className="p-3.5 rounded-lg bg-[#14231b] border border-[#274635] text-xs text-[#a2d8b8] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-[#34a87a] text-[#0d1310] font-mono font-bold text-[11px]">
                        0%
                      </span>
                      <div>
                        <strong className="block font-semibold text-[#e1f5eb]">Không mất 25% – 30% phí chiết khấu</strong>
                        <span className="text-[11px] text-[#8dc7a7]">Quán nhận trọn 100% doanh thu trực tiếp từ khách.</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#34a87a] whitespace-nowrap">Tiết kiệm tối đa</span>
                  </div>
                </div>
              </Tilt3DCard>
            </div>
          </div>
        </div>
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 04: TẤT CẢ TRONG MỘT (ID="FEATURES")
       * ========================================================================= */}
      <CinematicSection
        id="features"
        sceneBadge="CẢNH 04 · TẤT CẢ TRONG MỘT"
        sceneTitle="Một Nhịp Vận Hành Liền Mạch, Từ Bàn Ăn Đến Gian Bếp"
        sceneSubtitle="6 phân hệ cốt lõi liên kết chặt chẽ giúp nhân viên giảm thao tác thủ công, đầu bếp không bị sót vé"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Thẻ 1 */}
            <Tilt3DCard glareColor="rgba(52, 168, 122, 0.15)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-4 flex flex-col justify-between h-full hover:border-[#34a87a]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#19241f] text-[#34a87a] grid place-items-center border border-[#2b3a32]">
                    <UtensilsCrossed className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">Thực đơn điện tử đa biến thể</h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Thiết lập danh mục linh hoạt, quản lý biến thể (Size L/M, Đường/Đá, Topping) và bật tắt trạng thái hết món (86) tức thì.
                  </p>
                </div>
                <Link href="/huong-dan" className="text-xs font-medium text-[#34a87a] hover:text-[#48c792] flex items-center gap-1 pt-2">
                  Khám phá tính năng <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
            </Tilt3DCard>

            {/* Thẻ 2 */}
            <Tilt3DCard glareColor="rgba(223, 160, 53, 0.15)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-4 flex flex-col justify-between h-full hover:border-[#dfa035]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#19241f] text-[#dfa035] grid place-items-center border border-[#2b3a32]">
                    <QrCode className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">Order bằng mã QR tại bàn</h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Khách quét camera điện thoại để tự xem menu và gửi đơn theo từng đợt (Rounds). Tích hợp nút gọi nhân viên và gọi thanh toán.
                  </p>
                </div>
                <Link href="/huong-dan" className="text-xs font-medium text-[#dfa035] hover:text-[#f0b54e] flex items-center gap-1 pt-2">
                  Xem quy trình tại bàn <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
            </Tilt3DCard>

            {/* Thẻ 3 */}
            <Tilt3DCard glareColor="rgba(52, 168, 122, 0.15)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-4 flex flex-col justify-between h-full hover:border-[#34a87a]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#19241f] text-[#34a87a] grid place-items-center border border-[#2b3a32]">
                    <Smartphone className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">POS phục vụ & Chuyển bàn</h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Sơ đồ bàn trực quan theo tầng/khu vực. Hỗ trợ thu ngân duyệt đợt gọi món QR của khách, chuyển bàn, gộp bàn an toàn.
                  </p>
                </div>
                <Link href="/dang-ky" className="text-xs font-medium text-[#34a87a] hover:text-[#48c792] flex items-center gap-1 pt-2">
                  Trải nghiệm miễn phí <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
            </Tilt3DCard>

            {/* Thẻ 4 */}
            <Tilt3DCard glareColor="rgba(200, 90, 50, 0.15)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-4 flex flex-col justify-between h-full hover:border-[#c85a32]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#19241f] text-[#c85a32] grid place-items-center border border-[#2b3a32]">
                    <ChefHat className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">Màn hình Bếp KDS chuẩn FIFO</h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Giao diện tối ưu công nghiệp, tự động phân luồng đơn vào trước ra trước, đếm ngược SLA và chuông báo khi món nấu xong.
                  </p>
                </div>
                <Link href="/huong-dan" className="text-xs font-medium text-[#c85a32] hover:text-[#e0724a] flex items-center gap-1 pt-2">
                  Xem quy trình bếp KDS <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
            </Tilt3DCard>

            {/* Thẻ 5 */}
            <Tilt3DCard glareColor="rgba(223, 160, 53, 0.15)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-4 flex flex-col justify-between h-full hover:border-[#dfa035]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#19241f] text-[#dfa035] grid place-items-center border border-[#2b3a32]">
                    <Receipt className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">Thanh toán VietQR & In nhiệt 80mm</h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Sinh mã VietQR động chuẩn Napas 247 đúng số tiền từng hóa đơn. In phiếu tạm tính chuẩn máy in nhiệt 80mm (ESC/POS) qua LAN/Bluetooth.
                  </p>
                </div>
                <Link href="/#pricing" className="text-xs font-medium text-[#dfa035] hover:text-[#f0b54e] flex items-center gap-1 pt-2">
                  Xem ưu đãi máy in <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
            </Tilt3DCard>

            {/* Thẻ 6 */}
            <Tilt3DCard glareColor="rgba(52, 168, 122, 0.15)">
              <div className="p-6 rounded-xl bg-[#131c18] border border-[#24332b] space-y-4 flex flex-col justify-between h-full hover:border-[#34a87a]/40 transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#19241f] text-[#34a87a] grid place-items-center border border-[#2b3a32]">
                    <TrendingUp className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">Báo cáo doanh thu & Đa chi nhánh</h3>
                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Theo dõi biểu đồ doanh thu theo giờ, phân tích top món bán chạy, quản lý danh sách đơn đã thanh toán và so sánh hiệu quả giữa các cơ sở.
                  </p>
                </div>
                <Link href="/dang-ky" className="text-xs font-medium text-[#34a87a] hover:text-[#48c792] flex items-center gap-1 pt-2">
                  Bắt đầu theo dõi doanh thu <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
                </Link>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 05: TRẢI NGHIỆM TẠI BÀN (ID="WORKFLOW")
       * ========================================================================= */}
      <CinematicSection
        id="workflow"
        sceneBadge="CẢNH 05 · TRẢI NGHIỆM TẠI BÀN"
        sceneTitle="Khách Chủ Động Chọn Món. Nhân Viên Thảnh Thơi Phục Vụ"
        sceneSubtitle="Quy trình 4 bước khép kín giúp quán vận hành nhẹ nhàng, giảm tối đa nhầm lẫn món và gia tăng tốc độ quay vòng bàn"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* 4 Bước Quy Trình */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#19241f] text-[#dfa035] font-mono text-xs font-bold grid place-items-center border border-[#2a3830]">
                01
              </div>
              <h3 className="text-xs font-semibold text-[#f5f1e8]">Quét mã & Chọn món</h3>
              <p className="text-xs text-[#8e9d94] leading-relaxed">
                Mỗi bàn ăn có mã QR riêng biệt. Khách quét camera xem menu, chọn size, topping, thêm ghi chú và gửi order.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#19241f] text-[#dfa035] font-mono text-xs font-bold grid place-items-center border border-[#2a3830]">
                02
              </div>
              <h3 className="text-xs font-semibold text-[#f5f1e8]">Nhân viên xác nhận</h3>
              <p className="text-xs text-[#8e9d94] leading-relaxed">
                Chuông thông báo reo trên POS thu ngân; nhân viên đối soát nhanh và bấm duyệt để đơn được chuyển sang bếp.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#19241f] text-[#dfa035] font-mono text-xs font-bold grid place-items-center border border-[#2a3830]">
                03
              </div>
              <h3 className="text-xs font-semibold text-[#f5f1e8]">Bếp chuẩn bị & Phục vụ</h3>
              <p className="text-xs text-[#8e9d94] leading-relaxed">
                Màn hình KDS hiển thị món theo thứ tự FIFO; đầu bếp hoàn thành bấm báo xong để phục vụ mang ra bàn cho khách.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#19241f] text-[#dfa035] font-mono text-xs font-bold grid place-items-center border border-[#2a3830]">
                04
              </div>
              <h3 className="text-xs font-semibold text-[#f5f1e8]">Tạm tính & Thanh toán VietQR</h3>
              <p className="text-xs text-[#8e9d94] leading-relaxed">
                Khách tự xem phiếu tạm tính trên điện thoại, quét mã VietQR chuyển khoản chính xác từng đồng hoặc gọi thu ngân.
              </p>
            </div>
          </div>

          <div className="text-center pt-1">
            <Link href="/huong-dan">
              <Button variant="secondary" size="md" className="h-10 px-5 text-xs font-semibold bg-[#18241f] text-[#ede7da] border border-[#2a3931] hover:bg-[#202e27]">
                Xem cẩm nang vận hành chi tiết 7 bước <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
              </Button>
            </Link>
          </div>

          {/* InteractiveTableMenuSimulator */}
          <div className="pt-4">
            <InteractiveTableMenuSimulator />
          </div>
        </div>
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 06: BẢNG SO SÁNH (ID="COMPARISON")
       * ========================================================================= */}
      <CinematicSection
        id="comparison"
        sceneBadge="CẢNH 06 · BẢNG SO SÁNH"
        sceneTitle="iMenu Cloud vs. Phần Mềm POS Truyền Thống"
        sceneSubtitle="Những khác biệt mang tính quyết định giúp nhà hàng tinh gọn chi phí và tăng tốc phục vụ"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Bảng so sánh warm dark studio */}
          <div className="overflow-x-auto rounded-xl border border-[#26352e] bg-[#121b17] shadow-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#24332b] bg-[#16221d]">
                  <th className="p-4 font-semibold text-[#ede7da] w-1/3">Tiêu chí vận hành</th>
                  <th className="p-4 font-semibold text-[#8a9990] w-1/3">POS truyền thống & Menu giấy</th>
                  <th className="p-4 font-semibold text-[#34a87a] bg-[#172b22] w-1/3 border-l border-[#294235]">
                    Nền tảng iMenu Cloud
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a23] text-[#c5cfc9]">
                <tr>
                  <td className="p-4 font-medium text-[#f5f1e8]">Thiết bị & Phần cứng</td>
                  <td className="p-4 text-[#8a9990]">
                    Bắt buộc mua máy POS cảm ứng chuyên dụng (8–15 triệu đồng/máy).
                  </td>
                  <td className="p-4 font-medium text-[#e1f5eb] bg-[#172b22]/60 border-l border-[#294235]">
                    Tận dụng ngay điện thoại, tablet, laptop sẵn có của quán (Chi phí thiết bị 0đ).
                  </td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-[#f5f1e8]">Khách quét QR tự gọi món</td>
                  <td className="p-4 text-[#8a9990]">
                    Thường tính thêm phí module riêng hoặc không có tính năng gọi món đa đợt (Rounds).
                  </td>
                  <td className="p-4 font-medium text-[#e1f5eb] bg-[#172b22]/60 border-l border-[#294235]">
                    Tích hợp sẵn; quét camera là vào menu ngay, không cần cài đặt thêm app.
                  </td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-[#f5f1e8]">Màn hình Bếp KDS & Báo hết món (86)</td>
                  <td className="p-4 text-[#8a9990]">
                    Phụ thuộc máy in phiếu giấy dễ kẹt; báo hết món chậm trễ gây bực bội.
                  </td>
                  <td className="p-4 font-medium text-[#e1f5eb] bg-[#172b22]/60 border-l border-[#294235]">
                    Đồng bộ thời gian thực qua WebSocket; 1 chạm ẩn món hết hàng trên toàn hệ thống.
                  </td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-[#f5f1e8]">Thanh toán VietQR động</td>
                  <td className="p-4 text-[#8a9990]">
                    Dán mã QR tĩnh, khách phải tự gõ số tiền và nội dung, dễ thừa thiếu hoặc nhầm lẫn.
                  </td>
                  <td className="p-4 font-medium text-[#e1f5eb] bg-[#172b22]/60 border-l border-[#294235]">
                    Tự động tạo mã VietQR Napas 247 khớp đúng số tiền của từng bàn và chi nhánh.
                  </td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-[#f5f1e8]">Thời gian làm quen của nhân viên</td>
                  <td className="p-4 text-[#8a9990]">
                    Giao diện nhiều tầng lớp phức tạp, mất 2–3 ngày đào tạo khi có nhân viên mới.
                  </td>
                  <td className="p-4 font-medium text-[#e1f5eb] bg-[#172b22]/60 border-l border-[#294235]">
                    Giao diện tối giản trực quan, nhân viên nắm bắt và thành thạo chỉ trong 5 phút.
                  </td>
                </tr>

                <tr>
                  <td className="p-4 font-medium text-[#f5f1e8]">Gói miễn phí lâu dài</td>
                  <td className="p-4 text-[#8a9990]">
                    Chỉ cho dùng thử từ 7 đến 15 ngày rồi khóa tài khoản, ép mua hợp đồng dài hạn.
                  </td>
                  <td className="p-4 font-medium text-[#e1f5eb] bg-[#172b22]/60 border-l border-[#294235]">
                    Gói Cơ bản 0đ vĩnh viễn, không ép nâng cấp, dữ liệu bảo toàn 100%.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 07: BẢNG GIÁ LINH HOẠT (ID="PRICING")
       * ========================================================================= */}
      <CinematicSection
        id="pricing"
        sceneBadge="CẢNH 07 · BẢNG GIÁ LINH HOẠT"
        sceneTitle="Bắt Đầu Miễn Phí 0đ. Nâng Cấp Khi Quán Sẵn Sàng"
        sceneSubtitle="Mọi tài khoản tạo mới đều được tặng ngay 1 tháng trải nghiệm toàn bộ tính năng cao cấp"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gói 1: Cơ bản */}
            <Tilt3DCard glareColor="rgba(152, 166, 158, 0.12)">
              <div className="p-6 rounded-xl flex flex-col justify-between bg-[#131c18] border border-[#24332b] h-full">
                <div className="space-y-3.5">
                  <Badge variant="neutral">CƠ BẢN</Badge>
                  <h3 className="text-base font-bold text-[#f5f1e8]">Vận hành thiết yếu</h3>
                  <p className="text-xs text-[#8e9d94]">Dành cho quán ăn, quán nước nhỏ mới mở cần số hóa quy trình cơ bản.</p>
                  <div className="pt-1">
                    <span className="text-3xl font-bold text-[#f5f1e8] tabular-nums">0đ</span>
                    <span className="text-xs text-[#8e9d94] ml-1">/ vĩnh viễn</span>
                  </div>
                  <hr className="border-[#212e27]" />
                  <ul className="space-y-2 text-xs text-[#c5cfc9]">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Quản lý danh mục & thực đơn món</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Nhân viên ghi order POS tại bàn</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Màn hình Bếp KDS cơ bản</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Sơ đồ quản lý bàn ăn & trạng thái</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> In phiếu tạm tính chuẩn 80mm</li>
                  </ul>
                </div>
                <Link href="/dang-ky" className="mt-6">
                  <Button variant="outline" className="w-full text-xs font-semibold h-10 bg-[#18241f] border-[#2b3a32] text-[#ede7da] hover:bg-[#202e27]">
                    Bắt đầu miễn phí 0đ
                  </Button>
                </Link>
              </div>
            </Tilt3DCard>

            {/* Gói 2: Tiêu chuẩn (Khuyên dùng) */}
            <Tilt3DCard glareColor="rgba(52, 168, 122, 0.22)">
              <div className="p-6 rounded-xl flex flex-col justify-between bg-[#15231c] border-2 border-[#34a87a] relative shadow-xl h-full">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand">TIÊU CHUẨN</Badge>
                    <span className="text-[10px] font-semibold text-[#34a87a] bg-[#34a87a]/15 px-2.5 py-0.5 rounded-full border border-[#34a87a]/40">
                      Khuyên dùng
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#f5f1e8]">Phục vụ thông minh</h3>
                  <p className="text-xs text-[#8e9d94]">Tự động hóa trải nghiệm gọi món, giảm bớt nhân lực chạy bàn.</p>
                  <div className="pt-1">
                    <span className="text-3xl font-bold text-[#34a87a] tabular-nums">250.000đ</span>
                    <span className="text-xs text-[#8e9d94] ml-1">/ tháng</span>
                  </div>
                  <hr className="border-[#274435]" />
                  <ul className="space-y-2 text-xs text-[#c5cfc9]">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Menu điện tử QR trên điện thoại khách</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Khách tự chọn món & gửi đơn nhiều đợt</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Kênh Bán mang đi & Đặt trước VietQR</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Đồng bộ Realtime Bàn - Bếp - Thu ngân</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2]" /> Phân quyền nhân viên theo ca trực</li>
                  </ul>
                </div>
                <Link href="/dang-ky" className="mt-6">
                  <Button variant="primary" className="w-full text-xs font-semibold h-10 bg-[#dfa035] text-[#0d1310] border-none hover:bg-[#c98a22]">
                    Dùng thử 1 tháng miễn phí
                  </Button>
                </Link>
              </div>
            </Tilt3DCard>

            {/* Gói 3: Nâng cao */}
            <Tilt3DCard glareColor="rgba(223, 160, 53, 0.2)">
              <div className="p-6 rounded-xl flex flex-col justify-between bg-[#131c18] border border-[#24332b] h-full">
                <div className="space-y-3.5">
                  <Badge variant="amber">NÂNG CAO</Badge>
                  <h3 className="text-base font-bold text-[#f5f1e8]">Quản trị chuỗi</h3>
                  <p className="text-xs text-[#8e9d94]">Kiểm soát tập trung và báo cáo doanh thu toàn chuỗi F&B.</p>
                  <div className="pt-1">
                    <span className="text-3xl font-bold text-[#dfa035] tabular-nums">500.000đ</span>
                    <span className="text-xs text-[#8e9d94] ml-1">/ tháng</span>
                  </div>
                  <hr className="border-[#212e27]" />
                  <ul className="space-y-2 text-xs text-[#c5cfc9]">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2]" /> Thanh toán VietQR động tự động nhận tiền</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2]" /> Quản lý chuỗi nhiều chi nhánh (Multi-Branch)</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2]" /> Menu, giá bán & tài khoản ngân hàng riêng từng quán</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2]" /> Báo cáo hợp nhất doanh thu toàn hệ thống</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2]" /> Ưu tiên hỗ trợ kỹ thuật trực tiếp 24/7</li>
                  </ul>
                </div>
                <Link href="/dang-ky" className="mt-6">
                  <Button variant="outline" className="w-full text-xs font-semibold h-10 bg-[#18241f] border-[#2b3a32] text-[#ede7da] hover:bg-[#202e27]">
                    Trải nghiệm đầy đủ
                  </Button>
                </Link>
              </div>
            </Tilt3DCard>
          </div>

          {/* Ưu đãi máy in */}
          <Tilt3DCard glareColor="rgba(223, 160, 53, 0.15)">
            <div className="p-6 rounded-xl bg-[#131c18] border border-[#2b3a32] flex flex-col md:flex-row items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#1a2620] border border-[#2d3f35] text-[#dfa035] grid place-items-center shrink-0">
                  <Printer className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-[#f5f1e8]">
                    Ưu đãi phần cứng: Tặng Máy In Hóa Đơn Nhiệt 80mm khi đăng ký gói trả phí
                  </h3>
                  <p className="text-xs text-[#98a69e] max-w-2xl leading-relaxed">
                    Áp dụng khi đăng ký gói <strong>Tiêu chuẩn</strong> hoặc <strong>Nâng cao</strong>. Máy in khổ 80mm chuẩn ESC/POS, tốc độ in 200mm/s, tự động cắt giấy, cắm là chạy.
                  </p>
                </div>
              </div>

              <Link href="/dang-ky" className="shrink-0 w-full md:w-auto">
                <Button variant="primary" size="md" className="w-full md:w-auto text-xs font-semibold h-10 px-5 bg-[#dfa035] text-[#0d1310] border-none hover:bg-[#c98a22]">
                  Nhận ưu đãi máy in <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[2]" />
                </Button>
              </Link>
            </div>
          </Tilt3DCard>
        </div>
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 08: PHÂN QUYỀN RBAC (ID="ROLES")
       * ========================================================================= */}
      <CinematicSection
        id="roles"
        sceneBadge="CẢNH 08 · PHÂN QUYỀN RBAC"
        sceneTitle="Phân Quyền 5 Cấp Độ Bảo Mật Nghiêm Ngặt"
        sceneSubtitle="Đảm bảo đúng người, đúng việc và ngăn chặn thất thoát dữ liệu ở từng chi nhánh"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Tilt3DCard glareColor="rgba(52, 168, 122, 0.15)">
              <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3 text-center h-full flex flex-col justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#19241f] border border-[#2d3e34] text-[#34a87a] grid place-items-center mx-auto">
                  <Zap className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#f5f1e8]">Quản trị hệ thống</h3>
                  <p className="text-[11px] text-[#8e9d94] leading-relaxed mt-1">
                    Kiểm soát toàn bộ nền tảng, quản lý tài nguyên và cấu hình bảo mật toàn cục.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[#34a87a]">SUPER ADMIN</div>
              </div>
            </Tilt3DCard>

            <Tilt3DCard glareColor="rgba(223, 160, 53, 0.15)">
              <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3 text-center h-full flex flex-col justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#19241f] border border-[#2d3e34] text-[#dfa035] grid place-items-center mx-auto">
                  <Building2 className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#f5f1e8]">Quản trị chuỗi HQ</h3>
                  <p className="text-[11px] text-[#8e9d94] leading-relaxed mt-1">
                    Theo dõi chỉ số toàn chuỗi, điều phối danh mục thực đơn và xem báo cáo hợp nhất.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[#dfa035]">CHAIN OWNER</div>
              </div>
            </Tilt3DCard>

            <Tilt3DCard glareColor="rgba(52, 168, 122, 0.15)">
              <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3 text-center h-full flex flex-col justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#19241f] border border-[#2d3e34] text-[#34a87a] grid place-items-center mx-auto">
                  <Store className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#f5f1e8]">Quản lý chi nhánh</h3>
                  <p className="text-[11px] text-[#8e9d94] leading-relaxed mt-1">
                    Quản trị thực đơn, giá bán, bàn ăn và tài khoản ngân hàng nhận tiền riêng của cơ sở.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[#34a87a]">BRANCH MGR</div>
              </div>
            </Tilt3DCard>

            <Tilt3DCard glareColor="rgba(223, 160, 53, 0.15)">
              <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3 text-center h-full flex flex-col justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#19241f] border border-[#2d3e34] text-[#dfa035] grid place-items-center mx-auto">
                  <UserCheck className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#f5f1e8]">Thu ngân & Phục vụ</h3>
                  <p className="text-[11px] text-[#8e9d94] leading-relaxed mt-1">
                    Vận hành sơ đồ bàn, duyệt đợt gọi món QR, gộp/chuyển bàn và in phiếu tính tiền.
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[#dfa035]">CASHIER / POS</div>
              </div>
            </Tilt3DCard>

            <Tilt3DCard glareColor="rgba(200, 90, 50, 0.15)">
              <div className="p-5 rounded-xl bg-[#131c18] border border-[#24332b] space-y-3 text-center h-full flex flex-col justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#19241f] border border-[#2d3e34] text-[#c85a32] grid place-items-center mx-auto">
                  <Users className="w-5 h-5 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#f5f1e8]">Đầu bếp KDS</h3>
                  <p className="text-[11px] text-[#8e9d94] leading-relaxed mt-1">
                    Xem vé bếp theo thứ tự gọi món FIFO, đánh dấu món hoàn thành và báo hết hàng (86).
                  </p>
                </div>
                <div className="text-[10px] font-mono text-[#c85a32]">KITCHEN KDS</div>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 09: KIẾN THỨC VẬN HÀNH & HỢP TÁC KINH DOANH (BENTO)
       * ========================================================================= */}
      <CinematicSection
        id="knowledge"
        sceneBadge="CẢNH 09 · KIẾN THỨC & HỢP TÁC"
        sceneTitle="Kiến Thức Vận Hành Thực Chiến & Cơ Hội Hợp Tác"
        sceneSubtitle="Giải pháp quản trị bài bản cho chủ quán F&B và chính sách thu nhập hấp dẫn cho đối tác phát triển thị trường"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Cẩm nang */}
            <Tilt3DCard glareColor="rgba(52, 168, 122, 0.18)">
              <div className="p-7 rounded-xl bg-[#131c18] border border-[#24332b] space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#182620] border border-[#274435] text-[11px] font-semibold text-[#34a87a]">
                      <BookOpen className="w-3.5 h-3.5 text-[#34a87a] stroke-[1.5]" />
                      Dành Cho Chủ Quán F&B
                    </span>
                    <span className="text-[11px] text-[#8a9990] font-mono">2026</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#f5f1e8] tracking-tight">
                    Cẩm nang & Kiến thức vận hành F&B thực chiến
                  </h3>

                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Cách tính giá vốn (Food Cost), ghi sổ doanh thu bỏ thuế khoán 2026, chống nhân viên &ldquo;đá bill&rdquo;, thất thoát nguyên liệu và tối ưu quy trình gọi món QR tại bàn.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs text-[#c5cfc9] font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2] shrink-0" />
                      <span>Quản trị Food Cost</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2] shrink-0" />
                      <span>Chống thất thoát bill</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2] shrink-0" />
                      <span>Bếp FIFO không tắc nghẽn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#34a87a] stroke-[2] shrink-0" />
                      <span>Kinh nghiệm marketing quán</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/kien-thuc">
                    <Button variant="outline" size="sm" className="h-9 text-xs font-semibold bg-[#18241f] border-[#2b3a32] text-[#ede7da] hover:bg-[#202e27]">
                      Đọc cẩm nang chủ quán <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Tilt3DCard>

            {/* Card 2: Tuyển dụng */}
            <Tilt3DCard glareColor="rgba(223, 160, 53, 0.18)">
              <div className="p-7 rounded-xl bg-[#131c18] border border-[#24332b] space-y-5 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#241e15] border border-[#3f321d] text-[11px] font-semibold text-[#dfa035]">
                      <Briefcase className="w-3.5 h-3.5 text-[#dfa035] stroke-[1.5]" />
                      Cơ Hội Hợp Tác & Tuyển Dụng
                    </span>
                    <span className="text-[11px] font-semibold text-[#34a87a] bg-[#34a87a]/15 border border-[#34a87a]/30 px-2.5 py-0.5 rounded-full">
                      Hoa hồng 50%
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#f5f1e8] tracking-tight">
                    Tuyển Nhân viên Kinh doanh & Đối tác Thị trường
                  </h3>

                  <p className="text-xs text-[#98a69e] leading-relaxed">
                    Làm việc linh hoạt toàn quốc, nhận ngay <strong>50% phí triển khai (tối thiểu 500K/quán)</strong> cùng <strong>20% hoa hồng duy trì hằng năm</strong> cho mỗi khách hàng tái ký.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs text-[#c5cfc9] font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2] shrink-0" />
                      <span>Hoa hồng 50% thanh toán nhanh</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2] shrink-0" />
                      <span>20% doanh thu tái ký hằng năm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2] shrink-0" />
                      <span>Chủ động thời gian toàn quốc</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#dfa035] stroke-[2] shrink-0" />
                      <span>Hỗ trợ tài liệu & đào tạo bài bản</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/tuyen-dung-nhan-vien-kinh-doanh">
                    <Button variant="outline" size="sm" className="h-9 text-xs font-semibold bg-[#18241f] border-[#2b3a32] text-[#ede7da] hover:bg-[#202e27]">
                      Xem chính sách thu nhập & Ứng tuyển <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Tilt3DCard>
          </div>
        </div>
      </CinematicSection>

      {/* =========================================================================
       * CẢNH 10: FAQ & CTA CHÂN TRANG (ID="FAQ")
       * ========================================================================= */}
      <CinematicSection
        id="faq"
        sceneBadge="CẢNH 10 · HỎI ĐÁP & MỞ QUÁN"
        sceneTitle="Câu Hỏi Thường Gặp Của Chủ Quán"
        sceneSubtitle="Những điều các chủ nhà hàng, quán ăn và cà phê quan tâm nhất khi chuyển đổi sang iMenu"
        className="py-16 sm:py-20 border-b border-[#23322b]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* FAQ Accordion warm dark */}
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#24332b] bg-[#131c18] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#f5f1e8] hover:text-[#dfa035] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#8a9990] stroke-[2] flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#dfa035]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-[#98a69e] leading-relaxed border-t border-[#1f2c24] pt-3.5 animate-fadeIn font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA Banner cuối trang trong Tilt3DCard */}
          <Tilt3DCard glareColor="rgba(223, 160, 53, 0.2)">
            <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-[#15231c] via-[#121c17] to-[#1a1c15] text-[#ede7da] border border-[#2b3e34] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#dfa035]">
                  <Sparkles className="w-3.5 h-3.5" /> Miễn phí 0đ trọn đời gói Cơ bản
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#f5f1e8] tracking-tight">
                  Sẵn sàng để nhà hàng vận hành nhẹ nhàng hơn?
                </h3>
                <p className="text-xs sm:text-sm text-[#98a69e] max-w-xl">
                  Đăng ký ngay hôm nay để trải nghiệm miễn phí toàn bộ tính năng cao cấp trong 1 tháng. Không cần thẻ tín dụng, đưa vào phục vụ khách chỉ sau 5 phút.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
                <Link href="/dang-ky" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full whitespace-nowrap h-11 px-6 text-sm font-semibold bg-[#dfa035] hover:bg-[#c98a22] text-[#0d1310] border-none shadow-lg shadow-[#dfa035]/20"
                  >
                    Tạo quán ngay bây giờ <ArrowRight className="w-4 h-4 ml-2 stroke-[2]" />
                  </Button>
                </Link>
                <Link href="/huong-dan" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full whitespace-nowrap h-11 px-5 text-sm font-medium bg-[#18241f] text-[#ede7da] border-[#2b3a32] hover:bg-[#202e27]"
                  >
                    Xem hướng dẫn 7 bước
                  </Button>
                </Link>
              </div>
            </div>
          </Tilt3DCard>
        </div>
      </CinematicSection>

      <Footer />
    </div>
  );
}
