'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo, Button, Card } from '@imenu/ui';
import { storageService } from '@imenu/utils';
import { Table } from '@imenu/types';
import {
  QrCode,
  ArrowRight,
  Store,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Utensils,
  Receipt,
  Smartphone,
  ShieldCheck,
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
    <div className="min-h-screen bg-gradient-to-b from-[#f3f7f4] via-[#eaf2ed] to-[#dfede4] py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* BRAND HERO HEADER */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-md border border-emerald-950/10 mb-1">
            <Logo size="lg" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#124a36]/10 border border-[#124a36]/20 text-[#124a36] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Hệ Thống Thực Đơn Điện Tử & Gọi Món Tại Bàn</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09271d] tracking-tight">
            Chọn Bàn Trải Nghiệm
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Mô phỏng thao tác thực khách quét mã QR dán tại bàn ăn của nhà hàng Bếp Nhà để gọi món, xem trạng thái chế biến và thanh toán
          </p>
        </div>

        {/* FEATURED DEMO HERO CARD: BÀN 08 (BÀN CÓ SẴN ĐƠN MẪU) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#09271d] via-[#124a36] to-[#176044] text-white p-5 sm:p-6 shadow-2xl border-2 border-emerald-500/30">
          {/* Subtle background glow circle */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[11px] font-extrabold tracking-wide uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Gợi Ý Thử Nghiệm Nhanh
              </span>
              <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Đang có đơn hoạt động
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Bàn 08 · Tầng 2 (Máy Lạnh)
                </h2>
              </div>
              <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
                Bàn này đã được thiết lập sẵn 2 món ăn demo (Phở Bò Tái Nạm, Trà Đào Cam Sả). Thích hợp nhất để test nhanh quy trình gọi thêm món, gọi nhân viên, và đối soát bill.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-emerald-200">
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl backdrop-blur-sm">
                <Utensils className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">2 món đang nấu</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl backdrop-blur-sm">
                <Receipt className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">Tổng bill: 216.000đ</span>
              </div>
            </div>

            <Link href="/menu/bep-nha/ban-08" className="block pt-1">
              <Button
                variant="amber"
                size="lg"
                className="w-full py-3.5 text-sm sm:text-base font-black shadow-xl hover:shadow-amber-500/25 active:scale-[0.99] transition-all"
              >
                <span>Vào Trải Nghiệm Bàn 08 Ngay</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ALL TABLES SELECTION CARD */}
        <div className="p-5 sm:p-6 bg-white rounded-3xl border-2 border-slate-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-extrabold text-[#176044]">
              <Store className="w-4 h-4 text-[#176044]" />
              <span>Danh Sách Bàn Ăn Bếp Nhà</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {filteredTables.length} bàn
            </span>
          </div>

          {/* Zone filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setActiveZone(z.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeZone === z.id
                    ? 'bg-[#124a36] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {z.name}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Chạm vào một bàn bên dưới để mở thực đơn điện tử chuẩn giao diện điện thoại:
          </p>

          {/* Tables Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {filteredTables.map((tbl) => {
              const isBan08 = tbl.code === 'ban-08';
              const isOccupied = tbl.status === 'Occupied' || isBan08;

              return (
                <Link key={tbl.id} href={`/menu/bep-nha/${tbl.code}`}>
                  <div
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[105px] group cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                      isBan08
                        ? 'bg-[#eef7f2] border-[#176044] ring-2 ring-[#176044]/20'
                        : 'bg-slate-50/70 hover:bg-[#edf6f1] border-slate-200 hover:border-[#176044]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <strong className="text-sm font-black text-slate-900 group-hover:text-[#176044] block transition-colors">
                          {tbl.name}
                        </strong>
                        <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                          {tbl.zoneName}
                        </span>
                      </div>

                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 group-hover:border-[#176044] group-hover:bg-[#176044] text-slate-400 group-hover:text-white grid place-items-center transition-colors">
                        <QrCode className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 mt-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOccupied
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {isOccupied ? '● Đang dùng' : '○ Bàn trống'}
                      </span>
                      <span className="text-[10px] font-bold text-[#176044] opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        Mở →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* SYSTEM HIGHLIGHTS FOOTER */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <Smartphone className="w-5 h-5 text-[#176044] mx-auto" />
            <strong className="text-[11px] font-bold text-slate-800 block">Gọi Món Ngay</strong>
            <p className="text-[9px] text-slate-500">Không cần chờ phục vụ</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <Clock className="w-5 h-5 text-[#176044] mx-auto" />
            <strong className="text-[11px] font-bold text-slate-800 block">Bếp Nhận Tức Thì</strong>
            <p className="text-[9px] text-slate-500">Báo chuông Realtime</p>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <Receipt className="w-5 h-5 text-[#176044] mx-auto" />
            <strong className="text-[11px] font-bold text-slate-800 block">VietQR Chuẩn Xác</strong>
            <p className="text-[9px] text-slate-500">Đối soát bill tự động</p>
          </div>
        </div>
      </div>
    </div>
  );
}
