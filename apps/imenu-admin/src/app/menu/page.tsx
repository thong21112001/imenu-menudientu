'use client';

import React, { useState, useEffect } from 'react';
import { storageService, formatCurrencyVND, realtimeHub } from '@imenu/utils';
import { MenuItem, MenuCategory } from '@imenu/types';
import { Card, Button, Badge } from '@imenu/ui';
import { Plus, Check, X, ToggleLeft, ToggleRight, UtensilsCrossed } from 'lucide-react';

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  useEffect(() => {
    setCategories(storageService.getCategories());
    setMenuItems(storageService.getMenuItems());
  }, []);

  const handleToggleAvailable = (itemId: string) => {
    const updated = menuItems.map((item) => {
      if (item.id === itemId) {
        return { ...item, isAvailable: !item.isAvailable };
      }
      return item;
    });
    setMenuItems(updated);
    storageService.saveMenuItems(updated);
    realtimeHub.publish('MENU_AVAILABILITY_CHANGED', { itemId }, 'rest-bep-nha');
  };

  const filteredItems = menuItems.filter(
    (i) => selectedCatId === 'all' || i.categoryId === selectedCatId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Quản Lý Thực Đơn & Danh Mục</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Cập nhật giá bán, hình ảnh và bật/tắt trạng thái Còn món / Hết món tức thì
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setSelectedCatId('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedCatId === 'all'
              ? 'bg-[#124a36] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả món ({menuItems.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCatId(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCatId === c.id
                ? 'bg-[#124a36] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Menu Items Table Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4 flex gap-4 items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <strong className="text-xs font-bold text-slate-900 block truncate">{item.name}</strong>
                <span className="text-xs font-extrabold text-[#176044] block mt-0.5">
                  {formatCurrencyVND(item.price)}
                </span>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {item.isAvailable ? 'Còn món' : 'Hết món'}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleAvailable(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                item.isAvailable
                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {item.isAvailable ? 'Tắt món' : 'Bật món'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
