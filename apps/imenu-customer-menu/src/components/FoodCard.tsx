'use client';

import React from 'react';
import { MenuItem } from '@imenu/types';
import { formatCurrencyVND } from '@imenu/utils';
import { Plus, Flame, CheckCircle2 } from 'lucide-react';
import { FoodImageFallback } from './FoodImageFallback';

export interface FoodCardProps {
  item: MenuItem;
  itemCartQty: number;
  onOpenDetail: (item: MenuItem) => void;
  onQuickAdd: (e: React.MouseEvent, item: MenuItem) => void;
  isHero?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  itemCartQty,
  onOpenDetail,
  onQuickAdd,
  isHero = false,
}) => {
  const isAvailable = item.isAvailable;

  // HERO CARD LAYOUT (for featured / popular dishes in hero spotlight)
  if (isHero) {
    return (
      <div
        onClick={() => isAvailable && onOpenDetail(item)}
        className={`group bg-white rounded-2xl border border-[#E8E4DA] overflow-hidden shadow-xs transition-all duration-200 relative flex flex-col ${
          isAvailable
            ? 'hover:border-[#244B3C]/40 hover:shadow-md cursor-pointer active:scale-[0.99]'
            : 'opacity-60 grayscale cursor-not-allowed'
        }`}
      >
        {/* Hero Photo (16:9 / 4:3) */}
        <div className="relative w-full aspect-16/10 bg-[#F4F1EA] overflow-hidden">
          <FoodImageFallback
            src={item.imageUrl}
            alt={item.name}
            aspectRatioClass="aspect-16/10"
            className="group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {item.isPopular && (
              <span className="px-2 py-0.5 rounded-full bg-[#C2542E] text-white text-[10px] font-bold flex items-center gap-1 shadow-sm tracking-wide uppercase">
                <Flame className="w-3 h-3 fill-white" /> Hot
              </span>
            )}
          </div>

          {!isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center text-white text-xs font-bold tracking-wider uppercase">
              Hết món
            </div>
          )}

          {itemCartQty > 0 && (
            <span className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-[#17382D] text-[#E9B84C] border border-white/30 text-[10px] font-black flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3 h-3 text-[#E9B84C]" />
              Đang chọn: {itemCartQty}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#282923] line-clamp-1 group-hover:text-[#244B3C] transition-colors">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-[11px] text-[#5F6055] line-clamp-2 mt-1 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F0ECE3]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-[#244B3C]">
                {formatCurrencyVND(item.price)}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-[10px] text-[#8C8D82] line-through font-medium">
                  {formatCurrencyVND(item.originalPrice)}
                </span>
              )}
            </div>

            {isAvailable && (
              <button
                type="button"
                onClick={(e) => onQuickAdd(e, item)}
                className="w-8 h-8 rounded-xl bg-[#244B3C] hover:bg-[#17382D] text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer"
                title="Thêm nhanh vào giỏ"
                aria-label={`Thêm ${item.name} vào giỏ`}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // COMPACT EDITORIAL CARD (Standard Grid)
  return (
    <div
      onClick={() => isAvailable && onOpenDetail(item)}
      className={`group p-3 bg-white rounded-2xl border border-[#E8E4DA] shadow-xs flex gap-3.5 transition-all duration-200 relative ${
        isAvailable
          ? 'hover:border-[#244B3C]/40 hover:shadow-md active:scale-[0.99] cursor-pointer'
          : 'opacity-60 grayscale cursor-not-allowed'
      }`}
    >
      {/* Dish Photo */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#F4F1EA] shrink-0 border border-[#ECE7DC]">
        <FoodImageFallback
          src={item.imageUrl}
          alt={item.name}
          aspectRatioClass="aspect-square"
          className="group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {item.isPopular && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#C2542E] text-white text-[9px] font-bold flex items-center gap-0.5 shadow-xs">
            <Flame className="w-2.5 h-2.5 fill-white" /> Hot
          </span>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold tracking-wide uppercase">
            Hết món
          </div>
        )}

        {/* Cart Quantity Badge */}
        {itemCartQty > 0 && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-[#17382D] text-[#E9B84C] border border-white/30 text-[9px] font-black flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-2.5 h-2.5 text-[#E9B84C]" />
            Đang chọn: {itemCartQty}
          </span>
        )}
      </div>

      {/* Dish Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-sm font-bold text-[#282923] truncate group-hover:text-[#244B3C] transition-colors">
            {item.name}
          </h3>
          <p className="text-[11px] text-[#5F6055] line-clamp-2 mt-0.5 leading-relaxed">
            {item.description || 'Món ăn tươi ngon được chế biến theo công thức đặc biệt'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F0ECE3]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-[#244B3C]">
              {formatCurrencyVND(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-[10px] text-[#8C8D82] line-through font-medium">
                {formatCurrencyVND(item.originalPrice)}
              </span>
            )}
          </div>

          {isAvailable && (
            <button
              type="button"
              onClick={(e) => onQuickAdd(e, item)}
              className="w-7 h-7 rounded-lg bg-[#244B3C] hover:bg-[#17382D] text-white flex items-center justify-center shadow-xs active:scale-90 transition-transform cursor-pointer"
              title="Thêm nhanh vào giỏ"
              aria-label={`Thêm ${item.name} vào giỏ`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

