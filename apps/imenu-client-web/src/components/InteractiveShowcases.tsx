'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Badge } from '@imenu/ui';
import {
  Smartphone,
  Laptop,
  ChefHat,
  QrCode,
  CheckCircle2,
  Clock,
  Printer,
  ArrowRight,
  ExternalLink,
  Plus,
  Minus,
  RotateCcw,
  Utensils,
  Check,
  Receipt,
  Coffee,
  Soup,
  CupSoda,
} from 'lucide-react';

const MENU_DEMO_URL = process.env.NEXT_PUBLIC_MENU_DEMO_URL || 'http://localhost:3005/menu/bep-nha/ban-08';
const ADMIN_DEMO_URL = process.env.NEXT_PUBLIC_ADMIN_DEMO_URL || 'http://localhost:3003';

/* =========================================================================
 * KHỐI A: HERO SYSTEM PREVIEW (Mô phỏng 3 màn hình sống động tại Hero)
 * ========================================================================= */
export const HeroSystemPreview: React.FC = () => {
  type SystemTab = 'customer-qr' | 'pos-cashier' | 'kitchen-kds';
  const [activeTab, setActiveTab] = useState<SystemTab>('customer-qr');

  // Customer QR interactive state
  const [cookingSeconds, setCookingSeconds] = useState(252); // 4:12

  // POS Cashier interactive state
  const [table08Status, setTable08Status] = useState<'waiting' | 'approved'>('waiting');
  const [showBillPreview, setShowBillPreview] = useState(false);

  // Kitchen KDS interactive state
  const [kdsItems, setKdsItems] = useState([
    { id: 1, name: 'Phở Bò Tái Lăn (x2)', note: 'Ít hành lá, thêm bò tái', done: true },
    { id: 2, name: 'Trà Đào Cam Sả (x1)', note: '70% đường, 100% đá', done: true },
    { id: 3, name: 'Cà Phê Muối Huế (x1)', note: 'Ít đá, béo vừa', done: false },
  ]);

  // SLA timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCookingSeconds((prev) => (prev > 0 ? prev + 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleKdsItem = (id: number) => {
    setKdsItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-md border border-zinc-200/90 overflow-hidden flex flex-col transition-colors">
      {/* Tab Switcher Header */}
      <div className="bg-zinc-900 p-2.5 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-1.5 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
        </div>

        {/* 3 Tabs */}
        <div className="flex items-center gap-1 bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-700/50">
          <button
            type="button"
            onClick={() => setActiveTab('customer-qr')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'customer-qr'
                ? 'bg-emerald-700 text-white'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Khách</span> QR Bàn 08
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pos-cashier')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'pos-cashier'
                ? 'bg-emerald-700 text-white'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>POS Thu Ngân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kitchen-kds')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'kitchen-kds'
                ? 'bg-emerald-700 text-white'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Bếp KDS</span>
          </button>
        </div>
      </div>

      {/* Screen Container */}
      <div className="p-4 sm:p-5 bg-zinc-50 min-h-[380px] flex flex-col justify-between">
        {/* ================= TAB 1: KHÁCH QUÉT QR (BÀN 08) ================= */}
        {activeTab === 'customer-qr' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200/80">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-700 text-white grid place-items-center font-bold text-xs">
                  iM
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 leading-none">Bếp Nhà Restaurant</h4>
                  <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Bàn 08 · Trực tuyến
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded font-mono font-medium">
                ORD-2610-08
              </span>
            </div>

            {/* Simulated Ordered Items */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-md bg-white border border-zinc-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-900 block">2x Phở Bò Tái Lăn</span>
                  <small className="text-[10px] text-zinc-500">Ít hành lá, thêm bò tái</small>
                </div>
                <span className="font-mono text-zinc-900 font-medium tabular-nums">150.000₫</span>
              </div>

              <div className="p-2.5 rounded-md bg-white border border-zinc-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-900 block">1x Trà Đào Cam Sả</span>
                  <small className="text-[10px] text-zinc-500">70% đường, 100% đá</small>
                </div>
                <span className="font-mono text-zinc-900 font-medium tabular-nums">39.000₫</span>
              </div>

              <div className="p-2.5 rounded-md bg-white border border-zinc-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-zinc-900 block">1x Cà Phê Muối Xứ Huế</span>
                  <small className="text-[10px] text-zinc-500">Ít đá, béo vừa</small>
                </div>
                <span className="font-mono text-zinc-900 font-medium tabular-nums">35.000₫</span>
              </div>
            </div>

            {/* Order Progress / Total */}
            <div className="p-3 bg-zinc-900 text-white rounded-md space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Tổng tạm tính (3 món)</span>
                <span className="font-mono text-white font-semibold text-sm tabular-nums">224.000₫</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-800">
                <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
                  Đang chế biến tại bếp
                </span>
                <span className="font-mono text-zinc-400 tabular-nums">SLA: {formatTimer(cookingSeconds)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: POS THU NGÂN ================= */}
        {activeTab === 'pos-cashier' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="grid grid-cols-4 gap-2">
              {/* Bàn 08 */}
              <div className="p-2 rounded-md bg-emerald-50 border border-emerald-300 text-center space-y-1">
                <span className="text-[10px] font-semibold text-emerald-900 block">BÀN 08</span>
                <span className="text-[11px] font-semibold text-emerald-800 block">
                  {table08Status === 'waiting' ? 'Chờ duyệt' : 'Đang phục vụ'}
                </span>
                <span className="text-[10px] text-emerald-900 font-mono font-medium block tabular-nums">224.000₫</span>
              </div>

              {/* Bàn 09 */}
              <div className="p-2 rounded-md bg-white border border-zinc-200 text-center space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 block">BÀN 09</span>
                <span className="text-[11px] font-medium text-zinc-700 block">Trống</span>
                <span className="text-[10px] text-zinc-500 font-medium block">Sẵn sàng</span>
              </div>

              {/* Bàn 12 */}
              <div className="p-2 rounded-md bg-blue-50 border border-blue-200 text-center space-y-1">
                <span className="text-[10px] font-semibold text-blue-900 block">BÀN 12</span>
                <span className="text-[11px] font-medium text-blue-800 block">Gọi VietQR</span>
                <span className="text-[10px] text-blue-900 font-mono font-medium block tabular-nums">540.000₫</span>
              </div>

              {/* Bàn 15 */}
              <div className="p-2 rounded-md bg-zinc-100 border border-zinc-200 text-center space-y-1">
                <span className="text-[10px] font-semibold text-zinc-400 block">BÀN 15</span>
                <span className="text-[11px] font-medium text-zinc-600 block">Đang dọn</span>
                <span className="text-[10px] text-zinc-400 block">3m trước</span>
              </div>
            </div>

            {/* Action Bar for Table 08 */}
            <div className="p-3 bg-white rounded-md border border-zinc-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-700 stroke-[1.5]" />
                  Đơn QR Bàn 08 (3 món · 224.000₫)
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Đợt 1</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTable08Status(table08Status === 'waiting' ? 'approved' : 'waiting')}
                  className={`flex-1 h-8 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    table08Status === 'waiting'
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2]" />
                  {table08Status === 'waiting' ? 'Duyệt chuyển Bếp KDS' : 'Đã duyệt (Bấm hủy)'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowBillPreview(!showBillPreview)}
                  className="h-8 px-3 rounded-md border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
                  <span>{showBillPreview ? 'Ẩn bill' : 'In 80mm'}</span>
                </button>
              </div>
            </div>

            {/* Receipt Preview */}
            {showBillPreview && (
              <div className="p-3 bg-white rounded-md border border-dashed border-zinc-300 font-mono text-[10px] text-zinc-800 space-y-1 animate-fadeIn">
                <div className="text-center font-bold">--- BẾP NHÀ RESTAURANT ---</div>
                <div className="text-center text-[9px] text-zinc-500">PHIẾU TẠM TÍNH - BÀN 08</div>
                <div className="border-b border-dashed border-zinc-200 my-1" />
                <div className="flex justify-between">
                  <span>Phở Tái Lăn (x2)</span>
                  <span className="tabular-nums">150.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Trà Đào Cam Sả (x1)</span>
                  <span className="tabular-nums">39.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cà Phê Muối (x1)</span>
                  <span className="tabular-nums">35.000</span>
                </div>
                <div className="border-b border-dashed border-zinc-200 my-1" />
                <div className="flex justify-between font-bold text-xs">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-emerald-700 tabular-nums">224.000 VNĐ</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: MÀN HÌNH BẾP KDS ================= */}
        {activeTab === 'kitchen-kds' && (
          <div className="space-y-3 animate-fadeIn bg-zinc-900 -m-4 sm:-m-5 p-4 sm:p-5 rounded-b-xl text-white">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-emerald-400 stroke-[1.5]" />
                <span className="text-xs font-semibold text-white tracking-wide">MÀN HÌNH BẾP (KDS CHUẨN FIFO)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                Live 10:15:30
              </span>
            </div>

            {/* KDS Ticket Card */}
            <div className="bg-zinc-800/80 rounded-md border border-zinc-700 p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-zinc-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 text-xs font-bold">
                    BÀN 08
                  </span>
                  <span className="text-[11px] text-zinc-300 font-medium">Đợt 1</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700">
                  <Clock className="w-3 h-3 text-zinc-400 stroke-[1.5]" />
                  <span className="tabular-nums">SLA: {formatTimer(cookingSeconds)}</span>
                </div>
              </div>

              {/* Items checklist */}
              <div className="space-y-1.5">
                {kdsItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleKdsItem(item.id)}
                    className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-colors ${
                      item.done
                        ? 'bg-zinc-900/60 border-zinc-700 text-zinc-400'
                        : 'bg-zinc-900 border-zinc-700 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-3.5 h-3.5 rounded mt-0.5 grid place-items-center shrink-0 text-[10px] ${
                          item.done ? 'bg-emerald-600 text-white' : 'border border-zinc-600'
                        }`}
                      >
                        {item.done && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
                      </div>
                      <div>
                        <span className={`text-xs font-medium block ${item.done ? 'line-through opacity-70' : ''}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">{item.note}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                        item.done
                          ? 'bg-zinc-800 text-emerald-400 border-zinc-700'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-600'
                      }`}
                    >
                      {item.done ? 'Xong ✓' : 'Báo xong'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Quick Caption */}
        <div className="pt-3 border-t border-zinc-200/80 flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[1.5]" />
            Đồng bộ thời gian thực qua WebSocket
          </span>
          <a
            href={MENU_DEMO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-medium text-zinc-700 hover:text-zinc-950 hover:underline flex items-center gap-1"
          >
            Mở thử nghiệm thật ↗
          </a>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
 * KHỐI B: INTERACTIVE TABLE MENU SIMULATOR (Mô phỏng Điện Thoại Gọi Món Thật)
 * ========================================================================= */
export const InteractiveTableMenuSimulator: React.FC = () => {
  type Category = 'all' | 'main' | 'drinks' | 'appetizer';
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [cart, setCart] = useState<Record<string, number>>({
    pho: 1,
    goiCuon: 0,
    traDao: 1,
    caPheMuoi: 0,
  });

  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);

  const demoItems = [
    {
      id: 'pho',
      name: 'Phở Bò Tái Lăn',
      category: 'main',
      price: 75000,
      description: 'Bò xào lăn thơm phức trên lửa lớn, nước dùng ninh xương ống bò 12 giờ.',
      tag: 'Bán chạy',
      icon: Soup,
    },
    {
      id: 'goiCuon',
      name: 'Gỏi Cuốn Tôm Thịt (4 cuộn)',
      category: 'appetizer',
      price: 45000,
      description: 'Tôm sú tươi giòn, thịt luộc thái mỏng, bún tươi và tương bơ đậu phộng.',
      tag: 'Ăn kèm',
      icon: Utensils,
    },
    {
      id: 'traDao',
      name: 'Trà Đào Cam Sả',
      category: 'drinks',
      price: 39000,
      description: 'Trà đen ủ lạnh cao cấp hòa quyện đào giòn ngọt và tinh dầu sả thanh mát.',
      tag: 'Yêu thích',
      icon: CupSoda,
    },
    {
      id: 'caPheMuoi',
      name: 'Cà Phê Muối Xứ Huế',
      category: 'drinks',
      price: 35000,
      description: 'Cà phê Robusta Đắk Lắk pha phin truyền thống kèm lớp kem béo mặn đặc trưng.',
      tag: 'Đặc sản',
      icon: Coffee,
    },
  ];

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const filteredItems =
    activeCategory === 'all'
      ? demoItems
      : demoItems.filter((item) => item.category === activeCategory);

  const totalQuantity = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = demoItems.reduce((sum, item) => {
    const qty = cart[item.id] || 0;
    return sum + qty * item.price;
  }, 0);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const handleSendOrder = () => {
    if (totalQuantity === 0) return;
    setIsOrderSubmitted(true);
  };

  const handleReset = () => {
    setCart({
      pho: 1,
      goiCuon: 0,
      traDao: 1,
      caPheMuoi: 0,
    });
    setIsOrderSubmitted(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
      {/* Left Column: Context & Explanations */}
      <div className="lg:col-span-5 space-y-5">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800">
          <Smartphone className="w-3.5 h-3.5 text-emerald-700 stroke-[1.5]" />
          Mô phỏng trải nghiệm thực khách
        </div>

        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight leading-snug">
          Thử chạm chọn món ngay trên màn hình bên cạnh
        </h3>

        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Khách hàng tại quán chỉ cần quét camera điện thoại vào mã QR dán trên bàn ăn để mở menu web app mượt mà, không yêu cầu cài đặt ứng dụng.
        </p>

        <div className="space-y-2.5 pt-1 text-xs font-medium text-zinc-700">
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 stroke-[2] shrink-0 mt-0.5" />
            <span>Không cần tải app — Mở ngay bằng Camera iPhone, Android hoặc ứng dụng Zalo.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 stroke-[2] shrink-0 mt-0.5" />
            <span>Tự do tùy biến — Chọn size, đá, đường, topping và ghi chú riêng cho đầu bếp.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 stroke-[2] shrink-0 mt-0.5" />
            <span>Gọi thêm nhiều đợt (Rounds) — Thoải mái gọi thêm món mới mà không sợ trùng đơn.</span>
          </div>
        </div>

        {/* Real Demo CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <a
            href={MENU_DEMO_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="md" className="w-full font-medium text-xs">
              Mở Demo Menu Bàn 08 (Trang Thật) <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
            </Button>
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto h-9 px-3.5 rounded-md border border-zinc-200 hover:bg-zinc-100 text-xs font-medium text-zinc-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500 stroke-[1.5]" />
            Đặt lại mô phỏng
          </button>
        </div>
      </div>

      {/* Right Column: Phone Mockup Container */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-full max-w-[360px] bg-white rounded-xl p-3 shadow-md border border-zinc-200/90 relative">
          {/* Phone Screen Inner */}
          <div className="bg-zinc-50 rounded-lg p-3.5 border border-zinc-200/80 min-h-[480px] flex flex-col justify-between overflow-hidden relative">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-800 text-white grid place-items-center font-bold text-xs">
                    BN
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900">Bếp Nhà Restaurant</h4>
                    <span className="text-[10px] text-emerald-800 font-medium block">Bàn 08 · Menu Điện Tử</span>
                  </div>
                </div>
                <span className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium border border-zinc-200">
                  WiFi: BepNha_5G
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Tất cả ({demoItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('main')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
                    activeCategory === 'main'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Món chính
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('appetizer')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
                    activeCategory === 'appetizer'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Ăn kèm
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('drinks')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0 transition-colors cursor-pointer ${
                    activeCategory === 'drinks'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  Đồ uống
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 mt-1">
                {filteredItems.map((item) => {
                  const qty = cart[item.id] || 0;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`p-2 rounded-md bg-white border transition-colors ${
                        qty > 0 ? 'border-emerald-500' : 'border-zinc-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-8 h-8 rounded bg-zinc-100 text-zinc-700 grid place-items-center shrink-0 border border-zinc-200">
                            <Icon className="w-4 h-4 stroke-[1.5]" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-semibold text-zinc-900 truncate">
                              {item.name}
                            </h5>
                            <span className="font-mono text-xs text-emerald-700 font-medium tabular-nums block">
                              {formatVND(item.price)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {qty > 0 && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-6 h-6 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 grid place-items-center cursor-pointer text-xs"
                              >
                                <Minus className="w-3 h-3 stroke-[2]" />
                              </button>
                              <span className="w-4 text-center font-mono text-xs font-semibold text-zinc-900 tabular-nums">
                                {qty}
                              </span>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded bg-emerald-700 hover:bg-emerald-800 text-white grid place-items-center cursor-pointer text-xs"
                          >
                            <Plus className="w-3 h-3 stroke-[2]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Checkout Action */}
            <div className="pt-2 border-t border-zinc-200 mt-2">
              {isOrderSubmitted ? (
                <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-center space-y-1 animate-fadeIn">
                  <span className="text-xs font-semibold text-emerald-900 block flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 stroke-[1.5]" />
                    Đã gửi đơn vào Bếp thành công!
                  </span>
                  <span className="text-[10px] text-emerald-700">Đơn hàng đang được đầu bếp tiếp nhận chế biến</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Tổng cộng ({totalQuantity} món)</span>
                    <span className="font-mono text-xs font-bold text-zinc-900 tabular-nums">
                      {formatVND(totalPrice)}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={totalQuantity === 0}
                    onClick={handleSendOrder}
                    className="h-8 px-3 text-xs font-medium"
                  >
                    Gửi gọi món tới Bếp
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
