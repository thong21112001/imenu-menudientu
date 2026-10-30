'use client';

import React from 'react';
import { MenuItem } from '@imenu/types';
import { formatCurrencyVND } from '@imenu/utils';
import { Tilt3DCard } from '@imenu/ui';
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
      <Tilt3DCard
        maxTilt={6}
        disabled={!isAvailable}
        onClick={() => isAvailable && onOpenDetail(item)}
        className={`group cinematic-card-surface rounded-2xl overflow-hidden shadow-lg transition-all duration-200 relative flex flex-col ${
          isAvailable
            ? 'hover:border-[#dfa035]/60 hover:shadow-2xl cursor-pointer'
            : 'opacity-55 grayscale cursor-not-allowed'
        }`}
      >
        {/* Hero Photo (16:10) */}
        <div className="relative w-full aspect-16/10 bg-[#0d1310] overflow-hidden" style={{ transform: 'translateZ(12px)' }}>
          <FoodImageFallback
            src={item.imageUrl}
            alt={item.name}
            aspectRatioClass="aspect-16/10"
            className="group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Badges with animate-tagSwing */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            {item.isPopular && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#c85a32] text-[#efeae0] text-[10px] font-bold flex items-center gap-1 shadow-md tracking-wide uppercase animate-tagSwing">
                <Flame className="w-3 h-3 fill-current" /> Hot
              </span>
            )}
          </div>

          {!isAvailable && (
            <div className="absolute inset-0 bg-[#080c0a]/80 backdrop-blur-[2px] flex items-center justify-center text-[#ede7da] text-xs font-bold tracking-wider uppercase">
              Hết món
            </div>
          )}

          {itemCartQty > 0 && (
            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#151f1b]/95 text-[#dfa035] border border-[#dfa035]/40 text-[10px] font-black flex items-center gap-1 shadow-md">
              <CheckCircle2 className="w-3 h-3 text-[#dfa035]" />
              Đang chọn: {itemCartQty}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 flex-1 flex flex-col justify-between" style={{ transform: 'translateZ(8px)' }}>
          <div>
            <h3 className="text-sm font-bold text-[#ede7da] line-clamp-1 group-hover:text-[#dfa035] transition-colors">
              {item.name}
            </h3>
            {item.description && (
              <p className="text-[11px] text-[#98a69e] line-clamp-2 mt-1 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#26352e]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-black text-[#dfa035] animate-tagSwing inline-block">
                {formatCurrencyVND(item.price)}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-[10px] text-[#98a69e] line-through font-medium">
                  {formatCurrencyVND(item.originalPrice)}
                </span>
              )}
            </div>

            {isAvailable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(e, item);
                }}
                className="w-8 h-8 rounded-xl bg-[#245846] hover:bg-[#1a4133] active:bg-[#dfa035] active:text-[#080c0a] text-[#ede7da] flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer border border-[#2e7a60]/40"
                title="Thêm nhanh vào giỏ"
                aria-label={`Thêm ${item.name} vào giỏ`}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </Tilt3DCard>
    );
  }

  // COMPACT EDITORIAL CARD (Standard Grid)
  return (
    <Tilt3DCard
      maxTilt={4}
      disabled={!isAvailable}
      onClick={() => isAvailable && onOpenDetail(item)}
      className={`group p-3 cinematic-card-surface rounded-2xl shadow-xs flex gap-3.5 transition-all duration-200 relative ${
        isAvailable
          ? 'hover:border-[#dfa035]/50 hover:shadow-xl cursor-pointer'
          : 'opacity-55 grayscale cursor-not-allowed'
      }`}
    >
      {/* Dish Photo */}
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#0d1310] shrink-0 border border-[#26352e]" style={{ transform: 'translateZ(10px)' }}>
        <FoodImageFallback
          src={item.imageUrl}
          alt={item.name}
          aspectRatioClass="aspect-square"
          className="group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {item.isPopular && (
          <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-[#c85a32] text-[#efeae0] text-[9px] font-bold flex items-center gap-0.5 shadow-xs animate-tagSwing">
            <Flame className="w-2.5 h-2.5 fill-current" /> Hot
          </span>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-[#080c0a]/80 flex items-center justify-center text-[#ede7da] text-[10px] font-bold tracking-wide uppercase">
            Hết món
          </div>
        )}

        {/* Cart Quantity Badge */}
        {itemCartQty > 0 && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-[#151f1b]/95 text-[#dfa035] border border-[#dfa035]/40 text-[9px] font-black flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-2.5 h-2.5 text-[#dfa035]" />
            Đang chọn: {itemCartQty}
          </span>
        )}
      </div>

      {/* Dish Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0" style={{ transform: 'translateZ(6px)' }}>
        <div>
          <h3 className="text-sm font-bold text-[#ede7da] truncate group-hover:text-[#dfa035] transition-colors">
            {item.name}
          </h3>
          <p className="text-[11px] text-[#98a69e] line-clamp-2 mt-0.5 leading-relaxed">
            {item.description || 'Món ăn tươi ngon được chế biến theo công thức đặc biệt'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#26352e]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-[#dfa035] animate-tagSwing inline-block">
              {formatCurrencyVND(item.price)}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-[10px] text-[#98a69e] line-through font-medium">
                {formatCurrencyVND(item.originalPrice)}
              </span>
            )}
          </div>

          {isAvailable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(e, item);
              }}
              className="w-7 h-7 rounded-lg bg-[#245846] hover:bg-[#1a4133] active:bg-[#dfa035] active:text-[#080c0a] text-[#ede7da] flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer border border-[#2e7a60]/40"
              title="Thêm nhanh vào giỏ"
              aria-label={`Thêm ${item.name} vào giỏ`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Tilt3DCard>
  );
};
