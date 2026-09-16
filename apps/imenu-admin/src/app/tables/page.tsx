'use client';

import React, { useState, useEffect } from 'react';
import { storageService, formatCurrencyVND, realtimeHub, soundEngine } from '@imenu/utils';
import { Table, Order, TableStatus } from '@imenu/types';
import { Card, Button, StatusChip, Drawer, Modal, useToast } from '@imenu/ui';
import {
  Grid3X3,
  Users,
  Plus,
  ArrowRightLeft,
  Merge,
  Receipt,
  CheckCircle2,
  PhoneCall,
  Clock,
  X,
  ExternalLink,
} from 'lucide-react';

export default function TablesMapPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const loadData = () => {
    setTables(storageService.getTables());
    setOrders(storageService.getOrders());
  };

  useEffect(() => {
    loadData();

    const unsub = realtimeHub.subscribe('*', () => {
      loadData();
    });
    return () => unsub();
  }, []);

  const zones = [
    { id: 'all', name: 'Tất cả khu vực' },
    { id: 'zone-1', name: 'Tầng 1' },
    { id: 'zone-2', name: 'Tầng 2 (Máy Lạnh)' },
    { id: 'zone-3', name: 'Sân Vườn' },
    { id: 'zone-vip', name: 'Phòng VIP' },
  ];

  const filteredTables = tables.filter(
    (t) => activeZone === 'all' || t.zoneId === activeZone
  );

  // Find active order for selected table
  const selectedTableOrder = selectedTable
    ? orders.find((o) => o.tableId === selectedTable.id && o.status !== 'Paid' && o.status !== 'Cancelled')
    : null;

  // Complete Payment for table
  const handleCompletePayment = () => {
    if (!selectedTable || !selectedTableOrder) return;

    soundEngine.playReadyChime();

    // Mark order as Paid
    const allOrders = storageService.getOrders();
    const oIdx = allOrders.findIndex((o) => o.id === selectedTableOrder.id);
    if (oIdx > -1) {
      allOrders[oIdx].status = 'Paid';
      allOrders[oIdx].isPaid = true;
      storageService.saveOrders(allOrders);
    }

    // Set table to Available
    const allTables = storageService.getTables();
    const tIdx = allTables.findIndex((t) => t.id === selectedTable.id);
    if (tIdx > -1) {
      allTables[tIdx].status = 'Available';
      allTables[tIdx].currentOrderId = undefined;
      allTables[tIdx].totalGuests = undefined;
      allTables[tIdx].activeSince = undefined;
      storageService.saveTables(allTables);
    }

    realtimeHub.publish('PAYMENT_COMPLETED', { tableId: selectedTable.id }, 'rest-bep-nha');
    setSelectedTable(null);
    loadData();
    toast.success(`Đã hoàn tất thanh toán cho ${selectedTable.name}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Sơ Đồ Quản Lý Bàn</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Trực quan hóa trạng thái bàn, mở bàn, gọi món và đối soát hóa đơn
          </p>
        </div>

        {/* Legend status indicators */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bàn trống</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Đang dùng</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Chờ thanh toán</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Đã đặt</div>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setActiveZone(z.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeZone === z.id
                ? 'bg-[#124a36] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {z.name}
          </button>
        ))}
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredTables.map((tbl) => {
          const isOccupied = tbl.status === 'Occupied';
          const isPayment = tbl.status === 'PaymentRequested';
          const isReserved = tbl.status === 'Reserved';

          return (
            <div
              key={tbl.id}
              onClick={() => setSelectedTable(tbl)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[120px] shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                isPayment
                  ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400 animate-pulse'
                  : isOccupied
                  ? 'bg-amber-50/70 border-amber-300'
                  : isReserved
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-white border-slate-200 hover:border-[#176044]'
              }`}
            >
              <div className="flex items-start justify-between">
                <strong className="text-sm font-extrabold text-slate-900">{tbl.name}</strong>
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-semibold">
                  <Users className="w-3 h-3" /> {tbl.capacity}
                </span>
              </div>

              <div className="mt-4">
                <StatusChip status={tbl.status} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Table Drawer */}
      <Drawer
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        title={`Chi tiết: ${selectedTable?.name || ''} · ${selectedTable?.zoneName || ''}`}
        position="right"
      >
        {selectedTable && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-semibold text-slate-600">Trạng thái hiện tại:</span>
              <StatusChip status={selectedTable.status} />
            </div>

            {selectedTableOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-200">
                  <span>Món đang phục vụ ({selectedTableOrder.items.length})</span>
                  <span className="text-slate-500 font-mono">{selectedTableOrder.orderCode}</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedTableOrder.items.map((it) => (
                    <div key={it.id} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block">{it.quantity}x {it.name}</strong>
                        {it.note && <small className="text-[10px] text-amber-700">{it.note}</small>}
                      </div>
                      <span className="font-bold text-[#176044]">{formatCurrencyVND(it.itemTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-[#edf6f1] border border-[#d9ece3] flex justify-between items-center text-sm font-bold">
                  <span>Tổng tiền:</span>
                  <span className="text-base text-[#176044]">{formatCurrencyVND(selectedTableOrder.totalAmount)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <a
                    href={`http://localhost:3005/menu/bep-nha/${selectedTable.code}`}
                    target="_blank"
                    className="col-span-2 block"
                  >
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" /> Mở QR Menu Khách Hàng
                    </Button>
                  </a>

                  <Button
                    variant="primary"
                    onClick={handleCompletePayment}
                    className="col-span-2 py-3"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Xác nhận Đã Thu Tiền & Trả Bàn
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-3">
                <p className="text-xs">Bàn đang trống, chưa có đơn hàng nào.</p>
                <a
                  href={`http://localhost:3005/menu/bep-nha/${selectedTable.code}`}
                  target="_blank"
                  className="block"
                >
                  <Button variant="primary" size="sm">
                    Mở QR gọi món cho bàn này
                  </Button>
                </a>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
