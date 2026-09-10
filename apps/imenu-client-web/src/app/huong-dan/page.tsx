'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Button } from '@imenu/ui';
import {
  Layers,
  PlusCircle,
  QrCode,
  Smartphone,
  UserCheck,
  ChefHat,
  Receipt,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Lightbulb,
  Maximize2,
  X,
  PhoneCall,
  MessageSquare,
  BookOpen,
  ArrowUpRight,
  Clock,
  Laptop,
  Check,
  ChevronRight
} from 'lucide-react';

interface GuideStep {
  id: string;
  sectionNumber: '01' | '02';
  sectionTitle: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  badge: string;
  timeEstimate: string;
  actions: {
    title: string;
    desc: string;
  }[];
  proTip: string;
  imageSrc: string;
  imageAlt: string;
  deviceType: 'browser' | 'mobile';
  urlPath: string;
  ctaText: string;
  ctaUrl: string;
  tags: string[];
}

const GUIDE_STEPS: GuideStep[] = [
  // SECTION 01: Tạo menu nhà hàng
  {
    id: 'tao-danh-muc',
    sectionNumber: '01',
    sectionTitle: 'Tạo menu nhà hàng',
    stepNumber: '01',
    title: 'Tạo danh mục món ăn',
    shortDesc: 'Phân nhóm món rõ ràng giúp khách dễ dàng chọn món trên thực đơn điện tử.',
    badge: 'Bước 1 / 7',
    timeEstimate: '1 phút',
    actions: [
      {
        title: 'Truy cập Quản lý Thực đơn',
        desc: 'Vào trang Admin, chọn mục "Quản lý Thực đơn" trên thanh điều hướng bên trái.',
      },
      {
        title: 'Phân loại nhóm món khoa học',
        desc: 'Tổ chức các danh mục thực đơn như Khai vị, Món chính, Đồ uống, Tráng miệng kèm icon sinh động.',
      },
      {
        title: 'Kiểm tra hiển thị tức thì',
        desc: 'Danh mục sau khi lưu sẽ lập tức xuất hiện theo tab trên thực đơn quét mã QR của khách.',
      },
    ],
    proTip: 'Nên giới hạn từ 4 đến 6 danh mục chính để khách hàng không bị quá tải thông tin khi lướt trên điện thoại.',
    imageSrc: '/images/guide/01-tao-danh-muc.png',
    imageAlt: 'Giao diện quản lý danh mục và danh sách món ăn trên Admin iMenu',
    deviceType: 'browser',
    urlPath: 'admin.imenu.vn/menu',
    ctaText: 'Mở màn hình Quản lý Thực đơn',
    ctaUrl: 'http://localhost:3003/menu',
    tags: ['Danh mục', 'Thực đơn', 'Giao diện Admin'],
  },
  {
    id: 'them-mon-moi',
    sectionNumber: '01',
    sectionTitle: 'Tạo menu nhà hàng',
    stepNumber: '02',
    title: 'Thêm món mới & Định giá',
    shortDesc: 'Đăng tải món ăn kèm hình ảnh hấp dẫn, giá bán và cơ chế bật/tắt còn món 1 chạm.',
    badge: 'Bước 2 / 7',
    timeEstimate: '2 phút',
    actions: [
      {
        title: 'Bấm nút "Thêm món mới"',
        desc: 'Nhập tên món ăn đặc sắc, chọn đúng danh mục phân loại và nhập đơn giá niêm yết.',
      },
      {
        title: 'Thêm hình ảnh thực tế chất lượng',
        desc: 'Hình ảnh bắt mắt kích thích sức mua tăng đến 35% so với thực đơn giấy truyền thống.',
      },
      {
        title: 'Bật/Tắt còn món linh hoạt',
        desc: 'Khi hết nguyên liệu giữa ca, chỉ cần 1 chạm chuyển sang "Hết món" để khách không gọi nhầm.',
      },
    ],
    proTip: 'Tính năng Bật/Tắt còn món đồng bộ thời gian thực đến điện thoại của khách chỉ trong 0.1 giây qua WebSockets.',
    imageSrc: '/images/guide/02-them-mon-moi.png',
    imageAlt: 'Quản lý món ăn, giá tiền và trạng thái Còn món / Hết món trên iMenu',
    deviceType: 'browser',
    urlPath: 'admin.imenu.vn/menu',
    ctaText: 'Trải nghiệm thêm món mới',
    ctaUrl: 'http://localhost:3003/menu',
    tags: ['Thêm món', 'Giá bán', 'Bật/Tắt Còn món'],
  },
  {
    id: 'tao-ban-ma-qr',
    sectionNumber: '01',
    sectionTitle: 'Tạo menu nhà hàng',
    stepNumber: '03',
    title: 'Tạo bàn & In tem mã QR',
    shortDesc: 'Thiết lập sơ đồ khu vực nhà hàng và xuất file in Standee mica / Khung gỗ cho từng bàn.',
    badge: 'Bước 3 / 7',
    timeEstimate: '2 phút',
    actions: [
      {
        title: 'Khởi tạo sơ đồ bàn theo khu vực',
        desc: 'Phân loại theo Tầng 1, Tầng 2 máy lạnh, Sân vườn, Phòng VIP để phục vụ chính xác vị trí.',
      },
      {
        title: 'Tự động tạo mã QR định danh',
        desc: 'Mỗi bàn sở hữu mã QR độc nhất, khách quét vào sẽ tự động gán đúng mã bàn mà không cần nhân viên hỏi lại.',
      },
      {
        title: 'Xuất file in chuẩn A6 / Standee',
        desc: 'Bấm "In toàn bộ mã QR bàn" để tải file in chất lượng cao dùng cho Standee mica hoặc tem dán chống nước.',
      },
    ],
    proTip: 'Mã QR iMenu không giới hạn số lượt quét và không bao giờ hết hạn. Khi bạn đổi giá hoặc cập nhật món, tem QR tại bàn vẫn giữ nguyên giá trị sử dụng.',
    imageSrc: '/images/guide/03-tao-ban-ma-qr.png',
    imageAlt: 'Giao diện tạo và in hàng loạt mã QR Standee mica cho từng bàn',
    deviceType: 'browser',
    urlPath: 'admin.imenu.vn/qr-codes',
    ctaText: 'Xem trang xuất tem QR bàn',
    ctaUrl: 'http://localhost:3003/qr-codes',
    tags: ['Mã QR bàn', 'Standee A6', 'Sơ đồ bàn'],
  },

  // SECTION 02: Hướng dẫn vận hành
  {
    id: 'khach-tu-order',
    sectionNumber: '02',
    sectionTitle: 'Hướng dẫn vận hành',
    stepNumber: '04',
    title: 'Khách tự gọi món qua QR',
    shortDesc: 'Khách ngồi tại bàn dùng camera điện thoại quét mã QR để gọi món trực tiếp.',
    badge: 'Bước 4 / 7',
    timeEstimate: 'Thực tế',
    actions: [
      {
        title: 'Quét camera không cần cài app',
        desc: 'Khách hàng mở camera điện thoại hoặc Zalo quét mã QR tại bàn là thực đơn mở ngay tức thì.',
      },
      {
        title: 'Chọn món & ghi chú khẩu vị',
        desc: 'Khách dễ dàng chọn số lượng, thêm ghi chú (ít cay, không hành...) và xem tổng tạm tính rõ ràng.',
      },
      {
        title: 'Bấm "Gửi gọi món" tới bếp',
        desc: 'Ngay khi khách bấm gửi, vé order lập tức bay về màn hình bếp và POS thu ngân kèm chuông báo.',
      },
    ],
    proTip: 'Trải nghiệm mượt mà giảm 100% thời gian khách phải vẫy tay gọi nhân viên vào những khung giờ cao điểm đông đúc.',
    imageSrc: '/images/guide/04-khach-tu-order.png',
    imageAlt: 'Giao diện thực đơn QR gọi món di động của khách tại Bàn 08',
    deviceType: 'mobile',
    urlPath: 'imenu.vn/menu/bep-nha/ban-08',
    ctaText: 'Mở Menu Khách Demo (Bàn 08)',
    ctaUrl: 'http://localhost:3005/menu/bep-nha/ban-08',
    tags: ['Khách tự order', 'Mobile Web', 'Không cần tải App'],
  },
  {
    id: 'nhan-vien-order',
    sectionNumber: '02',
    sectionTitle: 'Hướng dẫn vận hành',
    stepNumber: '05',
    title: 'Nhân viên nhận & tạo đơn (POS)',
    shortDesc: 'Dành cho khách gọi trực tiếp tại quầy hoặc gọi bổ sung qua nhân viên phục vụ.',
    badge: 'Bước 5 / 7',
    timeEstimate: '30 giây',
    actions: [
      {
        title: 'Chọn bàn cần tạo đơn',
        desc: 'Nhân viên mở màn hình POS trên máy tính bảng hoặc laptop thu ngân, nhấp chọn bàn tương ứng.',
      },
      {
        title: 'Tìm kiếm & thêm món nhanh',
        desc: 'Giao diện POS tối ưu với nút bấm lớn, tìm kiếm nhanh theo tên món hoặc mã phím tắt.',
      },
      {
        title: 'Gửi đơn chế biến tới bếp',
        desc: 'Bấm "Bắn đơn tới bếp", hệ thống tự động in phiếu chế biến hoặc hiển thị vé lên màn hình KDS Bếp.',
      },
    ],
    proTip: 'Đơn nhân viên tạo tại POS sẽ đồng bộ ngay lập tức với giao diện theo dõi món trên điện thoại của khách tại bàn đó.',
    imageSrc: '/images/guide/05-nhan-vien-order.png',
    imageAlt: 'Giao diện POS bán hàng và tạo order dành cho nhân viên phục vụ và thu ngân',
    deviceType: 'browser',
    urlPath: 'admin.imenu.vn/pos',
    ctaText: 'Mở màn hình POS bán hàng',
    ctaUrl: 'http://localhost:3003/pos',
    tags: ['POS Thu ngân', 'Nhân viên order', 'Bắn đơn'],
  },
  {
    id: 'bep-phuc-vu',
    sectionNumber: '02',
    sectionTitle: 'Hướng dẫn vận hành',
    stepNumber: '06',
    title: 'Bếp & Bar điều phối chế biến',
    shortDesc: 'Màn hình KDS thay thế giấy in nhiệt truyền thống, hạn chế tối đa thất lạc món.',
    badge: 'Bước 6 / 7',
    timeEstimate: 'Real-time',
    actions: [
      {
        title: 'Chuông báo tự động khi có đơn',
        desc: 'Khi khách hoặc nhân viên gửi order, màn hình bếp tự động phát chuông ding-dong nhắc nhở đầu bếp.',
      },
      {
        title: 'Sắp xếp vé theo thời gian gọi',
        desc: 'Các món được xếp theo thứ tự vào trước ra trước (FIFO), hiển thị rõ bàn, số lượng và ghi chú riêng.',
      },
      {
        title: 'Bấm "Xong món" thông báo phục vụ',
        desc: 'Khi chế biến xong, đầu bếp bấm 1 chạm, chuông báo phục vụ vang lên và khách nhận được cập nhật "Món sẵn sàng".',
      },
    ],
    proTip: 'Màn hình KDS giúp nhà hàng tiết kiệm hàng triệu đồng chi phí cuộn giấy in nhiệt mỗi tháng và bảo vệ môi trường.',
    imageSrc: '/images/guide/06-bep-phuc-vu.png',
    imageAlt: 'Màn hình bếp KDS hiển thị vé món theo thời gian thực và chuông báo Web Audio',
    deviceType: 'browser',
    urlPath: 'admin.imenu.vn/kitchen',
    ctaText: 'Mở màn hình Bếp KDS Real-time',
    ctaUrl: 'http://localhost:3003/kitchen',
    tags: ['KDS Bếp & Bar', 'Chuông báo Web Audio', 'Điều phối món'],
  },
  {
    id: 'tam-tinh-thanh-toan',
    sectionNumber: '02',
    sectionTitle: 'Hướng dẫn vận hành',
    stepNumber: '07',
    title: 'Tạm tính, In bill 80mm & VietQR',
    shortDesc: 'Xuất hóa đơn nhiệt khổ 80mm chuẩn F&B và tạo mã VietQR động chính xác từng đồng.',
    badge: 'Bước 7 / 7',
    timeEstimate: '30 giây',
    actions: [
      {
        title: 'Kiểm tra chi tiết đơn hàng',
        desc: 'Vào mục "Hóa đơn & In Bill", nhấp chọn bàn cần thanh toán để xem lại danh sách các món đã dùng.',
      },
      {
        title: 'In phiếu tạm tính khổ 80mm',
        desc: 'Nhấn "Xem & In Bill 80mm" để xuất hóa đơn chuẩn máy in nhiệt cầm tay hoặc máy in quầy thu ngân.',
      },
      {
        title: 'Quét mã VietQR chuyển khoản',
        desc: 'Mã VietQR động tự động điền sẵn số tài khoản quán, số tiền chính xác và nội dung chuyển khoản để khách quét là xong.',
      },
    ],
    proTip: 'Thanh toán VietQR động loại bỏ 100% rủi ro chuyển nhầm số tiền hoặc chuyển sai số tài khoản của thu ngân.',
    imageSrc: '/images/guide/07-tam-tinh-thanh-toan.png',
    imageAlt: 'Xem trước hóa đơn in nhiệt khổ 80mm chuẩn F&B và thanh toán VietQR',
    deviceType: 'browser',
    urlPath: 'admin.imenu.vn/bills',
    ctaText: 'Mở trang Hóa đơn & In Bill',
    ctaUrl: 'http://localhost:3003/bills',
    tags: ['In Bill 80mm', 'VietQR tự động', 'Thanh toán'],
  },
];

