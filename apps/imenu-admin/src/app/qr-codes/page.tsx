'use client';

import React, { useState, useEffect } from 'react';
import { storageService } from '@imenu/utils';
import { Table } from '@imenu/types';
import { Card, Button, QrCodeRenderer } from '@imenu/ui';
import { Printer, Download, QrCode } from 'lucide-react';

export default function QrCodesGeneratorPage() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    setTables(storageService.getTables());
  }, []);

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Tạo & In Mã QR Bàn Hàng Loạt</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Xuất file in chuẩn kích thước Standee mica A6, Khung gỗ để bàn hoặc Tem dán
          </p>
        </div>

        <Button variant="primary" onClick={handlePrintAll} icon={<Printer className="w-4 h-4" />}>
          In toàn bộ mã QR bàn
        </Button>
      </div>

      {/* QR Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((tbl) => {
          const tableUrl = `http://localhost:3005/menu/bep-nha/${tbl.code}`;
          return (
            <Card key={tbl.id} className="p-6 text-center space-y-4 border-2 border-slate-200">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-widest text-[#176044] uppercase block">
                  Bếp Nhà Restaurant
                </span>
                <h3 className="text-lg font-extrabold text-[#09271d]">{tbl.name}</h3>
                <small className="text-xs text-slate-400 block">{tbl.zoneName}</small>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
                <QrCodeRenderer value={tableUrl} size={150} />
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Quét mã để xem thực đơn & gọi món
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
