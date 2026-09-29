'use client';

import React, { useState, useEffect } from 'react';
import { storageService, formatCurrencyVND, realtimeHub, apiClient } from '@imenu/utils';
import { MenuItem, MenuCategory, MenuItemOptionGroup } from '@imenu/types';
import { Card, Button, Modal, CustomSelect, useToast } from '@imenu/ui';
import {
  Plus,
  X,
  UtensilsCrossed,
  FolderPlus,
  Edit2,
  Trash2,
  Layers,
  Search,
  Flame,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const EMOJI_SUGGESTIONS = ['🍲', '🥗', '🧋', '🍨', '🥩', '🍺', '☕', '🍱', '🍕', '🍜', '🥘', '🥤', '🍣', '🍰', '🍔', '🍙'];

export default function MenuManagementPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Modal 1: Add Item
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState('Cơm Chiên Hải Sản Hoàng Gia');
  const [newItemPrice, setNewItemPrice] = useState('79000');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemImage, setNewItemImage] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
  const [newItemDescription, setNewItemDescription] = useState('Hải sản tươi ngọt xào cùng cơm hạt vàng giòn thơm nức mũi');
  const [newItemIsPopular, setNewItemIsPopular] = useState<boolean>(false);
  const [newItemOptions, setNewItemOptions] = useState<MenuItemOptionGroup[]>([]);

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
  const [editItemOptions, setEditItemOptions] = useState<MenuItemOptionGroup[]>([]);

  // Modal 3: Category Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [categoryIcon, setCategoryIcon] = useState<string>('🍲');
  const [categoryOrder, setCategoryOrder] = useState<number>(1);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    if (type === 'error') toast.error(text);
    else if (type === 'info') toast.info(text);
    else toast.success(text);
  };

  // Fetch full menu data from API with storage fallback
  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        apiClient.categories.list().catch((err) => {
          console.warn('Cannot fetch categories from API:', err.message);
          return null;
        }),
        apiClient.menuItems.list({ limit: 200 }).catch((err) => {
          console.warn('Cannot fetch menu items from API:', err.message);
          return null;
        }),
      ]);

      if (catsRes && Array.isArray(catsRes.data)) {
        setCategories(catsRes.data);
        storageService.saveCategories(catsRes.data);
      } else if (!catsRes) {
        const localCats = storageService.getCategories();
        setCategories(localCats);
      }

      if (itemsRes && itemsRes.data) {
        const list = Array.isArray(itemsRes.data)
          ? itemsRes.data
          : (itemsRes.data as any).items || [];
        setMenuItems(list);
        storageService.saveMenuItems(list);
      } else if (!itemsRes) {
        const localItems = storageService.getMenuItems();
        setMenuItems(localItems);
      }
    } catch (err: any) {
      console.error('Error fetching menu data:', err);
      setCategories(storageService.getCategories());
      setMenuItems(storageService.getMenuItems());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDefaultMenu = async () => {
    setIsSeeding(true);
    try {
      await apiClient.categories.seedDefault();
      showToast('Đã khởi tạo bộ thực đơn mẫu chuẩn nhà hàng Việt thành công!', 'success');
      await fetchMenuData();
    } catch (err: any) {
      showToast(err.message || 'Không thể khởi tạo thực đơn mẫu', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('modal=add')) {
      setIsAddModalOpen(true);
    }
  }, []);

  // Quick stats
  const totalItemsCount = menuItems.length;
  const availableItemsCount = menuItems.filter((i) => i.isAvailable).length;
  const unavailableItemsCount = menuItems.filter((i) => !i.isAvailable).length;

  // Filtered Menu Items
  const filteredItems = menuItems.filter((item) => {
    const itemCatId = item.categoryId || (item as any).category?._id || (item as any).category?.id || (typeof (item as any).category === 'string' ? (item as any).category : '');
    const matchesCategory = selectedCatId === 'all' || itemCatId === selectedCatId;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'available' && item.isAvailable) ||
      (statusFilter === 'unavailable' && !item.isAvailable);

    return matchesCategory && matchesSearch && matchesStatus;
  });

  // Fast toggle item availability with API call & optimistic update
  const handleToggleAvailable = async (itemId: string) => {
    const target = menuItems.find((i) => i.id === itemId);
    if (!target) return;
    const nextAvailable = !target.isAvailable;

    const previous = [...menuItems];
    const updated = menuItems.map((item) =>
      item.id === itemId ? { ...item, isAvailable: nextAvailable } : item
    );
    setMenuItems(updated);
    storageService.saveMenuItems(updated);

    try {
      await apiClient.menuItems.toggleStatus(itemId, nextAvailable);
      realtimeHub.publish('MENU_AVAILABILITY_CHANGED', { itemId, isAvailable: nextAvailable }, 'rest-bep-nha');
      showToast(
        `Đã ${nextAvailable ? 'bật bán lại' : 'tạm hết món'} "${target.name}"!`,
        nextAvailable ? 'success' : 'info'
      );
    } catch (err: any) {
      setMenuItems(previous);
      storageService.saveMenuItems(previous);
      showToast(err.message || 'Lỗi khi cập nhật trạng thái món', 'error');
    }
  };

  // Option Group helper functions
  const addOptionGroup = (isEdit: boolean) => {
    const newGroup: MenuItemOptionGroup = {
      id: `opt-${Date.now()}`,
      name: '',
      required: false,
      multiple: false,
      values: [{ id: `val-${Date.now()}-1`, name: '', priceDelta: 0 }],
    };
    if (isEdit) {
      setEditItemOptions([...editItemOptions, newGroup]);
    } else {
      setNewItemOptions([...newItemOptions, newGroup]);
    }
  };

  const removeOptionGroup = (isEdit: boolean, groupIndex: number) => {
    if (isEdit) {
      setEditItemOptions(editItemOptions.filter((_, idx) => idx !== groupIndex));
    } else {
      setNewItemOptions(newItemOptions.filter((_, idx) => idx !== groupIndex));
    }
  };

  const updateOptionGroup = (isEdit: boolean, groupIndex: number, field: keyof MenuItemOptionGroup, value: any) => {
    const list = isEdit ? [...editItemOptions] : [...newItemOptions];
    list[groupIndex] = { ...list[groupIndex], [field]: value };
    if (isEdit) setEditItemOptions(list);
    else setNewItemOptions(list);
  };

  const addOptionValue = (isEdit: boolean, groupIndex: number) => {
    const list = isEdit ? [...editItemOptions] : [...newItemOptions];
    const group = { ...list[groupIndex] };
    group.values = [
      ...group.values,
      { id: `val-${Date.now()}-${group.values.length + 1}`, name: '', priceDelta: 0 },
    ];
    list[groupIndex] = group;
    if (isEdit) setEditItemOptions(list);
    else setNewItemOptions(list);
  };

  const removeOptionValue = (isEdit: boolean, groupIndex: number, valueIndex: number) => {
    const list = isEdit ? [...editItemOptions] : [...newItemOptions];
    const group = { ...list[groupIndex] };
    group.values = group.values.filter((_, idx) => idx !== valueIndex);
    list[groupIndex] = group;
    if (isEdit) setEditItemOptions(list);
    else setNewItemOptions(list);
  };

  const updateOptionValue = (
    isEdit: boolean,
    groupIndex: number,
    valueIndex: number,
    field: 'name' | 'priceDelta',
    value: any
  ) => {
    const list = isEdit ? [...editItemOptions] : [...newItemOptions];
    const group = { ...list[groupIndex] };
    const values = [...group.values];
    values[valueIndex] = {
      ...values[valueIndex],
      [field]: field === 'priceDelta' ? (parseInt(value, 10) || 0) : value,
    };
    group.values = values;
    list[groupIndex] = group;
    if (isEdit) setEditItemOptions(list);
    else setNewItemOptions(list);
  };

  // Render Option Groups Editor block inside modals
  const renderOptionGroupsEditor = (isEdit: boolean) => {
    const groups = isEdit ? editItemOptions : newItemOptions;

    return (
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 block">Tùy chọn & Topping (Size, Độ ngọt, Topping...)</span>
            <span className="text-[11px] text-slate-400">Khách có thể lựa chọn thêm khi quét mã QR gọi món</span>
          </div>
          <button
            type="button"
            onClick={() => addOptionGroup(isEdit)}
            className="text-xs font-bold text-[#176044] hover:text-[#09271d] flex items-center gap-1 cursor-pointer bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm nhóm tùy chọn
          </button>
        </div>

        {groups.length === 0 && (
          <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-400">
            Chưa có nhóm tùy chọn nào. Bấm nút bên trên nếu món có Size, Topping hoặc yêu cầu riêng.
          </div>
        )}

        {groups.map((group, gIdx) => (
          <div key={group.id || gIdx} className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Tên nhóm (VD: Kích cỡ, Topping, Lượng đá...)"
                value={group.name}
                onChange={(e) => updateOptionGroup(isEdit, gIdx, 'name', e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => removeOptionGroup(isEdit, gIdx)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                title="Xóa nhóm này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={group.required}
                  onChange={(e) => updateOptionGroup(isEdit, gIdx, 'required', e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Bắt buộc chọn (Required)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={group.multiple}
                  onChange={(e) => updateOptionGroup(isEdit, gIdx, 'multiple', e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Cho chọn nhiều (Multiple)</span>
              </label>
            </div>

            {/* List of Values */}
            <div className="space-y-1.5 pl-2.5 border-l-2 border-emerald-300">
              {group.values.map((val, vIdx) => (
                <div key={val.id || vIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Tên lựa chọn (VD: Size L, Trân châu trắng...)"
                    value={val.name}
                    onChange={(e) => updateOptionValue(isEdit, gIdx, vIdx, 'name', e.target.value)}
                    className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <div className="flex items-center gap-1 w-32 shrink-0">
                    <span className="text-xs text-slate-400">+</span>
                    <input
                      type="number"
                      placeholder="Giá (+VNĐ)"
                      value={val.priceDelta || 0}
                      onChange={(e) => updateOptionValue(isEdit, gIdx, vIdx, 'priceDelta', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs text-right bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOptionValue(isEdit, gIdx, vIdx)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Xóa lựa chọn"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addOptionValue(isEdit, gIdx)}
                className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 pt-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Thêm giá trị lựa chọn
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ================= CRUD MENU ITEMS =================

  // 1. Submit Add Item
  const handleAddNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice.trim()) return;

    setIsSubmitting(true);
    const categoryId = newItemCategory || (categories[0]?.id || '');

    // Sanitize option groups
    const cleanOptions = newItemOptions
      .filter((g) => g.name.trim())
      .map((g) => ({
        ...g,
        name: g.name.trim(),
        values: g.values.filter((v) => v.name.trim()),
      }));

    const payload = {
      name: newItemName.trim(),
      categoryId,
      price: parseInt(newItemPrice, 10) || 50000,
      description: newItemDescription.trim(),
      imageUrl: newItemImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isAvailable: true,
      isPopular: newItemIsPopular,
      options: cleanOptions,
    };

    try {
      const res = await apiClient.menuItems.create(payload);
      const createdItem = res.data || {
        ...payload,
        id: `dish-${Date.now()}`,
        slug: `mon-${Date.now()}`,
      };

      const updated = [createdItem, ...menuItems];
      setMenuItems(updated);
      storageService.saveMenuItems(updated);
      setIsAddModalOpen(false);

      // Reset inputs
      setNewItemName('');
      setNewItemPrice('');
      setNewItemDescription('');
      setNewItemIsPopular(false);
      setNewItemOptions([]);
      showToast(`Đã thêm món "${createdItem.name}" vào thực đơn thành công!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể tạo món mới', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Open Edit Item Modal
  const handleOpenEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setEditItemName(item.name);
    setEditItemPrice(item.price.toString());
    const catId = item.categoryId || (item as any).category?._id || (item as any).category?.id || (typeof (item as any).category === 'string' ? (item as any).category : '');
    setEditItemCategory(catId);
    setEditItemImage(item.imageUrl);
    setEditItemDescription(item.description || '');
    setEditItemIsAvailable(item.isAvailable);
    setEditItemIsPopular(!!item.isPopular);
    setEditItemOptions(item.options ? JSON.parse(JSON.stringify(item.options)) : []);
    setIsEditModalOpen(true);
  };

  // 3. Submit Update Item
  const handleSaveEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editItemName.trim() || !editItemPrice.trim()) return;

    setIsSubmitting(true);
    const cleanOptions = editItemOptions
      .filter((g) => g.name.trim())
      .map((g) => ({
        ...g,
        name: g.name.trim(),
        values: g.values.filter((v) => v.name.trim()),
      }));

    const payload = {
      name: editItemName.trim(),
      categoryId: editItemCategory || editingItem.categoryId,
      price: parseInt(editItemPrice, 10) || editingItem.price,
      imageUrl: editItemImage.trim(),
      description: editItemDescription.trim(),
      isAvailable: editItemIsAvailable,
      isPopular: editItemIsPopular,
      options: cleanOptions,
    };

    try {
      const res = await apiClient.menuItems.update(editingItem.id, payload);
      const updatedItem = res.data || {
        ...editingItem,
        ...payload,
      };

      const updated = menuItems.map((item) =>
        item.id === editingItem.id ? updatedItem : item
      );

      setMenuItems(updated);
      storageService.saveMenuItems(updated);
      setIsEditModalOpen(false);
      showToast(`Đã cập nhật món "${editItemName.trim()}" thành công!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể cập nhật món ăn', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Delete Item
  const handleDeleteItem = async (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa món "${item.name}" khỏi thực đơn?`)) {
      return;
    }

    try {
      await apiClient.menuItems.delete(itemId);
      const updated = menuItems.filter((i) => i.id !== itemId);
      setMenuItems(updated);
      storageService.saveMenuItems(updated);
      showToast(`Đã xóa món "${item.name}" khỏi thực đơn!`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa món ăn', 'error');
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
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSubmitting(true);
    const payload = {
      name: categoryName.trim(),
      slug: categorySlug.trim() || undefined,
      icon: categoryIcon,
      order: categoryOrder,
    };

    try {
      if (editingCategory) {
        const res = await apiClient.categories.update(editingCategory.id, payload);
        const updatedCat = res.data || { ...editingCategory, ...payload };
        const updated = categories.map((c) => (c.id === editingCategory.id ? updatedCat : c));
        setCategories(updated);
        storageService.saveCategories(updated);
        showToast(`Đã cập nhật danh mục "${categoryName.trim()}"!`, 'success');
      } else {
        const res = await apiClient.categories.create(payload);
        const newCat = res.data || {
          id: `cat-${Date.now()}`,
          ...payload,
          itemsCount: 0,
        };
        const updated = [...categories, newCat];
        setCategories(updated);
        storageService.saveCategories(updated);
        showToast(`Đã tạo mới danh mục "${categoryName.trim()}"!`, 'success');
      }
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu danh mục', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (catId: string) => {
    const itemsInCat = menuItems.filter((i) => {
      const itemCatId = i.categoryId || (i as any).category?._id || (i as any).category?.id || (typeof (i as any).category === 'string' ? (i as any).category : '');
      return itemCatId === catId;
    });

    if (itemsInCat.length > 0) {
      toast.error(
        `Không thể xóa danh mục này vì đang có ${itemsInCat.length} món ăn. Vui lòng chuyển các món sang danh mục khác trước.`
      );
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }

    try {
      await apiClient.categories.delete(catId);
      const updated = categories.filter((c) => c.id !== catId);
      setCategories(updated);
      storageService.saveCategories(updated);
      if (selectedCatId === catId) {
        setSelectedCatId('all');
      }
      setIsCategoryModalOpen(false);
      showToast('Đã xóa danh mục!', 'info');
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa danh mục', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= TOP HEADER BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#09271d] flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 sm:w-7 sm:h-7 text-[#176044] shrink-0" />
            <span className="truncate">Quản Lý Thực Đơn & Danh Mục</span>
          </h1>
          <p className="text-xs text-[#66736d] mt-0.5 line-clamp-1 sm:line-clamp-none">
            Cập nhật món ăn, hình ảnh, giá bán, topping và cấu hình hiển thị trên mã QR của khách
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            icon={<RefreshCw className={`w-4 h-4 text-[#176044] ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => fetchMenuData()}
            className="cursor-pointer bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs w-full sm:w-auto text-xs py-2 px-2.5 justify-center"
            title="Tải lại dữ liệu từ máy chủ"
          >
            Làm mới
          </Button>

          {menuItems.length === 0 && (
            <Button
              variant="outline"
              icon={isSeeding ? <Loader2 className="w-4 h-4 animate-spin text-[#176044]" /> : <Sparkles className="w-4 h-4 text-amber-600" />}
              onClick={handleSeedDefaultMenu}
              disabled={isSeeding}
              className="cursor-pointer bg-amber-50/80 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-2xs w-full sm:w-auto text-xs py-2 px-2.5 justify-center font-bold col-span-2 sm:col-span-1"
              title="Khởi tạo nhanh thực đơn mẫu gồm 4 danh mục và 8 món ăn"
            >
              {isSeeding ? 'Đang nạp...' : '✨ Khởi tạo thực đơn mẫu'}
            </Button>
          )}

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
            onClick={() => {
              setNewItemOptions([]);
              setIsAddModalOpen(true);
            }}
            id="btn-add-new-item"
            className="cursor-pointer shadow-md bg-[#124a36] hover:bg-[#09271d] w-full sm:w-auto text-xs py-2 px-2.5 justify-center col-span-2 sm:col-span-1"
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
          <div className="flex items-center gap-2 w-full sm:w-64 justify-between sm:justify-start shrink-0">
            <span className="text-xs font-bold text-slate-500 shrink-0">Trạng thái:</span>
            <div className="flex-1 min-w-0">
              <CustomSelect
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as any)}
                options={[
                  { value: 'all', label: `Tất cả món (${menuItems.length})` },
                  { value: 'available', label: `Đang phục vụ (${availableItemsCount})` },
                  { value: 'unavailable', label: `Tạm hết món (${unavailableItemsCount})` },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Category Tabs & Quick Manage */}
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
              const count = menuItems.filter((i) => {
                const itemCatId = i.categoryId || (i as any).category?._id || (i as any).category?.id || (typeof (i as any).category === 'string' ? (i as any).category : '');
                return itemCatId === c.id;
              }).length;
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
                      {c.itemsCount !== undefined ? c.itemsCount : count}
                    </span>
                  </button>

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

      {/* ================= LOADING & EMPTY STATE ================= */}
      {isLoading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 mx-auto text-[#176044] animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Đang tải danh sách món ăn từ máy chủ...</p>
        </div>
      ) : menuItems.length === 0 ? (
        /* ================= EMPTY RESTAURANT ONBOARDING HERO CARD ================= */
        <div className="bg-linear-to-b from-white to-slate-50/60 p-8 sm:p-12 text-center rounded-3xl border border-dashed border-[#176044]/30 shadow-xs space-y-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-100/80 text-[#176044] flex items-center justify-center shadow-xs">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-[#176044]" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-800">
              Thực đơn nhà hàng của bạn đang trống
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Bạn có thể tự tạo danh mục và món ăn mới, hoặc nạp ngay bộ thực đơn mẫu chuẩn vị Việt (4 danh mục, 8 món kèm Topping) để bắt đầu kinh doanh ngay.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={handleSeedDefaultMenu}
              disabled={isSeeding}
              icon={isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              className="cursor-pointer bg-[#124a36] hover:bg-[#09271d] text-white font-bold px-4 py-2.5 shadow-sm text-xs sm:text-sm"
            >
              {isSeeding ? 'Đang nạp thực đơn mẫu...' : '✨ Khởi tạo thực đơn mẫu'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setNewItemOptions([]);
                setIsAddModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
              className="cursor-pointer font-bold px-4 py-2.5 text-xs sm:text-sm"
            >
              Thêm món mới
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenCategoryModal()}
              icon={<FolderPlus className="w-4 h-4" />}
              className="cursor-pointer font-bold px-4 py-2.5 text-xs sm:text-sm"
            >
              Thêm danh mục
            </Button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        /* ================= FILTER / SEARCH EMPTY STATE ================= */
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-4">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-slate-300" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-700">Không tìm thấy món ăn phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery.trim()
                ? `Không có món nào khớp với từ khóa "${searchQuery}".`
                : 'Không có món nào thuộc danh mục hoặc bộ lọc trạng thái đã chọn.'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCatId('all');
              setStatusFilter('all');
            }}
            icon={<RefreshCw className="w-4 h-4" />}
            className="cursor-pointer mx-auto text-xs font-bold"
          >
            Xóa bộ lọc tìm kiếm
          </Button>
        </div>
      ) : (
        /* ================= MENU ITEMS RESPONSIVE GRID ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full min-w-0">
          {filteredItems.map((item) => {
            const itemCatId = item.categoryId || (item as any).category?._id || (item as any).category?.id || (typeof (item as any).category === 'string' ? (item as any).category : '');
            const categoryObj = categories.find((c) => c.id === itemCatId);

            return (
              <Card
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow relative group min-w-0 w-full ${
                  !item.isAvailable ? 'bg-slate-50/80 border-slate-200' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  {/* Top Strip: Category & Popular & Options badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-2.5 flex-wrap">
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[130px]">
                      {categoryObj ? `${categoryObj.icon || ''} ${categoryObj.name}` : 'Món ăn'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.options && item.options.length > 0 && (
                        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {item.options.length} tùy chọn
                        </span>
                      )}

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
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <strong className="text-sm font-extrabold text-slate-900 block truncate" title={item.name}>
                        {item.name}
                      </strong>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#176044] block">
                          {formatCurrencyVND(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrencyVND(item.originalPrice)}
                          </span>
                        )}
                      </div>

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
      )}

      {/* ================= MODAL 1: THÊM MÓN MỚI ================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Thêm Món Mới Vào Thực Đơn"
        subtitle="Món mới sẽ lập tức hiển thị trên thực đơn mã QR khi khách quét mã"
        maxWidth="lg"
      >
        <form onSubmit={handleAddNewItem} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
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
              <CustomSelect
                value={newItemCategory || (categories[0]?.id || '')}
                onChange={(val) => setNewItemCategory(val)}
                options={categories.map((c) => ({
                  value: c.id,
                  label: `${c.icon || '🍲'} ${c.name}`,
                }))}
                placeholder="Chọn danh mục..."
              />
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

          {/* Option Groups (Topping, Size...) Editor */}
          {renderOptionGroupsEditor(false)}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="bg-[#124a36]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Đang lưu...
                </>
              ) : (
                'Lưu & Xuất bản thực đơn'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 2: CHỈNH SỬA MÓN ĂN ================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingItem ? `Chỉnh Sửa: ${editingItem.name}` : 'Chỉnh Sửa Món Ăn'}
        subtitle="Cập nhật giá bán, hình ảnh, topping và thông tin chi tiết của món ăn"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEditItem} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
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
              <CustomSelect
                value={editItemCategory}
                onChange={(val) => setEditItemCategory(val)}
                options={categories.map((c) => ({
                  value: c.id,
                  label: `${c.icon || '🍲'} ${c.name}`,
                }))}
                placeholder="Chọn danh mục..."
              />
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
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                  }}
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

          {/* Option Groups (Topping, Size...) Editor */}
          {renderOptionGroupsEditor(true)}

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} className="bg-[#124a36]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Đang lưu...
                </>
              ) : (
                'Lưu thay đổi'
              )}
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
                disabled={isSubmitting}
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
              <Button variant="primary" type="submit" disabled={isSubmitting} className="bg-[#124a36]">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Đang lưu...
                  </>
                ) : editingCategory ? (
                  'Lưu thay đổi'
                ) : (
                  'Tạo danh mục mới'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
