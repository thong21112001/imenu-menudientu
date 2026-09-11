'use client';

import React, { useState, useEffect, useRef } from 'react';
import { storageService, formatCurrencyVND, formatDateTime, generateVietQRUrl } from '@imenu/utils';
import { Order, Restaurant } from '@imenu/types';
import { Card, Button, StatusChip } from '@imenu/ui';
import {
  Receipt,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CheckCircle2,
  Clock,
  QrCode,
  Store,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

export default function BillsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>(storageService.getRestaurant());
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<Order | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Preparing' | 'PaymentRequested'>('all');

  useEffect(() => {
    setOrders(storageService.getOrders());
    setRestaurant(storageService.getRestaurant());
  }, []);

  // Keyboard shortcut: ESC to close preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedOrderForBill(null);
      }
    };
    if (selectedOrderForBill) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [selectedOrderForBill]);

  const handleOpenPreview = (order: Order) => {
    setSelectedOrderForBill(order);
    setZoomScale(1); // Reset zoom on open
  };

  const handleClosePreview = () => {
    setSelectedOrderForBill(null);
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.0));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.6));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'Paid') return o.status === 'Paid' || o.isPaid;
    if (statusFilter === 'PaymentRequested') return o.status === 'PaymentRequested';
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d] flex items-center gap-2.5">
            <Receipt className="w-7 h-7 text-[#176044]" />
            Hóa Đơn & In Bill Nhiệt 80mm
          </h1>
          <p className="text-xs text-[#66736d] mt-1">
            Quản lý lịch sử thanh toán, xem trước hóa đơn dạng thu phóng trực quan và in bill chuẩn máy POS 80mm
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-[#124a36] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('PaymentRequested')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'PaymentRequested'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
            }`}
          >
            Chờ thanh toán
          </button>
          <button
            onClick={() => setStatusFilter('Paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === 'Paid'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
            }`}
          >
            Đã thanh toán
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">Chưa có hóa đơn nào theo bộ lọc này</p>
            <p className="text-xs text-slate-400">Các đơn gọi món từ khách hàng và POS sẽ hiển thị tại đây</p>
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <Card
              key={ord.id}
              onClick={() => handleOpenPreview(ord)}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-slate-200 hover:border-[#176044] hover:shadow-md transition-all cursor-pointer group bg-white"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-extrabold text-[#09271d] group-hover:text-[#176044] transition-colors">
                    {ord.tableName}
                  </span>
                  <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                    {ord.orderCode}
                  </span>
                  <StatusChip status={ord.status} size="sm" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDateTime(ord.createdAt)}
                  </span>
                  <span>·</span>
                  <span className="font-medium text-slate-700">{ord.items.length} món ăn</span>
                  <span>·</span>
                  <span className="text-[11px] text-[#176044] font-semibold">
                    {ord.orderSource === 'STAFF_POS' ? 'Tạo bởi POS' : 'Khách quét QR'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                    Tổng thanh toán
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#176044]">
                    {formatCurrencyVND(ord.totalAmount)}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPreview(ord);
                  }}
                  icon={<Receipt className="w-4 h-4" />}
                  className="shadow-sm"
                >
                  Xem & In Bill 80mm
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* FULLSCREEN RESPONSIVE ZOOMABLE RECEIPT MODAL */}
      {selectedOrderForBill && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-md animate-fadeIn"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={handleClosePreview}
        >
          {/* STICKY TOP HEADER */}
          <div
            className="flex-shrink-0 bg-[#09271d] text-white px-4 sm:px-6 py-3.5 border-b border-[#183a2e] flex items-center justify-between shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#176044] text-white grid place-items-center flex-shrink-0 shadow-inner">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold truncate text-white">
                  Xem Trước Hóa Đơn In Nhiệt 80mm
                </h2>
                <p className="text-[11px] text-emerald-300 truncate">
                  {selectedOrderForBill.tableName} · Mã: <span className="font-mono font-bold text-white">{selectedOrderForBill.orderCode}</span>
                </p>
              </div>
            </div>

            {/* EXIT / CLOSE BUTTON */}
            <button
              onClick={handleClosePreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600 hover:text-white text-slate-200 transition-all text-xs font-bold border border-white/20 active:scale-95 cursor-pointer ml-3 flex-shrink-0"
              title="Thoát xem trước (phím ESC)"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>

          {/* ZOOM TOOLBAR (FLOATING / STICKY UNDER HEADER) */}
          <div
            className="flex-shrink-0 bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="text-[11px] text-slate-400">Thu phóng:</span>
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 0.6}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors border border-slate-700"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="min-w-[48px] text-center font-bold font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 2.0}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors border border-slate-700"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors border border-slate-700 ml-1"
                title="Đặt lại 100%"
              >
                <RotateCcw className="w-3 h-3" /> Chuẩn (100%)
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="hidden md:inline">Khổ giấy tiêu chuẩn: <strong>80mm</strong></span>
              <span className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800 font-semibold text-[10px]">
                {selectedOrderForBill.status === 'Paid' ? 'Đã Thanh Toán' : 'Phiếu Tạm Tính'}
              </span>
            </div>
          </div>

          {/* SCROLLABLE VIEWPORT FOR THERMAL RECEIPT */}
          <div
            className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start touch-pan-y"
            onClick={handleClosePreview}
          >
            <div
              className="transition-transform duration-150 ease-out origin-top my-auto py-2"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* THERMAL PAPER CONTAINER (PRINTABLE AREA) */}
              <div
                id="thermal-print-area"
                className="relative bg-white text-black font-mono shadow-2xl rounded-sm border border-slate-300 p-5 w-[330px] max-w-[92vw] mx-auto text-xs leading-relaxed select-text"
                style={{
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.1)',
                }}
              >
                {/* Decorative Top Perforation / Tear Notch */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />

                {/* Restaurant Brand Info */}
                <div className="text-center pb-3 border-b-2 border-dashed border-slate-900 space-y-1">
                  <h3 className="text-base font-bold font-sans tracking-wide uppercase text-slate-950">
                    {restaurant.name}
                  </h3>
                  <p className="text-[11px] text-slate-700 leading-tight">
                    {restaurant.address}
                  </p>
                  <p className="text-[11px] text-slate-700">
                    Hotline: <strong>{restaurant.phone}</strong>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Wifi: BepNha_Guest / Pass: bepnha888
                  </p>
                </div>

                {/* Bill Header Meta */}
                <div className="text-center py-2.5 space-y-1">
                  <div className="text-sm font-extrabold tracking-wider uppercase text-slate-950">
                    {selectedOrderForBill.status === 'Paid' ? 'HÓA ĐƠN THANH TOÁN' : 'PHIẾU TẠM TÍNH TIỀN'}
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    {selectedOrderForBill.tableName}
                  </div>
                  <div className="text-[10px] text-slate-600 flex justify-between pt-1">
                    <span>Số HĐ: <strong>{selectedOrderForBill.orderCode}</strong></span>
                    <span>Thu ngân: ThuNgan_01</span>
                  </div>
                  <div className="text-[10px] text-slate-600 flex justify-between">
                    <span>Giờ vào: {formatDateTime(selectedOrderForBill.createdAt)}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-t-2 border-b-2 border-dashed border-slate-900 py-2 my-2">
                  <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-dotted border-slate-400">
                    <span className="w-1/2 text-left">Tên món</span>
                    <span className="w-1/6 text-center">SL</span>
                    <span className="w-1/3 text-right">T.Tiền</span>
                  </div>

                  <div className="divide-y divide-dotted divide-slate-300 pt-1">
                    {selectedOrderForBill.items.map((it, idx) => (
                      <div key={idx} className="py-1.5 flex justify-between items-start text-[11px]">
                        <div className="w-1/2 pr-1">
                          <strong className="block text-slate-950 font-bold leading-tight">
                            {it.name}
                          </strong>
                          <span className="text-[10px] text-slate-600 block">
                            @{formatCurrencyVND(it.price)}
                          </span>
                        </div>
                        <div className="w-1/6 text-center font-bold pt-0.5">
                          {it.quantity}
                        </div>
                        <div className="w-1/3 text-right font-bold pt-0.5 text-slate-950">
                          {formatCurrencyVND(it.itemTotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-1 py-1 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Tổng số lượng món:</span>
                    <span className="font-bold">
                      {selectedOrderForBill.items.reduce((s, c) => s + c.quantity, 0)} món
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Tạm tính tiền món:</span>
                    <span>{formatCurrencyVND(selectedOrderForBill.subTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Giảm giá / Ưu đãi:</span>
                    <span>0đ</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Thuế VAT (0%):</span>
                    <span>0đ</span>
                  </div>

                  {/* Grand Total */}
                  <div className="flex justify-between items-center text-sm font-extrabold pt-2 border-t-2 border-dashed border-slate-900 text-slate-950">
                    <span>TỔNG THANH TOÁN:</span>
                    <span className="text-base font-black text-slate-950">
                      {formatCurrencyVND(selectedOrderForBill.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* QR PAYMENT AREA (VIETQR) */}
                <div className="my-3 p-3 bg-slate-50 border border-slate-300 rounded-xl text-center space-y-2">
                  <span className="text-[10px] font-bold text-slate-700 block uppercase">
                    Quét mã VietQR chuyển khoản nhanh
                  </span>
                  <div className="flex justify-center">
                    <img
                      src={generateVietQRUrl({
                        bankId: restaurant.bankAccount?.bankId || 'MB',
                        accountNo: restaurant.bankAccount?.accountNo || '0901234567',
                        accountName: restaurant.bankAccount?.accountName || 'IMENU BEP NHA',
                        amount: selectedOrderForBill.totalAmount,
                        memo: selectedOrderForBill.orderCode,
                        template: 'compact2',
                      })}
                      alt="VietQR Chuyển Khoản"
                      className="w-32 h-32 object-contain border border-slate-200 rounded-lg p-1 bg-white"
                    />
                  </div>
                  <div className="text-[10px] text-slate-600 font-sans space-y-0.5">
                    <p><strong>{restaurant.bankAccount?.bankName || 'Ngân hàng Quân Đội (MBBank)'}</strong></p>
                    <p>STK: <strong>{restaurant.bankAccount?.accountNo || '0901234567'}</strong></p>
                    <p>Chủ TK: <strong>{restaurant.bankAccount?.accountName || 'NHA HANG BEP NHA'}</strong></p>
                  </div>
                </div>

                {/* Footer Notes */}
                <div className="text-center pt-2 border-t border-dashed border-slate-900 space-y-1 text-[10px] text-slate-700">
                  <p className="font-bold">CẢM ƠN QUÝ KHÁCH VÀ HẸN GẶP LẠI!</p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    Powered by iMenu Electronic Solution
                  </p>
                  {/* Barcode representation */}
                  <div className="tracking-widest font-mono text-center pt-1 text-slate-400 text-[10px]">
                    ||| | |||| || |||||| | ||| |||| | ||
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STICKY BOTTOM ACTIONS FOR MOBILE & DESKTOP */}
          <div
            className="flex-shrink-0 bg-[#09271d] border-t border-[#183a2e] px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white text-xs hidden sm:block">
              <span>Đang xem: <strong>{selectedOrderForBill.tableName}</strong> ({selectedOrderForBill.orderCode})</span>
              <span className="ml-2 text-emerald-400 font-bold">
                · {formatCurrencyVND(selectedOrderForBill.totalAmount)}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleClosePreview}
                className="flex-1 sm:flex-initial py-2.5 px-4 text-xs bg-transparent text-slate-200 border-white/20 hover:bg-white/10 hover:text-white"
              >
                <X className="w-4 h-4 mr-1.5" /> Thoát / Đóng
              </Button>

              <Button
                variant="primary"
                onClick={handlePrintReceipt}
                className="flex-1 sm:flex-initial py-2.5 px-6 text-xs font-bold shadow-lg bg-[#176044] hover:bg-[#124a36]"
              >
                <Printer className="w-4 h-4 mr-2" /> In Hóa Đơn 80mm Ngay
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
