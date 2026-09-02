'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo, Button, Card } from '@imenu/ui';
import { storageService } from '@imenu/utils';
import { Table } from '@imenu/types';
import { QrCode, ArrowRight, Store } from 'lucide-react';

export default function CustomerIndexPage() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    setTables(storageService.getTables());
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 pt-10">
      <div className="text-center space-y-2">
        <Logo size="lg" />
        <h1 className="text-2xl font-extrabold text-[#09271d]">Chọn bàn trải nghiệm</h1>
        <p className="text-xs text-slate-500">
          Mô phỏng quét mã QR tại các bàn ăn của nhà hàng Bếp Nhà
        </p>
      </div>

      <div className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#176044]">
          <Store className="w-4 h-4" /> Bếp Nhà - Ẩm Thực Việt
        </div>
        <p className="text-xs text-slate-500">
          Chọn một bàn bất kỳ bên dưới để truy cập Menu điện tử:
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {tables.slice(0, 8).map((tbl) => (
            <Link key={tbl.id} href={`/menu/bep-nha/${tbl.code}`}>
              <div className="p-3.5 rounded-2xl bg-[#f7f5ef] hover:bg-[#edf6f1] border border-[#e4e8e5] hover:border-[#176044] transition-all flex items-center justify-between group cursor-pointer">
                <div>
                  <strong className="text-sm text-slate-800 block group-hover:text-[#176044]">{tbl.name}</strong>
                  <small className="text-[10px] text-slate-500">{tbl.zoneName}</small>
                </div>
                <QrCode className="w-5 h-5 text-slate-400 group-hover:text-[#176044]" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link href="/menu/bep-nha/ban-08">
          <Button variant="primary" size="lg" className="w-full shadow-lg">
            Mở Bàn 08 (Bàn đang có đơn) <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
