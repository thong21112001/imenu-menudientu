'use client';

import React, { useState, useEffect } from 'react';
import { storageService, formatCurrencyVND, formatDateTime, generateVietQRUrl } from '@imenu/utils';
import { Order, Restaurant } from '@imenu/types';
import { Card, Button, StatusChip, Modal } from '@imenu/ui';
import { Receipt, Printer, CheckCircle2, QrCode } from 'lucide-react';

export default function BillsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>(storageService.getRestaurant());
  const [selectedOrderForBill, setSelectedOrderForBill] = useState<Order | null>(null);

  useEffect(() => {
    setOrders(storageService.getOrders());
    setRestaurant(storageService.getRestaurant());
  }, []);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Hóa Đơn & In Bill Nhiệt 80mm</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Quản lý lịch sử thanh toán, xuất phiếu tạm tính và in hóa đơn chuẩn máy in nhiệt khổ 80mm
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {orders.map((ord) => (
          <Card key={ord.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm font-bold text-slate-900">{ord.tableName}</strong>
                <span className="text-xs text-slate-500 font-mono">({ord.orderCode})</span>
                <StatusChip status={ord.status} size="sm" />
              </div>
              <span className="text-xs text-slate-500 block mt-1">
                {formatDateTime(ord.createdAt)} · {ord.items.length} món
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-extrabold text-[#176044]">
                {formatCurrencyVND(ord.totalAmount)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrderForBill(ord)}
                icon={<Receipt className="w-4 h-4" />}
              >
                Xem & In Bill 80mm
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Thermal Bill Modal */}
      <Modal
        isOpen={!!selectedOrderForBill}
        onClose={() => setSelectedOrderForBill(null)}
        title="Xem trước hóa đơn in nhiệt"
      >
        {selectedOrderForBill && (
          <div className="space-y-4">
            {/* Printable 80mm area */}
            <div
              id="thermal-print-area"
              className="p-4 bg-white border border-slate-300 rounded-xl font-mono text-xs text-black mx-auto max-w-[320px] shadow-inner space-y-3"
            >
              <div className="text-center pb-2 border-b border-dashed border-black">
                <strong className="text-base font-sans block">{restaurant.name}</strong>
                <p className="text-[10px]">{restaurant.address}</p>
                <p className="text-[10px]">Hotline: {restaurant.phone}</p>
              </div>

              <div className="text-center py-1 font-bold text-sm">
                PHIẾU THANH TOÁN
                <div className="text-[10px] font-normal">{selectedOrderForBill.tableName} · {selectedOrderForBill.orderCode}</div>
              </div>

              <div className="space-y-1 py-1 border-t border-b border-dashed border-black">
                {selectedOrderForBill.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span>{it.quantity}x {it.name}</span>
                    <span>{formatCurrencyVND(it.itemTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-sm font-bold pt-1">
                <span>TỔNG CỘNG:</span>
                <span>{formatCurrencyVND(selectedOrderForBill.totalAmount)}</span>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-black text-[10px]">
                Cảm ơn quý khách và hẹn gặp lại!
              </div>
            </div>

            <Button variant="primary" onClick={handlePrintReceipt} className="w-full">
              <Printer className="w-4 h-4 mr-2" /> In hóa đơn nhiệt 80mm ngay
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
