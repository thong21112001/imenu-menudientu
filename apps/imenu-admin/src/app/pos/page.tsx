'use client';

import React, { useState, useEffect } from 'react';
import { storageService, formatCurrencyVND, soundEngine, realtimeHub } from '@imenu/utils';
import { Table, MenuItem, Order, OrderItem } from '@imenu/types';
import { Card, Button, CustomSelect, useToast } from '@imenu/ui';
import { Search, Plus, Minus, Trash2, Send } from 'lucide-react';

export default function PosTerminalPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  interface PosCartItem {
    item: MenuItem;
    quantity: number;
  }
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);

  useEffect(() => {
    const tbls = storageService.getTables();
    setTables(tbls);
    if (tbls.length > 0) setSelectedTableId(tbls[0].id);
    setMenuItems(storageService.getMenuItems());
  }, []);

  const handleAddItem = (item: MenuItem) => {
    const idx = posCart.findIndex((c) => c.item.id === item.id);
    if (idx > -1) {
      const updated = [...posCart];
      updated[idx].quantity += 1;
      setPosCart(updated);
    } else {
      setPosCart([...posCart, { item, quantity: 1 }]);
    }
  };

  const handleSendOrder = () => {
    if (posCart.length === 0 || !selectedTableId) return;

    soundEngine.playNewOrderChime();
    const table = tables.find((t) => t.id === selectedTableId);
    if (!table) return;

    const newOrderItems: OrderItem[] = posCart.map((c, i) => ({
      id: `pos-${Date.now()}-${i}`,
      menuItemId: c.item.id,
      name: c.item.name,
      price: c.item.price,
      quantity: c.quantity,
      status: 'Cooking',
      itemTotal: c.item.price * c.quantity,
    }));

    const total = posCart.reduce((s, c) => s + c.item.price * c.quantity, 0);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderCode: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
      tableId: table.id,
      tableName: table.name,
      restaurantId: 'rest-bep-nha',
      items: newOrderItems,
      subTotal: total,
      totalAmount: total,
      status: 'Preparing',
      isPaid: false,
      orderSource: 'STAFF_POS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allOrders = storageService.getOrders();
    allOrders.unshift(newOrder);
    storageService.saveOrders(allOrders);

    // Update table status
    const allTables = storageService.getTables();
    const tIdx = allTables.findIndex((t) => t.id === table.id);
    if (tIdx > -1) {
      allTables[tIdx].status = 'Occupied';
      storageService.saveTables(allTables);
    }

    realtimeHub.publish('NEW_ORDER', newOrder, 'rest-bep-nha');
    setPosCart([]);
    toast.success(`Đã gửi đơn POS thành công cho ${table.name}!`);
  };

  const filteredItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Menu Selection Left Column */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[#09271d]">POS Bán Hàng Tại Bàn</h1>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm món nhanh..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleAddItem(item)}
              className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-[#176044] hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <strong className="text-xs text-slate-900 block truncate">{item.name}</strong>
                <span className="text-xs font-bold text-[#176044] mt-1 block">
                  {formatCurrencyVND(item.price)}
                </span>
              </div>
              <Button variant="secondary" size="sm" className="mt-3 w-full py-1 text-xs">
                + Thêm món
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* POS Order Cart Right Column */}
      <div className="lg:col-span-5">
        <Card className="p-5 space-y-4 sticky top-20 bg-white shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <h3 className="text-sm font-bold text-slate-900 shrink-0">Chi tiết phiếu Order</h3>
            <div className="w-52">
              <CustomSelect
                value={selectedTableId}
                onChange={(val) => setSelectedTableId(val)}
                options={tables.map((t) => ({
                  value: t.id,
                  label: `${t.name} (${t.zoneName})`,
                }))}
                placeholder="Chọn bàn..."
              />
            </div>
          </div>

          {/* Cart list */}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {posCart.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-400">Chưa chọn món nào</p>
            ) : (
              posCart.map((c, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1">
                    <strong className="text-slate-900 block truncate">{c.item.name}</strong>
                    <span className="text-[#176044] font-bold">
                      {formatCurrencyVND(c.item.price * c.quantity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (c.quantity === 1) {
                          setPosCart(posCart.filter((_, i) => i !== idx));
                        } else {
                          const updated = [...posCart];
                          updated[idx].quantity -= 1;
                          setPosCart(updated);
                        }
                      }}
                      className="w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-xs">{c.quantity}</span>
                    <button
                      onClick={() => {
                        const updated = [...posCart];
                        updated[idx].quantity += 1;
                        setPosCart(updated);
                      }}
                      className="w-5 h-5 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Tổng cộng:</span>
              <span className="text-base text-[#176044]">
                {formatCurrencyVND(posCart.reduce((s, c) => s + c.item.price * c.quantity, 0))}
              </span>
            </div>

            <Button
              variant="primary"
              onClick={handleSendOrder}
              disabled={posCart.length === 0}
              className="w-full py-3"
            >
              <Send className="w-4 h-4 mr-2" /> Gửi đơn xuống Bếp ngay
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
