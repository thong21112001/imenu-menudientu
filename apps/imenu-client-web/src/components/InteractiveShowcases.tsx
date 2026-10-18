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
  Bell,
  Printer,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Send,
  RotateCcw,
  Utensils,
  Layers,
  Flame,
  Check,
  AlertCircle,
  Receipt,
} from 'lucide-react';

/* =========================================================================
 * KHỐI A: HERO SYSTEM PREVIEW (Mô phỏng 3 màn hình sống động tại Hero)
 * ========================================================================= */
export const HeroSystemPreview: React.FC = () => {
  type SystemTab = 'customer-qr' | 'pos-cashier' | 'kitchen-kds';
  const [activeTab, setActiveTab] = useState<SystemTab>('customer-qr');

  // Customer QR interactive state
  const [isVietQrModalOpen, setIsVietQrModalOpen] = useState(false);
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
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border-2 border-slate-900/90 overflow-hidden flex flex-col transition-all">
      {/* Tab Switcher Header */}
      <div className="bg-slate-900 p-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-1.5 px-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/90 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/90 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/90 inline-block" />
        </div>

        {/* 3 Tabs */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('customer-qr')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'customer-qr'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span className="hidden sm:inline">Khách</span> QR Bàn 08
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pos-cashier')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'pos-cashier'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Laptop className="w-3 h-3" />
            <span>POS Thu Ngân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kitchen-kds')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'kitchen-kds'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <ChefHat className="w-3 h-3" />
            <span>Bếp KDS</span>
          </button>
        </div>
      </div>

      {/* Screen Container */}
      <div className="p-4 sm:p-5 bg-slate-50 min-h-[380px] flex flex-col justify-between">
        
        {/* ================= TAB 1: KHÁCH QUÉT QR (BÀN 08) ================= */}
        {activeTab === 'customer-qr' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* Phone Top Notch & Brand Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white grid place-items-center font-black text-xs shadow-sm">
                  iM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 leading-none">Bếp Nhà Restaurant</h4>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Bàn 08 · Trực tuyến
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                ORD-2610-08
              </span>
            </div>

            {/* Selected Items Cards */}
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 grid place-items-center text-base border border-emerald-100 flex-shrink-0">
                    🍲
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Phở Bò Tái Lăn (x2)</div>
                    <div className="text-[10px] text-amber-700 font-medium">Ít hành lá, thêm bò tái</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-slate-900">150.000₫</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 grid place-items-center text-base border border-amber-100 flex-shrink-0">
                    🍹
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Trà Đào Cam Sả (x1)</div>
                    <div className="text-[10px] text-slate-500">70% đường, 100% đá</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-slate-900">39.000₫</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 grid place-items-center text-base border border-amber-100 flex-shrink-0">
                    ☕
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Cà Phê Muối Huế (x1)</div>
                    <div className="text-[10px] text-slate-500">Ít đá, béo vừa</div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-slate-900">35.000₫</span>
              </div>
            </div>

            {/* Live Kitchen Progress Status */}
            <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 grid place-items-center border border-amber-500/30">
                  <Flame className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Tiến độ gian bếp
                  </span>
                  <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span>Đang nấu 2/3 món</span>
                    <span className="text-[10px] text-slate-400 font-mono">({formatTimer(cookingSeconds)})</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Tổng thanh toán</span>
                <span className="text-sm font-extrabold text-emerald-400">224.000₫</span>
              </div>
            </div>

            {/* Actions: Request VietQR Payment */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsVietQrModalOpen(!isVietQrModalOpen)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <CreditCard className="w-4 h-4 text-emerald-200" />
                {isVietQrModalOpen ? 'Ẩn mã QR' : 'Gọi thanh toán VietQR (Chính xác từng đồng)'}
              </button>
            </div>

            {/* Simulated VietQR Modal Dropdown */}
            {isVietQrModalOpen && (
              <div className="p-3 bg-white rounded-2xl border-2 border-emerald-500 shadow-lg text-center space-y-2 animate-scaleUp">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  Mã VietQR Napas 247 · Bàn 08
                </div>
                <div className="w-28 h-28 mx-auto bg-slate-100 rounded-xl p-1.5 border border-slate-200 grid place-items-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://vietqr.me/demo-224k-ban08"
                    alt="VietQR Demo"
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <div className="text-[11px] text-slate-600">
                  Chủ TK: <strong className="text-slate-900">BẾP NHÀ RESTAURANT</strong> · 224.000₫
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: THU NGÂN POS & SƠ ĐỒ BÀN ================= */}
        {activeTab === 'pos-cashier' && (
          <div className="space-y-3.5 animate-fadeIn">
            {/* POS Top Status Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-900">POS Thu Ngân · Trụ Sở Chính</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Bell className="w-3 h-3 text-amber-600 animate-bounce" />
                <span>1 yêu cầu mới</span>
              </div>
            </div>

            {/* Interactive Table Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Bàn 01 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">BÀN 01</span>
                <span className="text-[11px] font-bold text-slate-700 block">Trống</span>
                <span className="text-[9px] text-emerald-600 font-semibold block">Sẵn sàng</span>
              </div>

              {/* Bàn 03 */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 block">BÀN 03</span>
                <span className="text-[11px] font-extrabold text-emerald-950 block">4 khách</span>
                <span className="text-[9px] text-emerald-700 font-mono font-bold block">380.000₫</span>
              </div>

              {/* Bàn 08 (Actionable Table) */}
              <div
                className={`p-2.5 rounded-xl border-2 text-center space-y-1 transition-all cursor-pointer ${
                  table08Status === 'waiting'
                    ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                    : 'bg-emerald-50 border-emerald-500'
                }`}
                onClick={() => setTable08Status(table08Status === 'waiting' ? 'approved' : 'waiting')}
                title="Bấm để mô phỏng duyệt món"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-900">BÀN 08</span>
                  {table08Status === 'waiting' ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  ) : (
                    <Check className="w-3 h-3 text-emerald-600" />
                  )}
                </div>
                <span className="text-[11px] font-extrabold text-slate-900 block">
                  {table08Status === 'waiting' ? 'Chờ duyệt QR' : 'Đang phục vụ'}
                </span>
                <span className="text-[9px] text-emerald-700 font-mono font-bold block">224.000₫</span>
              </div>

              {/* Bàn 09 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">BÀN 09</span>
                <span className="text-[11px] font-bold text-slate-700 block">Trống</span>
                <span className="text-[9px] text-emerald-600 font-semibold block">Sẵn sàng</span>
              </div>

              {/* Bàn 12 */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-300 text-center space-y-1">
                <span className="text-[10px] font-bold text-blue-800 block">BÀN 12</span>
                <span className="text-[11px] font-bold text-blue-950 block">Gọi VietQR</span>
                <span className="text-[9px] text-blue-700 font-mono font-bold block">540.000₫</span>
              </div>

              {/* Bàn 15 */}
              <div className="p-2.5 rounded-xl bg-slate-100/70 border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">BÀN 15</span>
                <span className="text-[11px] font-bold text-slate-600 block">Đang dọn</span>
                <span className="text-[9px] text-slate-400 block">3 phút trước</span>
              </div>
            </div>

            {/* Action Bar for Selected Table 08 */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  Đơn QR Bàn 08 (3 món · 224.000₫)
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">Lượt gọi #1</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTable08Status(table08Status === 'waiting' ? 'approved' : 'waiting')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    table08Status === 'waiting'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {table08Status === 'waiting' ? 'Duyệt chuyển Bếp KDS' : 'Đã duyệt (Bấm hủy)'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowBillPreview(!showBillPreview)}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showBillPreview ? 'Ẩn bill' : 'In 80mm'}</span>
                </button>
              </div>
            </div>

            {/* Receipt 80mm Mockup */}
            {showBillPreview && (
              <div className="p-3 bg-white rounded-2xl border border-dashed border-slate-400 font-mono text-[10px] text-slate-800 space-y-1 animate-fadeIn">
                <div className="text-center font-bold">--- BẾP NHÀ RESTAURANT ---</div>
                <div className="text-center text-[9px] text-slate-500">PHIẾU TẠM TÍNH - BÀN 08</div>
                <div className="border-b border-dashed border-slate-300 my-1" />
                <div className="flex justify-between">
                  <span>Phở Tái Lăn (x2)</span>
                  <span>150.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Trà Đào Cam Sả (x1)</span>
                  <span>39.000</span>
                </div>
                <div className="flex justify-between">
                  <span>Cà Phê Muối (x1)</span>
                  <span>35.000</span>
                </div>
                <div className="border-b border-dashed border-slate-300 my-1" />
                <div className="flex justify-between font-bold text-xs">
                  <span>TỔNG CỘNG:</span>
                  <span className="text-emerald-700">224.000 VNĐ</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: MÀN HÌNH BẾP KDS ================= */}
        {activeTab === 'kitchen-kds' && (
          <div className="space-y-3.5 animate-fadeIn bg-slate-900 -m-4 sm:-m-5 p-4 sm:p-5 rounded-b-3xl text-white">
            {/* KDS Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white tracking-wide">MÀN HÌNH BẾP (KDS CHUẨN FIFO)</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                Live 10:15:30
              </span>
            </div>

            {/* KDS Ticket Card */}
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-3.5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-black">
                    BÀN 08
                  </span>
                  <span className="text-[11px] text-slate-300 font-semibold">Lượt #1 (Khách QR)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                  <Clock className="w-3 h-3 animate-spin" />
                  SLA: {formatTimer(cookingSeconds)}
                </div>
              </div>

              {/* Items checklist */}
              <div className="space-y-2">
                {kdsItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleKdsItem(item.id)}
                    className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      item.done
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-slate-300'
                        : 'bg-slate-900/80 border-slate-700 text-white'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`w-4 h-4 rounded mt-0.5 grid place-items-center flex-shrink-0 text-[10px] ${
                          item.done ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600'
                        }`}
                      >
                        {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${item.done ? 'line-through opacity-70' : ''}`}>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-amber-400/90 block">{item.note}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                        item.done
                          ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                          : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
                      }`}
                    >
                      {item.done ? 'Đã xong ✓' : 'Báo xong'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span>Chạm vào món để đánh dấu hoàn thành</span>
                <span className="text-emerald-400 font-bold">Chuông báo phục vụ: Sẵn sàng</span>
              </div>
            </div>

            {/* Bottom Realtime Indicator */}
            <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Tự động đồng bộ với máy thu ngân và điện thoại khách qua WebSocket
            </div>
          </div>
        )}

        {/* Footer Quick Caption */}
        <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            3 phân hệ đồng bộ tức thì
          </span>
          <a
            href="http://localhost:3005/menu/bep-nha/ban-08"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
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
      emoji: '🍲',
    },
    {
      id: 'goiCuon',
      name: 'Gỏi Cuốn Tôm Thịt (4 cuộn)',
      category: 'appetizer',
      price: 45000,
      description: 'Tôm sú tươi giòn, thịt luộc thái mỏng, bún tươi và tương bơ đậu phộng.',
      tag: 'Ăn kèm',
      emoji: '🥢',
    },
    {
      id: 'traDao',
      name: 'Trà Đào Cam Sả',
      category: 'drinks',
      price: 39000,
      description: 'Trà đen ủ lạnh cao cấp hòa quyện đào giòn ngọt và tinh dầu sả thanh mát.',
      tag: 'Yêu thích',
      emoji: '🍹',
    },
    {
      id: 'caPheMuoi',
      name: 'Cà Phê Muối Xứ Huế',
      category: 'drinks',
      price: 35000,
      description: 'Cà phê Robusta Đắk Lắk pha phin truyền thống kèm lớp kem béo mặn đặc trưng.',
      tag: 'Đặc sản',
      emoji: '☕',
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
      <div className="lg:col-span-5 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Mô phỏng trải nghiệm thực khách
        </div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
          Thử chạm chọn món ngay trên màn hình bên cạnh
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed">
          Khách hàng tại quán chỉ cần quét camera điện thoại vào mã QR dán trên bàn ăn để mở menu web app mượt mà, không yêu cầu cài đặt ứng dụng.
        </p>

        <div className="space-y-3.5 pt-2 text-xs font-semibold text-slate-700">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span><strong>Không cần tải app</strong> — Mở ngay bằng Camera iPhone, Android hoặc ứng dụng Zalo.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span><strong>Tự do tùy biến</strong> — Chọn size, đá, đường, topping và ghi chú riêng cho đầu bếp.</span>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center flex-shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span><strong>Gọi thêm nhiều đợt (Rounds)</strong> — Thoải mái gọi thêm món mới mà không sợ trùng đơn.</span>
          </div>
        </div>

        {/* Real Demo CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <a
            href="http://localhost:3005/menu/bep-nha/ban-08"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="lg" className="w-full shadow-md shadow-emerald-700/20 font-bold text-xs sm:text-sm">
              Mở Demo Menu Bàn 08 (Trang Thật) <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Đặt lại mô phỏng
          </button>
        </div>
      </div>

      {/* Right Column: Phone Mockup Container */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="w-full max-w-[380px] bg-white rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-900 relative">
          
          {/* Phone Top Notch Speaker */}
          <div className="w-28 h-4 bg-slate-900 rounded-b-xl mx-auto -mt-3 mb-2 flex items-center justify-center">
            <span className="w-10 h-1 rounded-full bg-slate-700" />
          </div>

          {/* Phone Screen Inner */}
          <div className="bg-slate-50 rounded-[2rem] p-4 border border-slate-200/80 min-h-[520px] flex flex-col justify-between overflow-hidden relative">
            
            {/* Phone Header */}
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white grid place-items-center font-bold text-xs shadow-xs">
                    BN
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Bếp Nhà Restaurant</h4>
                    <span className="text-[10px] text-emerald-700 font-bold block">Bàn 08 · Menu Điện Tử</span>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  WiFi: BepNha_5G
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Tất cả ({demoItems.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('main')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 transition-colors ${
                    activeCategory === 'main'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Món chính
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('appetizer')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 transition-colors ${
                    activeCategory === 'appetizer'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Ăn kèm
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('drinks')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 transition-colors ${
                    activeCategory === 'drinks'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Đồ uống
                </button>
              </div>

              {/* Interactive Item Cards List */}
              <div className="space-y-2.5 mt-1">
                {filteredItems.map((item) => {
                  const qty = cart[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-2xl bg-white border transition-all ${
                        qty > 0
                          ? 'border-emerald-500 shadow-sm ring-1 ring-emerald-500/20'
                          : 'border-slate-200/90 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 grid place-items-center text-lg flex-shrink-0">
                            {item.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-slate-900 truncate">
                                {item.name}
                              </h5>
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/60 flex-shrink-0">
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                            <span className="text-xs font-extrabold text-emerald-700 block mt-1">
                              {formatVND(item.price)}
                            </span>
                          </div>
                        </div>

                        {/* Quantity Counter Buttons */}
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={qty === 0}
                            className={`w-6 h-6 rounded-lg grid place-items-center transition-colors ${
                              qty > 0
                                ? 'bg-white text-slate-800 shadow-xs hover:bg-slate-200'
                                : 'text-slate-300 cursor-not-allowed'
                            }`}
                            aria-label={`Giảm số lượng ${item.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="w-4 text-center font-bold text-xs text-slate-900">
                            {qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white grid place-items-center shadow-xs transition-colors"
                            aria-label={`Tăng số lượng ${item.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Floating Bar inside phone */}
            <div className="pt-3">
              {isOrderSubmitted ? (
                <div className="p-3 bg-emerald-800 text-white rounded-2xl shadow-lg space-y-2 animate-scaleUp text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 mx-auto grid place-items-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">Đã gửi đơn thành công!</h5>
                    <p className="text-[10px] text-emerald-200 mt-0.5">
                      Đơn Bàn 08 đã vào máy Thu Ngân & Bếp KDS
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-1.5 rounded-xl bg-white text-emerald-950 font-bold text-[11px] hover:bg-emerald-50 transition-colors"
                  >
                    Thử lại đợt gọi món khác
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white grid place-items-center relative">
                      <ShoppingBag className="w-4 h-4" />
                      {totalQuantity > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] grid place-items-center">
                          {totalQuantity}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Tạm tính ({totalQuantity} món)</span>
                      <strong className="text-xs font-bold text-emerald-400 block">{formatVND(totalPrice)}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOrder}
                    disabled={totalQuantity === 0}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      totalQuantity > 0
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Gửi đơn</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};
