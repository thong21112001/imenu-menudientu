'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  storageService,
  formatCurrencyVND,
  generateVietQRUrl,
  realtimeHub,
  soundEngine,
} from '@imenu/utils';
import {
  Restaurant,
  Table,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  SelectedOption,
} from '@imenu/types';
import {
  Logo,
  Button,
  Modal,
  Drawer,
  StatusChip,
  Toast,
  Badge,
} from '@imenu/ui';
import {
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Bell,
  Clock,
  Receipt,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  X,
  ChevronRight,
  Send,
  CreditCard,
  QrCode,
  Flame,
} from 'lucide-react';

export default function CustomerTableMenuPage() {
  const params = useParams();
  const restaurantSlug = (params?.restaurantSlug as string) || 'bep-nha';
  const tableCode = (params?.tableCode as string) || 'ban-08';

  const [restaurant, setRestaurant] = useState<Restaurant>(storageService.getRestaurant());
  const [table, setTable] = useState<Table | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart state
  interface CartItem {
    id: string; // generated unique key for variant
    menuItemId: string;
    item: MenuItem;
    quantity: number;
    selectedOptions: SelectedOption[];
    note: string;
    itemTotal: number;
  }
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Modals state
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalSelectedOptions, setModalSelectedOptions] = useState<SelectedOption[]>([]);
  const [modalNote, setModalNote] = useState<string>('');

  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [isPreBillOpen, setIsPreBillOpen] = useState<boolean>(false);
  const [isCallStaffOpen, setIsCallStaffOpen] = useState<boolean>(false);
  const [isVietQROpen, setIsVietQROpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active orders for this table
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Load initial data
  useEffect(() => {
    const restData = storageService.getRestaurant();
    setRestaurant(restData);

    const tbls = storageService.getTables();
    const foundTbl = tbls.find((t) => t.code === tableCode) || tbls[0];
    setTable(foundTbl);

    setCategories(storageService.getCategories());
    setMenuItems(storageService.getMenuItems());

    // Load active order for this table
    const orders = storageService.getOrders();
    const curOrder = orders.find(
      (o) => o.tableId === foundTbl.id && o.status !== 'Paid' && o.status !== 'Cancelled'
    );
    if (curOrder) {
      setActiveOrder(curOrder);
    }
  }, [tableCode]);

  // Subscribe to Real-time updates
  useEffect(() => {
    const unsub = realtimeHub.subscribe('*', (payload) => {
      // Reload orders when there's an update
      const orders = storageService.getOrders();
      if (table) {
        const curOrder = orders.find(
          (o) => o.tableId === table.id && o.status !== 'Paid' && o.status !== 'Cancelled'
        );
        setActiveOrder(curOrder || null);
      }
      // Reload menu items if availability changed
      if (payload.type === 'MENU_AVAILABILITY_CHANGED') {
        setMenuItems(storageService.getMenuItems());
      }
    });

    return () => unsub();
  }, [table]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategoryId === 'all' || item.categoryId === activeCategoryId;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Open item customization modal
  const handleOpenItemModal = (item: MenuItem) => {
    setSelectedItemForDetail(item);
    setModalQuantity(1);
    setModalNote('');

    // Preselect default required options
    const defaults: SelectedOption[] = [];
    if (item.options) {
      item.options.forEach((grp) => {
        if (grp.required && grp.values.length > 0) {
          defaults.push({
            groupId: grp.id,
            groupName: grp.name,
            valueId: grp.values[0].id,
            valueName: grp.values[0].name,
            priceDelta: grp.values[0].priceDelta,
          });
        }
      });
    }
    setModalSelectedOptions(defaults);
  };

  // Add to cart from modal
  const handleAddToCart = () => {
    if (!selectedItemForDetail) return;

    const extraPrice = modalSelectedOptions.reduce((sum, opt) => sum + opt.priceDelta, 0);
    const unitPrice = selectedItemForDetail.price + extraPrice;
    const itemTotal = unitPrice * modalQuantity;

    const cartKey = `${selectedItemForDetail.id}_${modalSelectedOptions
      .map((o) => o.valueId)
      .sort()
      .join('_')}_${modalNote}`;

    const existingIdx = cart.findIndex((c) => c.id === cartKey);
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += modalQuantity;
      updated[existingIdx].itemTotal += itemTotal;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: cartKey,
          menuItemId: selectedItemForDetail.id,
          item: selectedItemForDetail,
          quantity: modalQuantity,
          selectedOptions: modalSelectedOptions,
          note: modalNote,
          itemTotal,
        },
      ]);
    }

    setSelectedItemForDetail(null);
    showToast(`Đã thêm ${modalQuantity}x ${selectedItemForDetail.name} vào giỏ!`);
  };

  // Quick add button (+) for items without required options
  const handleQuickAdd = (e: React.MouseEvent, item: MenuItem) => {
    e.stopPropagation();
    if (item.options && item.options.some((o) => o.required)) {
      handleOpenItemModal(item);
      return;
    }

    const cartKey = item.id;
    const existingIdx = cart.findIndex((c) => c.id === cartKey);
    if (existingIdx > -1) {
      const updated = [...cart];
      updated[existingIdx].quantity += 1;
      updated[existingIdx].itemTotal += item.price;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          id: cartKey,
          menuItemId: item.id,
          item: item,
          quantity: 1,
          selectedOptions: [],
          note: '',
          itemTotal: item.price,
        },
      ]);
    }
    showToast(`Đã thêm 1x ${item.name} vào giỏ!`);
  };

  // Cart total calculations
  const totalCartCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const totalCartAmount = cart.reduce((sum, c) => sum + c.itemTotal, 0);

  // Submit Order to Kitchen/POS
  const handleSubmitOrder = () => {
    if (cart.length === 0 || !table) return;

    soundEngine.playNewOrderChime();

    const newOrderItems: OrderItem[] = cart.map((c, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      menuItemId: c.menuItemId,
      name: c.item.name,
      price: c.item.price + c.selectedOptions.reduce((s, o) => s + o.priceDelta, 0),
      quantity: c.quantity,
      selectedOptions: c.selectedOptions,
      note: c.note,
      status: 'Cooking',
      itemTotal: c.itemTotal,
    }));

    const allOrders = storageService.getOrders();
    let updatedOrder: Order;

    if (activeOrder) {
      // Append to existing active order
      updatedOrder = {
        ...activeOrder,
        items: [...activeOrder.items, ...newOrderItems],
        subTotal: activeOrder.subTotal + totalCartAmount,
        totalAmount: activeOrder.totalAmount + totalCartAmount,
        updatedAt: new Date().toISOString(),
      };
      const idx = allOrders.findIndex((o) => o.id === activeOrder.id);
      if (idx > -1) allOrders[idx] = updatedOrder;
    } else {
      // Create fresh new order
      updatedOrder = {
        id: `ord-${Date.now()}`,
        orderCode: `IM-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(
          100 + Math.random() * 900
        )}`,
        tableId: table.id,
        tableName: table.name,
        restaurantId: restaurant.id,
        items: newOrderItems,
        subTotal: totalCartAmount,
        totalAmount: totalCartAmount,
        status: 'Preparing',
        isPaid: false,
        orderSource: 'QR_CUSTOMER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      allOrders.unshift(updatedOrder);

      // Update table status to Occupied
      const allTables = storageService.getTables();
      const tIdx = allTables.findIndex((t) => t.id === table.id);
      if (tIdx > -1) {
        allTables[tIdx].status = 'Occupied';
        allTables[tIdx].currentOrderId = updatedOrder.id;
        allTables[tIdx].activeSince = new Date().toISOString();
        storageService.saveTables(allTables);
        setTable(allTables[tIdx]);
      }
    }

    storageService.saveOrders(allOrders);
    setActiveOrder(updatedOrder);
    setCart([]);
    setIsCartOpen(false);

    // Broadcast real-time event to Admin POS & Kitchen KDS tabs
    realtimeHub.publish('NEW_ORDER', updatedOrder, restaurant.id);

    showToast('🎉 Đã gửi đơn thành công đến Bếp & Thu ngân!');
    setIsTrackerOpen(true);
  };

  // Call Staff action
  const handleSendCallStaff = (reason: string) => {
    if (!table) return;
    realtimeHub.publish(
      'CALL_STAFF',
      {
        tableId: table.id,
        tableName: table.name,
        reason,
        timestamp: Date.now(),
      },
      restaurant.id
    );
    setIsCallStaffOpen(false);
    showToast(`🔔 Đã gửi yêu cầu "${reason}" đến nhân viên!`);
  };

  // Request payment action
  const handleRequestPayment = (method: 'VietQR' | 'Cash') => {
    if (!activeOrder || !table) return;

    const allOrders = storageService.getOrders();
    const idx = allOrders.findIndex((o) => o.id === activeOrder.id);
    if (idx > -1) {
      allOrders[idx].status = 'PaymentRequested';
      allOrders[idx].paymentMethod = method;
      storageService.saveOrders(allOrders);
      setActiveOrder(allOrders[idx]);
    }

    const allTables = storageService.getTables();
    const tIdx = allTables.findIndex((t) => t.id === table.id);
    if (tIdx > -1) {
      allTables[tIdx].status = 'PaymentRequested';
      storageService.saveTables(allTables);
      setTable(allTables[tIdx]);
    }

    realtimeHub.publish('PAYMENT_REQUESTED', { orderId: activeOrder.id, method }, restaurant.id);
    setIsPreBillOpen(false);

    if (method === 'VietQR') {
      setIsVietQROpen(true);
    } else {
      showToast('💵 Đã báo thu ngân mang hóa đơn & tiền thừa tới bàn!');
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-[#f7f5ef] min-h-screen">
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-40 bg-[#09271d] text-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo light size="sm" />
            <div className="border-l border-white/20 pl-2.5">
              <strong className="text-xs font-bold block leading-tight">{restaurant.name}</strong>
              <small className="text-[10px] text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đang mở cửa
              </small>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-bold text-amber-300">
              {table?.name || 'Bàn'}
            </div>
            <button
              onClick={() => setIsCallStaffOpen(true)}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95"
              title="Gọi nhân viên"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Quick actions strip if active order exists */}
        {activeOrder && (
          <div className="bg-[#124a36] px-4 py-2 flex items-center justify-between text-xs border-t border-white/10">
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="flex items-center gap-1.5 text-amber-300 font-semibold"
            >
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Tiến độ món ({activeOrder.items.length} món)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsPreBillOpen(true)}
              className="px-2 py-0.5 rounded bg-[#eab867] text-[#17211d] font-bold text-[11px]"
            >
              Tạm tính: {formatCurrencyVND(activeOrder.totalAmount)}
            </button>
          </div>
        )}
      </header>

      {/* ================= SEARCH & CATEGORIES ================= */}
      <div className="sticky top-[53px] z-30 bg-[#f7f5ef] pt-3 pb-2 px-4 space-y-2.5 border-b border-[#e4e8e5]/80 backdrop-blur-md">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm món ngon, đồ uống..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#176044]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Horizontal Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategoryId === 'all'
                ? 'bg-[#124a36] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🔥 Tất cả món
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategoryId === cat.id
                  ? 'bg-[#124a36] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ================= MENU ITEMS LIST ================= */}
      <main className="p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <p className="text-sm">Không tìm thấy món ăn phù hợp</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setActiveCategoryId('all'); }}>
              Xem tất cả thực đơn
            </Button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => item.isAvailable && handleOpenItemModal(item)}
              className={`p-3 bg-white rounded-2xl border border-[#e4e8e5] shadow-sm flex gap-3.5 transition-all ${
                item.isAvailable
                  ? 'hover:border-[#cbdad3] active:scale-[0.99] cursor-pointer'
                  : 'opacity-60 grayscale cursor-not-allowed'
              }`}
            >
              {/* Dish Photo */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {item.isPopular && (
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                    <Flame className="w-2.5 h-2.5" /> Hot
                  </span>
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                    Hết món
                  </div>
                )}
              </div>

              {/* Dish Content */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 truncate">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-[#176044]">
                      {formatCurrencyVND(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatCurrencyVND(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {item.isAvailable && (
                    <button
                      onClick={(e) => handleQuickAdd(e, item)}
                      className="w-7 h-7 rounded-lg bg-[#124a36] hover:bg-[#176044] text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* ================= FLOATING CART BOTTOM DRAWER TRIGGER ================= */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-slideUp">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#124a36] hover:bg-[#176044] text-white rounded-2xl p-3.5 px-5 shadow-2xl flex items-center justify-between font-bold border-2 border-amber-300 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 grid place-items-center text-xs font-black">
                {totalCartCount}
              </div>
              <span className="text-sm">Xem giỏ hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base text-amber-300">{formatCurrencyVND(totalCartAmount)}</span>
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
          </button>
        </div>
      )}

      {/* ================= ITEM DETAIL & CUSTOMIZE MODAL ================= */}
      <Modal
        isOpen={!!selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        maxWidth="md"
      >
        {selectedItemForDetail && (
          <div className="space-y-5">
            <div className="relative -mx-6 -mt-6 h-48 bg-slate-100 overflow-hidden">
              <img
                src={selectedItemForDetail.imageUrl}
                alt={selectedItemForDetail.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItemForDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">{selectedItemForDetail.name}</h2>
                <span className="text-base font-extrabold text-[#176044]">
                  {formatCurrencyVND(selectedItemForDetail.price)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {selectedItemForDetail.description}
              </p>
            </div>

            {/* Options list */}
            {selectedItemForDetail.options?.map((grp) => (
              <div key={grp.id} className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{grp.name}</span>
                  {grp.required && <span className="text-[10px] text-amber-600">Bắt buộc</span>}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {grp.values.map((val) => {
                    const isSelected = modalSelectedOptions.some((o) => o.valueId === val.id);
                    return (
                      <button
                        key={val.id}
                        type="button"
                        onClick={() => {
                          if (grp.multiple) {
                            if (isSelected) {
                              setModalSelectedOptions(
                                modalSelectedOptions.filter((o) => o.valueId !== val.id)
                              );
                            } else {
                              setModalSelectedOptions([
                                ...modalSelectedOptions,
                                {
                                  groupId: grp.id,
                                  groupName: grp.name,
                                  valueId: val.id,
                                  valueName: val.name,
                                  priceDelta: val.priceDelta,
                                },
                              ]);
                            }
                          } else {
                            // Single choice in group
                            const filtered = modalSelectedOptions.filter((o) => o.groupId !== grp.id);
                            setModalSelectedOptions([
                              ...filtered,
                              {
                                groupId: grp.id,
                                groupName: grp.name,
                                valueId: val.id,
                                valueName: val.name,
                                priceDelta: val.priceDelta,
                              },
                            ]);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#edf6f1] border-[#176044] text-[#176044] font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{val.name}</span>
                        {val.priceDelta > 0 && (
                          <span className="text-slate-500">+{formatCurrencyVND(val.priceDelta)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Note input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800">Ghi chú cho bếp:</label>
              <input
                type="text"
                value={modalNote}
                onChange={(e) => setModalNote(e.target.value)}
                placeholder="Ví dụ: Ít đá, không hành, cay vừa..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#176044]"
              />
            </div>

            {/* Quantity Stepper & Add Button */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 active:scale-95"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-sm text-slate-800">
                  {modalQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="p-2.5 hover:bg-slate-200 text-slate-700 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="primary"
                onClick={handleAddToCart}
                className="flex-1 py-3"
              >
                Thêm vào giỏ ·{' '}
                {formatCurrencyVND(
                  (selectedItemForDetail.price +
                    modalSelectedOptions.reduce((s, o) => s + o.priceDelta, 0)) *
                    modalQuantity
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= CART DRAWER ================= */}
      <Drawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title={`Giỏ hàng · ${table?.name || 'Bàn'}`}
        position="bottom"
      >
        <div className="space-y-4">
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">{item.item.name}</h4>
                  {item.selectedOptions.length > 0 && (
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {item.selectedOptions.map((o) => o.valueName).join(', ')}
                    </div>
                  )}
                  {item.note && (
                    <div className="text-[10px] text-amber-700 mt-0.5 italic">
                      Ghi chú: {item.note}
                    </div>
                  )}
                  <span className="text-xs font-bold text-[#176044] mt-1 block">
                    {formatCurrencyVND(item.itemTotal)}
                  </span>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        setCart(cart.filter((_, i) => i !== idx));
                      } else {
                        const updated = [...cart];
                        updated[idx].quantity -= 1;
                        updated[idx].itemTotal -= item.itemTotal / (item.quantity);
                        setCart(updated);
                      }
                    }}
                    className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => {
                      const updated = [...cart];
                      const unitP = item.itemTotal / item.quantity;
                      updated[idx].quantity += 1;
                      updated[idx].itemTotal += unitP;
                      setCart(updated);
                    }}
                    className="w-6 h-6 rounded-md bg-white border border-slate-300 text-slate-700 flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-sm font-bold text-slate-900">
              <span>Tổng tiền ({totalCartCount} món):</span>
              <span className="text-lg text-[#176044]">{formatCurrencyVND(totalCartAmount)}</span>
            </div>

            <Button
              variant="primary"
              onClick={handleSubmitOrder}
              className="w-full py-3.5 text-base shadow-lg"
            >
              <Send className="w-4 h-4 mr-2" />
              Gửi gọi món tới Bếp ngay
            </Button>
          </div>
        </div>
      </Drawer>

      {/* ================= ORDER TRACKER TIMELINE MODAL ================= */}
      <Modal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        title="Tiến độ chế biến món ăn"
        subtitle={`${table?.name || 'Bàn'} · Mã đơn: ${activeOrder?.orderCode || ''}`}
      >
        {activeOrder ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-[#edf6f1] border border-[#d9ece3] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Trạng thái tổng thể:</span>
                <StatusChip status={activeOrder.status} />
              </div>
              <p className="text-xs text-slate-600">
                Đơn hàng đang được Bếp tiếp nhận và nấu nướng theo thứ tự yêu cầu.
              </p>
            </div>

            {/* Dishes checklist in order */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Chi tiết món ăn ({activeOrder.items.length} món)
              </h4>
              <div className="space-y-2">
                {activeOrder.items.map((it) => (
                  <div
                    key={it.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-xs text-slate-900 block">
                        {it.quantity}x {it.name}
                      </strong>
                      {it.note && <small className="text-[10px] text-amber-700">{it.note}</small>}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        it.status === 'Ready'
                          ? 'bg-teal-100 text-teal-800'
                          : it.status === 'Cooking'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {it.status === 'Ready' ? '✓ Đã xong' : it.status === 'Cooking' ? '♨ Đang nấu' : 'Chờ nấu'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsPreBillOpen(true)}
                className="flex-1"
              >
                <Receipt className="w-4 h-4 mr-1.5" /> Xem phiếu tạm tính
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsTrackerOpen(false)}
                className="flex-1"
              >
                Gọi thêm món
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs">
            Bàn hiện chưa có đơn gọi món nào.
          </div>
        )}
      </Modal>

      {/* ================= PRE-BILL REVIEW MODAL ================= */}
      <Modal
        isOpen={isPreBillOpen}
        onClose={() => setIsPreBillOpen(false)}
        title="Phiếu tạm tính hóa đơn"
        subtitle={`${restaurant.name} · ${table?.name || 'Bàn'}`}
      >
        {activeOrder ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#fff9ed] border border-[#f0dbb5] rounded-2xl space-y-3 font-mono text-xs">
              <div className="text-center pb-3 border-b border-dashed border-[#dbc89f]">
                <strong className="text-sm font-sans block text-slate-900">{restaurant.name}</strong>
                <span className="text-[11px] text-slate-600">{table?.name} · {activeOrder.orderCode}</span>
              </div>

              <div className="space-y-1.5 py-1">
                {activeOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-start text-[11px]">
                    <span className="text-slate-800">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCurrencyVND(it.itemTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-center text-sm font-bold font-sans">
                <span>TỔNG CỘNG:</span>
                <span className="text-base text-[#176044]">
                  {formatCurrencyVND(activeOrder.totalAmount)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => handleRequestPayment('Cash')}
                className="py-3"
              >
                💵 Tiền mặt
              </Button>
              <Button
                variant="amber"
                onClick={() => handleRequestPayment('VietQR')}
                className="py-3"
              >
                <QrCode className="w-4 h-4 mr-1.5" /> Quét VietQR
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* ================= CALL STAFF MODAL ================= */}
      <Modal
        isOpen={isCallStaffOpen}
        onClose={() => setIsCallStaffOpen(false)}
        title="Gọi nhân viên phục vụ"
        subtitle="Chọn yêu cầu nhanh bên dưới để nhân viên hỗ trợ ngay"
      >
        <div className="grid grid-cols-1 gap-2.5">
          {[
            'Xin thêm đá lạnh',
            'Xin thêm nước lọc / Trà đá',
            'Xin thêm chén dĩa / Đũa muỗng',
            'Cần lau dọn bàn',
            'Cần gọi nhân viên tư vấn',
          ].map((reason) => (
            <button
              key={reason}
              onClick={() => handleSendCallStaff(reason)}
              className="p-3 rounded-xl bg-slate-50 hover:bg-[#edf6f1] border border-slate-200 hover:border-[#176044] text-xs font-semibold text-slate-800 hover:text-[#176044] text-left transition-colors flex items-center justify-between"
            >
              <span>{reason}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>
      </Modal>

      {/* ================= VIETQR MODAL ================= */}
      <Modal
        isOpen={isVietQROpen}
        onClose={() => setIsVietQROpen(false)}
        title="Thanh toán VietQR Napas 24/7"
        subtitle="Mở app ngân hàng bất kỳ để quét mã thanh toán chính xác"
      >
        {activeOrder && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <img
                src={generateVietQRUrl({
                  bankId: restaurant.bankAccount?.bankId || 'MB',
                  accountNo: restaurant.bankAccount?.accountNo || '0908123456',
                  accountName: restaurant.bankAccount?.accountName || 'BEP NHA RESTAURANT',
                  amount: activeOrder.totalAmount,
                  memo: `${restaurant.slug} ${table?.name} ${activeOrder.orderCode}`,
                })}
                alt="VietQR Payment"
                className="w-56 h-auto rounded-lg shadow-sm"
              />
              <div className="mt-3 text-xs space-y-1">
                <strong className="text-sm text-[#176044] block">
                  {formatCurrencyVND(activeOrder.totalAmount)}
                </strong>
                <p className="text-[11px] text-slate-500 font-mono">
                  Nội dung: {restaurant.slug} {table?.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Sau khi chuyển khoản thành công, hệ thống thu ngân sẽ xác nhận và hoàn tất đơn hàng tự động.
            </p>

            <Button
              variant="primary"
              onClick={() => {
                setIsVietQROpen(false);
                showToast('Đang chờ thu ngân xác nhận đã nhận tiền...');
              }}
              className="w-full"
            >
              Tôi đã chuyển khoản xong
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
