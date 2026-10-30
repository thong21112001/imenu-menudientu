'use client';

import React, { useState, useEffect } from 'react';
import { Button, Tilt3DCard } from '@imenu/ui';
import {
  Smartphone,
  Laptop,
  ChefHat,
  CheckCircle2,
  Printer,
  ArrowRight,
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
    <Tilt3DCard
      maxTilt={8}
      className="w-full max-w-lg mx-auto bg-[#121b17] rounded-3xl shadow-2xl border border-[#23322b] overflow-hidden flex flex-col transition-all"
    >
      {/* Tab Switcher Header */}
      <div className="bg-[#0b110f] p-3 flex items-center justify-between border-b border-[#23322b]">
        <div className="flex items-center gap-1.5 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c85a32] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#dfa035] inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#34a87a] inline-block" />
        </div>

        {/* 3 Tabs */}
        <div className="flex items-center gap-1 bg-[#16211c] p-1 rounded-xl border border-[#23322b]">
          <button
            type="button"
            onClick={() => setActiveTab('customer-qr')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'customer-qr'
                ? 'bg-[#dfa035] text-[#080c0a] shadow-xs'
                : 'text-[#98a69e] hover:text-[#ede7da]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Khách</span> QR Bàn 08
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pos-cashier')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pos-cashier'
                ? 'bg-[#dfa035] text-[#080c0a] shadow-xs'
                : 'text-[#98a69e] hover:text-[#ede7da]'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>POS Thu Ngân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kitchen-kds')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'kitchen-kds'
                ? 'bg-[#dfa035] text-[#080c0a] shadow-xs'
                : 'text-[#98a69e] hover:text-[#ede7da]'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Bếp KDS</span>
          </button>
        </div>
      </div>

      {/* Screen Container */}
      <div className="p-4 sm:p-5 bg-[#16211c] min-h-[380px] flex flex-col justify-between text-[#ede7da]">
        {/* ================= TAB 1: KHÁCH QUÉT QR (BÀN 08) ================= */}
        {activeTab === 'customer-qr' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#23322b]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#245846] text-[#ede7da] grid place-items-center font-bold text-xs border border-[#34a87a]/40">
                  iM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#ede7da] leading-none">Bếp Nhà Restaurant</h4>
                  <span className="text-[10px] text-[#34a87a] font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34a87a] animate-pulse" />
                    Bàn 08 · Trực tuyến 3D
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-[#121b17] text-[#dfa035] border border-[#dfa035]/30 px-2 py-0.5 rounded font-mono font-medium">
                ORD-2610-08
              </span>
            </div>

            {/* Simulated Ordered Items */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-[#121b17] border border-[#26352e] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#ede7da] block">2x Phở Bò Tái Lăn</span>
                  <small className="text-[10px] text-[#98a69e]">Ít hành lá, thêm bò tái</small>
                </div>
                <span className="font-mono text-[#dfa035] font-bold tabular-nums">150.000₫</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#121b17] border border-[#26352e] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#ede7da] block">1x Trà Đào Cam Sả</span>
                  <small className="text-[10px] text-[#98a69e]">70% đường, 100% đá</small>
                </div>
                <span className="font-mono text-[#dfa035] font-bold tabular-nums">39.000₫</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#121b17] border border-[#26352e] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#ede7da] block">1x Cà Phê Muối Xứ Huế</span>
                  <small className="text-[10px] text-[#98a69e]">Ít đá, béo vừa</small>
                </div>
                <span className="font-mono text-[#dfa035] font-bold tabular-nums">35.000₫</span>
              </div>
            </div>

            {/* Order Progress / Total */}
            <div className="p-3 bg-[#0e1613] text-[#ede7da] rounded-xl border border-[#26352e] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#98a69e]">Tổng tạm tính (3 món)</span>
                <span className="font-mono text-[#dfa035] font-bold text-sm tabular-nums">224.000₫</span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#23322b]">
                <span className="text-[#34a87a] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34a87a] stroke-[1.5]" />
                  Đang chế biến tại bếp
                </span>
                <span className="font-mono text-[#98a69e] tabular-nums">SLA: {formatTimer(cookingSeconds)}</span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: POS THU NGÂN ================= */}
        {activeTab === 'pos-cashier' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="grid grid-cols-4 gap-2">
              {/* Bàn 08 */}
              <div className="p-2 rounded-xl bg-[#245846]/20 border border-[#245846]/50 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#dfa035] block">BÀN 08</span>
                <span className="text-[11px] font-bold text-[#34a87a] block">
                  {table08Status === 'waiting' ? 'Chờ duyệt' : 'Đang phục vụ'}
                </span>
              </div>

              {/* Bàn 02 */}
              <div className="p-2 rounded-xl bg-[#121b17] border border-[#26352e] text-center space-y-1">
                <span className="text-[10px] font-bold text-[#98a69e] block">BÀN 02</span>
                <span className="text-[11px] font-medium text-[#738379] block">Bàn trống</span>
              </div>

              {/* Bàn 05 */}
              <div className="p-2 rounded-xl bg-[#121b17] border border-[#26352e] text-center space-y-1">
                <span className="text-[10px] font-bold text-[#98a69e] block">BÀN 05</span>
                <span className="text-[11px] font-medium text-[#dfa035] block">Chờ bill</span>
              </div>

              {/* Bàn VIP */}
              <div className="p-2 rounded-xl bg-[#121b17] border border-[#26352e] text-center space-y-1">
                <span className="text-[10px] font-bold text-[#98a69e] block">BÀN VIP</span>
                <span className="text-[11px] font-medium text-[#34a87a] block">Đang dùng</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-1">
              {table08Status === 'waiting' ? (
                <button
                  type="button"
                  onClick={() => setTable08Status('approved')}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#245846] hover:bg-[#1a4133] text-[#ede7da] text-xs font-bold transition-colors cursor-pointer shadow-xs border border-[#2e7a60]/40"
                >
                  Xác nhận Bàn 08 gọi món ✓
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTable08Status('waiting')}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#18231e] border border-[#26352e] text-xs text-[#98a69e] hover:text-[#ede7da] transition-colors cursor-pointer"
                >
                  Đã duyệt (Chạm để hoàn tác)
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowBillPreview(!showBillPreview)}
                className="py-2 px-3 rounded-lg bg-[#18231e] hover:bg-[#202e27] text-[#dfa035] border border-[#26352e] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-[#dfa035]" />
                <span>In 80mm</span>
              </button>
            </div>

            {/* Warm-Parchment (#efeae0) 80mm Receipt Preview Prop */}
            {showBillPreview && (
              <div className="p-3.5 bg-[#efeae0] text-[#111815] border border-[#ded8cb] rounded-xl shadow-2xl space-y-1.5 font-mono text-[11px] animate-scaleUp">
                <div className="text-center font-bold pb-1 border-b border-dashed border-[#c5cec7]">
                  HÓA ĐƠN BÀN 08 (80mm TỰ ĐỘNG)
                </div>
                <div className="flex justify-between text-[10px] text-[#718077]">
                  <span>2x Phở Bò Tái Lăn</span>
                  <span>150.000₫</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#718077]">
                  <span>1x Trà Đào Cam Sả</span>
                  <span>39.000₫</span>
                </div>
                <div className="flex justify-between text-[10px] text-[#718077]">
                  <span>1x Cà Phê Muối</span>
                  <span>35.000₫</span>
                </div>
                <div className="pt-1.5 border-t border-dashed border-[#c5cec7] flex justify-between font-bold text-xs">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-[#245846]">224.000₫</span>
                </div>
                <div className="text-center text-[9px] text-[#718077] pt-1">
                  Mã VietQR: IMENU-ORD-2610-08
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: BẾP KDS ================= */}
        {activeTab === 'kitchen-kds' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-[#23322b]">
              <span className="text-xs font-bold text-[#ede7da] flex items-center gap-1.5">
                <ChefHat className="w-4 h-4 text-[#dfa035]" />
                Màn hình Bếp KDS · Chạm để báo xong
              </span>
              <span className="text-[10px] bg-[#245846]/20 text-[#34a87a] border border-[#245846]/40 px-2 py-0.5 rounded font-mono font-medium">
                Chuẩn FIFO
              </span>
            </div>

            <div className="space-y-2">
              {kdsItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleKdsItem(item.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    item.done
                      ? 'bg-[#121b17] border-[#245846]/50 opacity-80'
                      : 'bg-[#18231e] border-[#dfa035]/40 hover:border-[#dfa035]'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span
                      className={`text-xs font-bold block ${
                        item.done ? 'line-through text-[#738379]' : 'text-[#ede7da]'
                      }`}
                    >
                      {item.name}
                    </span>
                    <small className="text-[10px] text-[#98a69e] block">{item.note}</small>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${
                      item.done
                        ? 'bg-[#245846]/30 text-[#34a87a] border border-[#245846]/50'
                        : 'bg-[#dfa035] text-[#080c0a]'
                    }`}
                  >
                    {item.done ? 'Xong ✓' : 'Báo xong'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Quick Caption */}
        <div className="pt-3 border-t border-[#23322b] flex items-center justify-between text-xs text-[#98a69e]">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#34a87a]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#34a87a] stroke-[1.5]" />
            Đồng bộ thời gian thực qua WebSocket
          </span>
          <a
            href={MENU_DEMO_URL}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-medium text-[#dfa035] hover:text-[#f2b54e] hover:underline flex items-center gap-1"
          >
            Mở thử nghiệm thật ↗
          </a>
        </div>
      </div>
    </Tilt3DCard>
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
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center text-[#ede7da]">
      {/* Left Column: Context & Explanations */}
      <div className="lg:col-span-5 space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151f1b] border border-[#26352e] text-xs font-bold text-[#dfa035]">
          <Smartphone className="w-3.5 h-3.5 text-[#dfa035] stroke-[1.5]" />
          Mô phỏng trải nghiệm thực khách 3D
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-[#ede7da] tracking-tight leading-snug">
          Thử chạm chọn món ngay trên mô phỏng di động
        </h3>

        <p className="text-xs sm:text-sm text-[#98a69e] leading-relaxed">
          Khách hàng tại quán chỉ cần quét camera điện thoại vào mã QR dán trên bàn ăn để mở menu web app mượt mà, không yêu cầu cài đặt ứng dụng.
        </p>

        <div className="space-y-3 pt-1 text-xs font-medium text-[#98a69e]">
          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#34a87a] stroke-[2] shrink-0 mt-0.5" />
            <span>Không cần tải app — Mở ngay bằng Camera iPhone, Android hoặc ứng dụng Zalo.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#34a87a] stroke-[2] shrink-0 mt-0.5" />
            <span>Tự do tùy biến — Chọn size, đá, đường, topping và ghi chú riêng cho đầu bếp.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <Check className="w-4 h-4 text-[#34a87a] stroke-[2] shrink-0 mt-0.5" />
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
            <Button variant="amber" size="md" className="w-full font-bold text-xs shadow-md">
              Mở Demo Menu Bàn 08 (Trang Thật) <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[1.5]" />
            </Button>
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto h-9 px-3.5 rounded-lg border border-[#26352e] hover:bg-[#18231e] text-xs font-medium text-[#98a69e] hover:text-[#ede7da] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#738379] stroke-[1.5]" />
            Đặt lại mô phỏng
          </button>
        </div>
      </div>

      {/* Right Column: Phone Mockup Container inside Tilt3DCard */}
      <div className="lg:col-span-7 flex justify-center">
        <Tilt3DCard
          maxTilt={10}
          className="w-full max-w-[370px] bg-[#121b17] rounded-3xl p-3.5 shadow-2xl border border-[#26352e] relative"
        >
          {/* Phone Screen Inner */}
          <div className="bg-[#16211c] rounded-2xl p-4 border border-[#23322b] min-h-[480px] flex flex-col justify-between overflow-hidden relative">
            <div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#23322b]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#245846] text-[#ede7da] grid place-items-center font-bold text-xs border border-[#34a87a]/40">
                    BN
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#ede7da]">Bếp Nhà Restaurant</h4>
                    <span className="text-[10px] text-[#34a87a] font-medium block">Bàn 08 · Menu Điện Tử</span>
                  </div>
                </div>
                <span className="text-[10px] bg-[#121b17] text-[#dfa035] px-2 py-0.5 rounded-full font-medium border border-[#26352e]">
                  WiFi: BepNha_5G
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                    activeCategory === 'all'
                      ? 'bg-[#dfa035] text-[#080c0a]'
                      : 'bg-[#121b17] text-[#98a69e] border border-[#26352e] hover:bg-[#18231e]'
                  }`}
                >
                  Tất cả ({demoItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('main')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                    activeCategory === 'main'
                      ? 'bg-[#dfa035] text-[#080c0a]'
                      : 'bg-[#121b17] text-[#98a69e] border border-[#26352e] hover:bg-[#18231e]'
                  }`}
                >
                  Món chính
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('appetizer')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                    activeCategory === 'appetizer'
                      ? 'bg-[#dfa035] text-[#080c0a]'
                      : 'bg-[#121b17] text-[#98a69e] border border-[#26352e] hover:bg-[#18231e]'
                  }`}
                >
                  Ăn kèm
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('drinks')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                    activeCategory === 'drinks'
                      ? 'bg-[#dfa035] text-[#080c0a]'
                      : 'bg-[#121b17] text-[#98a69e] border border-[#26352e] hover:bg-[#18231e]'
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
                      className={`p-2 rounded-xl bg-[#121b17] border transition-colors ${
                        qty > 0 ? 'border-[#dfa035]/60 bg-[#14201a]' : 'border-[#26352e]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#18231e] text-[#ede7da] grid place-items-center shrink-0 border border-[#26352e]">
                            <Icon className="w-4 h-4 stroke-[1.5]" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[#ede7da] truncate">
                              {item.name}
                            </h5>
                            <span className="font-mono text-xs text-[#dfa035] font-bold tabular-nums block">
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
                                className="w-6 h-6 rounded bg-[#18231e] hover:bg-[#202e27] text-[#ede7da] grid place-items-center cursor-pointer text-xs border border-[#26352e]"
                              >
                                <Minus className="w-3 h-3 stroke-[2]" />
                              </button>
                              <span className="w-4 text-center font-mono text-xs font-bold text-[#ede7da] tabular-nums">
                                {qty}
                              </span>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded bg-[#245846] hover:bg-[#1a4133] text-[#ede7da] grid place-items-center cursor-pointer text-xs border border-[#2e7a60]/40"
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
            <div className="pt-2 border-t border-[#23322b] mt-2">
              {isOrderSubmitted ? (
                <div className="p-3 rounded-xl bg-[#245846]/20 border border-[#245846]/50 text-center space-y-1 animate-fadeIn">
                  <span className="text-xs font-bold text-[#34a87a] block flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34a87a] stroke-[1.5]" />
                    Đã gửi đơn vào Bếp thành công!
                  </span>
                  <span className="text-[10px] text-[#98a69e]">Đơn hàng đang được đầu bếp tiếp nhận chế biến</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-[#98a69e] block">Tổng cộng ({totalQuantity} món)</span>
                    <span className="font-mono text-xs font-bold text-[#dfa035] tabular-nums">
                      {formatVND(totalPrice)}
                    </span>
                  </div>
                  <Button
                    variant="amber"
                    size="sm"
                    disabled={totalQuantity === 0}
                    onClick={handleSendOrder}
                    className="h-8 px-3 text-xs font-bold cursor-pointer"
                  >
                    Gửi gọi món tới Bếp
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Tilt3DCard>
      </div>
    </div>
  );
};
