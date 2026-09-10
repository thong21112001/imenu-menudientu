'use client';

import React, { useState, useEffect } from 'react';
import { storageService, formatCurrencyVND, realtimeHub } from '@imenu/utils';
import { MenuItem, MenuCategory } from '@imenu/types';
import { Card, Button, Badge, Modal } from '@imenu/ui';
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

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState('Cơm Chiên Hải Sản Hoàng Gia');
  const [newItemPrice, setNewItemPrice] = useState('79000');
  const [newItemCategory, setNewItemCategory] = useState('cat-main');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('modal=add')) {
      setIsAddModalOpen(true);
    }
  }, []);

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    const cat = categories.find((c) => c.id === newItemCategory);
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      categoryId: newItemCategory,
      name: newItemName,
      slug: `mon-${Date.now()}`,
      description: 'Món mới được thêm vào thực đơn',
      price: parseInt(newItemPrice, 10) || 50000,
      imageUrl: newItemImage,
      isAvailable: true,
    };
    const updated = [newItem, ...menuItems];
    setMenuItems(updated);
    storageService.saveMenuItems(updated);
    setIsAddModalOpen(false);
    setNewItemName('');
    setNewItemPrice('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Quản Lý Thực Đơn & Danh Mục</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Cập nhật giá bán, hình ảnh và bật/tắt trạng thái Còn món / Hết món tức thì
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-new-item"
          >
            Thêm món mới
          </Button>
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

      {/* Add New Dish Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Món Mới Vào Thực Đơn"
        subtitle="Món mới sẽ lập tức hiển thị trên mã QR của khách hàng"
        maxWidth="md"
      >
        <form onSubmit={handleAddNewItem} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tên món ăn / đồ uống *</label>
            <input
              type="text"
              required
              placeholder="VD: Cơm Chiên Dương Châu Hải Sản"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Giá bán (VNĐ) *</label>
              <input
                type="number"
                required
                placeholder="VD: 65000"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Danh mục *</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Đường dẫn ảnh món</label>
            <input
              type="text"
              value={newItemImage}
              onChange={(e) => setNewItemImage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit">
              Lưu & Xuất bản thực đơn
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
