'use client';

import React from 'react';
import { Card, Badge } from '@imenu/ui';
import { BarChart3, TrendingUp, DollarSign, Award } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#09271d]">Báo Cáo & Phân Tích Doanh Thu</h1>
        <p className="text-xs text-[#66736d] mt-0.5">
          Báo cáo hợp nhất doanh số theo ngày, tuần, tháng và top 10 món bán chạy nhất
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Doanh thu tháng này</span>
          <div className="text-3xl font-extrabold text-[#176044]">142.500.000₫</div>
          <span className="text-xs text-emerald-600 font-bold">↗ +24.8% so với tháng trước</span>
        </Card>

        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Tổng số lượt khách</span>
          <div className="text-3xl font-extrabold text-[#09271d]">2.180 khách</div>
          <span className="text-xs text-emerald-600 font-bold">↗ +15.2%</span>
        </Card>

        <Card className="p-6 space-y-2">
          <span className="text-xs font-semibold text-slate-500">Tỉ lệ thanh toán VietQR</span>
          <div className="text-3xl font-extrabold text-[#a66d12]">78.5%</div>
          <span className="text-xs text-slate-500">Tiền mặt: 21.5%</span>
        </Card>
      </div>

      {/* Best Sellers */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Top 5 Món Bán Chạy Nhất</h3>
        <div className="space-y-2.5">
          {[
            { name: 'Phở Bò Tái Nạm Đặc Biệt', qty: 342, rev: '23.598.000₫' },
            { name: 'Cơm Tấm Sườn Bì Chả Trứng', qty: 289, rev: '19.652.000₫' },
            { name: 'Trà Đào Cam Sả Tươi', qty: 415, rev: '16.185.000₫' },
            { name: 'Bún Bò Huế Cố Đô', qty: 210, rev: '13.650.000₫' },
            { name: 'Gỏi Cuốn Tôm Thịt', qty: 195, rev: '9.555.000₫' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-[#124a36] text-white font-bold grid place-items-center text-[10px]">
                  0{idx + 1}
                </span>
                <strong className="text-slate-900">{item.name}</strong>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-slate-500">{item.qty} suất</span>
                <span className="font-bold text-[#176044]">{item.rev}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