export default function GuidePage() {
  const [activeStepId, setActiveStepId] = useState<string>('tao-danh-muc');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string } | null>(null);

  // ScrollSpy: Observe sections to update TOC active item
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveStepId(entry.target.id);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -55% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    GUIDE_STEPS.forEach((step) => {
      const el = document.getElementById(step.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToStep = (id: string) => {
    setActiveStepId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex flex-col selection:bg-emerald-100 selection:text-emerald-950">
      <Header />

      {/* ================= HERO HEADER ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/20 to-white pt-12 pb-14 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-5">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-emerald-800 font-bold">Hướng dẫn vận hành iMenu</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-300/80 text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Cẩm Nang Vận Hành Toàn Diện 2026
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#09271d] tracking-tight leading-tight">
                Hướng dẫn thiết lập & vận hành nhà hàng số với iMenu
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Tài liệu chuẩn hóa từng bước dành riêng cho Chủ nhà hàng, Quản lý và Nhân viên: từ khâu khởi tạo thực đơn, in mã QR bàn đến quy trình phối hợp thời gian thực Khách - Bếp - Thu ngân.
              </p>
            </div>

            {/* Quick Metadata Stats */}
            <div className="flex flex-wrap sm:flex-nowrap gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-shrink-0">
              <div className="px-4 py-2 border-r border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Quy trình</span>
                <strong className="text-lg font-extrabold text-slate-900">2 Phần · 7 Bước</strong>
              </div>
              <div className="px-4 py-2 border-r border-slate-100">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Thời gian học</span>
                <strong className="text-lg font-extrabold text-emerald-700">~5 Phút</strong>
              </div>
              <div className="px-4 py-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 block">Hệ thống</span>
                <strong className="text-lg font-extrabold text-slate-900">100% Realtime</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTAINER WITH 2-COLUMN GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full flex-grow">
        
        {/* Mobile Horizontal Quick TOC Bar */}
        <div className="lg:hidden sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 py-3 mb-8 overflow-x-auto shadow-sm">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-extrabold text-[#09271d] whitespace-nowrap mr-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> Mục lục:
            </span>
            {GUIDE_STEPS.map((step) => {
              const isActive = activeStepId === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => scrollToStep(step.id)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {step.stepNumber}. {step.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* ================= LEFT COLUMN: STICKY TOC SIDEBAR ================= */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
            
            {/* Widget Mục Lục Thiết Kế Đúng Chuẩn Theo Hình Người Dùng Gửi */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden">
              
              {/* Dải xanh lá cây thương hiệu trên đỉnh (như hình mẫu) */}
              <div className="h-1.5 bg-[#0e4834] w-full" />

              <div className="p-7 space-y-6">
                
                {/* Tiêu đề "Mục lục" */}
                <div>
                  <h2 className="text-xl font-extrabold text-[#09271d] tracking-tight">
                    Mục lục
                  </h2>
                </div>

                {/* Phần 01: Tạo menu nhà hàng */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-[#b45309]">01</span>
                    <h3 className="text-base font-extrabold text-[#09271d]">
                      Tạo menu nhà hàng
                    </h3>
                  </div>

                  <ul className="space-y-1.5 pl-6 border-l-2 border-slate-100 ml-2">
                    {GUIDE_STEPS.filter((s) => s.sectionNumber === '01').map((step) => {
                      const isActive = activeStepId === step.id;
                      return (
                        <li key={step.id}>
                          <button
                            onClick={() => scrollToStep(step.id)}
                            className={`text-left text-sm py-1 px-2 rounded-lg transition-all w-full flex items-center justify-between group cursor-pointer ${
                              isActive
                                ? 'text-[#0e4834] font-bold bg-emerald-50/80 -translate-x-1 pl-3 border-l-2 border-[#0e4834]'
                                : 'text-slate-600 hover:text-[#0e4834] hover:bg-slate-50 font-medium'
                            }`}
                          >
                            <span>{step.title}</span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Phần 02: Hướng dẫn vận hành */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-[#b45309]">02</span>
                    <h3 className="text-base font-extrabold text-[#09271d]">
                      Hướng dẫn vận hành
                    </h3>
                  </div>

                  <ul className="space-y-1.5 pl-6 border-l-2 border-slate-100 ml-2">
                    {GUIDE_STEPS.filter((s) => s.sectionNumber === '02').map((step) => {
                      const isActive = activeStepId === step.id;
                      return (
                        <li key={step.id}>
                          <button
                            onClick={() => scrollToStep(step.id)}
                            className={`text-left text-sm py-1 px-2 rounded-lg transition-all w-full flex items-center justify-between group cursor-pointer ${
                              isActive
                                ? 'text-[#0e4834] font-bold bg-emerald-50/80 -translate-x-1 pl-3 border-l-2 border-[#0e4834]'
                                : 'text-slate-600 hover:text-[#0e4834] hover:bg-slate-50 font-medium'
                            }`}
                          >
                            <span>{step.title}</span>
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Đường gạch phân cách dưới cùng (như hình mẫu) */}
                <div className="pt-2 border-b border-slate-200" />
              </div>
            </div>

            {/* Quick Support Card */}
            <div className="bg-gradient-to-br from-[#0a2f23] to-[#041a13] rounded-2xl p-6 text-white space-y-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 grid place-items-center text-emerald-300">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Hỗ trợ kỹ thuật F&B</h4>
                  <p className="text-xs text-slate-300">Hỗ trợ onboarding 1-1 miễn phí</p>
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-900/60 space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Hotline 24/7:</span>
                  <span className="font-bold text-amber-300">1900 xxxx (Nhánh 1)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Zalo Hỗ Trợ:</span>
                  <span className="font-bold text-white">0908 xxx xxx</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <a
                  href="http://localhost:3005/menu/bep-nha/ban-08"
                  target="_blank"
                  className="w-full text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mở Menu Khách Bàn 08 ↗
                </a>
                <a
                  href="http://localhost:3003"
                  target="_blank"
                  className="w-full text-center py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <Laptop className="w-3.5 h-3.5" /> Mở Admin & POS Quản Trị ↗
                </a>
              </div>
            </div>

          </aside>

          {/* ================= RIGHT COLUMN: BALANCED STEP CONTENT CARDS ================= */}
          <main className="lg:col-span-8 space-y-12">
            
            {/* Banner Khởi đầu */}
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white grid place-items-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-sm">
                <strong className="text-[#09271d] font-bold block text-base">
                  Quy trình chuẩn hóa 2 giai đoạn: Thiết lập thực đơn & Vận hành order
                </strong>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
                  Dưới đây là 7 bước hướng dẫn kèm hình ảnh chụp thực tế từ hệ thống iMenu đang hoạt động. Bạn có thể nhấp vào bất kỳ hình ảnh nào để phóng to hoặc nhấn nút trải nghiệm trực tiếp trên bản Demo.
                </p>
              </div>
            </div>

            {/* Loop through all steps */}
            {GUIDE_STEPS.map((step) => {
              const isFirstOfSection02 = step.sectionNumber === '02' && step.stepNumber === '04';

              return (
                <React.Fragment key={step.id}>
                  {/* Section 02 Separator Heading */}
                  {isFirstOfSection02 && (
                    <div className="pt-8 pb-4 border-t-2 border-dashed border-slate-200">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black tracking-wider uppercase">
                          PHẦN 02
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#09271d]">
                          Hướng Dẫn Vận Hành Thời Gian Thực
                        </h2>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        Quy trình phối hợp khép kín từ khi khách ngồi vào bàn, quét mã gọi món cho đến khi Bếp chế biến và Thu ngân in hóa đơn.
                      </p>
                    </div>
                  )}

                  {/* STEP CARD: Chia khung đều đặn, chuẩn xu hướng hiện đại */}
                  <article
                    id={step.id}
                    className="scroll-mt-28 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    {/* Card Top Header */}
                    <div className="p-6 sm:p-8 pb-0 space-y-4">
                      
                      {/* Badge & Metadata Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#0e4834] text-white text-xs font-bold tracking-wide">
                            {step.badge}
                          </span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Phần {step.sectionNumber} · {step.sectionTitle}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Thời gian: {step.timeEstimate}
                        </div>
                      </div>

                      {/* Step Title & Subtitle */}
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                          {step.stepNumber}. {step.title}
                        </h3>
                        <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">
                          {step.shortDesc}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {step.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Action Steps Walkthrough (1 - 2 - 3) */}
                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {step.actions.map((act, actIdx) => (
                          <div
                            key={actIdx}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                          >
                            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold text-xs grid place-items-center">
                              {actIdx + 1}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {act.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {act.desc}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Pro Tip Callout Box */}
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900 leading-relaxed">
                          <strong className="font-bold block mb-0.5">Mẹo hay F&B:</strong>
                          {step.proTip}
                        </div>
                      </div>

                    </div>

                    {/* Screenshot Container Frame (Mô phỏng trình duyệt / thiết bị cao cấp) */}
                    <div className="p-6 sm:p-8 pt-6">
                      
                      <div className="relative group rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-900/5 shadow-inner">
                        
                        {/* Browser Bar Mockup */}
                        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                          </div>

                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-mono text-slate-600 max-w-xs truncate shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            https://{step.urlPath}
                          </div>

                          <button
                            onClick={() => setLightboxImage({ src: step.imageSrc, title: `${step.stepNumber}. ${step.title}` })}
                            className="text-xs text-slate-600 hover:text-emerald-700 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                            title="Phóng to ảnh"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Phóng to</span>
                          </button>
                        </div>

                        {/* Image Preview with Hover Click-to-Zoom */}
                        <div
                          onClick={() => setLightboxImage({ src: step.imageSrc, title: `${step.stepNumber}. ${step.title}` })}
                          className="relative cursor-zoom-in overflow-hidden bg-slate-100 flex items-center justify-center min-h-[260px] sm:min-h-[380px]"
                        >
                          <img
                            src={step.imageSrc}
                            alt={step.imageAlt}
                            className={`w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.01] ${
                              step.deviceType === 'mobile' ? 'max-w-sm mx-auto p-4 rounded-3xl' : ''
                            }`}
                            loading="lazy"
                          />

                          {/* Hover Overlay Hint */}
                          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="px-4 py-2 rounded-xl bg-white/95 text-slate-900 text-xs font-bold shadow-lg flex items-center gap-2">
                              <Maximize2 className="w-4 h-4 text-emerald-700" /> Bấm để xem ảnh phóng to chi tiết
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Card Bottom CTA Button */}
                      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-500 italic">
                          Ảnh chụp thực tế từ hệ thống iMenu đang chạy live.
                        </span>
                        <a
                          href={step.ctaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow"
                        >
                          {step.ctaText} <ArrowUpRight className="w-4 h-4" />
                        </a>
                      </div>

                    </div>

                  </article>
                </React.Fragment>
              );
            })}

            {/* Bottom Support CTA Box */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0c392b] via-[#06261c] to-[#041a13] text-white space-y-6 shadow-xl text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <span className="inline-block text-xs font-extrabold uppercase tracking-wider text-amber-400">
                    Sẵn sàng chuyển đổi số nhà hàng?
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Bắt đầu số hóa F&B miễn phí ngay hôm nay
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Khởi tạo thực đơn và in mã QR trong 5 phút. Đội ngũ chuyên gia iMenu luôn đồng hành hỗ trợ cài đặt tận nơi.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 flex-shrink-0">
                  <Link href="/dang-ky">
                    <Button variant="amber" size="lg" className="shadow-lg">
                      Đăng ký quán mới 0đ <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <a
                    href="http://localhost:3005/menu/bep-nha/ban-08"
                    target="_blank"
                    className="w-full sm:w-auto"
                  >
                    <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full">
                      Thử Menu Bàn 08 ↗
                    </Button>
                  </a>
                </div>
              </div>
            </div>

          </main>

        </div>
      </div>

      {/* ================= LIGHTBOX MODAL ================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">{lightboxImage.title}</h4>
                <p className="text-[11px] text-slate-400">Ảnh chụp màn hình thực tế độ phân giải cao</p>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 bg-slate-950 overflow-auto flex items-center justify-center max-h-[80vh]">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
