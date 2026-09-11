'use client';

import React, { useState, useEffect } from 'react';
import { storageService } from '@imenu/utils';
import { Table, Restaurant } from '@imenu/types';
import { Card, Button, QrCodeRenderer, Badge } from '@imenu/ui';
import {
  Printer,
  Download,
  QrCode,
  Filter,
  Wifi,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function QrCodesGeneratorPage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(storageService.getRestaurant());
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [printSize, setPrintSize] = useState<'A6' | 'STICKER'>('A6');

  useEffect(() => {
    setRestaurant(storageService.getRestaurant());
    setTables(storageService.getTables());
  }, []);

  const zones = [
    { id: 'all', name: 'Tất cả khu vực' },
    { id: 'zone-1', name: 'Tầng 1' },
    { id: 'zone-2', name: 'Tầng 2 (Máy Lạnh)' },
    { id: 'zone-3', name: 'Sân Vườn' },
    { id: 'zone-vip', name: 'Phòng VIP' },
  ];

  const filteredTables = tables.filter(
    (t) => selectedZone === 'all' || t.zoneId === selectedZone
  );

  const handlePrint = (singleTableId?: string) => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Screen Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#09271d]">Tạo & In Mã QR Bàn Hàng Loạt</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Xuất file in chuẩn kích thước Standee mica A6, Khung gỗ để bàn hoặc Tem dán bàn ăn
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => handlePrint()}
            icon={<Printer className="w-4 h-4" />}
            className="cursor-pointer shadow-md"
          >
            In toàn bộ ({filteredTables.length} bàn)
          </Button>
        </div>
      </div>

      {/* Control Filter Bar (Screen Only) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Zone Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Khu vực:
          </span>
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedZone === z.id
                  ? 'bg-[#124a36] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {z.name}
            </button>
          ))}
        </div>

        {/* Print Size Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 shrink-0">Định dạng in:</span>
          <button
            onClick={() => setPrintSize('A6')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              printSize === 'A6'
                ? 'bg-[#176044] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Standee mica A6 (Chuẩn)
          </button>
          <button
            onClick={() => setPrintSize('STICKER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              printSize === 'STICKER'
                ? 'bg-[#176044] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tem vuông dán bàn
          </button>
        </div>
      </div>

      {/* ================= PRINTABLE & PREVIEW CONTAINER ================= */}
      <div id="qr-print-area">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print-qr-grid">
          {filteredTables.map((tbl) => {
            const tableUrl = `http://localhost:3005/menu/bep-nha/${tbl.code}`;
            return (
              <div
                key={tbl.id}
                className="print-qr-card bg-white rounded-2xl border-2 border-slate-200 p-5 flex flex-col justify-between items-center text-center space-y-3.5 shadow-xs hover:shadow-lg transition-all relative group"
              >
                {/* Brand Header */}
                <div className="space-y-1 w-full border-b border-slate-100 pb-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#124a36] text-[10px] font-extrabold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{restaurant.name || 'Bếp Nhà'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#09271d] tracking-tight mt-1">
                    {tbl.name}
                  </h2>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {tbl.zoneName}
                  </span>
                </div>

                {/* QR Code Graphic Box */}
                <div className="p-3 bg-white rounded-2xl border-2 border-emerald-950/20 shadow-xs flex flex-col items-center justify-center">
                  <QrCodeRenderer value={tableUrl} size={150} title="" />
                </div>

                {/* 3-Step Instruction Guide */}
                <div className="w-full bg-slate-50/90 rounded-xl p-2.5 text-slate-700 text-[11px] space-y-1 border border-slate-200/70 text-left">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Smartphone className="w-3.5 h-3.5 text-[#176044] shrink-0" />
                    <span>Hướng dẫn gọi món:</span>
                  </div>
                  <ol className="list-decimal list-inside text-[10px] text-slate-600 space-y-0.5 pl-0.5">
                    <li>Mở Camera điện thoại quét mã QR</li>
                    <li>Xem thực đơn & chọn món ưa thích</li>
                    <li>Xác nhận gửi đơn đến bếp tức thì</li>
                  </ol>
                </div>

                {/* Wi-Fi & System Footer Strip */}
                <div className="w-full pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1 text-slate-600 font-medium">
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    <span>Wi-Fi: BepNha_Free</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400">Pass: bepnha88</span>
                </div>

                {/* Single Table Print Button (Screen Only) */}
                <div className="w-full pt-2 flex items-center justify-between screen-only opacity-90 group-hover:opacity-100 border-t border-slate-100">
                  <a
                    href={tableUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#176044] hover:underline flex items-center gap-1"
                  >
                    Test link <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => handlePrint(tbl.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#124a36] hover:text-white text-slate-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" /> In bàn này
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
