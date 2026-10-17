'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Button } from '@imenu/ui';
import {
  Briefcase,
  ChevronRight,
  Sparkles,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Check,
  Send,
  HelpCircle,
  ChevronDown,
  Gift,
  Award,
  Clock,
  MapPin,
  PhoneCall,
  Mail,
  Zap,
  Target,
  FileText,
  BadgePercent,
  Calculator,
  Store,
} from 'lucide-react';

export default function TuyenDungKinhDoanhPage() {
  // Simulator State
  const [directStores, setDirectStores] = useState<number>(5);
  const [subStores, setSubStores] = useState<number>(3);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calculation
  // 1. Phí setup: directStores * 500.000₫
  // 2. Mở mới thực tế: directStores * 250.000₫
  // 3. Thưởng CTV: subStores * 250.000₫
  const directSetupIncome = directStores * 500000;
  const directOpenBonus = directStores * 250000;
  const subTeamBonus = subStores * 250000;
  const totalMonthlyIncome = directSetupIncome + directOpenBonus + subTeamBonus;

  // Thu nhập duy trì năm tiếp theo (20% phí duy trì hằng năm: 600.000₫ / quán / năm)
  const passiveAnnualIncome = (directStores + subStores) * 600000;

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  const candidateFaqs = [
    {
      q: 'Tôi có phải đóng bất kỳ khoản phí tham gia, cọc tiền hay mua tài liệu đào tạo nào không?',
      a: 'Tuyệt đối KHÔNG! iMenu không bao giờ thu bất kỳ khoản phí tham gia, phí cọc hay phí tài liệu nào từ Nhân viên kinh doanh và Cộng tác viên. Chúng tôi cung cấp miễn phí 100% tài liệu hướng dẫn, slide giới thiệu giải pháp, tài khoản demo thực tế và hỗ trợ kỹ thuật đồng hành.',
    },
    {
      q: 'Hoa hồng và phí mở mới được đối soát và thanh toán vào thời gian nào?',
      a: 'iMenu thực hiện đối soát và chi trả hoa hồng 2 lần mỗi tháng vào ngày 05 và ngày 20 hằng tháng qua tài khoản ngân hàng chính chủ của bạn (hỗ trợ chuyển khoản nhanh Napas 247). Bạn có thể theo dõi danh sách quán đã triển khai và số dư hoa hồng minh bạch trên cổng Portal đối tác.',
    },
    {
      q: 'Chính sách hoa hồng duy trì 20% hằng năm được tính như thế nào?',
      a: 'Khi nhà hàng do bạn phát triển tiếp tục gia hạn sử dụng các gói dịch vụ nâng cao của iMenu trong các năm tiếp theo, bạn sẽ tự động nhận 20% giá trị hợp đồng tái ký mỗi năm suốt vòng đời khách hàng sử dụng hệ thống. Đây là nguồn thu nhập thụ động bền vững tích lũy theo thời gian.',
    },
    {
      q: 'Nếu tôi chưa từng có kinh nghiệm bán phần mềm thì có làm được không?',
      a: 'Hoàn toàn được! iMenu được thiết kế tối giản, trực quan và dễ hiểu hơn nhiều so với các phần mềm POS truyền thống. Chỉ sau 30 phút trải nghiệm kịch bản demo quét mã QR và giao diện Bếp KDS, bạn đã nắm vững toàn bộ quy trình để tự tin chia sẻ với các chủ quán.',
    },
    {
      q: 'Làm thế nào để hệ thống ghi nhận nhà hàng do tôi trực tiếp giới thiệu?',
      a: 'Mỗi Nhân viên kinh doanh & Cộng tác viên sẽ được cấp 1 Mã Giới Thiệu (Partner Code) và 1 đường link đăng ký định danh. Khi chủ quán đăng ký tài khoản qua link của bạn hoặc nhập mã của bạn lúc tạo quán, hệ thống tự động khóa mã vĩnh viễn với tài khoản nhà hàng đó.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      <Header />

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 text-white pt-12 pb-20 sm:pb-28 border-b border-emerald-900/60">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-emerald-300/80">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-amber-400 font-bold">Tuyển dụng Kinh doanh</span>
          </nav>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-xs font-extrabold text-amber-300 shadow-sm">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <span>Tuyển Dụng NVKD & Đối Tác Phát Triển Thị Trường Toàn Quốc</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Đồng hành số hóa nhà hàng, quán ăn, cafe Việt cùng iMenu
              </h1>

              <p className="text-base sm:text-lg text-emerald-100/80 max-w-2xl leading-relaxed">
                Làm việc từ xa linh hoạt, tự do làm chủ thời gian và địa bàn kinh doanh. Nhận ngay <strong>hoa hồng lên tới 50%</strong> cùng nguồn <strong>thu nhập thụ động 20% duy trì hằng năm</strong>. Tuyệt đối không đóng bất kỳ khoản phí tham gia nào!
              </p>

              {/* Tag Highlights */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  0đ phí tham gia
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  Thanh toán ngày 05 & 20
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  Làm việc toàn quốc
                </span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <a href="#ung-tuyen-ngay" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-7 py-3 shadow-xl border-0"
                  >
                    Đăng ký ứng tuyển ngay <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
                <a href="#tinh-thu-nhap" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-emerald-600/70 text-emerald-100 hover:bg-emerald-900/60 font-bold px-6 py-3"
                  >
                    Ước tính thu nhập của bạn
                  </Button>
                </a>
              </div>
            </div>

            {/* Quick Hero Stat Badge Card */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-emerald-900/40 border border-emerald-700/50 backdrop-blur-md space-y-4 text-center">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-300 block">
                Thu nhập tiềm năng trung bình
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white">
                15.000.000₫+
                <span className="text-xs font-normal text-emerald-300 block mt-1">/ tháng chỉ với 10 quán ăn</span>
              </div>
              <div className="pt-3 border-t border-emerald-800/60 text-xs text-emerald-200/80 leading-relaxed text-left space-y-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Hoa hồng nhận tiền tươi ngay trong tháng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Duy trì hoa hồng trọn đời khách hàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Được đào tạo cầm tay chỉ việc từ A-Z</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= 4 THẺ CHÍNH SÁCH THU NHẬP & HOA HỒNG ================= */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">
              Chính Sách Quyền Lợi Minh Bạch
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              4 tầng thu nhập vượt trội dành cho đối tác iMenu
            </h2>
            <p className="text-sm text-slate-600">
              Chúng tôi trân trọng từng nhà hàng do bạn mở rộng và chia sẻ phần lớn doanh thu để cùng phát triển lâu dài.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Thẻ 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 grid place-items-center font-black text-lg border border-amber-200">
                  50%
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Phí Khởi Tạo / Setup Gói Trả Phí
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nhận ngay <strong>50% giá trị hợp đồng khởi tạo</strong> khi khách hàng nâng cấp gói dịch vụ trả phí.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80">
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 block text-center">
                  Tối thiểu 500.000₫ / quán
                </span>
              </div>
            </div>

            {/* Thẻ 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 grid place-items-center font-black text-lg border border-emerald-200">
                  20%
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Hoa Hồng Duy Trì Hằng Năm
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Thu nhập thụ động bền vững: Nhận <strong>20% giá trị tái ký mỗi năm</strong> suốt toàn bộ thời gian nhà hàng hoạt động.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 block text-center">
                  Từ 600.000₫ / quán / năm
                </span>
              </div>
            </div>

            {/* Thẻ 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 grid place-items-center font-black text-lg border border-blue-200">
                  250K
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Ghi Nhận Mở Mới Vận Hành
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ngay cả khi quán đang trong giai đoạn dùng thử 0đ, chỉ cần quán kích hoạt menu và phát sinh giao dịch thật, bạn vẫn nhận thưởng.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80">
                <span className="text-xs font-black text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 block text-center">
                  250.000₫ / quán vận hành
                </span>
              </div>
            </div>

            {/* Thẻ 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 grid place-items-center font-black text-lg border border-purple-200">
                  250K
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Thưởng Phát Triển Đội Ngũ CTV
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Giới thiệu bạn bè cùng làm CTV iMenu: Nhận thưởng cho mỗi quán đầu tiên đủ điều kiện do CTV của bạn triển khai thành công.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80">
                <span className="text-xs font-black text-purple-800 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 block text-center">
                  250.000₫ / quán CTV
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= CÔNG CỤ ƯỚC TÍNH THU NHẬP TƯƠNG TÁC (SIMULATOR) ================= */}
      <section id="tinh-thu-nhap" className="py-16 bg-slate-100/80 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              <Calculator className="w-3.5 h-3.5" />
              Công Cụ Tính Thu Nhập Trực Quan
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Ước tính thu nhập của bạn cùng iMenu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Kéo các thanh trượt bên dưới để ước lượng thu nhập nhận ngay trong tháng và dòng tiền thụ động năm tiếp theo.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Sliders Area (7 cols) */}
            <div className="lg:col-span-7 space-y-7">
              {/* Slider 1: Quán triển khai trực tiếp */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Store className="w-4 h-4 text-emerald-700" />
                    Số nhà hàng triển khai trực tiếp trong tháng:
                  </label>
                  <span className="text-base font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {directStores} quán
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={directStores}
                  onChange={(e) => setDirectStores(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>1 quán</span>
                  <span>15 quán</span>
                  <span>30 quán</span>
                </div>
              </div>

              {/* Slider 2: Quán do CTV cấp dưới triển khai */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-700" />
                    Số quán do Cộng tác viên giới thiệu triển khai:
                  </label>
                  <span className="text-base font-black text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    {subStores} quán
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={subStores}
                  onChange={(e) => setSubStores(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>0 quán</span>
                  <span>10 quán</span>
                  <span>20 quán</span>
                </div>
              </div>

              {/* Chi tiết từng khoản nhỏ */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>• 50% Phí Setup ({directStores} quán × 500K):</span>
                  <span className="font-bold text-slate-800">{directSetupIncome.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>• Thưởng mở mới thực tế ({directStores} quán × 250K):</span>
                  <span className="font-bold text-slate-800">{directOpenBonus.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>• Thưởng phát triển CTV ({subStores} quán × 250K):</span>
                  <span className="font-bold text-slate-800">{subTeamBonus.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>

            {/* Result Box (5 cols) */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white space-y-6 text-center border border-emerald-800 shadow-lg">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  Thu nhập nhận ngay trong tháng
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  {totalMonthlyIncome.toLocaleString('vi-VN')}₫
                </div>
                <p className="text-[11px] text-emerald-200/70">
                  Được đối soát và chuyển khoản nhanh vào ngày 05 & 20
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                  Thu nhập thụ động duy trì năm tiếp theo
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-300">
                  +{passiveAnnualIncome.toLocaleString('vi-VN')}₫ / năm
                </div>
                <span className="text-[10px] text-slate-300 block">
                  Dựa trên 20% phí gia hạn từ {directStores + subStores} khách hàng
                </span>
              </div>

              <a href="#ung-tuyen-ngay" className="block">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2.5 shadow-md border-0"
                >
                  Ứng tuyển & Bắt đầu ngay
                </Button>
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ================= QUY TRÌNH 6 CÔNG VIỆC CỐT LÕI ================= */}
      <section className="py-16 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase">
              Quy Trình Triển Khai Chuẩn
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              6 bước công việc của Nhân viên Kinh doanh iMenu
            </h2>
            <p className="text-sm text-slate-600">
              Lộ trình được tinh gọn tối đa để bất kỳ ai cũng có thể triển khai thành công ngay từ tuần đầu tiên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Tìm kiếm & Lắng nghe bài toán của chủ quán',
                desc: 'Khảo sát các quán ăn, quán cà phê trong khu vực bạn sinh sống. Lắng nghe nỗi đau thất thoát bill, giờ cao điểm nhầm món hoặc chi phí mua máy POS quá đắt đỏ.',
                icon: Target,
                color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
              },
              {
                step: '02',
                title: 'Khởi tạo nhà hàng gắn mã đối tác',
                desc: 'Đăng nhập vào Portal Đối tác, tạo nhanh tài khoản nhà hàng cho quán chỉ trong 2 phút với Mã định danh ghi nhận doanh số của bạn.',
                icon: Store,
                color: 'text-amber-700 bg-amber-50 border-amber-200',
              },
              {
                step: '03',
                title: 'Hỗ trợ thiết lập thực đơn & mã QR bàn',
                desc: 'Áp dụng bộ menu mẫu có sẵn trên iMenu hoặc tải ảnh món ăn của quán lên. In bộ mã QR bàn tự động bằng file PDF xuất sẵn.',
                icon: FileText,
                color: 'text-blue-700 bg-blue-50 border-blue-200',
              },
              {
                step: '04',
                title: 'Demo trực tiếp luồng Quét QR - POS - KDS',
                desc: 'Dùng điện thoại của chủ quán quét thử mã QR đặt món, mở tablet quán xem đơn vào màn hình Bếp KDS và quét VietQR Napas 247 test thanh toán.',
                icon: Zap,
                color: 'text-teal-700 bg-teal-50 border-teal-200',
              },
              {
                step: '05',
                title: 'Chăm sóc sau bàn giao (24h & 7 ngày)',
                desc: 'Đồng hành cùng nhân viên quán trong ngày đầu tiên bán hàng. Hỗ trợ giải đáp các thao tác gộp bàn, in bill và theo dõi phản hồi của khách.',
                icon: Clock,
                color: 'text-purple-700 bg-purple-50 border-purple-200',
              },
              {
                step: '06',
                title: 'Mở rộng mạng lưới cộng tác viên',
                desc: 'Giới thiệu các bạn trẻ, nhân viên ngành F&B cùng tham gia đội ngũ để xây dựng nguồn thu nhập thụ động nhiều tầng vững chắc.',
                icon: Users,
                color: 'text-rose-700 bg-rose-50 border-rose-200',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center border ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black text-slate-300">{item.step}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= 5 BÍ QUYẾT TƯ VẤN & CHECKLIST BẠN CÓ PHÙ HỢP ================= */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* 5 Bí quyết tư vấn */}
            <div className="bg-white rounded-3xl border border-slate-200 p-7 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-amber-700 tracking-wider uppercase">
                  Bí Quyết Thực Chiến
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  5 bí quyết tư vấn &ldquo;Bách phát bách trúng&rdquo;
                </h3>
                <p className="text-xs text-slate-500">
                  Đừng chỉ bán phần mềm — Hãy giải quyết nỗi đau vận hành thật của quán!
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black grid place-items-center shrink-0">1</span>
                  <p><strong>Nói về giảm thất thoát & nhầm món:</strong> Chủ quán quan tâm nhất là không bị nhân viên đá bill và giờ cao điểm bếp không quên món.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black grid place-items-center shrink-0">2</span>
                  <p><strong>Rút điện thoại demo trong 3 giây:</strong> Mở ngay menu QR trên máy của bạn và mời chủ quán quét thử để thấy sự tiện lợi tận mắt.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black grid place-items-center shrink-0">3</span>
                  <p><strong>Nhấn mạnh 0đ thiết bị:</strong> Tận dụng điện thoại, tablet, laptop cũ sẵn có — Không bắt buộc mua máy POS cảm ứng mười mấy triệu.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black grid place-items-center shrink-0">4</span>
                  <p><strong>VietQR tiền về ngay:</strong> Tiền khách thanh toán vào thẳng tài khoản ngân hàng chính chủ của chủ quán, không giữ tiền qua cổng trung gian.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black grid place-items-center shrink-0">5</span>
                  <p><strong>Đồng hành buổi đầu:</strong> Đứng cạnh nhân viên thu ngân 1 buổi tối để họ tự tin bấm bill, quán sẽ gắn bó trung thành dài lâu.</p>
                </div>
              </div>
            </div>

            {/* Checklist Bạn có phù hợp? */}
            <div className="bg-white rounded-3xl border border-slate-200 p-7 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
                    Tiêu Chí Đánh Giá
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Bạn có phù hợp để trở thành đối tác iMenu?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nếu bạn có từ 4/6 đặc điểm sau, bạn chắc chắn sẽ thành công lớn cùng chúng tôi:
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  {[
                    'Yêu thích giao tiếp, thân thiện và thích trò chuyện cùng các chủ quán ăn, tiệm cà phê.',
                    'Tinh thần chủ động cao, không thích bị gò bó 8 tiếng văn phòng mà muốn tự quyết định thu nhập.',
                    'Có hiểu biết cơ bản hoặc từng có trải nghiệm làm thêm tại các quán ăn, nhà hàng, quán trà sữa.',
                    'Sử dụng thành thạo smartphone, các ứng dụng Zalo, mạng xã hội và trình duyệt web.',
                    'Trung thực, minh bạch, tôn trọng cam kết bảo mật và quyền dữ liệu riêng tư của nhà hàng.',
                    'Khao khát xây dựng nguồn thu nhập thụ động bền vững tăng dần theo số lượng khách hàng qua các năm.',
                  ].map((trait, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-emerald-50/50 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{trait}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-emerald-800 block text-center">
                  Không yêu cầu bằng cấp chuyên môn — Đào tạo miễn phí từ đầu!
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= BIỂU MẪU ĐĂNG KÝ ỨNG TUYỂN ================= */}
      <section id="ung-tuyen-ngay" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2.5">
            <span className="text-xs font-bold text-amber-600 tracking-widest uppercase">
              Gia Nhập Ngay Hôm Nay
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Đăng ký trở thành Đối tác Kinh doanh iMenu
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Điền thông tin bên dưới, chuyên viên phụ trách đối tác sẽ liên hệ và cấp mã định danh qua Zalo trong vòng 24 giờ làm việc.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-4 animate-scaleUp">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto border-2 border-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Đăng ký ứng tuyển thành công!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Cảm ơn bạn <strong>{fullName}</strong>. Chuyên viên quản lý đối tác iMenu sẽ kết bạn Zalo qua số điện thoại <strong>{phone}</strong> để gửi bộ tài liệu đào tạo và kích hoạt Mã Đối Tác của bạn.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFullName('');
                      setPhone('');
                      setEmail('');
                      setCity('');
                      setNote('');
                    }}
                    className="text-xs font-bold"
                  >
                    Gửi biểu mẫu khác
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Họ và tên của bạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Số điện thoại / Zalo <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Địa chỉ Email
                    </label>
                    <input
                      type="email"
                      placeholder="email@vidu.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800">
                      Tỉnh / Thành phố hoạt động chính <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Hà Nội, TP.HCM, Đà Nẵng..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Kinh nghiệm hoặc lời nhắn gửi ban tuyển dụng
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Chia sẻ ngắn gọn về kinh nghiệm bán hàng, quan hệ với các quán ăn trong khu vực của bạn..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-3 shadow-md shadow-emerald-700/20"
                  >
                    {isSubmitting ? 'Đang gửi thông tin...' : 'Gửi Đăng Ký Ứng Tuyển Đối Tác →'}
                  </Button>
                </div>

                <p className="text-[11px] text-slate-400 text-center pt-1">
                  Cam kết bảo mật 100% thông tin cá nhân theo Chính sách quyền riêng tư của iMenu.
                </p>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ================= CÂU HỎI THƯỜNG GẶP (FAQ ỨNG VIÊN) ================= */}
      <section className="py-16 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Giải Đáp Thắc Mắc
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Câu hỏi thường gặp dành cho Ứng viên Kinh doanh
            </h2>
          </div>

          <div className="space-y-3">
            {candidateFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-emerald-800 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-700 shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
