'use client';

import React from 'react';
import { MenuItem, SelectedOption } from '@imenu/types';
import { formatCurrencyVND } from '@imenu/utils';
import { Modal, Button } from '@imenu/ui';
import { Plus, Minus, Check } from 'lucide-react';
import { FoodImageFallback } from './FoodImageFallback';

export interface FoodDetailDrawerProps {
  selectedItem: MenuItem | null;
  onClose: () => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  selectedOptions: SelectedOption[];
  onOptionsChange: (opts: SelectedOption[]) => void;
  note: string;
  onNoteChange: (note: string) => void;
  onAddToCart: () => void;
}

export const FoodDetailDrawer: React.FC<FoodDetailDrawerProps> = ({
  selectedItem,
  onClose,
  quantity,
  onQuantityChange,
  selectedOptions,
  onOptionsChange,
  note,
  onNoteChange,
  onAddToCart,
}) => {
  if (!selectedItem) return null;

  const extraPrice = selectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
  const unitPrice = selectedItem.price + extraPrice;
  const totalPrice = unitPrice * quantity;

  const handleSelectOption = (
    grpId: string,
    grpName: string,
    isRequired: boolean,
    valId: string,
    valName: string,
    priceDelta: number,
  ) => {
    if (isRequired) {
      // Single select for required group
      const filtered = selectedOptions.filter((o) => o.groupId !== grpId);
      onOptionsChange([
        ...filtered,
        { groupId: grpId, groupName: grpName, valueId: valId, valueName: valName, priceDelta },
      ]);
    } else {
      // Multi toggle for optional group
      const isSelected = selectedOptions.some((o) => o.valueId === valId);
      if (isSelected) {
        onOptionsChange(selectedOptions.filter((o) => o.valueId !== valId));
      } else {
        onOptionsChange([
          ...selectedOptions,
          { groupId: grpId, groupName: grpName, valueId: valId, valueName: valName, priceDelta },
        ]);
      }
    }
  };

  return (
    <Modal
      isOpen={!!selectedItem}
      onClose={onClose}
      title={selectedItem.name}
      subtitle={`Giá gốc: ${formatCurrencyVND(selectedItem.price)}`}
    >
      <div className="space-y-4 text-[#111815]">
        {/* Dish Photo Banner */}
        {selectedItem.imageUrl && (
          <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-[#ded8cb] border border-[#ded8cb]">
            <FoodImageFallback
              src={selectedItem.imageUrl}
              alt={selectedItem.name}
              aspectRatioClass="aspect-auto h-full"
            />
          </div>
        )}

        {selectedItem.description && (
          <p className="text-xs text-[#718077] leading-relaxed bg-[#e5dfd3]/80 p-2.5 rounded-xl border border-[#ded8cb]">
            {selectedItem.description}
          </p>
        )}

        {/* Options Groups */}
        {selectedItem.options && selectedItem.options.length > 0 && (
          <div className="space-y-3.5">
            {selectedItem.options.map((grp) => (
              <div key={grp.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111815]">
                    {grp.name}{' '}
                    {grp.required && <span className="text-[#c85a32] font-bold">*</span>}
                  </span>
                  {grp.required && (
                    <span className="text-[10px] text-[#245846] bg-[#245846]/15 px-2 py-0.5 rounded-full font-semibold border border-[#245846]/30">
                      Bắt buộc
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {grp.values.map((val) => {
                    const isSelected = selectedOptions.some(
                      (o) => o.groupId === grp.id && o.valueId === val.id,
                    );
                    return (
                      <button
                        type="button"
                        key={val.id}
                        onClick={() =>
                          handleSelectOption(
                            grp.id,
                            grp.name,
                            grp.required,
                            val.id,
                            val.name,
                            val.priceDelta,
                          )
                        }
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#245846]/15 border-[#245846] text-[#245846] font-bold shadow-xs'
                            : 'bg-[#f0ece3] border-[#ded8cb] text-[#2c3b34] hover:bg-[#e5dfd3] hover:border-[#c5cec7]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#245846]" />}
                          <span className="truncate">{val.name}</span>
                        </span>
                        {val.priceDelta > 0 && (
                          <span className="text-[11px] text-[#718077] shrink-0 font-medium">
                            +{formatCurrencyVND(val.priceDelta)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Note input */}
        <div className="space-y-1.5 pt-2 border-t border-[#ded8cb]">
          <label className="text-xs font-bold text-[#111815]">Ghi chú cho bếp:</label>
          <input
            type="text"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Ví dụ: Ít đá, không hành, cay vừa..."
            maxLength={150}
            className="w-full px-3 py-2 text-xs rounded-xl border border-[#ded8cb] bg-[#f0ece3] text-[#111815] placeholder:text-[#9aa89f] focus:outline-none focus:ring-2 focus:ring-[#245846]/30 focus:border-[#245846] transition-all"
          />
        </div>

        {/* Quantity Stepper & Add Button */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#ded8cb]">
          <div className="flex items-center border border-[#ded8cb] rounded-xl overflow-hidden bg-[#e5dfd3] shadow-xs">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="p-2.5 hover:bg-[#ded8cb] text-[#111815] active:scale-95 transition-colors cursor-pointer"
              aria-label="Giảm số lượng"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-9 text-center font-bold text-sm text-[#111815] tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="p-2.5 hover:bg-[#ded8cb] text-[#111815] active:scale-95 transition-colors cursor-pointer"
              aria-label="Tăng số lượng"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="amber"
            size="xl"
            onClick={onAddToCart}
            className="flex-1 font-bold shadow-md cursor-pointer"
          >
            Thêm vào giỏ · {formatCurrencyVND(totalPrice)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
