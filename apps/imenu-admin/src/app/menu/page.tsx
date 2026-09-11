'use client';

import React, { useState, useEffect } from 'react';
import { storageService, formatCurrencyVND, realtimeHub } from '@imenu/utils';
import { MenuItem, MenuCategory } from '@imenu/types';
import { Card, Button, Badge, Modal } from '@imenu/ui';
import {
  Plus,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  UtensilsCrossed,
  FolderPlus,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';

const EMOJI_SUGGESTIONS = ['🍲', '🥗', '🧋', '🍨', '🥩', '🍺', '☕', '🍱', '🍕', '🍜', '🥘', '🥤', '🍣', '🍰', '🍔', '🍙'];

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');

  // Add Item Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState('Cơm Chiên Hải Sản Hoàng Gia');
  const [newItemPrice, setNewItemPrice] = useState('79000');
  const [newItemCategory, setNewItemCategory] = useState('cat-main');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');

  // Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [categoryIcon, setCategoryIcon] = useState<string>('🍲');
  const [categoryOrder, setCategoryOrder] = useState<number>(1);

  useEffect(() => {
    setCategories(storageService.getCategories());
    setMenuItems(storageService.getMenuItems());
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('modal=add')) {
      setIsAddModalOpen(true);
    }
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

  // Add Item Submit
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
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

  // Open Category Modal (Add or Edit)
  const handleOpenCategoryModal = (cat?: MenuCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategorySlug(cat.slug);
      setCategoryIcon(cat.icon || '🍲');
      setCategoryOrder(cat.order || 1);
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategorySlug('');
      setCategoryIcon('🍲');
      setCategoryOrder(categories.length + 1);
    }
    setIsCategoryModalOpen(true);
  };

  // Auto-generate slug when typing category name
  const handleCategoryNameChange = (val: string) => {
    setCategoryName(val);
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setCategorySlug(generatedSlug);
    }
  };

  // Save Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    let updated: MenuCategory[];
    if (editingCategory) {
      updated = categories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: categoryName.trim(),
              slug: categorySlug.trim() || `cat-${Date.now()}`,
              icon: categoryIcon,
              order: categoryOrder,
            }
          : c
      );
    } else {
      const newCat: MenuCategory = {
        id: `cat-${Date.now()}`,
        name: categoryName.trim(),
        slug: categorySlug.trim() || `cat-${Date.now()}`,
        icon: categoryIcon,
        order: categoryOrder,
        itemsCount: 0,
      };
      updated = [...categories, newCat];
    }

    setCategories(updated);
    storageService.saveCategories(updated);
    setIsCategoryModalOpen(false);
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    const itemsInCat = menuItems.filter((i) => i.categoryId === catId);
    if (itemsInCat.length > 0) {
      alert(`Không thể xóa danh mục này vì đang có ${itemsInCat.length} món ăn. Vui lòng chuyển các món sang danh mục khác trước.`);
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      const updated = categories.filter((c) => c.id !== catId);
      setCategories(updated);
      storageService.saveCategories(updated);
      if (selectedCatId === catId) {
        setSelectedCatId('all');
      }
      setIsCategoryModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#09271d]">Quản Lý Thực Đơn & Danh Mục</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Cập nhật giá bán, hình ảnh món ăn và quản lý phân loại danh mục thực đơn tức thì
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            icon={<FolderPlus className="w-4 h-4 text-[#176044]" />}
            onClick={() => handleOpenCategoryModal()}
            className="cursor-pointer"
          >
            + Tạo mới danh mục
          </Button>

          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-new-item"
            className="cursor-pointer"
          >
            Thêm món mới
          </Button>
        </div>
      </div>

      {/* Category Tabs & Quick Manage */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#176044]">
            <Layers className="w-4 h-4" />
            <span>Phân loại danh mục thực đơn ({categories.length})</span>
          </div>
          <button
            onClick={() => handleOpenCategoryModal()}
            className="text-xs font-bold text-[#176044] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm danh mục
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 items-center">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              selectedCatId === 'all'
                ? 'bg-[#124a36] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Tất cả món</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCatId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {menuItems.length}
            </span>
          </button>

          {categories.map((c) => {
            const count = menuItems.filter((i) => i.categoryId === c.id).length;
            const isSelected = selectedCatId === c.id;
            return (
              <div key={c.id} className="inline-flex items-center group">
                <button
                  onClick={() => setSelectedCatId(c.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#124a36] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{c.icon || '🍲'}</span>
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>

                {/* Quick Edit icon for category */}
                <button
                  onClick={() => handleOpenCategoryModal(c)}
                  className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-[#176044] hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={`Chỉnh sửa danh mục ${c.name}`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="p-4 flex gap-4 items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 shadow-2xs"
              />
              <div className="min-w-0">
                <strong className="text-xs sm:text-sm font-bold text-slate-900 block truncate">{item.name}</strong>
                <span className="text-xs font-black text-[#176044] block mt-0.5">
                  {formatCurrencyVND(item.price)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {item.isAvailable ? 'Còn món' : 'Hết món'}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleToggleAvailable(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
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

      {/* ================= MODAL TẠO / SỬA DANH MỤC MÓN ================= */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Món Mới'}
        subtitle="Danh mục giúp khách hàng dễ dàng tìm kiếm món ăn trên thực đơn QR"
        maxWidth="md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tên danh mục *</label>
            <input
              type="text"
              required
              placeholder="VD: Lẩu & Nướng Đặc Biệt, Đồ Uống Pha Chế..."
              value={categoryName}
              onChange={(e) => handleCategoryNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mã định danh (Slug)</label>
            <input
              type="text"
              placeholder="VD: lau-nuong-dac-biet"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Biểu tượng Icon Emoji</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setCategoryIcon(emoji)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center cursor-pointer transition-all ${
                    categoryIcon === emoji
                      ? 'bg-[#124a36] text-white shadow-md ring-2 ring-[#124a36]/30'
                      : 'bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Hoặc tự nhập:</span>
              <input
                type="text"
                value={categoryIcon}
                onChange={(e) => setCategoryIcon(e.target.value)}
                className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Thứ tự hiển thị</label>
            <input
              type="number"
              min={1}
              value={categoryOrder}
              onChange={(e) => setCategoryOrder(parseInt(e.target.value, 10) || 1)}
              className="w-28 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {editingCategory ? (
              <Button
                variant="outline"
                type="button"
                onClick={() => handleDeleteCategory(editingCategory.id)}
                className="text-red-600 hover:bg-red-50 border-red-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Xóa danh mục
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" type="button" onClick={() => setIsCategoryModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" type="submit">
                {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục mới'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL THÊM MÓN MỚI ================= */}
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
