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
        <div className="text-center py-8 text-[#718077] text-xs">
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
      <div className="space-y-4 text-[#111815]">
        {/* Progress Summary Card */}
        <div className="p-4 rounded-2xl bg-[#e5dfd3]/90 border border-[#ded8cb] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#111815] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#245846]" /> Tiến độ hoàn thành:
            </span>
            <span className="text-sm font-black text-[#245846] tabular-nums">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-3 bg-[#ded8cb] rounded-full overflow-hidden border border-[#c5cec7] p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#dfa035] via-[#245846] to-[#34a87a] transition-all duration-700 shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#718077]">
            <span>
              Đã xong / Phục vụ: <strong className="text-[#111815]">{readyOrServedCount}</strong>/{totalValid} món
            </span>
            <StatusChip status={activeOrder.status} size="sm" />
          </div>
        </div>

        {/* Dishes List with Distinct Stages */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-[#718077] tracking-wider">
            <span>Chi tiết món ăn ({activeOrder.items?.length || 0})</span>
            <span className="font-mono text-[10px] text-[#9aa89f]">Mã đơn: #{activeOrder.orderCode}</span>
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
                      ? 'bg-[#34a87a]/15 border-[#34a87a]/40 ring-1 ring-[#34a87a]/20'
                      : isCooking
                      ? 'bg-[#dfa035]/15 border-[#dfa035]/40'
                      : isCancelled
                      ? 'bg-[#ded8cb]/60 border-[#ded8cb] opacity-60'
                      : 'bg-[#e5dfd3]/80 border-[#ded8cb]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <strong className="text-xs font-bold text-[#111815] block truncate">
                      {it.quantity}x {it.name}
                    </strong>
                    {it.roundNumber && (
                      <span className="text-[10px] text-[#718077] block font-mono">
                        Lượt #{it.roundNumber}
                      </span>
                    )}
                    {it.selectedOptions && it.selectedOptions.length > 0 && (
                      <span className="text-[10px] text-[#718077] block truncate">
                        {it.selectedOptions.map((o) => o.valueName).join(', ')}
                      </span>
                    )}
                    {it.note && (
                      <span className="text-[10px] text-[#c85a32] block italic">
                        Ghi chú: {it.note}
                      </span>
                    )}
                    {isCancelled && (it as any).cancelReason && (
                      <span className="text-[10px] text-[#c85a32] block">
                        Lý do hủy: {(it as any).cancelReason}
                      </span>
                    )}
                  </div>

                  {/* Distinct Status Badges */}
                  <div className="shrink-0">
                    {isWaitingConf ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#dfa035]/15 text-[#b87c1c] border border-[#dfa035]/35 animate-pulse flex items-center gap-1 shadow-2xs">
                        <Hourglass className="w-3 h-3 text-[#dfa035]" /> Chờ xác nhận
                      </span>
                    ) : isWaitingKitchen ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#ded8cb] text-[#2c3b34] border border-[#c5cec7] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#718077]" /> Chờ bếp nấu
                      </span>
                    ) : isCooking ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#dfa035]/20 text-[#b87c1c] border border-[#dfa035]/40 animate-pulse flex items-center gap-1 shadow-2xs">
                        <Flame className="w-3 h-3 text-[#dfa035]" /> Đang chế biến ♨
                      </span>
                    ) : isReady ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#34a87a]/20 text-[#1f7050] border border-[#34a87a]/40 flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-[#34a87a]" /> Đã xong ✓
                      </span>
                    ) : isServed ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#4a7bb0]/15 text-[#2d5784] border border-[#4a7bb0]/30 flex items-center gap-1">
                        ✓ Đã phục vụ
                      </span>
                    ) : isCancelled ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#c85a32]/15 text-[#a64522] border border-[#c85a32]/30 flex items-center gap-1">
                        ✕ Đã hủy
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#ded8cb] text-[#2c3b34]">
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
        <div className="flex gap-3 pt-2 border-t border-[#ded8cb]">
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
            variant="primary"
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
