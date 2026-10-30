'use client';

import React from 'react';
import { Order } from '@imenu/types';
import { Drawer, Button, StatusChip } from '@imenu/ui';
import {
  CheckCircle2,
  Clock,
  Hourglass,
  Flame,
  Receipt,
  ChefHat,
} from 'lucide-react';

export interface CookingTrackerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  onOpenPreBill: () => void;
}

export const CookingTrackerDrawer: React.FC<CookingTrackerDrawerProps> = ({
  isOpen,
  onClose,
  activeOrder,
  onOpenPreBill,
}) => {
  if (!activeOrder) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Theo dõi tiến độ chế biến"
        position="bottom"
      >
        <div className="text-center py-8 text-[#5F6055] text-xs">
          Bàn hiện chưa có đơn gọi món nào.
        </div>
      </Drawer>
    );
  }

  const validItems = activeOrder.items?.filter((it) => it.status !== 'Cancelled') || [];
  const totalValid = validItems.length;
  const scoreWeight: Record<string, number> = {
    WaitingConfirmation: 10,
    Waiting: 25,
    Cooking: 60,
    Ready: 90,
    Served: 100,
  };
  const progressPercent =
    totalValid > 0
      ? Math.min(
          100,
          Math.round(
            validItems.reduce((sum, it) => sum + (scoreWeight[it.status] || 25), 0) /
              totalValid,
          ),
        )
      : 0;

  const readyOrServedCount = validItems.filter(
    (it) => it.status === 'Ready' || it.status === 'Served',
  ).length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Theo dõi tiến độ chế biến"
      position="bottom"
    >
      <div className="space-y-4">
        {/* Progress Summary Card */}
        <div className="p-4 rounded-2xl bg-[#E9F0EC] border border-[#C5DACF] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#282923] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#244B3C]" /> Tiến độ hoàn thành:
            </span>
            <span className="text-sm font-black text-[#244B3C] tabular-nums">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#C5DACF] p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#E9B84C] via-[#244B3C] to-[#10b981] transition-all duration-700 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#5F6055]">
            <span>
              Đã xong / Phục vụ: <strong className="text-[#282923]">{readyOrServedCount}</strong>/{totalValid} món
            </span>
            <StatusChip status={activeOrder.status} size="sm" />
          </div>
        </div>

        {/* Dishes List with Distinct Stages */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#5F6055] tracking-wider">
            <span>Chi tiết món ăn ({activeOrder.items?.length || 0})</span>
            <span className="font-mono text-[10px] text-[#8C8D82]">Mã đơn: #{activeOrder.orderCode}</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {activeOrder.items?.map((it) => {
              const isWaitingConf =
                it.status === 'WaitingConfirmation' ||
                activeOrder.status === 'WaitingConfirmation';
              const isWaitingKitchen = it.status === 'Waiting' && !isWaitingConf;
              const isCooking = it.status === 'Cooking';
              const isReady = it.status === 'Ready';
              const isServed = it.status === 'Served';
              const isCancelled = it.status === 'Cancelled';

              return (
                <div
                  key={it.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isReady
                      ? 'bg-[#E9F0EC] border-[#244B3C]/50 ring-1 ring-[#244B3C]/20'
                      : isCooking
                      ? 'bg-orange-50/70 border-orange-200'
                      : isCancelled
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-[#E8E4DA]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs font-bold text-[#282923] block truncate">
                      {it.quantity}x {it.name}
                    </strong>
                    {it.roundNumber && (
                      <span className="text-[10px] text-[#77776C] block font-mono">
                        Lượt #{it.roundNumber}
                      </span>
                    )}
                    {it.selectedOptions && it.selectedOptions.length > 0 && (
                      <span className="text-[10px] text-[#5F6055] block truncate">
                        {it.selectedOptions.map((o) => o.valueName).join(', ')}
                      </span>
                    )}
                    {it.note && (
                      <span className="text-[10px] text-[#C2542E] block italic">
                        Ghi chú: {it.note}
                      </span>
                    )}
                    {isCancelled && (it as any).cancelReason && (
                      <span className="text-[10px] text-rose-600 block">
                        Lý do hủy: {(it as any).cancelReason}
                      </span>
                    )}
                  </div>

                  {/* Distinct Status Badges */}
                  <div className="shrink-0">
                    {isWaitingConf ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse flex items-center gap-1 shadow-2xs">
                        <Hourglass className="w-3 h-3 text-amber-700" /> Chờ xác nhận
                      </span>
                    ) : isWaitingKitchen ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> Chờ bếp nấu
                      </span>
                    ) : isCooking ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 animate-pulse flex items-center gap-1 shadow-2xs">
                        <Flame className="w-3 h-3 text-orange-600" /> Đang chế biến ♨
                      </span>
                    ) : isReady ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-[#17382D] border border-emerald-300 flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-[#10b981]" /> Đã xong ✓
                      </span>
                    ) : isServed ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                        ✓ Đã phục vụ
                      </span>
                    ) : isCancelled ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        ✕ Đã hủy
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {it.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 border-t border-[#E8E4DA]">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onOpenPreBill();
            }}
            className="flex-1 py-3 text-xs font-bold cursor-pointer"
          >
            <Receipt className="w-4 h-4 mr-1.5" /> Phiếu tạm tính
          </Button>
          <Button
            variant="fnb-primary"
            onClick={onClose}
            className="flex-1 py-3 text-xs font-bold cursor-pointer"
          >
            Gọi thêm món
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

