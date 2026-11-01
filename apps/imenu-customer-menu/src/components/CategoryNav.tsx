'use client';

import React from 'react';
import { MenuCategory } from '@imenu/types';
import { Search, X } from 'lucide-react';

export interface CategoryNavProps {
  categories: MenuCategory[];
  activeCategoryId: string;
  categoryCounts: Record<string, number>;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  categoryCounts,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <div className="sticky top-[53px] z-30 bg-[#0d1310]/95 pt-1 pb-3 space-y-2.5 border-b border-[#26352e] backdrop-blur-md">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#98a69e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm món ngon, đồ uống..."
          className="w-full pl-10 pr-9 py-2 rounded-2xl bg-[#151f1b] border border-[#26352e] text-xs text-[#ede7da] placeholder:text-[#738379] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#dfa035]/30 focus:border-[#dfa035] transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98a69e] hover:text-[#ede7da] p-1 cursor-pointer"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Filter Pills & Categories with Dish Counts */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 items-center">
        {/* All Items Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            activeCategoryId === 'all'
              ? 'bg-[#dfa035] text-[#080c0a] font-bold shadow-md'
              : 'bg-[#151f1b] text-[#98a69e] border border-[#26352e] hover:bg-[#1a2621] hover:text-[#ede7da]'
          }`}
        >
          <span>🔥 Tất cả món</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategoryId === 'all'
                ? 'bg-[#080c0a]/20 text-[#080c0a]'
                : 'bg-[#26352e] text-[#98a69e]'
            }`}
          >
            {categoryCounts.all || 0}
          </span>
        </button>

        {/* Popular / Best Seller Pill */}
        <button
          type="button"
          onClick={() => onSelectCategory('popular')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
            activeCategoryId === 'popular'
              ? 'bg-[#dfa035] text-[#080c0a] font-bold shadow-md'
              : 'bg-[#151f1b] text-[#98a69e] border border-[#26352e] hover:bg-[#1a2621] hover:text-[#ede7da]'
          }`}
        >
          <span>⭐ Bán chạy</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeCategoryId === 'popular'
                ? 'bg-[#080c0a]/20 text-[#080c0a]'
                : 'bg-[#26352e] text-[#98a69e]'
            }`}
          >
            {categoryCounts.popular || 0}
          </span>
        </button>

        {/* Custom Category Pills */}
        {categories.map((cat) => (
          <button
            type="button"
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              activeCategoryId === cat.id
                ? 'bg-[#dfa035] text-[#080c0a] font-bold shadow-md'
                : 'bg-[#151f1b] text-[#98a69e] border border-[#26352e] hover:bg-[#1a2621] hover:text-[#ede7da]'
            }`}
          >
            <span>{cat.icon || '🍽️'}</span>
            <span>{cat.name}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeCategoryId === cat.id
                  ? 'bg-[#080c0a]/20 text-[#080c0a]'
                  : 'bg-[#26352e] text-[#98a69e]'
              }`}
            >
              {categoryCounts[cat.id] || 0}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
