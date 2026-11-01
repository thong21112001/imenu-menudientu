'use client';

import React from 'react';
import { MenuItem, SelectedOption } from '@imenu/types';
import { formatCurrencyVND } from '@imenu/utils';
import { Drawer, Button } from '@imenu/ui';
import { Minus, Plus, AlertCircle, Loader2, Send, ShoppingCart } from 'lucide-react';

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
      <div className="space-y-4">
        {/* Out-of-stock warning banner */}
        {hasOutOfStockItem && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
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
                    ? 'bg-rose-50/60 border-rose-300'
                    : 'bg-[#FAF7F0] border-[#E8E4DA]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#282923] truncate">{item.item.name}</h4>
                    {isItemOutOfStock && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-2xs shrink-0">
                        Hết món tại Bếp
                      </span>
                    )}
                  </div>
                  {item.selectedOptions.length > 0 && (
                    <div className="text-[10px] text-[#5F6055] mt-0.5">
                      {item.selectedOptions.map((o) => o.valueName).join(', ')}
                    </div>
                  )}
                  {item.note && (
                    <div className="text-[10px] text-[#C2542E] mt-0.5 italic">
                      Ghi chú: {item.note}
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#244B3C] mt-1 block">
                    {formatCurrencyVND(item.itemTotal)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onQuantityChange(idx, -1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#E8E4DA] text-[#282923] flex items-center justify-center hover:bg-[#F4F1EA] active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-[#282923] w-5 text-center tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isSubmitting || isItemOutOfStock}
                    onClick={() => onQuantityChange(idx, 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-[#E8E4DA] text-[#282923] flex items-center justify-center hover:bg-[#F4F1EA] active:scale-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
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
        <div className="pt-3 border-t border-[#E8E4DA] space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-[#282923]">
            <span>Tổng tiền ({totalCartCount} món):</span>
            <span className="text-lg text-[#244B3C] font-black">{formatCurrencyVND(totalCartAmount)}</span>
          </div>

          <Button
            variant="fnb-primary"
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

