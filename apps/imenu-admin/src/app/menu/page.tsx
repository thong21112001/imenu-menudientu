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
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Flame,
  Eye,
  EyeOff,
} from 'lucide-react';

const EMOJI_SUGGESTIONS = ['🍲', '🥗', '🧋', '🍨', '🥩', '🍺', '☕', '🍱', '🍕', '🍜', '🥘', '🥤', '🍣', '🍰', '🍔', '🍙'];

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modal 1: Add Item
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState('Cơm Chiên Hải Sản Hoàng Gia');
  const [newItemPrice, setNewItemPrice] = useState('79000');
  const [newItemCategory, setNewItemCategory] = useState('cat-main');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
  const [newItemDescription, setNewItemDescription] = useState('Hải sản tươi ngọt xào cùng cơm hạt vàng giòn thơm nức mũi');
  const [newItemIsPopular, setNewItemIsPopular] = useState<boolean>(false);

  // Modal 2: Edit Item
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editItemCategory, setEditItemCategory] = useState('');
  const [editItemImage, setEditItemImage] = useState('');
  const [editItemDescription, setEditItemDescription] = useState('');
  const [editItemIsAvailable, setEditItemIsAvailable] = useState<boolean>(true);
  const [editItemIsPopular, setEditItemIsPopular] = useState<boolean>(false);

  // Modal 3: Category Modal state
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

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Quick stats
  const totalItemsCount = menuItems.length;
  const availableItemsCount = menuItems.filter((i) => i.isAvailable).length;
  const unavailableItemsCount = menuItems.filter((i) => !i.isAvailable).length;

  // Filtered Menu Items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCatId === 'all' || item.categoryId === selectedCatId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'available' && item.isAvailable) ||
      (statusFilter === 'unavailable' && !item.isAvailable);

    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Toggle item availability
  const handleToggleAvailable = (itemId: string) => {
    const updated = menuItems.map((item) => {
      if (item.id === itemId) {
        const nextAvailable = !item.isAvailable;
        return { ...item, isAvailable: nextAvailable };
      }
      return item;
    });
    setMenuItems(updated);
    storageService.saveMenuItems(updated);
    realtimeHub.publish('MENU_AVAILABILITY_CHANGED', { itemId }, 'rest-bep-nha');

    const target = menuItems.find((i) => i.id === itemId);
    if (target) {
      showToast(
        `Đã ${target.isAvailable ? 'tạm hết món' : 'bật bán lại'} "${target.name}"!`,
        target.isAvailable ? 'info' : 'success'
      );
    }
  };

  // ================= CRUD MENU ITEMS (API READINESS) =================

  // 1. Submit Add Item
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice.trim()) return;

    const newItem: MenuItem = {
      id: `dish-${Date.now()}`,
      categoryId: newItemCategory || (categories[0]?.id || 'cat-main'),
      name: newItemName.trim(),
      slug: `mon-${Date.now()}`,
      description: newItemDescription.trim() || 'Món ngon được chế biến theo công thức gia truyền',
      price: parseInt(newItemPrice, 10) || 50000,
      imageUrl: newItemImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: newItemIsPopular,
    };

    const updated = [newItem, ...menuItems];
    setMenuItems(updated);
    storageService.saveMenuItems(updated);
    setIsAddModalOpen(false);

    // Reset inputs
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDescription('');
    setNewItemIsPopular(false);
    showToast(`Đã thêm món "${newItem.name}" vào thực đơn thành công!`, 'success');
  };

  // 2. Open Edit Item Modal
  const handleOpenEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
    setEditItemCategory(item.categoryId);
    setEditItemImage(item.imageUrl);
    setEditItemDescription(item.description || '');
    setEditItemIsAvailable(item.isAvailable);
    setEditItemIsPopular(!!item.isPopular);
    setIsEditModalOpen(true);
  };

  // 3. Submit Update Item
  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editItemName.trim() || !editItemPrice.trim()) return;

    const updated = menuItems.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            name: editItemName.trim(),
            price: parseInt(editItemPrice, 10) || item.price,
            categoryId: editItemCategory,
            imageUrl: editItemImage.trim(),
            description: editItemDescription.trim(),
            isAvailable: editItemIsAvailable,
            isPopular: editItemIsPopular,
          }
        : item
    );

    setMenuItems(updated);
    storageService.saveMenuItems(updated);
    setIsEditModalOpen(false);
    showToast(`Đã cập nhật món "${editItemName.trim()}" thành công!`, 'success');
  };

  // 4. Delete Item
  const handleDeleteItem = (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;

    if (confirm(`Bạn có chắc chắn muốn xóa món "${item.name}" khỏi thực đơn?`)) {
      const updated = menuItems.filter((i) => i.id !== itemId);
      setMenuItems(updated);
      storageService.saveMenuItems(updated);
      showToast(`Đã xóa món "${item.name}" khỏi thực đơn!`, 'info');
    }
  };

  // ================= CRUD CATEGORIES =================

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
    showToast(
      editingCategory
        ? `Đã cập nhật danh mục "${categoryName.trim()}"!`
        : `Đã tạo mới danh mục "${categoryName.trim()}"!`,
      'success'
    );
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    const itemsInCat = menuItems.filter((i) => i.categoryId === catId);
    if (itemsInCat.length > 0) {
      alert(
        `Không thể xóa danh mục này vì đang có ${itemsInCat.length} món ăn. Vui lòng chuyển các món sang danh mục khác trước.`
      );
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
      showToast('Đã xóa danh mục!', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-red-900 text-red-100 border-red-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ================= TOP HEADER BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#09271d] flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-[#176044] shrink-0" />
            <span className="truncate">Quản Lý Thực Đơn & Danh Mục</span>
          </h1>
          <p className="text-xs text-[#66736d] mt-0.5 line-clamp-1 sm:line-clamp-none">
            Cập nhật món ăn, hình ảnh, giá bán và cấu hình phân loại hiển thị trên mã QR của khách
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            icon={<FolderPlus className="w-4 h-4 text-[#176044]" />}
            onClick={() => handleOpenCategoryModal()}
            className="cursor-pointer bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs w-full sm:w-auto text-xs py-2 px-2.5 justify-center"
          >
            + Thêm danh mục
          </Button>

          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            id="btn-add-new-item"
            className="cursor-pointer shadow-md bg-[#124a36] hover:bg-[#09271d] w-full sm:w-auto text-xs py-2 px-2.5 justify-center"
          >
            Thêm món mới
          </Button>
        </div>
      </div>

      {/* ================= QUICK STATS CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full min-w-0">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#124a36] grid place-items-center font-bold shrink-0">
            <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">Tổng số món</span>
            <strong className="text-base sm:text-xl font-black text-slate-900 block truncate">{totalItemsCount}</strong>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-700 grid place-items-center font-bold shrink-0">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">Đang phục vụ</span>
            <strong className="text-base sm:text-xl font-black text-emerald-700 block truncate">{availableItemsCount}</strong>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-50 text-red-700 grid place-items-center font-bold shrink-0">
            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">Tạm hết món</span>
            <strong className="text-base sm:text-xl font-black text-red-700 block truncate">{unavailableItemsCount}</strong>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center font-bold shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">Danh mục</span>
            <strong className="text-base sm:text-xl font-black text-slate-900 block truncate">{categories.length}</strong>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & STATUS FILTER BAR ================= */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          {/* Search box */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm món theo tên hoặc mô tả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 min-w-0"
            />
          </div>

          {/* Availability filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start shrink-0">
            <span className="text-xs font-bold text-slate-500 shrink-0">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-bold text-slate-700 flex-1 sm:flex-initial"
            >
              <option value="all">Tất cả món ({menuItems.length})</option>
              <option value="available">Đang phục vụ ({availableItemsCount})</option>
              <option value="unavailable">Tạm hết món ({unavailableItemsCount})</option>
            </select>
          </div>
        </div>

        {/* Category Tabs & Quick Manage (Touch-friendly & Horizontal Scroll) */}
        <div className="border-t border-slate-100 pt-2.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#176044]">
              <Layers className="w-3.5 h-3.5" />
              <span>Danh mục thực đơn ({categories.length})</span>
            </div>
            <button
              onClick={() => handleOpenCategoryModal()}
              className="text-xs font-bold text-[#176044] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm danh mục
            </button>
          </div>

          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 items-center w-full min-w-0">
            <button
              onClick={() => setSelectedCatId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedCatId === 'all'
                  ? 'bg-[#124a36] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Tất cả món</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCatId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {menuItems.length}
              </span>
            </button>

            {categories.map((c) => {
              const count = menuItems.filter((i) => i.categoryId === c.id).length;
              const isSelected = selectedCatId === c.id;
              return (
                <div key={c.id} className="inline-flex items-center gap-1 shrink-0 bg-slate-50 p-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setSelectedCatId(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#124a36] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
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

                  {/* Direct Edit category button */}
                  <button
                    onClick={() => handleOpenCategoryModal(c)}
                    className="p-1 rounded-md text-slate-400 hover:text-[#176044] hover:bg-slate-200 transition-colors cursor-pointer"
                    title={`Chỉnh sửa danh mục ${c.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {filteredItems.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-3">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-extrabold text-slate-700">Không tìm thấy món ăn phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm, bộ lọc trạng thái hoặc bấm nút bên dưới để thêm món mới
          </p>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
            className="cursor-pointer mx-auto"
          >
            Thêm món mới vào thực đơn
          </Button>
        </div>
      )}

      {/* ================= MENU ITEMS RESPONSIVE GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
        {filteredItems.map((item) => {
          const categoryObj = categories.find((c) => c.id === item.categoryId);

          return (
            <Card
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow relative group min-w-0 w-full ${
                !item.isAvailable ? 'bg-slate-50/80 border-slate-200' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                {/* Top Strip: Category & Popular badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate">
                    {categoryObj ? `${categoryObj.icon || ''} ${categoryObj.name}` : 'Món ăn'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.isPopular && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        <Flame className="w-3 h-3 text-amber-600 fill-amber-500" /> Bán chạy
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      />
                      {item.isAvailable ? 'Còn món' : 'Hết món'}
                    </span>
                  </div>
                </div>

                {/* Main Content Info: Image + Title + Price */}
                <div className="flex items-start gap-3">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={`w-full h-full object-cover transition-transform group-hover:scale-105 ${
                        !item.isAvailable ? 'grayscale opacity-70' : ''
                      }`}
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <strong className="text-sm font-extrabold text-slate-900 block truncate" title={item.name}>
                      {item.name}
                    </strong>

                    <span className="text-sm font-black text-[#176044] block">
                      {formatCurrencyVND(item.price)}
                    </span>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description || 'Chưa có mô tả chi tiết cho món ăn này'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {/* Availability Toggle */}
                <button
                  onClick={() => handleToggleAvailable(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    item.isAvailable
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                  title={item.isAvailable ? 'Chuyển sang trạng thái hết món' : 'Bật phục vụ lại'}
                >
                  {item.isAvailable ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Tắt món</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Bật món</span>
                    </>
                  )}
                </button>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditItemModal(item)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title={`Chỉnh sửa món ${item.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 transition-colors cursor-pointer"
                    title={`Xóa món ${item.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ================= MODAL 1: THÊM MÓN MỚI ================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Món Mới Vào Thực Đơn"
        subtitle="Món mới sẽ lập tức hiển thị trên thực đơn mã QR khi khách quét mã"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Giá bán (VNĐ) *</label>
              <input
                type="number"
                required
                min={0}
                step={1000}
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
            <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả món ăn</label>
            <textarea
              rows={2}
              placeholder="Mô tả nguyên liệu, hương vị đặc trưng để hấp dẫn khách hàng..."
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Đường dẫn hình ảnh (URL)</label>
            <input
              type="text"
              value={newItemImage}
              onChange={(e) => setNewItemImage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
            />
            {newItemImage && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={newItemImage}
                  alt="Xem trước"
                  className="w-12 h-12 rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <span className="text-[11px] text-slate-500 font-medium">Xem trước ảnh món ăn</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="new-item-popular"
              checked={newItemIsPopular}
              onChange={(e) => setNewItemIsPopular(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="new-item-popular" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" /> Đánh dấu là món bán chạy / Best Seller
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit">
              Lưu & Xuất bản thực đơn
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 2: CHỈNH SỬA MÓN ĂN (NEW) ================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingItem ? `Chỉnh Sửa: ${editingItem.name}` : 'Chỉnh Sửa Món Ăn'}
        subtitle="Cập nhật giá bán, hình ảnh và thông tin chi tiết của món ăn"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEditItem} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tên món ăn / đồ uống *</label>
            <input
              type="text"
              required
              value={editItemName}
              onChange={(e) => setEditItemName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Giá bán (VNĐ) *</label>
              <input
                type="number"
                required
                min={0}
                step={1000}
                value={editItemPrice}
                onChange={(e) => setEditItemPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Danh mục *</label>
              <select
                value={editItemCategory}
                onChange={(e) => setEditItemCategory(e.target.value)}
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
            <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả món ăn</label>
            <textarea
              rows={2}
              value={editItemDescription}
              onChange={(e) => setEditItemDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Đường dẫn hình ảnh (URL)</label>
            <input
              type="text"
              value={editItemImage}
              onChange={(e) => setEditItemImage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
            />
            {editItemImage && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={editItemImage}
                  alt="Xem trước"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <span className="text-[11px] text-slate-500 font-medium">Xem trước ảnh món</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-item-available"
                checked={editItemIsAvailable}
                onChange={(e) => setEditItemIsAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="edit-item-available" className="text-xs font-bold text-slate-700 cursor-pointer">
                Đang phục vụ (Còn món)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-item-popular"
                checked={editItemIsPopular}
                onChange={(e) => setEditItemIsPopular(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <label htmlFor="edit-item-popular" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Món bán chạy / Best Seller
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit">
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 3: TẠO / SỬA DANH MỤC MÓN ================= */}
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
    </div>
  );
}
