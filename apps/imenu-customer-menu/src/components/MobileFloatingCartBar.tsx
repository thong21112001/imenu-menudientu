'use client';

import React from 'react';
import { formatCurrencyVND } from '@imenu/utils';
import { ChevronRight, ShoppingBag } from 'lucide-react';

export interface MobileFloatingCartBarProps {
  totalCartCount: number;
  totalCartAmount: number;
  onOpenCart: () => void;
}

export const MobileFloatingCartBar: React.FC<MobileFloatingCartBarProps> = ({
  totalCartCount,
  totalCartAmount,
  onOpenCart,
}) => {
  if (totalCartCount <= 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-slideUp lg:hidden">
      <button
        type="button"
        onClick={onOpenCart}
        className="w-full bg-[#17382D] hover:bg-[#244B3C] text-white rounded-2xl p-3.5 px-5 shadow-2xl flex items-center justify-between font-bold border-2 border-[#E9B84C] active:scale-[0.99] transition-all cursor-pointer"
        aria-label={`Xem giỏ hàng với ${totalCartCount} món, tổng tiền ${formatCurrencyVND(totalCartAmount)}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E9B84C] text-[#17382D] grid place-items-center text-xs font-black shadow-xs">
            {totalCartCount}
          </div>
          <div className="text-left">
            <div className="text-xs text-[#E9B84C]">Giỏ món ăn</div>
            <div className="text-sm leading-tight text-[#FAF7F0] font-black">
              {formatCurrencyVND(totalCartAmount)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#E9B84C] font-black">
          <span>Xem giỏ & Gửi món</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};

