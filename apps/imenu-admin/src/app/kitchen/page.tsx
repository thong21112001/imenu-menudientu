'use client';

import React, { useState, useEffect } from 'react';
import { storageService, formatTime, realtimeHub, soundEngine } from '@imenu/utils';
import { Order, OrderItem } from '@imenu/types';
import { Card, Button, StatusChip } from '@imenu/ui';
import { ChefHat, Check, Flame, Clock, Volume2 } from 'lucide-react';

export default function KitchenDisplaySystemPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = () => {
    const all = storageService.getOrders();
    // Filter active orders that need cooking
    setOrders(all.filter((o) => o.status !== 'Paid' && o.status !== 'Cancelled'));
  };

  useEffect(() => {
    loadOrders();

    const unsub = realtimeHub.subscribe('*', (payload) => {
      loadOrders();
    });
    return () => unsub();
  }, []);

  // Move dish item status
  const handleUpdateItemStatus = (orderId: string, itemId: string, nextStatus: 'Cooking' | 'Ready' | 'Served') => {
    const all = storageService.getOrders();
    const oIdx = all.findIndex((o) => o.id === orderId);
    if (oIdx > -1) {
      const itIdx = all[oIdx].items.findIndex((i) => i.id === itemId);
      if (itIdx > -1) {
        all[oIdx].items[itIdx].status = nextStatus;
        if (nextStatus === 'Ready') {
          soundEngine.playReadyChime();
        }
        storageService.saveOrders(all);
        setOrders([...all.filter((o) => o.status !== 'Paid' && o.status !== 'Cancelled')]);
        realtimeHub.publish('ORDER_STATUS_UPDATED', all[oIdx], 'rest-bep-nha');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d] flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-[#176044]" />
            Màn Hình Bếp & Bar (KDS)
          </h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Sắp xếp vé món theo thời gian gọi, tự động chuông báo và chuyển trạng thái tức thì
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => soundEngine.playNewOrderChime()}
          icon={<Volume2 className="w-4 h-4" />}
        >
          Thử chuông báo
        </Button>
      </div>

      {/* KDS Kanban Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.length === 0 ? (
          <div className="col-span-3 text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400">
            <ChefHat className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Hiện chưa có món nào cần chế biến. Gian bếp đã sẵn sàng!</p>
          </div>
        ) : (
          orders.map((ord) => (
            <Card key={ord.id} className="p-5 space-y-4 border-2 border-slate-300 shadow-md bg-white">
              {/* Ticket Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
                <div>
                  <strong className="text-base font-extrabold text-[#09271d] block">
                    {ord.tableName}
                  </strong>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {ord.orderCode} · {formatTime(ord.createdAt)}
                  </span>
                </div>
                <StatusChip status={ord.status} size="sm" />
              </div>

              {/* Ticket Items */}
              <div className="space-y-2.5 py-1">
                {ord.items.map((it) => (
                  <div
                    key={it.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      it.status === 'Ready'
                        ? 'bg-teal-50 border-teal-200 opacity-70'
                        : it.status === 'Cooking'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-[#124a36] text-white text-xs font-bold grid place-items-center">
                          {it.quantity}
                        </span>
                        <strong className="text-xs text-slate-900 truncate">{it.name}</strong>
                      </div>
                      {it.note && (
                        <span className="text-[10px] text-amber-800 font-bold block mt-1 pl-7">
                          ⚠️ {it.note}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {it.status === 'Cooking' ? (
                        <button
                          onClick={() => handleUpdateItemStatus(ord.id, it.id, 'Ready')}
                          className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-sm"
                        >
                          Xong món ✓
                        </button>
                      ) : it.status === 'Ready' ? (
                        <span className="text-xs font-bold text-teal-700">✓ Đã xong</span>
                      ) : (
                        <button
                          onClick={() => handleUpdateItemStatus(ord.id, it.id, 'Cooking')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-sm"
                        >
                          Nấu món ♨
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
