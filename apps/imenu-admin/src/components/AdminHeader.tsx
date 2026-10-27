import React, { useState, useEffect, useRef } from 'react';
import {
  storageService,
  realtimeHub,
  soundEngine,
  apiClient,
  formatCurrencyVND,
} from '@imenu/utils';
import {
  RestaurantBranch,
  AdminNotificationItem,
  ConnectionStatus,
} from '@imenu/types';
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
  Volume2,
  VolumeX,
  BellRing,
  CreditCard,
  UtensilsCrossed,
  CheckCircle2,
  RotateCw,
  WifiOff,
  Clock,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { isMobile, isCollapsed, toggleSidebar } = useSidebar();
  const toast = useToast();

  // Notification state
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'UNREAD' | 'CALL_STAFF'>('ALL');
  const [acknowledgingIds, setAcknowledgingIds] = useState<Record<string, boolean>>({});

  // Realtime & Audio state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    realtimeHub.getConnectionStatus() || 'CONNECTED',
  );
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.getIsMuted());

  // Dropdown & User state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
  const [user, setUser] = useState<any>(storageService.getCurrentUser());
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    storageService.getSelectedRestaurantId(),
  );
  const [branches, setBranches] = useState<RestaurantBranch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(
    storageService.getActiveBranchId(),
  );
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
      user?.role === 'super_admin',
  );
  const isMainBranchUser = isSuperAdmin || Boolean(user?.isMainBranch);
  const isDemo = Boolean(user?.isDemo || user?.email === 'owner@sample.vn');

  // Load saved notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('imenu_admin_notifications');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setNotifications(parsed.slice(0, 50));
          }
        }
      } catch {}
    }
  }, []);

  // Save notifications to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined' && notifications.length > 0) {
      try {
        localStorage.setItem(
          'imenu_admin_notifications',
          JSON.stringify(notifications.slice(0, 50)),
        );
      } catch {}
    }
  }, [notifications]);

  const fetchRestaurants = async () => {
    try {
      const res = await apiClient.restaurant.listAll();
      if (res.data && Array.isArray(res.data)) {
        setRestaurants(res.data);
      }
    } catch {}
  };

  const fetchBranches = async (targetRestId?: string | null) => {
    try {
      const effectiveRestId = targetRestId !== undefined ? targetRestId : selectedRestaurantId;
      if (isSuperAdmin && !effectiveRestId) {
        setBranches([]);
        return;
      }
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
    // 1. Lấy thông tin user hiện hành
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

    // 2. Theo dõi trạng thái kết nối Socket.IO
    const unsubStatus = realtimeHub.onConnectionStatusChange((status) => {
      setConnectionStatus(status);
    });

    // 3. Lắng nghe các sự kiện Realtime toàn cục (Chỉ nhân sự quán lẻ mới nghe chuông, Superadmin không nhận chuông quán lẻ)
    let unsubRealtime = () => {};
    if (!isSuperAdmin) {
      unsubRealtime = realtimeHub.subscribe('*', (payload) => {
      const now = Date.now();

      if (payload.type === 'CALL_STAFF' || payload.type === 'table:call_staff') {
        soundEngine.playCallStaffChime();
        const callData = payload.data || {};
        const newNotif: AdminNotificationItem = {
          id: callData.notificationId || `call_${callData.tableId}_${now}`,
          priority: 'URGENT',
          type: 'CALL_STAFF',
          title: `Khách gọi: ${callData.tableName || 'Bàn ăn'}`,
          message: `"${callData.reason || 'Cần hỗ trợ'}"${callData.note ? ` • ${callData.note}` : ''}`,
          tableName: callData.tableName,
          tableId: callData.tableId,
          timestamp: now,
          isRead: false,
          actionUrl: `/pos`,
        };

        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 50));
        toast.info(`🔔 ${callData.tableName || 'Bàn'}: "${callData.reason || 'Khách gọi nhân viên'}"`);
      } else if (payload.type === 'CALL_STAFF_ACKNOWLEDGED' || payload.type === 'table:call_acknowledged') {
        const ackData = payload.data || {};
        // Đánh dấu đã tiếp nhận hỗ trợ
        setNotifications((prev) =>
          prev.map((n) =>
            n.tableId === ackData.tableId && n.type === 'CALL_STAFF'
              ? { ...n, isRead: true, message: `${n.message} (Đã có nhân viên tiếp nhận)` }
              : n,
          ),
        );
      } else if (payload.type === 'PAYMENT_REQUESTED' || payload.type === 'order:payment_requested') {
        soundEngine.playPaymentRequestChime();
        const payData = payload.data || {};
        const newNotif: AdminNotificationItem = {
          id: `pay_${payData.orderId || payData.order?._id || now}`,
          priority: 'HIGH',
          type: 'PAYMENT_REQUESTED',
          title: `Yêu cầu thanh toán: ${payData.tableName || payData.order?.tableName || 'Bàn ăn'}`,
          message: `Đơn #${payData.orderCode || payData.order?.orderCode || ''} • ${payData.paymentMethod || 'VietQR'}`,
          tableName: payData.tableName || payData.order?.tableName,
          tableId: payData.tableId || payData.order?.tableId?._id || payData.order?.tableId,
          orderId: payData.orderId || payData.order?._id,
          orderCode: payData.orderCode || payData.order?.orderCode,
          timestamp: now,
          isRead: false,
          actionUrl: `/pos`,
        };
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 50));
        toast.info(`💵 Yêu cầu thanh toán từ ${newNotif.tableName}`);
      } else if (payload.type === 'NEW_ORDER' || payload.type === 'order:created') {
        soundEngine.playNewOrderChime();
        const orderData = payload.data || {};
        const itemCount = orderData.items?.length || 1;
        const total = orderData.totalAmount ? ` • ${formatCurrencyVND(orderData.totalAmount)}` : '';
        const newNotif: AdminNotificationItem = {
          id: `order_${orderData.id || orderData._id || now}`,
          priority: 'NORMAL',
          type: 'NEW_ORDER',
          title: `Đơn hàng mới từ ${orderData.tableName || 'Bàn ăn'}`,
          message: `${itemCount} món${total} (Đơn #${orderData.orderCode || ''})`,
          tableName: orderData.tableName,
          tableId: orderData.tableId?._id || orderData.tableId,
          orderId: orderData.id || orderData._id,
          orderCode: orderData.orderCode,
          timestamp: now,
          isRead: false,
          actionUrl: `/pos`,
        };
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 50));
      } else if (payload.type === 'ROUND_ADDED' || payload.type === 'order:round_added') {
        soundEngine.playNewOrderChime();
        const roundData = payload.data || {};
        const roundNum = roundData.roundNumber || 1;
        const newNotif: AdminNotificationItem = {
          id: `round_${roundData.order?.id || roundData.order?._id || now}_${roundNum}`,
          priority: 'NORMAL',
          type: 'ROUND_ADDED',
          title: `Lượt gọi món mới #${roundNum}`,
          message: `Từ ${roundData.tableName || roundData.order?.tableName || 'Bàn ăn'} (Chờ thu ngân duyệt)`,
          tableName: roundData.tableName || roundData.order?.tableName,
          tableId: roundData.order?.tableId?._id || roundData.order?.tableId,
          orderId: roundData.order?.id || roundData.order?._id,
          orderCode: roundData.order?.orderCode,
          timestamp: now,
          isRead: false,
          actionUrl: `/pos`,
        };
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 50));
      } else if (payload.type === 'ORDER_STATUS_UPDATED' || payload.type === 'order:item_status_updated') {
        if (payload.data?.status === 'Ready') {
          soundEngine.playReadyChime();
        }
      } else if (payload.type === 'NEW_REVIEW' || payload.type === 'review:created') {
        const revData = payload.data || {};
        const rating = Number(revData.overallRating) || 5;
        const isLow = rating <= 2;
        if (isLow) {
          soundEngine.playCallStaffChime();
        }
        const newNotif: AdminNotificationItem = {
          id: `rev_${revData.reviewId || now}`,
          priority: isLow ? 'URGENT' : 'NORMAL',
          type: 'REVIEW',
          title: isLow ? `⚠️ Cảnh báo đánh giá thấp (${rating}⭐)` : `⭐ Đánh giá mới (${rating}⭐)`,
          message: `${revData.tableName || 'Bàn ăn'}: "${revData.comment || 'Khách gửi đánh giá bữa ăn'}"`,
          tableName: revData.tableName,
          timestamp: now,
          isRead: false,
          actionUrl: `/reviews`,
        };
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 50));
        if (isLow) {
          toast.warning(`⚠️ Bàn ${revData.tableName || ''} đánh giá ${rating} sao! Cần kiểm tra.`);
        } else {
          toast.info(`⭐ Nhận đánh giá mới ${rating} sao từ bàn ${revData.tableName || ''}`);
        }
        }
      });
    }

    return () => {
      window.removeEventListener('imenu:branch_changed', handleBranchChange);
      window.removeEventListener('imenu:restaurant_changed', handleRestaurantChange);
      unsubStatus();
      if (typeof unsubRealtime === 'function') {
        unsubRealtime();
      }
    };
  }, [isSuperAdmin]);

  // Click-outside listener
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
    } finally {
      storageService.clearAuth();
      toast.info('Đã đăng xuất tài khoản thành công');
      window.location.href = '/login';
    }
  };

  // Đổi chi nhánh và chuyển phòng Socket.IO nguyên tử
  const handleSelectBranch = (branchId: string | null) => {
    storageService.setActiveBranchId(branchId);
    setActiveBranchId(branchId);
    setShowBranchDropdown(false);

    const targetName = branchId
      ? branches.find((b) => (b._id || b.id) === branchId)?.name || 'Chi nhánh'
      : 'Toàn chuỗi (Hợp nhất)';
    toast.info(`Phạm vi dữ liệu: ${targetName}`);

    // Kích hoạt switch room socket
    const restId = selectedRestaurantId || user?.restaurantId;
    if (restId) {
      realtimeHub.switchBranch(restId, branchId);
    }
    window.dispatchEvent(new CustomEvent('imenu:branch_changed', { detail: { branchId } }));
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
      realtimeHub.joinRestaurant(restId);
    } else {
      storageService.saveRestaurant(null);
      toast.info('Phạm vi: Toàn bộ hệ thống');
    }

    window.dispatchEvent(new CustomEvent('imenu:restaurant_changed', { detail: { restaurantId: restId } }));
    window.dispatchEvent(new CustomEvent('imenu:branch_changed', { detail: { branchId: null } }));
    fetchBranches(restId);
  };

  const handleToggleMute = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    toast.info(nextMuted ? '🔇 Đã tắt âm thanh cảnh báo' : '🔔 Đã bật âm thanh cảnh báo');
  };

  const handleAcknowledgeCall = async (tableId?: string, notifId?: string) => {
    if (!tableId) return;
    setAcknowledgingIds((prev) => ({ ...prev, [tableId]: true }));
    try {
      await apiClient.tables.acknowledgeCall(tableId);
      toast.success('Đã xác nhận tiếp nhận hỗ trợ bàn');
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)),
      );
    } catch (err: any) {
      toast.error(err.message || 'Không thể xác nhận hỗ trợ bàn');
    } finally {
      setAcknowledgingIds((prev) => ({ ...prev, [tableId]: false }));
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('imenu_admin_notifications');
      } catch {}
    }
  };

  const currentRestaurant = selectedRestaurantId
    ? restaurants.find((r) => (r._id || r.id) === selectedRestaurantId)
    : null;
  const selectedRestaurantLabel = currentRestaurant
    ? currentRestaurant.name
    : '🌐 Toàn hệ thống';

  const currentBranch = activeBranchId
    ? branches.find((b) => (b._id || b.id) === activeBranchId)
    : isMainBranchUser
    ? branches.find((b) => b.isMainBranch) || branches[0]
    : branches.find((b) => (b._id || b.id) === user?.branchId) || branches[0];

  const currentStatus = currentBranch?.status || 'ACTIVE';
  const isBranchOpen = currentStatus === 'ACTIVE';

  const handleToggleBranchStatus = async () => {
    if (!currentBranch) return;
    const branchId = currentBranch._id || currentBranch.id;

    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể đổi trạng thái hoạt động.');
      return;
    }

    if (isBranchOpen) {
      setCloseReason('');
      setStatusError('');
      setShowCloseModal(true);
    } else {
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

  const formatRelativeTime = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 15) return 'Vừa xong';
    if (diffSec < 60) return `${diffSec}s trước`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h trước`;
    return `${Math.floor(diffHour / 24)}d trước`;
  };

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A';
  const selectedBranchLabel = !activeBranchId
    ? '🏢 Toàn chuỗi (Hợp nhất)'
    : branches.find((b) => (b._id || b.id) === activeBranchId)?.name || 'Chi nhánh';

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'UNREAD') return !n.isRead;
    if (notifFilter === 'CALL_STAFF') return n.type === 'CALL_STAFF';
    return true;
  });

  return (
    <>
      {/* AUD-14.2 & Phase 15: Ambient Support Mode Banner for Superadmin */}
      {isSuperAdmin && selectedRestaurantId && (
        <div className="w-full bg-linear-to-r from-purple-800 via-indigo-900 to-purple-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md sticky top-0 z-40 border-b border-purple-500/30">
          <div className="flex items-center gap-2 truncate">
            <Crown className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
            <span>
              Chế độ Hỗ trợ: <strong className="text-amber-300">{currentRestaurant?.name || 'Đang hỗ trợ nhà hàng'}</strong>
            </span>
            <span className="text-purple-200 hidden sm:inline">
              ({currentRestaurant?.slug || ''}) • Toàn quyền xem và thao tác dữ liệu
            </span>
          </div>
          <button
            onClick={() => {
              handleSelectRestaurant(null);
              window.location.href = '/platform/dashboard';
            }}
            className="px-3 py-1 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-[11px] font-bold transition-all cursor-pointer shrink-0 ml-2 border border-purple-400/40 shadow-xs flex items-center gap-1"
          >
            <span>Thoát hỗ trợ</span>
            <span>✕</span>
          </button>
        </div>
      )}

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

          {/* AUD-14.2: Super Admin Royal Badge */}
          {isSuperAdmin && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200/80 text-xs font-bold text-purple-900 shadow-2xs">
              <Crown className="w-4 h-4 text-purple-600 shrink-0" />
              <span className="hidden lg:inline">👑 Quản Trị Viên Tối Cao (Superadmin)</span>
              <span className="lg:hidden">Superadmin</span>
            </div>
          )}

          {/* Phase 15: Superadmin Restaurant Selector */}
          {isSuperAdmin && (
            <div ref={restaurantDropdownRef} className="relative">
              <button
                onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedRestaurantId
                    ? 'bg-purple-100 text-purple-950 border-purple-300 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                }`}
                title="Chọn nhà hàng để hỗ trợ hoặc xem toàn sàn"
              >
                <Store className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[200px]">{selectedRestaurantLabel}</span>
                <ChevronDown className="w-3 h-3 text-purple-500 shrink-0" />
              </button>

              {showRestaurantDropdown && (
                <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                      Phạm vi điều hành
                    </span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                      SuperAdmin
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
                      <span>🌐 Toàn hệ thống (Platform Center)</span>
                    </div>
                    {selectedRestaurantId === null && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {restaurants.map((r) => {
                      const rId = r._id || r.id;
                      const isSelected = selectedRestaurantId === rId;
                      return (
                        <button
                          key={rId}
                          onClick={() => handleSelectRestaurant(rId)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-50 text-purple-900 font-bold border border-purple-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate font-semibold">{r.name}</span>
                              <span className="text-[9px] px-1 py-0.2 bg-purple-100 text-purple-800 font-bold rounded">
                                {r.plan || 'Basic'}
                              </span>
                            </div>
                            <small className="text-[10px] text-slate-400 block truncate">{r.address || r.slug}</small>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Branch Switcher / Current Branch Indicator */}
          {(!isSuperAdmin || Boolean(selectedRestaurantId)) &&
            (isMainBranchUser ? (
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
            ))}

          {/* Store / Branch Status Toggle */}
          {!isSuperAdmin && currentBranch && (
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

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Realtime Connection Status Indicator */}
          {connectionStatus === 'CONNECTED' ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800 shadow-2xs"
              title="Realtime: Đã kết nối Socket.IO ổn định"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">Trực tuyến</span>
            </div>
          ) : connectionStatus === 'RECONNECTING' || connectionStatus === 'CONNECTING' ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800 shadow-2xs"
              title="Mạng gián đoạn, đang tự động kết nối lại..."
            >
              <Loader2 className="w-3 h-3 text-amber-600 animate-spin" />
              <span className="hidden md:inline">Đang kết nối...</span>
            </div>
          ) : (
            <button
              onClick={() => realtimeHub.joinRestaurant(selectedRestaurantId || user?.restaurantId || '')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-[11px] font-bold text-rose-800 cursor-pointer shadow-2xs transition-colors"
              title="Mất kết nối thời gian thực — Bấm để thử lại"
            >
              <WifiOff className="w-3 h-3 text-rose-600" />
              <span className="hidden md:inline">Mất kết nối</span>
              <RotateCw className="w-2.5 h-2.5 text-rose-600 ml-0.5" />
            </button>
          )}

          {/* Sound Mute / Unmute Button */}
          {!isSuperAdmin && (
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isMuted
                  ? 'text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title={isMuted ? 'Bật chuông thông báo (Đang tắt)' : 'Tắt chuông thông báo (Đang bật)'}
              aria-label="Bật/Tắt chuông thông báo"
            >
              {isMuted ? <VolumeX className="w-4.5 h-4.5 text-rose-600" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>
          )}

          {/* Notification Center */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setShowNotificationList(!showNotificationList)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative cursor-pointer"
              title="Trung tâm thông báo"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotificationList && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3.5 space-y-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header Modal */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Thông Báo Trực Tuyến</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                        {unreadCount} mới
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-[#176044] hover:underline cursor-pointer"
                        title="Đánh dấu tất cả đã đọc"
                      >
                        Đã đọc
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearNotifications}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Xóa tất cả thông báo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setNotifFilter('ALL')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      notifFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Tất cả ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('UNREAD')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      notifFilter === 'UNREAD'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Chưa đọc ({unreadCount})
                  </button>
                  <button
                    onClick={() => setNotifFilter('CALL_STAFF')}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      notifFilter === 'CALL_STAFF'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'text-amber-700 hover:text-amber-900'
                    }`}
                  >
                    Khách gọi ({notifications.filter((n) => n.type === 'CALL_STAFF').length})
                  </button>
                </div>

                {/* Notification Items List */}
                <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 space-y-1">
                      <Bell className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                      <p className="text-xs font-medium">Không có thông báo nào</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      const isUrgent = notif.priority === 'URGENT';
                      const isHigh = notif.priority === 'HIGH';

                      return (
                        <div
                          key={notif.id}
                          className={`p-2.5 rounded-2xl border transition-all ${
                            notif.isRead
                              ? 'bg-white border-slate-100 text-slate-600'
                              : isUrgent
                              ? 'bg-amber-50/70 border-amber-300/80 shadow-2xs text-amber-950'
                              : isHigh
                              ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                              : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Icon */}
                            <div
                              className={`w-7 h-7 rounded-xl grid place-items-center shrink-0 mt-0.5 ${
                                isUrgent
                                  ? 'bg-amber-500 text-white animate-pulse'
                                  : isHigh
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {notif.type === 'CALL_STAFF' ? (
                                <BellRing className="w-3.5 h-3.5" />
                              ) : notif.type === 'PAYMENT_REQUESTED' ? (
                                <CreditCard className="w-3.5 h-3.5" />
                              ) : notif.type === 'NEW_ORDER' || notif.type === 'ROUND_ADDED' ? (
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-xs truncate leading-tight">
                                  {notif.title}
                                </h4>
                                <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5" />
                                  {formatRelativeTime(notif.timestamp)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>

                              {/* Action Footer */}
                              <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-200/50">
                                {notif.type === 'CALL_STAFF' && !notif.isRead && notif.tableId && (
                                  <button
                                    onClick={() => handleAcknowledgeCall(notif.tableId, notif.id)}
                                    disabled={acknowledgingIds[notif.tableId]}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                  >
                                    {acknowledgingIds[notif.tableId] ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    Đã hỗ trợ
                                  </button>
                                )}

                                {notif.actionUrl && (
                                  <a
                                    href={notif.actionUrl}
                                    className="text-[10px] font-bold text-[#176044] hover:underline flex items-center gap-0.5 ml-auto cursor-pointer"
                                  >
                                    Xem chi tiết <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
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
