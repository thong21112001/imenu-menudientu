'use client';

import React, { useState, useEffect, useRef } from 'react';
import { storageService, apiClient } from '@imenu/utils';
import { User, RoleDefinition, PermissionGroup, UserRole, RestaurantBranch } from '@imenu/types';
import { Card, Button, Badge, Modal, useToast, CustomSelect } from '@imenu/ui';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  Filter,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  Plus,
  Check,
  KeyRound,
  Sparkles,
  ArrowRightLeft,
  Loader2,
  ArrowRight,
  AlertTriangle,
  Crown,
  Globe,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  LayoutGrid,
  List,
  RotateCcw,
  X,
} from 'lucide-react';

export default function StaffPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [restaurant, setRestaurant] = useState(storageService.getRestaurant());
  const [branches, setBranches] = useState<RestaurantBranch[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(storageService.getCurrentUser());
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);

  // Super Admin state
  const isSuperAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.role === 'SYSTEM_ADMIN' ||
    currentUser?.role === 'system_admin' ||
    currentUser?.role === 'super_admin'
  );
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(storageService.getSelectedRestaurantId());
  const [restaurantFilter, setRestaurantFilter] = useState<string>('all');

  const isDemo = Boolean(currentUser?.isDemo || currentUser?.email === 'owner@sample.vn');
  const isMainBranchUser = isSuperAdmin || Boolean(currentUser?.isMainBranch);
  const canManageStaff =
    isSuperAdmin ||
    isMainBranchUser ||
    currentUser?.role === 'RESTAURANT_ADMIN' ||
    currentUser?.role === 'restaurant_admin';

  // Lọc vai trò: system_admin CHỈ hiển thị duy nhất cho Super Admin
  const isSuperAdminRole = (slugOrCode: string) => {
    const s = String(slugOrCode || '').toLowerCase();
    return s === 'system_admin' || s === 'super_admin';
  };

  const visibleRoles = roles.filter((r) => {
    if (isSuperAdminRole(r.code)) {
      return isSuperAdmin;
    }
    return true;
  });

  // Khi phân quyền vai trò cho nhân viên:
  // - Tuyệt đối không gán role Super Admin (system_admin)
  // - Nếu không phải Trụ sở chính (HQ), không thể gán vai trò quản trị (restaurant_admin, restaurant_manager)
  const assignableRoles = visibleRoles.filter((r) => {
    if (isSuperAdminRole(r.code)) return false;
    if (!isMainBranchUser) {
      const s = String(r.code || '').toLowerCase();
      if (s === 'restaurant_admin' || s === 'restaurant_manager') return false;
    }
    return true;
  });

  // Search & Filter state for Users
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Pagination & View Mode state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const isSearchMounted = useRef(false);

  // Cross-Branch Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferUser, setTransferUser] = useState<User | null>(null);
  const [targetBranchId, setTargetBranchId] = useState<string>('');
  const [transferLoading, setTransferLoading] = useState<boolean>(false);
  const [transferMsg, setTransferMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add/Edit User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userRestaurantId, setUserRestaurantId] = useState<string>('');
  const [modalBranches, setModalBranches] = useState<RestaurantBranch[]>([]);
  const [userFullName, setUserFullName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('CASHIER');
  const [userBranch, setUserBranch] = useState<string>('Chi nhánh Quận 1 (Chính)');
  const [userBranchId, setUserBranchId] = useState<string>('');
  const [userPassword, setUserPassword] = useState<string>('123456');
  const [userStatus, setUserStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Add/Edit Role Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleName, setRoleName] = useState<string>('');
  const [roleCode, setRoleCode] = useState<string>('');
  const [roleDescription, setRoleDescription] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);

  const loadStaffData = async (options?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    branchId?: string;
    restaurantId?: string;
  }) => {
    setStaffLoading(true);
    const targetPage = options?.page ?? currentPage;
    const targetLimit = options?.limit ?? pageSize;
    const sTerm = options?.search !== undefined ? options.search : searchTerm;
    const rRole = options?.role !== undefined ? options.role : roleFilter;
    const sStatus = options?.status !== undefined ? options.status : statusFilter;
    const bFilter = options?.branchId !== undefined ? options.branchId : branchFilter;
    const rFilter = options?.restaurantId !== undefined ? options.restaurantId : restaurantFilter;

    try {
      const effectiveRestId = rFilter !== 'all' ? rFilter : (selectedRestaurantId || undefined);
      const res = await apiClient.staff.list({
        restaurantId: effectiveRestId,
        branchId: bFilter !== 'all' ? bFilter : undefined,
        role: rRole !== 'all' ? rRole : undefined,
        status: sStatus !== 'all' ? sStatus : undefined,
        search: sTerm?.trim() || undefined,
        page: targetPage,
        limit: targetLimit,
      });

      if (res?.data) {
        let staffList: any[] = [];
        let totalCount = 0;
        let pagesCount = 1;

        if (Array.isArray(res.data)) {
          staffList = res.data;
          totalCount = res.data.length;
          pagesCount = Math.max(1, Math.ceil(totalCount / targetLimit));
        } else if (res.data && typeof res.data === 'object') {
          if (Array.isArray(res.data.data)) {
            staffList = res.data.data;
            totalCount = typeof res.data.total === 'number' ? res.data.total : staffList.length;
            pagesCount = typeof res.data.totalPages === 'number' ? res.data.totalPages : Math.max(1, Math.ceil(totalCount / targetLimit));
          } else if (Array.isArray(res.data.items)) {
            staffList = res.data.items;
            totalCount = typeof res.data.total === 'number' ? res.data.total : staffList.length;
            pagesCount = typeof res.data.totalPages === 'number' ? res.data.totalPages : Math.max(1, Math.ceil(totalCount / targetLimit));
          }
        }

        const normalized: User[] = staffList
          .map((u: any) => ({
            id: u._id || u.id,
            username: u.username || '',
            fullName: u.fullName || '',
            email: u.email || '',
            phone: u.phone || '',
            role: typeof u.role === 'object' ? u.role?.slug || u.role?.code || u.role?.name : u.role,
            branchName: typeof u.branchId === 'object' ? u.branchId?.name : (u.branchName || 'Chi nhánh chính'),
            branchId: typeof u.branchId === 'object' ? u.branchId?._id || u.branchId?.id : u.branchId,
            restaurantId: typeof u.restaurantId === 'object' ? u.restaurantId?._id || u.restaurantId?.id : u.restaurantId,
            restaurantName: typeof u.restaurantId === 'object' ? u.restaurantId?.name : (u.restaurantName || ''),
            status: u.status || 'ACTIVE',
            isDeleted: Boolean(u.isDeleted),
            deletedAt: u.deletedAt,
            createdAt: u.createdAt,
          }))
          .filter((u: any) => !u.isDeleted && u.status !== 'DELETED');

        setUsers(normalized);
        setTotalItems(totalCount);
        setTotalPages(pagesCount);
        setCurrentPage(targetPage);
        return;
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhân viên:', err);
    } finally {
      setStaffLoading(false);
    }

    const localUsers = storageService.getUsers().filter((u) => u.status !== 'DELETED');
    setUsers(localUsers);
    setTotalItems(localUsers.length);
    setTotalPages(Math.max(1, Math.ceil(localUsers.length / targetLimit)));
  };

  const loadBranches = async (targetRestId?: string | null) => {
    try {
      const restId = targetRestId !== undefined ? targetRestId : selectedRestaurantId;
      const res = await apiClient.branches.list(restId || undefined);
      if (res.data && Array.isArray(res.data)) {
        setBranches(res.data);
      } else if (restaurant?.branches) {
        setBranches(restaurant.branches);
      }
    } catch {
      if (restaurant?.branches) {
        setBranches(restaurant.branches);
      }
    }
  };

  const loadRoles = async (targetRestId?: string | null) => {
    setRolesLoading(true);
    try {
      const restId = targetRestId !== undefined ? targetRestId : selectedRestaurantId;
      const res = await apiClient.roles.list(restId || undefined);
      if (res?.data && Array.isArray(res.data)) {
        const mapped: RoleDefinition[] = res.data.map((r: any) => ({
          id: r._id || r.id,
          code: r.slug || r.code || r.name,
          name: r.name,
          description: r.description || '',
          isSystem: Boolean(r.isSystem),
          color: r.color || '#124a36',
          permissions: r.permissionIds || r.permissions || [],
          createdAt: r.createdAt,
        }));
        setRoles(mapped);
        return;
      }
    } catch (err) {
      console.error('Lỗi tải danh sách vai trò:', err);
    } finally {
      setRolesLoading(false);
    }
    setRoles(storageService.getRoles());
  };

  const loadRestaurants = async () => {
    try {
      const res = await apiClient.restaurant.listAll();
      if (res?.data && Array.isArray(res.data)) {
        setRestaurants(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nhà hàng:', err);
    }
  };

  useEffect(() => {
    const usr = storageService.getCurrentUser();
    setCurrentUser(usr);
    setPermissionGroups(storageService.getPermissionGroups());
    setRestaurant(storageService.getRestaurant());
    setSelectedRestaurantId(storageService.getSelectedRestaurantId());

    const isSup = Boolean(
      usr?.isSuperAdmin ||
      usr?.role === 'SYSTEM_ADMIN' ||
      usr?.role === 'system_admin' ||
      usr?.role === 'super_admin'
    );
    if (isSup) {
      loadRestaurants();
    }
    loadBranches();
    loadRoles();
    loadStaffData({ page: 1 });

    const handleRestaurantChanged = (e: any) => {
      const restId = e.detail?.restaurantId ?? null;
      setSelectedRestaurantId(restId);
      setRestaurantFilter('all');
      loadBranches(restId);
      loadRoles(restId);
      loadStaffData({ branchId: branchFilter, restaurantId: restId || 'all', page: 1 });
    };

    window.addEventListener('imenu:restaurant_changed', handleRestaurantChanged);
    return () => {
      window.removeEventListener('imenu:restaurant_changed', handleRestaurantChanged);
    };
  }, []);

  // Debounced search on searchTerm change
  useEffect(() => {
    if (!isSearchMounted.current) {
      isSearchMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadStaffData({ page: 1, search: searchTerm });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    loadStaffData({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    loadStaffData({ page: 1, limit: newSize });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setBranchFilter('all');
    setRestaurantFilter('all');
    setCurrentPage(1);
    loadStaffData({
      page: 1,
      search: '',
      role: 'all',
      status: 'all',
      branchId: 'all',
      restaurantId: 'all',
    });
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    roleFilter !== 'all' ||
    statusFilter !== 'all' ||
    branchFilter !== 'all' ||
    restaurantFilter !== 'all';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (current <= 3) {
      pages.push(1, 2, 3, 4, '...', total);
    } else if (current >= total - 2) {
      pages.push(1, '...', total - 3, total - 2, total - 1, total);
    } else {
      pages.push(1, '...', current - 1, current, current + 1, '...', total);
    }
    return pages;
  };

  // Open Add/Edit User Modal
  const handleOpenUserModal = async (usr?: User) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể thêm hoặc sửa nhân viên.');
      return;
    }
    if (!isMainBranchUser && !isSuperAdmin) {
      toast.error('Chỉ tài khoản chính của chủ nhà hàng (Trụ sở HQ) mới có quyền thêm nhân viên và phân quyền vai trò.');
      return;
    }
    if (usr) {
      setEditingUser(usr);
      setUserFullName(usr.fullName);
      setUserEmail(usr.email);
      setUserPhone(usr.phone);
      setUserRole(usr.role);
      const restId = usr.restaurantId || selectedRestaurantId || (restaurants[0]?._id || restaurants[0]?.id || '');
      setUserRestaurantId(restId);
      setUserBranch(usr.branchName || branches[0]?.name || 'Chi nhánh Quận 1 (Chính)');
      setUserBranchId(usr.branchId || branches[0]?._id || branches[0]?.id || '');
      setUserPassword('••••••');
      setUserStatus(usr.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE');
      setModalBranches(branches);
    } else {
      setEditingUser(null);
      setUserFullName('');
      setUserEmail('');
      setUserPhone('');
      const defaultRole = assignableRoles.find((r) => r.code?.toLowerCase() === 'cashier')?.code || assignableRoles[0]?.code || 'CASHIER';
      setUserRole(defaultRole);
      const targetRestId = selectedRestaurantId || (restaurants[0]?._id || restaurants[0]?.id || '');
      setUserRestaurantId(targetRestId);

      // Load branches cho nhà hàng được chọn trong modal
      let currentModalBranches = branches;
      if (isSuperAdmin && targetRestId) {
        try {
          const res = await apiClient.branches.list(targetRestId);
          if (res?.data && Array.isArray(res.data)) {
            currentModalBranches = res.data;
          }
        } catch {
          // Keep current branches
        }
      }
      setModalBranches(currentModalBranches);
      const defaultBranch = currentModalBranches[0];
      setUserBranch(defaultBranch?.name || 'Chi nhánh chính');
      setUserBranchId(defaultBranch?._id || defaultBranch?.id || '');
      if (!isMainBranchUser && currentUser?.branchId) {
        setUserBranch(currentUser.branchName || 'Chi nhánh hiện tại');
        setUserBranchId(currentUser.branchId);
      }
      setUserPassword('123456');
      setUserStatus('ACTIVE');
    }
    setIsUserModalOpen(true);
  };

  // Super Admin đổi nhà hàng mục tiêu trong Add User modal
  const handleModalRestaurantChange = async (targetRestId: string) => {
    setUserRestaurantId(targetRestId);
    try {
      const res = await apiClient.branches.list(targetRestId);
      if (res?.data && Array.isArray(res.data)) {
        setModalBranches(res.data);
        if (res.data.length > 0) {
          setUserBranchId(res.data[0]._id || res.data[0].id);
          setUserBranch(res.data[0].name);
        } else {
          setUserBranchId('');
          setUserBranch('');
        }
      }
    } catch {
      setModalBranches([]);
      setUserBranchId('');
      setUserBranch('');
    }
  };

  // Open Transfer Modal
  const handleOpenTransferModal = (usr: User) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể điều chuyển nhân sự.');
      return;
    }
    setTransferUser(usr);
    setTransferMsg(null);
    const otherBranch = branches.find((b) => (b._id || b.id) !== usr.branchId);
    setTargetBranchId(otherBranch?._id || otherBranch?.id || '');
    setIsTransferModalOpen(true);
  };

  // Confirm Staff Transfer
  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferUser || !targetBranchId) return;

    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể điều chuyển nhân sự.');
      return;
    }

    setTransferLoading(true);
    setTransferMsg(null);

    try {
      await apiClient.staff.transfer(transferUser.id, targetBranchId);
      const targetB = branches.find((b) => (b._id || b.id) === targetBranchId);
      const successText = `Đã điều chuyển nhân viên "${transferUser.fullName}" sang "${targetB?.name || 'Chi nhánh mới'}" thành công!`;
      setTransferMsg({
        type: 'success',
        text: successText,
      });
      toast.success(successText);
      await loadStaffData();
      setTimeout(() => {
        setIsTransferModalOpen(false);
        setTransferMsg(null);
      }, 1200);
    } catch (err: any) {
      const errMsg = err.message || 'Không thể điều chuyển nhân sự giữa các chi nhánh';
      setTransferMsg({
        type: 'error',
        text: errMsg,
      });
      toast.error(errMsg);
    } finally {
      setTransferLoading(false);
    }
  };

  // Save User Submit
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName.trim() || !userEmail.trim()) return;

    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể thay đổi thông tin nhân viên.');
      return;
    }

    try {
      const selectedRoleDef = roles.find((r) => r.code === userRole || r.id === userRole);
      const resolvedRoleId = selectedRoleDef?.id || userRole;

      if (editingUser) {
        await apiClient.staff.update(editingUser.id, {
          fullName: userFullName.trim(),
          phone: userPhone.trim(),
          roleId: resolvedRoleId,
          role: resolvedRoleId,
          branchId: userBranchId || undefined,
          status: userStatus,
        });
        toast.success(`Đã cập nhật nhân viên "${userFullName.trim()}" thành công`);
      } else {
        const createPayload: any = {
          fullName: userFullName.trim(),
          email: userEmail.trim(),
          phone: userPhone.trim(),
          roleId: resolvedRoleId,
          role: resolvedRoleId,
          branchId: userBranchId || undefined,
          password: userPassword || '123456',
        };
        if (isSuperAdmin && userRestaurantId) {
          createPayload.restaurantId = userRestaurantId;
        }

        await apiClient.staff.create(createPayload);
        toast.success(`Đã tạo mới nhân viên "${userFullName.trim()}" thành công`);
      }
      setIsUserModalOpen(false);
      await loadStaffData();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu thông tin nhân viên');
    }
  };

  // Toggle User Status (Lock/Unlock)
  const handleToggleUserStatus = async (userId: string) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể khóa/mở khóa nhân viên.');
      return;
    }
    if (!isMainBranchUser && !isSuperAdmin) {
      toast.error('Chỉ tài khoản chính của chủ nhà hàng mới có quyền thay đổi trạng thái nhân viên.');
      return;
    }
    try {
      const res = await apiClient.staff.toggleStatus(userId);
      const newStatus = res?.data?.status;
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              status: (newStatus || (u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')) as any,
            };
          }
          return u;
        })
      );
      toast.info(newStatus === 'ACTIVE' ? 'Đã mở khóa tài khoản' : 'Đã tạm khóa tài khoản');
    } catch (err: any) {
      toast.error(err.message || 'Không thể thay đổi trạng thái nhân viên');
    }
  };

  // Delete User (Soft Delete)
  const handleDeleteUser = async (userId: string) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể xóa nhân viên.');
      return;
    }
    if (!isMainBranchUser && !isSuperAdmin) {
      toast.error('Chỉ tài khoản chính của chủ nhà hàng mới có quyền xóa nhân viên.');
      return;
    }
    const targetUser = users.find((u) => u.id === userId);
    if (!confirm(`Bạn có chắc muốn xóa nhân viên "${targetUser?.fullName || 'này'}" khỏi hệ thống? (Thao tác sẽ thực hiện soft delete bảo vệ lịch sử hóa đơn).`)) {
      return;
    }
    try {
      await apiClient.staff.delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      toast.success('Đã xóa nhân viên (Soft Delete) thành công');
      await loadStaffData();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa nhân viên');
    }
  };

  // Open Add/Edit Role Modal
  const handleOpenRoleModal = (rl?: RoleDefinition) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể thay đổi vai trò phân quyền.');
      return;
    }
    if (!isMainBranchUser && !isSuperAdmin) {
      toast.error('Chỉ tài khoản chính của chủ nhà hàng mới có quyền cấu hình vai trò phân quyền.');
      return;
    }
    if (rl && isSuperAdminRole(rl.code) && !isSuperAdmin) {
      toast.error('Bạn không có quyền truy cập hoặc chỉnh sửa vai trò này.');
      return;
    }
    if (rl) {
      setEditingRole(rl);
      setRoleName(rl.name);
      setRoleCode(rl.code);
      setRoleDescription(rl.description);
      setRolePermissions(rl.permissions || []);
    } else {
      setEditingRole(null);
      setRoleName('');
      setRoleCode('');
      setRoleDescription('');
      setRolePermissions(['perm-pos-view', 'perm-pos-order']);
    }
    setIsRoleModalOpen(true);
  };

  // Auto-generate role code from name
  const handleRoleNameChange = (val: string) => {
    setRoleName(val);
    if (!editingRole) {
      const code = val
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/Đ/g, 'D')
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      setRoleCode(code);
    }
  };

  // Toggle permission checkbox
  const handleTogglePermission = (permId: string) => {
    setRolePermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Toggle all permissions in a group
  const handleToggleGroupPermissions = (group: PermissionGroup) => {
    const groupPermIds = group.permissions.map((p) => p.id);
    const hasAll = groupPermIds.every((id) => rolePermissions.includes(id));
    if (hasAll) {
      setRolePermissions((prev) => prev.filter((id) => !groupPermIds.includes(id)));
    } else {
      const added = Array.from(new Set([...rolePermissions, ...groupPermIds]));
      setRolePermissions(added);
    }
  };

  // Save Role Submit
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleCode.trim()) return;

    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể thay đổi phân quyền.');
      return;
    }

    if (!isMainBranchUser && !isSuperAdmin) {
      toast.error('Chỉ tài khoản chính của chủ nhà hàng mới có quyền cấu hình vai trò phân quyền.');
      return;
    }

    if (isSuperAdminRole(roleCode) && !isSuperAdmin) {
      toast.error('Không được phép cấu hình vai trò Quản trị viên hệ thống SaaS.');
      return;
    }

    try {
      if (editingRole) {
        await apiClient.roles.update(editingRole.id, {
          name: roleName.trim(),
          description: roleDescription.trim(),
          permissionIds: rolePermissions,
        });
        toast.success(`Đã cập nhật vai trò "${roleName.trim()}"`);
      } else {
        await apiClient.roles.create({
          name: roleName.trim(),
          slug: roleCode.trim(),
          description: roleDescription.trim() || 'Vai trò tùy chỉnh',
          permissionIds: rolePermissions,
          restaurantId: selectedRestaurantId || undefined,
        });
        toast.success(`Đã tạo vai trò mới "${roleName.trim()}"`);
      }
      await loadRoles();
      setIsRoleModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Không thể lưu vai trò phân quyền');
    }
  };

  // Delete Custom Role
  const handleDeleteRole = async (roleId: string) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể xóa vai trò.');
      return;
    }
    if (!isMainBranchUser && !isSuperAdmin) {
      toast.error('Chỉ tài khoản chính của chủ nhà hàng mới có quyền xóa vai trò.');
      return;
    }
    const roleToDelete = roles.find((r) => r.id === roleId);
    if (!roleToDelete) return;
    if (roleToDelete.isSystem) {
      toast.error('Không thể xóa vai trò mặc định của hệ thống!');
      return;
    }
    const usersWithRole = users.filter((u) => u.role === roleToDelete.code);
    if (usersWithRole.length > 0) {
      toast.error(`Đang có ${usersWithRole.length} nhân viên thuộc vai trò này. Hãy chuyển vai trò của họ trước khi xóa!`);
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa vai trò "${roleToDelete.name}"?`)) return;

    try {
      await apiClient.roles.delete(roleId);
      toast.success(`Đã xóa vai trò "${roleToDelete.name}"`);
      await loadRoles();
    } catch (err: any) {
      toast.error(err.message || 'Không thể xóa vai trò này');
    }
  };

  const getRoleBadge = (roleCode: string) => {
    const r = roles.find((item) => item.code === roleCode);
    const roleName = r ? r.name : roleCode;
    switch (roleCode) {
      case 'SYSTEM_ADMIN':
      case 'system_admin':
        return <Badge variant="brand">👑 Super Admin</Badge>;
      case 'RESTAURANT_ADMIN':
      case 'restaurant_admin':
        return <Badge variant="brand">{roleName}</Badge>;
      case 'RESTAURANT_MANAGER':
      case 'restaurant_manager':
        return <Badge variant="neutral">{roleName}</Badge>;
      case 'CASHIER':
      case 'cashier':
        return <Badge variant="amber">{roleName}</Badge>;
      case 'KITCHEN':
      case 'kitchen':
        return <Badge variant="danger">{roleName}</Badge>;
      case 'WAITER':
      case 'waiter':
        return <Badge variant="neutral">{roleName}</Badge>;
      default:
        return <Badge variant="neutral">{roleName}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#09271d]">Nhân Viên & Phân Quyền (RBAC)</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Quản lý danh sách nhân sự, phân quyền vai trò chi nhánh và cấu hình ma trận quyền hạn
          </p>
        </div>

        <div>
          {activeTab === 'users' ? (
            <Button
              variant="primary"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => handleOpenUserModal()}
              disabled={!canManageStaff}
              className={`cursor-pointer shadow-md ${!canManageStaff ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={!canManageStaff ? 'Chỉ quản trị viên mới có quyền thêm nhân viên' : undefined}
            >
              Thêm nhân viên mới
            </Button>
          ) : (
            isMainBranchUser && (
              <Button
                variant="primary"
                icon={<ShieldCheck className="w-4 h-4" />}
                onClick={() => handleOpenRoleModal()}
                className="cursor-pointer shadow-md"
              >
                + Tạo mới phân quyền
              </Button>
            )
          )}
        </div>
      </div>

      {/* Demo Account Protection Notice */}
      {isDemo && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 grid place-items-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Chế độ trải nghiệm (Demo Account)</p>
              <p className="text-xs text-amber-700/90">
                Bạn đang sử dụng tài khoản mẫu. Dữ liệu nhân sự và vai trò chỉ ở chế độ xem, các thao tác thêm, sửa, xóa, điều chuyển đã được bảo vệ.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200/70 text-amber-900">
            Chỉ xem (View Only)
          </span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-sm font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-[#124a36] text-[#124a36]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Nhân Viên</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'users' ? 'bg-emerald-100 text-[#124a36]' : 'bg-slate-100 text-slate-600'}`}>
            {totalItems}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-3 text-sm font-black transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-[#124a36] text-[#124a36]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Vai Trò & Phân Quyền (RBAC)</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'roles' ? 'bg-emerald-100 text-[#124a36]' : 'bg-slate-100 text-slate-600'}`}>
            {visibleRoles.length}
          </span>
        </button>
      </div>

      {/* ================= TAB 1: DANH SÁCH NHÂN VIÊN ================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo Tên, Username, Email hoặc SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                    loadStaffData({ page: 1, search: '' });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {isSuperAdmin && restaurants.length > 0 && (
                <div className="w-full sm:w-48">
                  <CustomSelect
                    size="sm"
                    value={restaurantFilter}
                    onChange={(val) => {
                      setRestaurantFilter(val);
                      setCurrentPage(1);
                      loadStaffData({ page: 1, restaurantId: val });
                    }}
                    options={[
                      { value: 'all', label: '🌐 Tất cả nhà hàng' },
                      ...restaurants.map((r) => ({
                        value: (r._id || r.id) as string,
                        label: r.name,
                      })),
                    ]}
                  />
                </div>
              )}

              <div className="w-full sm:w-40">
                <CustomSelect
                  size="sm"
                  value={roleFilter}
                  onChange={(val) => {
                    setRoleFilter(val);
                    setCurrentPage(1);
                    loadStaffData({ page: 1, role: val });
                  }}
                  options={[
                    { value: 'all', label: 'Tất cả vai trò' },
                    ...visibleRoles.map((r) => ({ value: r.code, label: r.name })),
                  ]}
                />
              </div>

              <div className="w-full sm:w-36">
                <CustomSelect
                  size="sm"
                  value={statusFilter}
                  onChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                    loadStaffData({ page: 1, status: val });
                  }}
                  options={[
                    { value: 'all', label: 'Tất cả trạng thái' },
                    { value: 'ACTIVE', label: 'Đang hoạt động' },
                    { value: 'INACTIVE', label: 'Tạm khóa' },
                  ]}
                />
              </div>

              {isMainBranchUser && branches.length > 0 && (
                <div className="w-full sm:w-48">
                  <CustomSelect
                    size="sm"
                    value={branchFilter}
                    onChange={(val) => {
                      setBranchFilter(val);
                      setCurrentPage(1);
                      loadStaffData({ page: 1, branchId: val });
                    }}
                    options={[
                      { value: 'all', label: '🏢 Tất cả chi nhánh' },
                      ...branches.map((b) => ({
                        value: (b._id || b.id) as string,
                        label: b.name,
                        badge: b.isMainBranch ? 'HQ' : undefined,
                      })),
                    ]}
                  />
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  title="Đặt lại tất cả bộ lọc"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Đặt lại</span>
                </button>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-[#124a36] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Hiển thị dạng bảng (Table view)"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-[#124a36] shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Hiển thị dạng thẻ (Cards view)"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {users.length === 0 && !staffLoading ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-3">
              <Users className="w-10 h-10 mx-auto text-slate-300" />
              <div>
                <p className="text-base font-bold text-slate-700">Không tìm thấy nhân viên phù hợp</p>
                <p className="text-xs text-slate-400 mt-1">Vui lòng thử từ khóa tìm kiếm hoặc bộ lọc khác</p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="mt-2 px-3 py-1.5 rounded-xl text-xs font-bold text-[#124a36] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : viewMode === 'table' ? (
            /* Table View: Display ONLY relevant columns */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto relative min-h-[140px]">
                {staffLoading && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs z-10 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-md border border-slate-200 text-xs font-bold text-[#124a36]">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                      Đang tải danh sách nhân viên...
                    </div>
                  </div>
                )}
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8faf9] border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Nhân viên</th>
                      <th className="py-3 px-4">Vai trò (RBAC)</th>
                      <th className="py-3 px-4">Chi nhánh làm việc</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Ngày tạo</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {users.map((usr) => {
                      const isActive = usr.status !== 'INACTIVE';
                      return (
                        <tr
                          key={usr.id}
                          className="hover:bg-emerald-50/40 transition-colors group"
                        >
                          {/* 1. Nhân viên */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#09271d] to-[#176044] text-white font-extrabold grid place-items-center text-sm shrink-0 shadow-2xs">
                                {usr.fullName?.charAt(0) || 'U'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-900 transition-colors">
                                    {usr.fullName}
                                  </span>
                                  {usr.username && (
                                    <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                      @{usr.username}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    {usr.email}
                                  </span>
                                  {usr.phone && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        {usr.phone}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Vai trò */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {getRoleBadge(usr.role)}
                          </td>

                          {/* 3. Chi nhánh làm việc */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                <span>{usr.branchName || 'Chi nhánh chính'}</span>
                                {usr.isMainBranch && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                    HQ
                                  </span>
                                )}
                              </div>
                              {isSuperAdmin && usr.restaurantName && (
                                <div className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 w-fit">
                                  <Crown className="w-3 h-3 text-purple-600" />
                                  <span>{usr.restaurantName}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 4. Trạng thái */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-red-50 text-red-800 border border-red-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                            </span>
                          </td>

                          {/* 5. Ngày tạo */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                            <div className="flex items-center gap-1.5 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDate(usr.createdAt)}</span>
                            </div>
                          </td>

                          {/* 6. Thao tác */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {isMainBranchUser && (
                                <button
                                  onClick={() => handleOpenTransferModal(usr)}
                                  className="p-1.5 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 border border-teal-200 transition-colors cursor-pointer"
                                  title="Điều chuyển nhân viên sang chi nhánh khác"
                                >
                                  <ArrowRightLeft className="w-4 h-4" />
                                </button>
                              )}

                              {canManageStaff && (
                                <>
                                  <button
                                    onClick={() => handleToggleUserStatus(usr.id)}
                                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                      isActive
                                        ? 'text-slate-500 bg-slate-50 hover:text-amber-700 hover:bg-amber-50 border-slate-200'
                                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                                    }`}
                                    title={isActive ? 'Tạm khóa tài khoản' : 'Kích hoạt lại tài khoản'}
                                  >
                                    {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                  </button>

                                  <button
                                    onClick={() => handleOpenUserModal(usr)}
                                    className="p-1.5 rounded-lg text-slate-600 bg-slate-50 hover:text-[#176044] hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                                    title="Chỉnh sửa thông tin"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleDeleteUser(usr.id)}
                                    className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:text-red-700 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                                    title="Xóa nhân viên (Soft Delete)"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Full Pagination Bar */}
              <div className="p-4 bg-[#fbfdfc] border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Hiển thị <strong className="text-slate-800">{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</strong> trong tổng số <strong className="text-slate-800">{totalItems}</strong> nhân sự
                  </span>
                  <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                    <span>Mỗi trang:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-1 rounded-md border border-slate-200 bg-white font-semibold text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage <= 1 || staffLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang đầu"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || staffLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 font-bold">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = p === currentPage;
                      return (
                        <button
                          key={p}
                          onClick={() => handlePageChange(Number(p))}
                          disabled={staffLoading}
                          className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#124a36] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || staffLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang kế tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages || staffLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang cuối"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="space-y-4">
              <div className="space-y-3">
                {users.map((usr) => {
                  const isActive = usr.status !== 'INACTIVE';
                  return (
                    <Card
                      key={usr.id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#09271d] to-[#176044] text-white font-black grid place-items-center text-sm shrink-0 shadow-xs">
                          {usr.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm font-extrabold text-slate-900 block truncate">
                              {usr.fullName}
                            </strong>
                            {usr.username && (
                              <span className="text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                @{usr.username}
                              </span>
                            )}
                            {getRoleBadge(usr.role)}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {isActive ? 'Hoạt động' : 'Tạm khóa'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" /> {usr.email}
                            </span>
                            {usr.phone && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" /> {usr.phone}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <Building2 className="w-3 h-3 text-emerald-700" />
                              {usr.branchName || 'Chi nhánh chính'}
                            </span>
                            {isSuperAdmin && usr.restaurantName && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 text-[11px]">
                                  <Crown className="w-3 h-3 text-purple-600" />
                                  {usr.restaurantName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                        {isMainBranchUser && (
                          <button
                            onClick={() => handleOpenTransferModal(usr)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer flex items-center gap-1 border border-teal-200"
                            title="Điều chuyển nhân viên sang chi nhánh khác"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600" />
                            <span className="hidden sm:inline">Điều chuyển</span>
                          </button>
                        )}

                        {canManageStaff && (
                          <>
                            <button
                              onClick={() => handleToggleUserStatus(usr.id)}
                              className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                isActive
                                  ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={isActive ? 'Tạm khóa tài khoản' : 'Kích hoạt lại tài khoản'}
                            >
                              {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => handleOpenUserModal(usr)}
                              className="p-2 rounded-xl text-slate-600 hover:text-[#176044] hover:bg-emerald-50 transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin nhân viên"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Xóa nhân viên"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination Bar for Cards */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Hiển thị <strong className="text-slate-800">{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> - <strong className="text-slate-800">{Math.min(currentPage * pageSize, totalItems)}</strong> trong tổng số <strong className="text-slate-800">{totalItems}</strong> nhân sự
                  </span>
                  <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                    <span>Mỗi trang:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      className="px-2 py-1 rounded-md border border-slate-200 bg-white font-semibold text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage <= 1 || staffLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang đầu"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || staffLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {getPageNumbers(currentPage, totalPages).map((p, idx) => {
                      if (p === '...') {
                        return (
                          <span key={`dots-c-${idx}`} className="px-2 py-1 text-slate-400 font-bold">
                            ...
                          </span>
                        );
                      }
                      const isCurrent = p === currentPage;
                      return (
                        <button
                          key={`card-p-${p}`}
                          onClick={() => handlePageChange(Number(p))}
                          disabled={staffLoading}
                          className={`min-w-8 h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#124a36] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || staffLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang kế tiếp"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage >= totalPages || staffLoading}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang cuối"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: VAI TRÒ & PHÂN QUYỀN (RBAC) ================= */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-[#09271d]">Ma Trận Vai Trò Hệ Thống</h2>
              <p className="text-xs text-slate-500">
                Cấu hình phân quyền truy cập theo từng phân hệ (Thực đơn, POS Bàn, Màn hình Bếp KDS, Báo cáo và Cài đặt)
              </p>
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visibleRoles.map((r) => {
              const userCount = users.filter((u) => u.role === r.code).length;
              return (
                <Card key={r.id} className="p-5 space-y-3.5 border-2 border-slate-200 hover:border-emerald-700/50 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-base font-black text-slate-900">{r.name}</strong>
                        {r.isSystem ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Hệ thống
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                            Tùy chỉnh
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-400">({r.code})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{r.description}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {((!r.isSystem && isMainBranchUser) || (r.isSystem && isSuperAdmin)) && (
                        <button
                          onClick={() => handleOpenRoleModal(r)}
                          className="p-1.5 text-slate-500 hover:text-[#176044] hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="Chỉnh sửa quyền hạn"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {!r.isSystem && isMainBranchUser && (
                        <button
                          onClick={() => handleDeleteRole(r.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Xóa vai trò"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Permissions Summary Pills */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Quyền hạn được cấp:</span>
                      <span className="font-black text-[#176044]">
                        {r.permissions.length} quyền
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                      {r.permissions.map((permId) => {
                        let permName = permId;
                        permissionGroups.forEach((g) => {
                          const p = g.permissions.find((item) => item.id === permId);
                          if (p) permName = p.name;
                        });
                        return (
                          <span
                            key={permId}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-[#124a36] border border-emerald-200/60"
                          >
                            ✓ {permName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {isSuperAdmin
                          ? `${userCount} nhân sự đang giữ vai trò này`
                          : isMainBranchUser
                          ? `${userCount} nhân sự (toàn chuỗi) đang giữ vai trò này`
                          : `${userCount} nhân sự (tại chi nhánh này) đang giữ vai trò này`}
                      </span>
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= MODAL THÊM / SỬA NHÂN VIÊN ================= */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? 'Chỉnh Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
        subtitle="Thông tin tài khoản đăng nhập và phân quyền chi nhánh làm việc"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveUser} className="space-y-5">
          {isSuperAdmin && !editingUser && (
            <div className="p-4 bg-purple-50/80 border border-purple-200/80 rounded-2xl space-y-2">
              <label className="text-xs font-black text-purple-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-purple-600" />
                Thuộc Nhà Hàng Quản Lý *
              </label>
              <CustomSelect
                options={restaurants.map((r) => ({
                  value: (r._id || r.id) as string,
                  label: r.name,
                  sublabel: `${r.branchCount ?? 1} chi nhánh • ${r.staffCount ?? 0} nhân sự`,
                }))}
                value={userRestaurantId}
                onChange={(val) => handleModalRestaurantChange(val)}
              />
            </div>
          )}

          {/* Block 1: Thông tin định danh */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-2xl space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              1. Thông Tin Nhân Sự
            </h4>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên nhân viên *</label>
              <input
                type="text"
                required
                placeholder="VD: Trần Quang Thông"
                value={userFullName}
                onChange={(e) => setUserFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email đăng nhập *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="thong.tran@sample.vn"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    placeholder="0395372415"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Block 2: Phân quyền vai trò & Chi nhánh */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-2xl space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#124a36] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              2. Phân Quyền Vai Trò & Nơi Làm Việc
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vai trò phân quyền *</label>
                <CustomSelect
                  options={assignableRoles.map((r) => ({
                    value: r.code,
                    label: r.name,
                    sublabel: r.description,
                  }))}
                  value={userRole}
                  onChange={(val) => setUserRole(val)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Chi nhánh làm việc *</label>
                <CustomSelect
                  options={(modalBranches.length > 0 ? modalBranches : branches).map((b) => ({
                    value: (b._id || b.id) as string,
                    label: b.name,
                    sublabel: b.address,
                    badge: b.isMainBranch ? 'Trụ sở HQ' : undefined,
                  }))}
                  value={userBranchId}
                  onChange={(val) => {
                    setUserBranchId(val);
                    const branchPool = modalBranches.length > 0 ? modalBranches : branches;
                    const selectedB = branchPool.find((b) => (b._id || b.id) === val);
                    setUserBranch(selectedB?.name || '');
                  }}
                  disabled={!isMainBranchUser && Boolean(currentUser?.branchId)}
                />
              </div>
            </div>
          </div>

          {/* Block 3: Bảo mật & Trạng thái */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/70 rounded-2xl space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-slate-600" />
              3. Bảo Mật & Trạng Thái
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mật khẩu khởi tạo</label>
                <input
                  type="text"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">Mặc định ban đầu hoặc đổi mật khẩu mới</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Trạng thái hoạt động</label>
                <CustomSelect
                  options={[
                    { value: 'ACTIVE', label: 'Kích hoạt (Hoạt động)' },
                    { value: 'INACTIVE', label: 'Tạm khóa (Không thể đăng nhập)' },
                  ]}
                  value={userStatus}
                  onChange={(val) => setUserStatus(val as 'ACTIVE' | 'INACTIVE')}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsUserModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit">
              {editingUser ? 'Lưu thay đổi' : 'Tạo nhân viên'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL TẠO / SỬA PHÂN QUYỀN (RBAC) ================= */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={editingRole ? 'Chỉnh Sửa Phân Quyền Vai Trò' : 'Tạo Mới Phân Quyền Vai Trò'}
        subtitle="Cấu hình tên vai trò và tích chọn các quyền hạn nghiệp vụ cho nhân viên"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên vai trò *</label>
              <input
                type="text"
                required
                placeholder="VD: Quản Lý Kho, Tổ Trưởng Sảnh..."
                value={roleName}
                onChange={(e) => handleRoleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mã vai trò (Code) *</label>
              <input
                type="text"
                required
                placeholder="VD: INVENTORY_MANAGER"
                value={roleCode}
                onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
                disabled={editingRole?.isSystem}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs uppercase disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả chức năng</label>
            <input
              type="text"
              placeholder="VD: Chịu trách nhiệm kiểm kê hàng hóa, nhập xuất kho..."
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Permissions Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Ma Trận Phân Quyền Chi Tiết ({rolePermissions.length} quyền đã chọn)
              </label>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {permissionGroups.map((group) => {
                const groupPermIds = group.permissions.map((p) => p.id);
                const hasAll = groupPermIds.every((id) => rolePermissions.includes(id));
                const hasSome = groupPermIds.some((id) => rolePermissions.includes(id));

                return (
                  <div key={group.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#176044] flex items-center gap-1.5">
                        <span>{group.icon}</span>
                        <span>{group.groupName}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleGroupPermissions(group)}
                        className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                      >
                        {hasAll ? 'Bỏ chọn nhóm' : 'Chọn toàn bộ'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.permissions.map((perm) => {
                        const checked = rolePermissions.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                              checked
                                ? 'bg-white border-[#176044] shadow-xs'
                                : 'bg-white/60 border-slate-200 hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="mt-0.5 rounded text-[#176044] focus:ring-emerald-600"
                            />
                            <div className="min-w-0">
                              <strong className="font-bold text-slate-900 block leading-tight">
                                {perm.name}
                              </strong>
                              <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
                                {perm.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsRoleModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit">
              {editingRole ? 'Lưu thay đổi phân quyền' : 'Tạo mới phân quyền'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL ĐIỀU CHUYỂN NHÂN SỰ GIỮA CHI NHÁNH ================= */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Điều Chuyển Chi Nhánh Làm Việc"
        subtitle="Chuyển giao quyền hạn và dữ liệu nhân sự sang chi nhánh mới trong chuỗi"
        maxWidth="md"
      >
        {transferUser && (
          <form onSubmit={handleConfirmTransfer} className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Nhân viên:</span>
                <strong className="text-slate-900 font-bold">{transferUser.fullName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Email:</span>
                <span className="text-slate-700">{transferUser.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Chi nhánh hiện tại:</span>
                <span className="text-[#176044] font-bold">
                  {transferUser.branchName || 'Chi nhánh chính'}
                </span>
              </div>
            </div>

            {transferMsg && (
              <div
                className={`p-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
                  transferMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {transferMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{transferMsg.text}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Chọn chi nhánh tiếp nhận *
              </label>
              <CustomSelect
                options={branches
                  .filter((b) => (b._id || b.id) !== transferUser.branchId)
                  .map((b) => ({
                    value: (b._id || b.id) as string,
                    label: b.name,
                    sublabel: b.address,
                    badge: b.isMainBranch ? 'Trụ sở chính HQ' : undefined,
                  }))}
                value={targetBranchId}
                onChange={(val) => setTargetBranchId(val)}
                placeholder="-- Chọn chi nhánh tiếp nhận --"
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl">
              💡 <strong>Lưu ý:</strong> Sau khi điều chuyển, nhân sự sẽ được cấp lại phạm vi dữ liệu theo chi
              nhánh mới. Chỉ Chủ nhà hàng/Trụ sở chính mới có quyền thực hiện thao tác này.
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                disabled={transferLoading}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={transferLoading || !targetBranchId}
                icon={transferLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
              >
                {transferLoading ? 'Đang điều chuyển...' : 'Xác nhận điều chuyển'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
