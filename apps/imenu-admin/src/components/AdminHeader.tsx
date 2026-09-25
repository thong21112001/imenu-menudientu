import React, { useState, useEffect, useRef } from 'react';
import { storageService, realtimeHub, soundEngine, apiClient } from '@imenu/utils';
import { RestaurantBranch } from '@imenu/types';
import { useSidebar } from './AdminLayoutShell';
import { useToast } from '@imenu/ui';
import {
  Bell,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ChevronDown,
  Building2,
  Check,
  Store,
  AlertTriangle,
  Loader2,
  Globe,
  Crown,
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { isMobile, isCollapsed, toggleSidebar } = useSidebar();
  const toast = useToast();
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
  const [user, setUser] = useState<any>(storageService.getCurrentUser());
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(storageService.getSelectedRestaurantId());
  const [branches, setBranches] = useState<RestaurantBranch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(storageService.getActiveBranchId());
  const [loadingStatusChange, setLoadingStatusChange] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [statusError, setStatusError] = useState('');

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);
  const restaurantDropdownRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = Boolean(
    user?.isSuperAdmin ||
    user?.role === 'SYSTEM_ADMIN' ||
    user?.role === 'system_admin' ||
    user?.role === 'super_admin'
  );
  const isMainBranchUser = isSuperAdmin || Boolean(user?.isMainBranch);
  const isDemo = Boolean(user?.isDemo || user?.email === 'owner@sample.vn');

  const fetchRestaurants = async () => {
    try {
      const res = await apiClient.restaurant.listAll();
      if (res.data && Array.isArray(res.data)) {
        setRestaurants(res.data);
      }
    } catch {
      // Ignored
    }
  };

  const fetchBranches = async (targetRestId?: string | null) => {
    try {
      const effectiveRestId = targetRestId !== undefined ? targetRestId : selectedRestaurantId;
      const res = await apiClient.branches.list(effectiveRestId || undefined);
      if (res.data && Array.isArray(res.data)) {
        setBranches(res.data);
      } else {
        setBranches([]);
      }
    } catch {
      setBranches([]);
    }
  };

  useEffect(() => {
    // Lay profile moi nhat tu backend neu co token
    if (storageService.getAccessToken()) {
      apiClient.auth
        .getMe()
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            storageService.setCurrentUser(res.data.user);
            if (!res.data.user.isSuperAdmin && !res.data.user.isMainBranch && res.data.user.branchId) {
              setActiveBranchId(res.data.user.branchId);
              storageService.setActiveBranchId(res.data.user.branchId);
            }
          }
        })
        .catch(() => {});
    }

    if (!isSuperAdmin && !user?.isMainBranch && user?.branchId) {
      setActiveBranchId(user.branchId);
      storageService.setActiveBranchId(user.branchId);
    }

    if (isSuperAdmin) {
      fetchRestaurants();
    }
    fetchBranches(selectedRestaurantId);

    const handleBranchChange = (e: any) => {
      setActiveBranchId(e.detail?.branchId ?? null);
    };

    const handleRestaurantChange = (e: any) => {
      const restId = e.detail?.restaurantId ?? null;
      setSelectedRestaurantId(restId);
      fetchBranches(restId);
    };

    window.addEventListener('imenu:branch_changed', handleBranchChange);
    window.addEventListener('imenu:restaurant_changed', handleRestaurantChange);

    const unsub = realtimeHub.subscribe('*', (payload) => {
      if (payload.type === 'NEW_ORDER') {
        soundEngine.playNewOrderChime();
        setNotifications((prev) => [
          `Đơn hàng mới từ ${payload.data.tableName} (${payload.data.items?.length || 1} món)`,
          ...prev,
        ]);
      } else if (payload.type === 'CALL_STAFF') {
        soundEngine.playNewOrderChime();
        setNotifications((prev) => [
          `🔔 ${payload.data.tableName}: "${payload.data.reason}"`,
          ...prev,
        ]);
      } else if (payload.type === 'PAYMENT_REQUESTED') {
        soundEngine.playReadyChime();
        setNotifications((prev) => [
          `💵 Yêu cầu thanh toán đơn hàng ${payload.data.orderId}`,
          ...prev,
        ]);
      }
    });

    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
      window.removeEventListener('imenu:restaurant_changed', handleRestaurantChange);
      unsub();
    };
  }, [isSuperAdmin]);

  // Click-outside listener for User Menu, Notification List, Branch Switcher and Restaurant Switcher
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotificationList(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setShowBranchDropdown(false);
      }
      if (restaurantDropdownRef.current && !restaurantDropdownRef.current.contains(event.target as Node)) {
        setShowRestaurantDropdown(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowUserMenu(false);
        setShowNotificationList(false);
        setShowBranchDropdown(false);
        setShowRestaurantDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.auth.logout();
    } catch {
      // Bo qua loi network khi logout
    } finally {
      storageService.clearAuth();
      toast.info('Đã đăng xuất tài khoản thành công');
      window.location.href = '/login';
    }
  };

  const handleSelectBranch = (branchId: string | null) => {
    storageService.setActiveBranchId(branchId);
    setActiveBranchId(branchId);
    setShowBranchDropdown(false);
    const targetName = branchId
      ? branches.find((b) => (b._id || b.id) === branchId)?.name || 'Chi nhánh'
      : 'Toàn chuỗi (Hợp nhất)';
    toast.info(`Phạm vi dữ liệu: ${targetName}`);
  };

  const handleSelectRestaurant = (restId: string | null) => {
    storageService.setSelectedRestaurantId(restId);
    setSelectedRestaurantId(restId);
    storageService.setActiveBranchId(null);
    setActiveBranchId(null);
    setShowRestaurantDropdown(false);

    if (restId) {
      const rest = restaurants.find((r) => (r._id || r.id) === restId);
      if (rest) {
        storageService.saveRestaurant(rest);
      }
      toast.info(`Phạm vi nhà hàng: ${rest?.name || 'Đã chọn'}`);
    } else {
      storageService.saveRestaurant(null);
      toast.info('Phạm vi: Toàn bộ hệ thống');
    }

    window.dispatchEvent(new CustomEvent('imenu:restaurant_changed', { detail: { restaurantId: restId } }));
    window.dispatchEvent(new CustomEvent('imenu:branch_changed', { detail: { branchId: null } }));
    fetchBranches(restId);
  };

  const currentRestaurant = selectedRestaurantId
    ? restaurants.find((r) => (r._id || r.id) === selectedRestaurantId)
    : null;
  const selectedRestaurantLabel = currentRestaurant
    ? currentRestaurant.name
    : '🌐 Toàn hệ thống';

  // Xác định chi nhánh hiện hành để hiển thị trạng thái
  const currentBranch = activeBranchId
    ? branches.find((b) => (b._id || b.id) === activeBranchId)
    : isMainBranchUser
    ? branches.find((b) => b.isMainBranch) || branches[0]
    : branches.find((b) => (b._id || b.id) === user?.branchId) || branches[0];

  const currentStatus = currentBranch?.status || 'ACTIVE';
  const isBranchOpen = currentStatus === 'ACTIVE';

  // Toggle trạng thái mở/đóng cửa chi nhánh (Áp dụng cho cả chi nhánh chính và chi nhánh con)
  const handleToggleBranchStatus = async () => {
    if (!currentBranch) return;
    const branchId = currentBranch._id || currentBranch.id;

    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể đổi trạng thái hoạt động.');
      return;
    }

    if (isBranchOpen) {
      // Mở modal nhập lý do tạm đóng
      setCloseReason('');
      setStatusError('');
      setShowCloseModal(true);
    } else {
      // Mở cửa trở lại
      setLoadingStatusChange(true);
      try {
        await apiClient.branches.reopen(branchId);
        toast.success(`Đã mở cửa hoạt động cho ${currentBranch.name}`);
        await fetchBranches();
      } catch (err: any) {
        toast.error(err.message || 'Không thể mở cửa chi nhánh');
      } finally {
        setLoadingStatusChange(false);
      }
    }
  };

  const handleConfirmClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBranch) return;
    const branchId = currentBranch._id || currentBranch.id;
    setLoadingStatusChange(true);
    setStatusError('');

    try {
      await apiClient.branches.close(branchId, closeReason.trim());
      setShowCloseModal(false);
      toast.success(`Đã tạm đóng cửa ${currentBranch.name}`);
      await fetchBranches();
    } catch (err: any) {
      setStatusError(err.message || 'Không thể tạm đóng chi nhánh');
      toast.error(err.message || 'Không thể tạm đóng chi nhánh');
    } finally {
      setLoadingStatusChange(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
      case 'system_admin':
      case 'super_admin':
        return 'Super Admin';
      case 'RESTAURANT_ADMIN':
      case 'restaurant_admin':
        return 'Chủ nhà hàng (HQ)';
      case 'RESTAURANT_MANAGER':
      case 'restaurant_manager':
        return 'Quản lý chi nhánh';
      case 'CASHIER':
      case 'cashier':
        return 'Thu ngân';
      case 'KITCHEN':
      case 'kitchen':
        return 'Nhân viên bếp';
      case 'WAITER':
      case 'waiter':
        return 'Nhân viên phục vụ';
      default:
        return 'Nhân viên';
    }
  };

  const userInitial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : 'A';

  const selectedBranchLabel = !activeBranchId
    ? '🏢 Toàn chuỗi (Hợp nhất)'
    : branches.find((b) => (b._id || b.id) === activeBranchId)?.name || 'Chi nhánh';

  return (
    <>
      <header className="h-16 bg-white border-b border-[#e4e8e5] sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 shadow-2xs w-full min-w-0 max-w-full">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            title={isMobile ? 'Mở thanh điều hướng' : isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            aria-label="Đóng/Mở thanh điều hướng"
          >
            {isMobile ? (
              <Menu className="w-5 h-5" />
            ) : isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-[#176044]" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* Super Admin: Restaurant Switcher */}
          {isSuperAdmin && (
            <div ref={restaurantDropdownRef} className="relative">
              <button
                onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-xs font-bold text-purple-900 transition-all cursor-pointer border border-purple-200/80 shadow-2xs"
                title="Chọn nhà hàng để quản trị"
              >
                <Crown className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[170px]">{selectedRestaurantLabel}</span>
                <ChevronDown className="w-3 h-3 text-purple-400 shrink-0" />
              </button>

              {showRestaurantDropdown && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                      Phạm vi Nhà hàng
                    </span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> Super Admin
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectRestaurant(null)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                      selectedRestaurantId === null
                        ? 'bg-purple-700 text-white font-bold'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 shrink-0" />
                      <span>Toàn hệ thống (Tất cả nhà hàng)</span>
                    </div>
                    {selectedRestaurantId === null && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {restaurants.length === 0 ? (
                      <p className="text-center py-4 text-slate-400">Không có nhà hàng nào</p>
                    ) : (
                      restaurants.map((r) => {
                        const rId = r._id || r.id;
                        const isSelected = selectedRestaurantId === rId;
                        return (
                          <button
                            key={rId}
                            onClick={() => handleSelectRestaurant(rId)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-purple-50 text-purple-950 font-bold border border-purple-200'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{r.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                <span>{r.branchCount ?? 1} chi nhánh</span>
                                <span>•</span>
                                <span>{r.staffCount ?? 0} nhân viên</span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Branch Switcher / Current Branch Indicator */}
          {(!isSuperAdmin || selectedRestaurantId !== null) && (
            isMainBranchUser ? (
              <div ref={branchDropdownRef} className="relative">
                <button
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-[#09271d] transition-all cursor-pointer border border-slate-200/60"
                  title="Chọn chi nhánh để lọc dữ liệu"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#176044] shrink-0" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedBranchLabel}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                </button>

                {showBranchDropdown && (
                  <div className="absolute left-0 mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                        Phạm vi hoạt động
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                        Chủ chuỗi (HQ)
                      </span>
                    </div>

                    <button
                      onClick={() => handleSelectBranch(null)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                        activeBranchId === null
                          ? 'bg-[#176044] text-white font-bold'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 shrink-0" />
                        <span>Toàn chuỗi (Báo cáo hợp nhất)</span>
                      </div>
                      {activeBranchId === null && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {branches.map((b) => {
                        const bId = b._id || b.id;
                        const isSelected = activeBranchId === bId;
                        return (
                          <button
                            key={bId}
                            onClick={() => handleSelectBranch(bId)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-emerald-50 text-[#176044] font-bold border border-emerald-200'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate">{b.name}</span>
                                {b.isMainBranch && (
                                  <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 font-bold rounded">
                                    HQ
                                  </span>
                                )}
                              </div>
                              <small className="text-[10px] text-slate-400 block truncate">{b.address}</small>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#176044] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-[#176044]" />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {user?.branchName || currentBranch?.name || 'Chi nhánh con'}
                </span>
                <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-medium">
                  Chi nhánh con
                </span>
              </div>
            )
          )}

          {/* Store / Branch Status Toggle */}
          {currentBranch && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBranchOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-slate-700">{isBranchOpen ? 'Đang mở cửa' : 'Tạm đóng cửa'}</span>
              <button
                onClick={handleToggleBranchStatus}
                disabled={loadingStatusChange}
                className="ml-0.5 text-[10px] font-bold text-[#176044] hover:underline cursor-pointer"
                title={isBranchOpen ? 'Tạm đóng cửa chi nhánh (hết ca/ngày)' : 'Mở cửa hoạt động chi nhánh'}
              >
                {loadingStatusChange ? '...' : isBranchOpen ? 'Đóng cửa' : 'Mở cửa'}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Notification Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotificationList(!showNotificationList)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative cursor-pointer"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotificationList && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2 z-50 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 font-bold text-slate-800">
                  <span>Thông báo Real-time</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Xóa hết
                    </button>
                  )}
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1.5">
                  {notifications.length === 0 ? (
                    <p className="text-center py-4 text-slate-400">Không có thông báo mới</p>
                  ) : (
                    notifications.map((msg, i) => (
                      <div key={i} className="p-2 bg-slate-50 rounded-lg text-slate-700 font-medium">
                        {msg}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile with Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-[#124a36] text-white grid place-items-center font-bold text-xs shrink-0">
                {userInitial}
              </div>
              <div className="hidden md:block text-left">
                <strong className="text-xs text-slate-900 block leading-tight">
                  {user?.fullName || user?.email || 'Tài khoản'}
                </strong>
                <small className="text-[10px] text-slate-500">{getRoleLabel(user?.role || '')}</small>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="p-2.5 border-b border-slate-100 mb-1">
                  <p className="font-bold text-slate-900 truncate">{user?.fullName || 'Chưa cập nhật tên'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email || ''}</p>
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold">
                      {getRoleLabel(user?.role || '')}
                    </span>
                    {isSuperAdmin && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                        👑 Super Admin
                      </span>
                    )}
                    {isMainBranchUser && !isSuperAdmin && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                        Trụ sở chính
                      </span>
                    )}
                    {isDemo && (
                      <span className="inline-block px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[9px] font-bold">
                        Dùng thử (Demo)
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-semibold cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất tài khoản
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Tạm đóng cửa chi nhánh */}
      {showCloseModal && currentBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 grid place-items-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tạm Đóng Cửa Chi Nhánh</h3>
                <p className="text-xs text-slate-500">{currentBranch.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Chi nhánh sẽ chuyển sang trạng thái <strong>Tạm đóng cửa</strong>. Khách hàng quét mã QR sẽ nhận được
              thông báo chi nhánh đang bảo trì hoặc tạm nghỉ.
            </p>

            {statusError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {statusError}
              </div>
            )}

            <form onSubmit={handleConfirmClose} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do tạm đóng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Vệ sinh định kỳ, Nâng cấp hệ thống bếp..."
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loadingStatusChange}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {loadingStatusChange ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Xác nhận tạm đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
