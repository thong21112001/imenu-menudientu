'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo, Button } from '@imenu/ui';
import { storageService } from '@imenu/utils';
import { Table } from '@imenu/types';
import {
  QrCode,
  ArrowRight,
  Store,
  Sparkles,
  Clock,
  Utensils,
  Receipt,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function CustomerIndexPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [activeZone, setActiveZone] = useState<string>('all');

  useEffect(() => {
    setTables(storageService.getTables());
  }, []);

  const zones = [
    { id: 'all', name: 'Tất cả bàn' },
    { id: 'zone-1', name: 'Tầng 1' },
    { id: 'zone-2', name: 'Tầng 2 (Máy Lạnh)' },
    { id: 'zone-3', name: 'Sân Vườn' },
    { id: 'zone-vip', name: 'Phòng VIP' },
  ];

  const filteredTables = tables.filter(
    (t) => activeZone === 'all' || t.zoneId === activeZone
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2f7f4] via-[#eaf3ee] to-[#dfeee5] flex flex-col justify-between selection:bg-emerald-200 selection:text-emerald-900">
      {/* MAIN RESPONSIVE WRAPPER */}
      <main className="w-full max-w-lg sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 flex-1">
        
        {/* BRAND HERO HEADER */}
        <header className="text-center space-y-3 pt-1 sm:pt-2">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-md border border-emerald-950/10 mb-1">
            <Logo size="lg" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#124a36]/10 border border-[#124a36]/20 text-[#124a36] text-xs sm:text-sm font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Hệ Thống Thực Đơn Điện Tử & Gọi Món Tại Bàn</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#09271d] tracking-tight">
            Chọn Bàn Trải Nghiệm
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            Mô phỏng thao tác thực khách quét mã QR dán tại bàn ăn của nhà hàng Bếp Nhà để gọi món, xem trạng thái chế biến và thanh toán tiện lợi
          </p>
        </header>

        {/* FEATURED DEMO HERO CARD: BÀN 08 (BÀN CÓ SẴN ĐƠN MẪU) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#09271d] via-[#124a36] to-[#176044] text-white p-5 sm:p-7 lg:p-8 shadow-2xl border-2 border-emerald-500/30">
          {/* Subtle background glow circles */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 md:grid md:grid-cols-12 md:gap-8 md:items-center space-y-4 md:space-y-0">
            {/* Left Col: Info & Description */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black tracking-wide uppercase shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Gợi Ý Thử Nghiệm Nhanh
                </span>
                <span className="text-[11px] sm:text-xs text-emerald-300 font-semibold flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                  </span>
                  Đang có đơn hoạt động
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Bàn 08 · Tầng 2 (Máy Lạnh)
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed max-w-xl">
                  Bàn này đã được thiết lập sẵn 2 món ăn demo (Phở Bò Tái Nạm, Trà Đào Cam Sả). Thích hợp nhất để test nhanh quy trình gọi thêm món, gọi nhân viên, và đối soát bill.
                </p>
              </div>
            </div>

            {/* Right Col: Metrics & Action CTA */}
            <div className="md:col-span-5 flex flex-col justify-center space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5 text-xs text-emerald-200">
                <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <Utensils className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-emerald-300/90 block uppercase tracking-wider font-semibold">Trạng thái</span>
                    <strong className="text-xs sm:text-[13px] text-white font-bold truncate block">2 món đang nấu</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 bg-white/10 px-3.5 py-2.5 rounded-xl backdrop-blur-sm border border-white/10">
                  <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-emerald-300/90 block uppercase tracking-wider font-semibold">Tạm tính</span>
                    <strong className="text-xs sm:text-[13px] text-amber-300 font-bold truncate block">216.000đ</strong>
                  </div>
                </div>
              </div>

              <Link href="/menu/bep-nha/ban-08" className="block w-full">
                <Button
                  variant="amber"
                  size="lg"
                  className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-black shadow-xl hover:shadow-amber-500/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <span>Vào Trải Nghiệm Bàn 08 Ngay</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ALL TABLES SELECTION SECTION */}
        <section className="p-5 sm:p-6 lg:p-8 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-slate-200/90 shadow-xl space-y-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 grid place-items-center text-[#176044] shrink-0">
                <Store className="w-5 h-5 text-[#176044]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-black text-[#176044]">
                  Danh Sách Bàn Ăn Bếp Nhà
                </h3>
                <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                  Chạm vào một bàn bên dưới để mở thực đơn điện tử chuẩn giao diện di động
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs font-black px-3 py-1.5 rounded-full bg-emerald-50 text-[#124a36] border border-emerald-200">
                {filteredTables.length} bàn hiển thị
              </span>
            </div>
          </div>

          {/* Zone filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap items-center">
            {zones.map((z) => {
              const count = z.id === 'all' 
                ? tables.length 
                : tables.filter((t) => t.zoneId === z.id).length;
              return (
                <button
                  key={z.id}
                  onClick={() => setActiveZone(z.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeZone === z.id
                      ? 'bg-[#124a36] text-white shadow-md shadow-emerald-950/20 ring-2 ring-[#124a36]/20'
                      : 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{z.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                      activeZone === z.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 sm:hidden">
            Chạm vào một bàn bên dưới để mở thực đơn điện tử:
          </p>

          {/* Tables Responsive Grid: 2 cols on mobile, 3 cols on tablet, 4 cols on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {filteredTables.map((tbl) => {
              const isBan08 = tbl.code === 'ban-08';
              const isOccupied = tbl.status === 'Occupied' || isBan08;

              return (
                <Link key={tbl.id} href={`/menu/bep-nha/${tbl.code}`}>
                  <div
                    className={`p-4 sm:p-4.5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[110px] sm:min-h-[120px] group cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-1 ${
                      isBan08
                        ? 'bg-gradient-to-br from-[#eef7f2] to-[#e4f2e9] border-[#176044] ring-2 ring-[#176044]/20'
                        : 'bg-slate-50/80 hover:bg-[#f0f8f3] border-slate-200/90 hover:border-[#176044]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <strong className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#176044] block transition-colors truncate">
                          {tbl.name}
                        </strong>
                        <span className="text-[11px] sm:text-xs font-medium text-slate-500 block mt-0.5 truncate">
                          {tbl.zoneName}
                        </span>
                      </div>

                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-slate-200 group-hover:border-[#176044] group-hover:bg-[#176044] text-slate-400 group-hover:text-white grid place-items-center transition-all shrink-0 shadow-xs">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="pt-2.5 flex items-center justify-between border-t border-slate-200/70 mt-2">
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${
                          isOccupied
                            ? 'bg-amber-100 text-amber-900 border border-amber-300/80'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300/80'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOccupied ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                          }`}
                        />
                        {isOccupied ? 'Đang dùng' : 'Bàn trống'}
                      </span>

                      <span className="text-[10px] sm:text-xs font-bold text-[#176044] opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5">
                        Mở menu →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* SYSTEM HIGHLIGHTS FOOTER STRIP */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 pt-1">
          <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 grid place-items-center text-[#176044] shrink-0 sm:mb-2.5">
              <Smartphone className="w-5 h-5 text-[#176044]" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">Gọi Món Ngay</strong>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Không cần chờ phục vụ, tự quét QR chọn món</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 grid place-items-center text-[#176044] shrink-0 sm:mb-2.5">
              <Clock className="w-5 h-5 text-[#176044]" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">Bếp Nhận Tức Thì</strong>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Báo chuông Realtime, chế biến liền tay</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-xs flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 transition-all hover:shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 grid place-items-center text-[#176044] shrink-0 sm:mb-2.5">
              <Receipt className="w-5 h-5 text-[#176044]" />
            </div>
            <div>
              <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">VietQR Chuẩn Xác</strong>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Quét mã thanh toán, đối soát bill tự động</p>
            </div>
          </div>
        </section>
      </main>

      {/* BRAND FOOTER (SEALED AT THE BOTTOM, ZERO WHITE GAP) */}
      <footer className="w-full border-t border-emerald-950/10 bg-white/50 backdrop-blur-md mt-6 sm:mt-8 py-4 sm:py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="font-semibold text-slate-700 hidden sm:inline">Hệ thống Thực đơn Số hóa QR Thông minh</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-500 flex-wrap justify-center">
            <span className="flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Hệ thống hoạt động bình thường
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="font-medium">Tương thích mọi thiết bị: Mobile, Tablet, Desktop</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
