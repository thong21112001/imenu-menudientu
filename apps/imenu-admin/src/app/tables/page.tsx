'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { storageService, formatCurrencyVND, realtimeHub, soundEngine, apiClient } from '@imenu/utils';
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
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function TablesMapPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<Array<{ id: string; name: string }>>([
    { id: 'all', name: 'Tất cả khu vực' },
  ]);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Transfer table modal state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferTargetTableId, setTransferTargetTableId] = useState<string>('');

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const activeBranchId = storageService.getActiveBranchId();

      const [tblRes, zoneRes, ordRes] = await Promise.all([
        apiClient.tables.list({ branchId: activeBranchId || undefined }).catch(() => null),
        apiClient.tableZones.list({ branchId: activeBranchId || undefined }).catch(() => null),
        apiClient.orders.list({ isPaid: false, branchId: activeBranchId || undefined, limit: 100 }).catch(() => null),
      ]);

      // 1. Process zones
      if (zoneRes && Array.isArray(zoneRes.data) && zoneRes.data.length > 0) {
        const loadedZones = zoneRes.data.map((z: any) => ({
          id: z._id || z.id,
          name: z.name,
        }));
        setZones([{ id: 'all', name: 'Tất cả khu vực' }, ...loadedZones]);
      } else {
        setZones([{ id: 'all', name: 'Tất cả khu vực' }]);
      }

      // 2. Process tables
      if (tblRes && Array.isArray(tblRes.data) && tblRes.data.length > 0) {
        const normalizedTables: Table[] = tblRes.data.map((t: any) => ({
          ...t,
          id: t._id || t.id,
          zoneId: t.zone?._id || t.zone || t.zoneId || 'default-zone',
          zoneName: t.zone?.name || t.zoneName || 'Khu vực chung',
        }));
        setTables(normalizedTables);
      } else {
        setTables([]);
      }

      // 3. Process active orders
      if (ordRes && ordRes.data) {
        const rawOrders = Array.isArray(ordRes.data) ? ordRes.data : ordRes.data.data || [];
        const normalizedOrders: Order[] = rawOrders.map((o: any) => ({
          ...o,
          id: o._id || o.id,
          tableId: o.tableId?._id ? o.tableId._id.toString() : (o.tableId ? o.tableId.toString() : ''),
        }));
        setOrders(normalizedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.warn('Load tables error:', err);
      setTables([]);
      setOrders([]);
      setZones([{ id: 'all', name: 'Tất cả khu vực' }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const unsub = realtimeHub.subscribe('*', (payload) => {
      loadData(true);
    });
    return () => unsub();
  }, [loadData]);

  const filteredTables = tables.filter(
    (t) => activeZone === 'all' || t.zoneId === activeZone
  );

  // Find active order for selected table
  const selectedTableOrder = selectedTable
    ? orders.find(
        (o) =>
          (o.tableId === selectedTable.id || o.tableId === (selectedTable as any)._id) &&
          o.status !== 'Paid' &&
          o.status !== 'Cancelled',
      )
    : null;

  // Complete Payment for table
  const handleCompletePayment = async () => {
    if (!selectedTable) return;

    soundEngine.playReadyChime();

    // 1. Gửi API thanh toán nếu có đơn hàng
    if (selectedTableOrder) {
      try {
        await apiClient.orders.pay(selectedTableOrder.id, { paymentMethod: 'Cash' });
      } catch (err) {
        console.warn('API pay error:', err);
      }
    }

    // 2. Set table to Available
    try {
      await apiClient.tables.updateStatus(selectedTable.id, 'Available');
    } catch (err) {
      console.warn('API update table status error:', err);
    }

    setSelectedTable(null);
    loadData(true);
    toast.success(`Đã hoàn tất thanh toán & trả bàn ${selectedTable.name}!`);
  };

  // Transfer table
  const handleTransferTable = async () => {
    if (!selectedTable || !transferTargetTableId) {
      toast.error('Vui lòng chọn bàn đích!');
      return;
    }

    try {
      await apiClient.tables.transfer({
        fromTableId: selectedTable.id,
        toTableId: transferTargetTableId,
      });
      toast.success('Chuyển bàn thành công!');
      setIsTransferModalOpen(false);
      setTransferTargetTableId('');
      setSelectedTable(null);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi chuyển bàn');
    }
  };

  // Seed default tables for current restaurant
  const handleSeedDefaultTables = async () => {
    try {
      await apiClient.tables.seedDefault();
      toast.success('Đã khởi tạo sơ đồ 12 bàn mẫu thành công!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi khởi tạo bàn');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Sơ Đồ Quản Lý Bàn</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Trực quan hóa trạng thái bàn, mở bàn, gọi món và đối soát hóa đơn theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tables.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDefaultTables}
              icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
            >
              Tạo sơ đồ mẫu
            </Button>
          )}

          {/* Legend status indicators */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bàn trống</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Đang dùng</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Chờ thanh toán</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Đã đặt</div>
          </div>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setActiveZone(z.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeZone === z.id
                ? 'bg-[#124a36] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {z.name}
          </button>
        ))}
      </div>

      {/* Empty State when no tables */}
      {!isLoading && tables.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-300 text-center space-y-4 my-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Grid3X3 className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-extrabold text-slate-900">Nhà hàng chưa có bàn ăn nào</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bắt đầu thiết lập sơ đồ phục vụ bằng cách thêm từng bàn ăn hoặc khởi tạo nhanh sơ đồ 12 bàn mẫu chuẩn nhà hàng Việt.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSeedDefaultTables}
              className="bg-[#124a36] hover:bg-[#176044] text-white shadow-md text-xs font-bold"
              icon={<Sparkles className="w-4 h-4 text-emerald-300" />}
            >
              Khởi tạo sơ đồ mẫu (12 bàn)
            </Button>
            <Button
              variant="outline"
              onClick={() => { window.location.href = '/qr-codes'; }}
              className="text-xs font-bold border-slate-300"
              icon={<Plus className="w-4 h-4 text-slate-600" />}
            >
              Thêm bàn & QR Code
            </Button>
          </div>
        </div>
      )}

      {/* Tables Grid */}
      {tables.length > 0 && (
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
      )}

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
                  <Button
                    variant="outline"
                    onClick={() => setIsTransferModalOpen(true)}
                    className="col-span-1"
                    icon={<ArrowRightLeft className="w-4 h-4" />}
                  >
                    Đổi bàn
                  </Button>

                  <a
                    href={`/pos`}
                    className="col-span-1 block"
                  >
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-1" /> Thêm món
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
                <div className="flex gap-2 justify-center">
                  <a href="/pos">
                    <Button variant="primary" size="sm">
                      Mở bán tại quầy POS
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Transfer Table Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Chuyển Bàn Gọi Món"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Chuyển toàn bộ món ăn và hóa đơn từ <strong>{selectedTable?.name}</strong> sang bàn trống khác:
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Chọn bàn trống muốn chuyển sang:</label>
            <select
              value={transferTargetTableId}
              onChange={(e) => setTransferTargetTableId(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-xl bg-white"
            >
              <option value="">-- Chọn bàn đích --</option>
              {tables
                .filter((t) => t.id !== selectedTable?.id && t.status === 'Available')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.zoneName})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsTransferModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleTransferTable}>
              Xác nhận chuyển
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
