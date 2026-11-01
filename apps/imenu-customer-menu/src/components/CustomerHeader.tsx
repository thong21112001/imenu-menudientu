'use client';

import React from 'react';
import { Restaurant, Table, Order } from '@imenu/types';
import { formatCurrencyVND } from '@imenu/utils';
import { Logo } from '@imenu/ui';
import { PhoneCall, Clock, ChevronRight } from 'lucide-react';

export interface CustomerHeaderProps {
  restaurant: Restaurant;
  table: Table;
  activeOrder: Order | null;
  readyOrServedCount: number;
  validOrderItemsCount: number;
  onOpenCallStaff: () => void;
  onOpenTracker: () => void;
  onOpenPreBill: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  restaurant,
  table,
  activeOrder,
  readyOrServedCount,
  validOrderItemsCount,
  onOpenCallStaff,
  onOpenTracker,
  onOpenPreBill,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#17382D] text-white shadow-md border-b border-[#244B3C]">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Restaurant Identity */}
        <div className="flex items-center gap-2.5">
          <Logo light size="sm" />
          <div className="border-l border-white/20 pl-2.5">
            <strong className="text-xs sm:text-sm font-bold block leading-tight text-[#FAF7F0]">
              {restaurant.name}
            </strong>
            <small className="text-[10px] text-[#A5C4B5] flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              Đang mở cửa
            </small>
          </div>
        </div>

        {/* Table Context & Call Staff Action */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-[#E9B84C] flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#E9B84C]" />
            <span>{table.name}</span>
            {table.zoneName && (
              <span className="text-[10px] text-[#A5C4B5] hidden sm:inline">({table.zoneName})</span>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenCallStaff}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-[#E9B84C]/20 hover:bg-[#E9B84C]/30 text-[#E9B84C] border border-[#E9B84C]/40 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Gọi nhân viên phục vụ"
          >
            <PhoneCall className="w-3.5 h-3.5 text-[#E9B84C]" />
            <span className="text-xs font-bold inline">Gọi nhân viên</span>
          </button>
        </div>
      </div>

      {/* Quick Active Order Progress Strip on Mobile / Tablet */}
      {activeOrder && (
        <div className="bg-[#122C23] px-4 py-1.5 border-t border-white/10 lg:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onOpenTracker}
              className="flex items-center gap-1.5 text-[#E9B84C] font-semibold cursor-pointer active:opacity-80"
            >
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Tiến độ món ({readyOrServedCount}/{validOrderItemsCount} món)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenPreBill}
              className="px-2.5 py-0.5 rounded-md bg-[#E9B84C] hover:bg-[#d8a63b] text-[#17382D] font-bold text-[11px] shadow-2xs cursor-pointer transition-colors"
            >
              Tạm tính: {formatCurrencyVND(activeOrder.totalAmount)}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

