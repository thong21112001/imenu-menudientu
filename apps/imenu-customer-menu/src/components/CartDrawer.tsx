'use client';

import React from 'react';
import { MenuItem, SelectedOption } from '@imenu/types';
import { formatCurrencyVND } from '@imenu/utils';
import { Drawer, Button } from '@imenu/ui';
import { Minus, Plus, AlertCircle, Loader2, Send } from 'lucide-react';

export interface CartItem {
  id: string;
  menuItemId: string;
  item: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  note: string;
  itemTotal: number;
}

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: string;
  cart: CartItem[];
  menuItems: MenuItem[];
  isSubmitting: boolean;
  totalCartCount: number;
  totalCartAmount: number;
  onQuantityChange: (idx: number, delta: number) => void;
  onSubmitOrder: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  tableName,
  cart,
  menuItems,
  isSubmitting,
  totalCartCount,
  totalCartAmount,
  onQuantityChange,
  onSubmitOrder,
}) => {
  const hasOutOfStockItem = cart.some((c) => {
    const currentItem = menuItems.find((m) => m.id === c.menuItemId);
    return currentItem && currentItem.isAvailable === false;
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Giỏ hàng · ${tableName}`}
      position="bottom"
    >
      <div className="space-y-4 text-[#111815]">
        {/* Out-of-stock warning banner */}
        {hasOutOfStockItem && (
          <div className="p-3 bg-[#c85a32]/15 border border-[#c85a32]/35 rounded-xl flex items-center gap-2.5 text-xs text-[#a64522] font-medium">
            <AlertCircle className="w-4 h-4 text-[#c85a32] shrink-0" />
            <span>Trong giỏ có món vừa hết hàng tại Bếp. Vui lòng xóa món hết hàng trước khi gửi đơn!</span>
          </div>
        )}

        {/* Cart items list */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {cart.map((item, idx) => {
            const isItemOutOfStock =
              menuItems.find((m) => m.id === item.menuItemId)?.isAvailable === false ||
              item.item.isAvailable === false;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border flex items-start justify-between gap-3 transition-colors ${
                  isItemOutOfStock
                    ? 'bg-[#c85a32]/10 border-[#c85a32]/40'
                    : 'bg-[#e5dfd3]/80 border-[#ded8cb]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#111815] truncate">{item.item.name}</h4>
                    {isItemOutOfStock && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#c85a32] text-white shadow-2xs shrink-0">
                        Hết món tại Bếp
                      </span>
                    )}
                  </div>
                  {item.selectedOptions.length > 0 && (
                    <div className="text-[10px] text-[#718077] mt-0.5">
                      {item.selectedOptions.map((o) => o.valueName).join(', ')}
                    </div>
                  )}
                  {item.note && (
                    <div className="text-[10px] text-[#c85a32] mt-0.5 italic">
                      Ghi chú: {item.note}
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#245846] mt-1 block">
                    {formatCurrencyVND(item.itemTotal)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onQuantityChange(idx, -1)}
                    className="w-7 h-7 rounded-lg bg-[#f0ece3] border border-[#ded8cb] text-[#111815] flex items-center justify-center hover:bg-[#ded8cb] active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-[#111815] w-5 text-center tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isSubmitting || isItemOutOfStock}
                    onClick={() => onQuantityChange(idx, 1)}
                    className="w-7 h-7 rounded-lg bg-[#f0ece3] border border-[#ded8cb] text-[#111815] flex items-center justify-center hover:bg-[#ded8cb] active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary & Submit */}
        <div className="pt-3 border-t border-[#ded8cb] space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-[#111815]">
            <span>Tổng tiền ({totalCartCount} món):</span>
            <span className="text-lg text-[#245846] font-black">{formatCurrencyVND(totalCartAmount)}</span>
          </div>

          <Button
            variant="amber"
            size="xl"
            onClick={onSubmitOrder}
            disabled={isSubmitting || hasOutOfStockItem}
            className="w-full py-3.5 text-base shadow-md flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi gọi món...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi gọi món tới Bếp ngay</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
