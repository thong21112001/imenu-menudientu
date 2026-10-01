'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  storageService,
  formatCurrencyVND,
  soundEngine,
  realtimeHub,
  apiClient,
  matchVietnameseSearch,
} from '@imenu/utils';
import {
  Table,
  MenuItem,
  MenuCategory,
  Order,
  OrderItem,
  SelectedOption,
  MenuItemOptionGroup,
  MenuItemOptionValue,
} from '@imenu/types';
import { Card, Button, CustomSelect, Modal, useToast } from '@imenu/ui';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Sparkles,
  AlertCircle,
  Tag,
  Check,
  X,
  Layers,
  ShoppingBag,
  Store,
  RefreshCw,
} from 'lucide-react';

interface PosCartItem {
  id: string; // unique cart entry key
  item: MenuItem;
  quantity: number;
  unitPrice: number;
  selectedOptions?: SelectedOption[];
  note?: string;
  itemTotal: number;
}

export default function PosTerminalPage() {
  const { toast } = useToast();

  // User & Branch context
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [activeBranchName, setActiveBranchName] = useState<string>('');

  // Data states
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cart state
  const [posCart, setPosCart] = useState<PosCartItem[]>([]);

  // Options customization modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedOptionValues, setSelectedOptionValues] = useState<Record<string, string[]>>({});
  const [itemCustomNote, setItemCustomNote] = useState<string>('');
  const [itemCustomQty, setItemCustomQty] = useState<number>(1);

  // Last submitted order confirmation modal
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState<Order | null>(null);

  // Initialize data and branch listeners
  useEffect(() => {
    const user = storageService.getCurrentUser();
    setCurrentUser(user);

    let branchId = storageService.getActiveBranchId();
    if (!user?.isSuperAdmin && !user?.isMainBranch && user?.branchId) {
      branchId = user.branchId;
    }
    setActiveBranchId(branchId);

    const tbls = storageService.getTables();
    setTables(tbls);
    if (tbls.length > 0) setSelectedTableId(tbls[0].id);

    fetchBranchAndMenuData(branchId);

    const handleBranchChange = (e: any) => {
      const newBranchId = e.detail?.branchId ?? null;
      setActiveBranchId(newBranchId);
      fetchBranchAndMenuData(newBranchId);
    };

    window.addEventListener('imenu:branch_changed', handleBranchChange);
    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
    };
  }, []);

  const fetchBranchAndMenuData = async (branchId: string | null) => {
    setIsLoading(true);
    try {
      // Fetch branch name if branchId exists
      if (branchId) {
        apiClient.branches
          .get(branchId)
          .then((res) => {
            if (res.data?.name) {
              setActiveBranchName(res.data.name);
            }
          })
          .catch(() => {
            setActiveBranchName('');
          });
      } else {
        setActiveBranchName('Toàn hệ thống (Chi nhánh chính)');
      }

      // Fetch categories, items & tables with branch context
      const [catsRes, itemsRes, tablesRes] = await Promise.all([
        apiClient.categories.list({ branchId: branchId || undefined }).catch(() => null),
        apiClient.menuItems
          .list({ branchId: branchId || undefined, limit: 300 })
          .catch(() => null),
        apiClient.tables
          .list({ branchId: branchId || undefined })
          .catch(() => null),
      ]);

      if (catsRes && Array.isArray(catsRes.data)) {
        setCategories(catsRes.data);
      } else {
        setCategories(storageService.getCategories());
      }

      if (itemsRes && itemsRes.data) {
        const list = Array.isArray(itemsRes.data)
          ? itemsRes.data
          : (itemsRes.data as any).items || [];
        setMenuItems(list);
      } else {
        setMenuItems(storageService.getMenuItems());
      }

      if (tablesRes && Array.isArray(tablesRes.data) && tablesRes.data.length > 0) {
        const tblList: Table[] = tablesRes.data.map((t: any) => ({
          ...t,
          id: t._id || t.id,
          zoneId: t.zone?._id || t.zone || t.zoneId || 'default-zone',
          zoneName: t.zone?.name || t.zoneName || 'Khu vực chung',
        }));
        setTables(tblList);
        setSelectedTableId((curr) => curr || tblList[0].id);
      } else {
        const fallbackTbls = storageService.getTables();
        setTables(fallbackTbls);
        if (fallbackTbls.length > 0) setSelectedTableId((curr) => curr || fallbackTbls[0].id);
      }
    } catch (err) {
      console.warn('POS data fallback to local storage:', err);
      setCategories(storageService.getCategories());
      setMenuItems(storageService.getMenuItems());
      const fallbackTbls = storageService.getTables();
      setTables(fallbackTbls);
      if (fallbackTbls.length > 0) setSelectedTableId((curr) => curr || fallbackTbls[0].id);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to determine effective values
  const getItemEffectivePrice = (item: MenuItem): number => {
    return item.effectivePrice ?? item.price;
  };

  const getItemEffectiveOriginalPrice = (item: MenuItem): number | undefined => {
    return item.effectiveOriginalPrice ?? item.originalPrice;
  };

  const getItemEffectiveIsAvailable = (item: MenuItem): boolean => {
    return item.effectiveIsAvailable !== undefined ? item.effectiveIsAvailable : item.isAvailable;
  };

  // Category items count lookup
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    menuItems.forEach((item) => {
      counts[item.categoryId] = (counts[item.categoryId] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  // Filter items by category and smart Vietnamese / English regex search
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
        return false;
      }
      // Vietnamese & English search filter
      if (search.trim()) {
        const textToMatch = `${item.name} ${item.description || ''}`;
        return matchVietnameseSearch(textToMatch, search);
      }
      return true;
    });
  }, [menuItems, selectedCategoryId, search]);

  // Click on a dish card
  const handleItemCardClick = (item: MenuItem) => {
    const isAvail = getItemEffectiveIsAvailable(item);
    if (!isAvail) {
      toast.error(`Món "${item.name}" hiện đang tạm hết tại chi nhánh này!`);
      return;
    }

    if (item.options && item.options.length > 0) {
      // Open customization modal
      openCustomizationModal(item);
    } else {
      // Direct add
      addDirectToCart(item);
    }
  };

  // Direct add item (no options)
  const addDirectToCart = (item: MenuItem) => {
    const price = getItemEffectivePrice(item);
    const cartItemId = `cart-direct-${item.id}`;

    const existingIdx = posCart.findIndex((c) => c.id === cartItemId);
    if (existingIdx > -1) {
      const updated = [...posCart];
      updated[existingIdx].quantity += 1;
      updated[existingIdx].itemTotal = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setPosCart(updated);
    } else {
      setPosCart([
        ...posCart,
        {
          id: cartItemId,
          item,
          quantity: 1,
          unitPrice: price,
          itemTotal: price,
        },
      ]);
    }
    toast.success(`+1 ${item.name}`);
  };

  // Open Options Customization Modal
  const openCustomizationModal = (item: MenuItem) => {
    setCustomizingItem(item);
    setItemCustomNote('');
    setItemCustomQty(1);

    // Initialize required single-choice options with their first value
    const initialChoices: Record<string, string[]> = {};
    if (item.options) {
      item.options.forEach((group) => {
        if (!group.multiple && group.values.length > 0) {
          initialChoices[group.id] = [group.values[0].id];
        } else {
          initialChoices[group.id] = [];
        }
      });
    }
    setSelectedOptionValues(initialChoices);
  };

  const handleToggleOptionValue = (
    group: MenuItemOptionGroup,
    val: MenuItemOptionValue
  ) => {
    setSelectedOptionValues((prev) => {
      const current = prev[group.id] || [];
      if (group.multiple) {
        if (current.includes(val.id)) {
          return { ...prev, [group.id]: current.filter((id) => id !== val.id) };
        } else {
          return { ...prev, [group.id]: [...current, val.id] };
        }
      } else {
        // Single choice
        return { ...prev, [group.id]: [val.id] };
      }
    });
  };

  // Calculate customized unit price
  const calculateCustomizedPrice = (): { unitPrice: number; selectedList: SelectedOption[] } => {
    if (!customizingItem) return { unitPrice: 0, selectedList: [] };
    const basePrice = getItemEffectivePrice(customizingItem);
    let deltaSum = 0;
    const selectedList: SelectedOption[] = [];

    if (customizingItem.options) {
      customizingItem.options.forEach((grp) => {
        const chosenIds = selectedOptionValues[grp.id] || [];
        grp.values.forEach((v) => {
          if (chosenIds.includes(v.id)) {
            deltaSum += v.priceDelta;
            selectedList.push({
              groupId: grp.id,
              groupName: grp.name,
              valueId: v.id,
              valueName: v.name,
              priceDelta: v.priceDelta,
            });
          }
        });
      });
    }

    return {
      unitPrice: basePrice + deltaSum,
      selectedList,
    };
  };

  // Confirm and add customized dish to cart
  const handleConfirmCustomizedItem = () => {
    if (!customizingItem) return;

    // Check required options
    if (customizingItem.options) {
      for (const grp of customizingItem.options) {
        if (grp.required) {
          const chosen = selectedOptionValues[grp.id] || [];
          if (chosen.length === 0) {
            toast.error(`Vui lòng chọn ${grp.name}!`);
            return;
          }
        }
      }
    }

    const { unitPrice, selectedList } = calculateCustomizedPrice();
    const optionFingerprint = selectedList
      .map((s) => s.valueId)
      .sort()
      .join('-');
    const cartItemId = `cart-opt-${customizingItem.id}-${optionFingerprint}-${itemCustomNote.trim()}`;

    const existingIdx = posCart.findIndex((c) => c.id === cartItemId);
    if (existingIdx > -1) {
      const updated = [...posCart];
      updated[existingIdx].quantity += itemCustomQty;
      updated[existingIdx].itemTotal = updated[existingIdx].quantity * updated[existingIdx].unitPrice;
      setPosCart(updated);
    } else {
      setPosCart([
        ...posCart,
        {
          id: cartItemId,
          item: customizingItem,
          quantity: itemCustomQty,
          unitPrice,
          selectedOptions: selectedList,
          note: itemCustomNote.trim() || undefined,
          itemTotal: unitPrice * itemCustomQty,
        },
      ]);
    }

    toast.success(`Đã thêm ${itemCustomQty}x ${customizingItem.name}`);
    setCustomizingItem(null);
  };

  // Modify Cart Item quantity
  const handleUpdateCartQty = (idx: number, delta: number) => {
    const updated = [...posCart];
    const newQty = updated[idx].quantity + delta;
    if (newQty <= 0) {
      setPosCart(posCart.filter((_, i) => i !== idx));
    } else {
      updated[idx].quantity = newQty;
      updated[idx].itemTotal = newQty * updated[idx].unitPrice;
      setPosCart(updated);
    }
  };

  const handleRemoveCartItem = (idx: number) => {
    setPosCart(posCart.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    if (posCart.length === 0) return;
    setPosCart([]);
    toast.info('Đã xóa giỏ hàng');
  };

  // Cart totals
  const totalCartAmount = useMemo(() => {
    return posCart.reduce((sum, item) => sum + item.itemTotal, 0);
  }, [posCart]);

  const totalCartQuantity = useMemo(() => {
    return posCart.reduce((sum, item) => sum + item.quantity, 0);
  }, [posCart]);

  // Send Order to Kitchen
  const handleSendOrder = async () => {
    if (posCart.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 món vào đơn hàng!');
      return;
    }
    if (!selectedTableId) {
      toast.error('Vui lòng chọn bàn nhận đơn!');
      return;
    }

    soundEngine.playNewOrderChime();
    const table = tables.find((t) => t.id === selectedTableId || t._id === selectedTableId);
    if (!table) return;

    const restId = currentUser?.restaurantId || 'rest-bep-nha';

    const orderPayload = {
      tableId: table._id || table.id,
      branchId: activeBranchId || undefined,
      orderSource: 'STAFF_POS',
      items: posCart.map((c) => ({
        menuItemId: c.item._id || c.item.id,
        quantity: c.quantity,
        selectedOptions: c.selectedOptions,
        note: c.note,
      })),
    };

    let createdOrder: Order | null = null;
    try {
      const res = await apiClient.orders.create(orderPayload);
      if (res.data) {
        createdOrder = {
          ...res.data,
          id: res.data._id || res.data.id,
          createdAt: res.data.createdAt || new Date().toISOString(),
          updatedAt: res.data.updatedAt || new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.warn('API create order failed, saving locally:', err);
    }

    if (!createdOrder) {
      const newOrderItems: OrderItem[] = posCart.map((c, i) => ({
        id: `pos-${Date.now()}-${i}`,
        menuItemId: c.item.id,
        name: c.item.name,
        price: c.unitPrice,
        quantity: c.quantity,
        selectedOptions: c.selectedOptions,
        note: c.note,
        status: 'Cooking',
        itemTotal: c.itemTotal,
      }));

      createdOrder = {
        id: `ord-${Date.now()}`,
        orderCode: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
        tableId: table.id,
        tableName: table.name,
        restaurantId: restId,
        items: newOrderItems,
        subTotal: totalCartAmount,
        totalAmount: totalCartAmount,
        status: 'Preparing',
        isPaid: false,
        orderSource: 'STAFF_POS',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save order into storage
      const allOrders = storageService.getOrders();
      allOrders.unshift(createdOrder);
      storageService.saveOrders(allOrders);
    }

    // Update table status to Occupied
    const allTables = storageService.getTables();
    const tIdx = allTables.findIndex((t) => t.id === table.id);
    if (tIdx > -1) {
      allTables[tIdx].status = 'Occupied';
      storageService.saveTables(allTables);
    }
    setTables((prev) =>
      prev.map((t) => (t.id === table.id ? { ...t, status: 'Occupied' } : t))
    );

    // Publish realtime event to Kitchen & Dashboard
    realtimeHub.publish('NEW_ORDER', createdOrder, restId, activeBranchId || undefined);

    setLastSubmittedOrder(createdOrder);
    setPosCart([]);
    toast.success(`Đã gửi đơn POS #${createdOrder.orderCode} cho ${table.name}!`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Branch Status & Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#176044] to-[#1f7e59] flex items-center justify-center text-white shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">POS Bán Hàng Tại Bàn</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#176044] border border-emerald-200">
                Live Multi-Branch
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>Đang phục vụ tại:</span>
              <strong className="text-slate-800 font-semibold">
                {activeBranchName || (activeBranchId ? `Chi nhánh ${activeBranchId}` : 'Toàn hệ thống')}
              </strong>
            </p>
          </div>
        </div>

        {/* Search input with live regex */}
        <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nhanh: pho bo, tra dao, bbq..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#176044]/30 focus:border-[#176044] transition-all bg-slate-50/50 hover:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchBranchAndMenuData(activeBranchId)}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl"
            title="Tải lại thực đơn"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Grid: Menu selection (Left) vs Order Cart (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Category Quick Tabs & Dish Grid */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Category Quick Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                selectedCategoryId === 'all'
                  ? 'bg-[#176044] text-white shadow-[#176044]/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span>🍽️ Tất cả</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedCategoryId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {menuItems.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                    isSelected
                      ? 'bg-[#176044] text-white shadow-[#176044]/20 font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <span>{cat.icon || '🍲'}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dish Grid */}
          {isLoading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <RefreshCw className="w-8 h-8 text-[#176044] animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-medium">Đang đồng bộ thực đơn chi nhánh...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Không tìm thấy món ăn nào!</p>
              <p className="text-xs text-slate-500 mt-1">
                {search ? `Không khớp từ khóa "${search}". Thử từ khóa khác hoặc xóa lọc.` : 'Danh mục này hiện chưa có món.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredItems.map((item) => {
                const effectivePrice = getItemEffectivePrice(item);
                const effectiveOriginalPrice = getItemEffectiveOriginalPrice(item);
                const isAvailable = getItemEffectiveIsAvailable(item);
                const hasDeal = effectiveOriginalPrice && effectiveOriginalPrice > effectivePrice;
                const discountPct = hasDeal
                  ? Math.round(((effectiveOriginalPrice! - effectivePrice) / effectiveOriginalPrice!) * 100)
                  : 0;
                const hasOptions = item.options && item.options.length > 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemCardClick(item)}
                    className={`group relative rounded-2xl border p-3 flex flex-col justify-between transition-all duration-150 select-none ${
                      isAvailable
                        ? 'bg-white border-slate-200/90 hover:border-[#176044] hover:shadow-md cursor-pointer hover:-translate-y-0.5'
                        : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Dish Image */}
                    <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isAvailable ? 'group-hover:scale-105' : 'grayscale'
                          }`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-black">
                          🍽️
                        </div>
                      )}

                      {/* Availability Tag */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-2 text-center">
                          <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-lg">
                            Tạm hết món
                          </span>
                        </div>
                      )}

                      {/* Deal Badge */}
                      {isAvailable && hasDeal && (
                        <div className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          <span>Deal -{discountPct}%</span>
                        </div>
                      )}

                      {/* Popular Badge */}
                      {isAvailable && item.isPopular && !hasDeal && (
                        <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Bán chạy</span>
                        </div>
                      )}
                    </div>

                    {/* Dish Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-[#176044]">
                          {item.name}
                        </h3>

                        {/* Price Display */}
                        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-xs font-black text-[#176044]">
                            {formatCurrencyVND(effectivePrice)}
                          </span>
                          {hasDeal && (
                            <span className="text-[10px] text-slate-400 line-through">
                              {formatCurrencyVND(effectiveOriginalPrice!)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add Button */}
                      <div className="mt-3">
                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemCardClick(item);
                          }}
                          className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                            !isAvailable
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : hasOptions
                              ? 'bg-emerald-50 text-[#176044] border border-emerald-300 hover:bg-[#176044] hover:text-white'
                              : 'bg-slate-100 text-slate-800 hover:bg-[#176044] hover:text-white'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{hasOptions ? 'Tùy chọn' : 'Thêm'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: POS Order Cart & Checkout Panel */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="p-4 space-y-4 sticky top-4 bg-white shadow-sm border border-slate-200/90 rounded-2xl">
            {/* Header: Table selector & clear cart */}
            <div className="pb-3 border-b border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-[#176044]" />
                  <h2 className="text-sm font-black text-slate-900">Chi tiết Order</h2>
                  {posCart.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#176044]/10 text-[#176044]">
                      {totalCartQuantity}
                    </span>
                  )}
                </div>
                {posCart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Table Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Chọn Bàn phục vụ:
                </label>
                <CustomSelect
                  value={selectedTableId}
                  onChange={(val) => setSelectedTableId(val)}
                  options={tables.map((t) => ({
                    value: t.id,
                    label: `${t.name} • ${t.zoneName} (${t.status === 'Available' ? 'Trống' : 'Có khách'})`,
                  }))}
                  placeholder="Chọn bàn..."
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {posCart.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2 text-xl">
                    🛒
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Chưa có món nào trong phiếu order</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Nhấp vào món ăn bên trái để thêm nhanh</p>
                </div>
              ) : (
                posCart.map((c, idx) => (
                  <div
                    key={c.id}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/80 transition-colors flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-1.5">
                        <strong className="text-slate-900 font-bold block truncate">{c.item.name}</strong>
                      </div>

                      {/* Display Custom Options */}
                      {c.selectedOptions && c.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.selectedOptions.map((opt, oi) => (
                            <span
                              key={oi}
                              className="text-[10px] bg-white text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded-md font-medium"
                            >
                              {opt.valueName}
                              {opt.priceDelta > 0 && ` (+${formatCurrencyVND(opt.priceDelta)})`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Display Note */}
                      {c.note && (
                        <p className="text-[10px] text-amber-700 font-medium italic mt-0.5">
                          Ghi chú: {c.note}
                        </p>
                      )}

                      {/* Subtotal */}
                      <div className="mt-1 text-xs font-black text-[#176044]">
                        {formatCurrencyVND(c.itemTotal)}
                        {c.quantity > 1 && (
                          <span className="text-[10px] font-normal text-slate-400 ml-1.5">
                            ({formatCurrencyVND(c.unitPrice)} / phần)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      <button
                        onClick={() => handleUpdateCartQty(idx, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-700 active:scale-95 transition-all shadow-2xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-black text-xs text-slate-800">
                        {c.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateCartQty(idx, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 hover:border-slate-400 flex items-center justify-center text-slate-700 active:scale-95 transition-all shadow-2xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveCartItem(idx)}
                        className="w-6 h-6 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center ml-1"
                        title="Xóa món"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Order Trigger */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Số lượng món:</span>
                <span className="font-bold text-slate-800">{totalCartQuantity} món</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span>Tổng tiền thanh toán:</span>
                <span className="text-lg text-[#176044]">
                  {formatCurrencyVND(totalCartAmount)}
                </span>
              </div>

              <Button
                variant="primary"
                onClick={handleSendOrder}
                disabled={posCart.length === 0}
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-[#176044]/20 active:scale-[0.99] transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Gửi đơn xuống Bếp ngay</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal 1: Option Groups / Toppings Customization Modal */}
      {customizingItem && (
        <Modal
          isOpen={Boolean(customizingItem)}
          onClose={() => setCustomizingItem(null)}
          title={`Tùy chỉnh: ${customizingItem.name}`}
          subtitle="Chọn kích cỡ, topping hoặc ghi chú cho món"
          maxWidth="md"
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {customizingItem.imageUrl && (
                <img
                  src={customizingItem.imageUrl}
                  alt={customizingItem.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              )}
              <div>
                <strong className="text-sm text-slate-900 block font-bold">
                  {customizingItem.name}
                </strong>
                <p className="text-xs text-[#176044] font-black mt-0.5">
                  Giá gốc: {formatCurrencyVND(getItemEffectivePrice(customizingItem))}
                </p>
              </div>
            </div>

            {/* Option Groups list */}
            {customizingItem.options?.map((group) => (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    {group.name}
                    {group.required && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {group.multiple ? 'Chọn nhiều' : 'Chọn 1'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {group.values.map((val) => {
                    const isSelected = (selectedOptionValues[group.id] || []).includes(val.id);
                    return (
                      <button
                        type="button"
                        key={val.id}
                        onClick={() => handleToggleOptionValue(group, val)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 border-[#176044] text-[#176044] font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{val.name}</span>
                        <span className="text-[10px] font-semibold text-slate-500 shrink-0 ml-1">
                          {val.priceDelta > 0 ? `+${formatCurrencyVND(val.priceDelta)}` : '0đ'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Note Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Ghi chú cho bếp:</label>
              <input
                type="text"
                value={itemCustomNote}
                onChange={(e) => setItemCustomNote(e.target.value)}
                placeholder="VD: Không đá, ít ngọt, không hành lá..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#176044]/30 focus:border-[#176044]"
              />
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-700">Số lượng:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setItemCustomQty(Math.max(1, itemCustomQty - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-xs">{itemCustomQty}</span>
                <button
                  type="button"
                  onClick={() => setItemCustomQty(itemCustomQty + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block">Thành tiền:</span>
                <span className="text-sm font-black text-[#176044]">
                  {formatCurrencyVND(calculateCustomizedPrice().unitPrice * itemCustomQty)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCustomizingItem(null)}
                  className="text-xs px-3"
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConfirmCustomizedItem}
                  className="text-xs px-4"
                >
                  Thêm vào đơn hàng
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 2: Order Placed Success Confirmation */}
      {lastSubmittedOrder && (
        <Modal
          isOpen={Boolean(lastSubmittedOrder)}
          onClose={() => setLastSubmittedOrder(null)}
          title="Đã gửi đơn hàng thành công!"
          subtitle={`Mã đơn: #${lastSubmittedOrder.orderCode}`}
          maxWidth="sm"
        >
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#176044] flex items-center justify-center mx-auto text-2xl">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Đơn đã gửi cho {lastSubmittedOrder.tableName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bếp và thu ngân đã nhận được thông báo thời gian thực qua hệ thống.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn:</span>
                <strong className="text-slate-800 font-bold">{lastSubmittedOrder.orderCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng số món:</span>
                <strong className="text-slate-800 font-bold">
                  {lastSubmittedOrder.items.reduce((s, i) => s + i.quantity, 0)} phần
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng tiền:</span>
                <strong className="text-[#176044] font-black">
                  {formatCurrencyVND(lastSubmittedOrder.totalAmount)}
                </strong>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setLastSubmittedOrder(null)}
              className="w-full py-2.5 rounded-xl font-bold text-xs"
            >
              Tiếp tục tạo đơn mới
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
