'use client';

import React, { useState, useEffect } from 'react';
import { storageService, apiClient } from '@imenu/utils';
import { User, RoleDefinition, PermissionGroup, UserRole, RestaurantBranch } from '@imenu/types';
import { Card, Button, Badge, Modal } from '@imenu/ui';
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
} from 'lucide-react';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>([]);
  const [restaurant, setRestaurant] = useState(storageService.getRestaurant());
  const [branches, setBranches] = useState<RestaurantBranch[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(storageService.getCurrentUser());
  const [staffLoading, setStaffLoading] = useState<boolean>(false);

  // Search & Filter state for Users
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Cross-Branch Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferUser, setTransferUser] = useState<User | null>(null);
  const [targetBranchId, setTargetBranchId] = useState<string>('');
  const [transferLoading, setTransferLoading] = useState<boolean>(false);
  const [transferMsg, setTransferMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add/Edit User Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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

  const isMainBranchUser = Boolean(currentUser?.isMainBranch);

  const loadStaffData = async (bFilter = branchFilter) => {
    setStaffLoading(true);
    try {
      const res = await apiClient.staff.list({
        branchId: bFilter !== 'all' ? bFilter : undefined,
        search: searchTerm || undefined,
      });
      if (res?.data) {
        const staffList = Array.isArray(res.data) ? res.data : res.data.items || [];
        if (staffList.length > 0) {
          setUsers(staffList);
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      setStaffLoading(false);
    }
    setUsers(storageService.getUsers());
  };

  const loadBranches = async () => {
    try {
      const res = await apiClient.branches.list();
      if (res.data && Array.isArray(res.data)) {
        setBranches(res.data);
      } else if (restaurant.branches) {
        setBranches(restaurant.branches);
      }
    } catch {
      if (restaurant.branches) {
        setBranches(restaurant.branches);
      }
    }
  };

  useEffect(() => {
    setCurrentUser(storageService.getCurrentUser());
    setRoles(storageService.getRoles());
    setPermissionGroups(storageService.getPermissionGroups());
    setRestaurant(storageService.getRestaurant());
    loadBranches();
    loadStaffData();
  }, []);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesBranch =
      branchFilter === 'all' ||
      u.branchId === branchFilter ||
      (branches.find((b) => (b._id || b.id) === branchFilter)?.name === u.branchName);
    return matchesSearch && matchesRole && matchesStatus && matchesBranch;
  });

  // Open Add/Edit User Modal
  const handleOpenUserModal = (usr?: User) => {
    if (usr) {
      setEditingUser(usr);
      setUserFullName(usr.fullName);
      setUserEmail(usr.email);
      setUserPhone(usr.phone);
      setUserRole(usr.role);
      setUserBranch(usr.branchName || branches[0]?.name || 'Chi nhánh Quận 1 (Chính)');
      setUserBranchId(usr.branchId || branches[0]?._id || branches[0]?.id || '');
      setUserPassword('••••••');
      setUserStatus(usr.status || 'ACTIVE');
    } else {
      setEditingUser(null);
      setUserFullName('');
      setUserEmail('');
      setUserPhone('');
      setUserRole('CASHIER');
      const defaultBranch = branches[0];
      setUserBranch(defaultBranch?.name || 'Chi nhánh Quận 1 (Chính)');
      setUserBranchId(defaultBranch?._id || defaultBranch?.id || '');
      setUserPassword('123456');
      setUserStatus('ACTIVE');
    }
    setIsUserModalOpen(true);
  };

  // Open Transfer Modal
  const handleOpenTransferModal = (usr: User) => {
    setTransferUser(usr);
    setTransferMsg(null);
    // Default target branch to another branch
    const otherBranch = branches.find((b) => (b._id || b.id) !== usr.branchId);
    setTargetBranchId(otherBranch?._id || otherBranch?.id || '');
    setIsTransferModalOpen(true);
  };

  // Confirm Staff Transfer
  const handleConfirmTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferUser || !targetBranchId) return;
    setTransferLoading(true);
    setTransferMsg(null);

    try {
      await apiClient.staff.transfer(transferUser.id, targetBranchId);
      const targetB = branches.find((b) => (b._id || b.id) === targetBranchId);
      setTransferMsg({
        type: 'success',
        text: `Đã điều chuyển nhân viên "${transferUser.fullName}" sang "${targetB?.name || 'Chi nhánh mới'}" thành công!`,
      });
      // Cập nhật state cục bộ
      const updated = users.map((u) =>
        u.id === transferUser.id
          ? {
              ...u,
              branchId: targetBranchId,
              branchName: targetB?.name || u.branchName,
            }
          : u
      );
      setUsers(updated);
      storageService.saveUsers(updated);
      setTimeout(() => {
        setIsTransferModalOpen(false);
        setTransferMsg(null);
      }, 1500);
    } catch (err: any) {
      setTransferMsg({
        type: 'error',
        text: err.message || 'Không thể điều chuyển nhân sự giữa các chi nhánh',
      });
    } finally {
      setTransferLoading(false);
    }
  };

  // Save User Submit
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName.trim() || !userEmail.trim()) return;

    try {
      if (editingUser) {
        await apiClient.staff.update(editingUser.id, {
          fullName: userFullName.trim(),
          phone: userPhone.trim(),
          role: userRole,
          status: userStatus,
        }).catch(() => {});

        const updated = users.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                fullName: userFullName.trim(),
                email: userEmail.trim(),
                phone: userPhone.trim(),
                role: userRole as UserRole,
                branchName: userBranch,
                branchId: userBranchId,
                status: userStatus,
              }
            : u
        );
        setUsers(updated);
        storageService.saveUsers(updated);
      } else {
        const createPayload = {
          fullName: userFullName.trim(),
          email: userEmail.trim(),
          phone: userPhone.trim(),
          role: userRole,
          branchId: userBranchId || undefined,
          password: userPassword || '123456',
        };

        const res = await apiClient.staff.create(createPayload).catch(() => null);

        const newUser: User = {
          id: res?.data?.id || res?.data?._id || `usr-${Date.now()}`,
          fullName: userFullName.trim(),
          email: userEmail.trim(),
          phone: userPhone.trim(),
          role: userRole as UserRole,
          branchName: userBranch,
          branchId: userBranchId,
          status: userStatus,
          createdAt: new Date().toISOString(),
        };
        const updated = [newUser, ...users];
        setUsers(updated);
        storageService.saveUsers(updated);
      }
      setIsUserModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi lưu thông tin nhân viên');
    }
  };

  // Toggle User Status (Lock/Unlock)
  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
        return { ...u, status: nextStatus as 'ACTIVE' | 'INACTIVE' };
      }
      return u;
    });
    setUsers(updated);
    storageService.saveUsers(updated);
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    if (confirm('Bạn có chắc muốn xóa nhân viên này khỏi hệ thống?')) {
      const updated = users.filter((u) => u.id !== userId);
      setUsers(updated);
      storageService.saveUsers(updated);
    }
  };

  // Open Add/Edit Role Modal
  const handleOpenRoleModal = (rl?: RoleDefinition) => {
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
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleCode.trim()) return;

    let updated: RoleDefinition[];
    if (editingRole) {
      updated = roles.map((r) =>
        r.id === editingRole.id
          ? {
              ...r,
              name: roleName.trim(),
              code: roleCode.trim(),
              description: roleDescription.trim(),
              permissions: rolePermissions,
            }
          : r
      );
    } else {
      const newRole: RoleDefinition = {
        id: `role-${Date.now()}`,
        code: roleCode.trim(),
        name: roleName.trim(),
        description: roleDescription.trim() || 'Vai trò tùy chỉnh',
        isSystem: false,
        color: '#124a36',
        permissions: rolePermissions,
        createdAt: new Date().toISOString(),
      };
      updated = [...roles, newRole];
    }

    setRoles(updated);
    storageService.saveRoles(updated);
    setIsRoleModalOpen(false);
  };

  // Delete Custom Role
  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = roles.find((r) => r.id === roleId);
    if (!roleToDelete) return;
    if (roleToDelete.isSystem) {
      alert('Không thể xóa vai trò mặc định của hệ thống!');
      return;
    }
    const usersWithRole = users.filter((u) => u.role === roleToDelete.code);
    if (usersWithRole.length > 0) {
      alert(`Đang có ${usersWithRole.length} nhân viên thuộc vai trò này. Hãy chuyển vai trò của họ trước khi xóa!`);
      return;
    }
    if (confirm(`Bạn có chắc muốn xóa vai trò "${roleToDelete.name}"?`)) {
      const updated = roles.filter((r) => r.id !== roleId);
      setRoles(updated);
      storageService.saveRoles(updated);
    }
  };

  const getRoleBadge = (roleCode: string) => {
    const r = roles.find((item) => item.code === roleCode);
    const roleName = r ? r.name : roleCode;
    switch (roleCode) {
      case 'RESTAURANT_ADMIN':
        return <Badge variant="brand">{roleName}</Badge>;
      case 'RESTAURANT_MANAGER':
        return <Badge variant="neutral">{roleName}</Badge>;
      case 'CASHIER':
        return <Badge variant="amber">{roleName}</Badge>;
      case 'KITCHEN':
        return <Badge variant="danger">{roleName}</Badge>;
      case 'WAITER':
        return <Badge variant="neutral">{roleName}</Badge>;
      default:
        return <Badge variant="brand">{roleName}</Badge>;
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
              className="cursor-pointer shadow-md"
            >
              Thêm nhân viên mới
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<ShieldCheck className="w-4 h-4" />}
              onClick={() => handleOpenRoleModal()}
              className="cursor-pointer shadow-md"
            >
              + Tạo mới phân quyền
            </Button>
          )}
        </div>
      </div>

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
            {users.length}
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
            {roles.length}
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
                placeholder="Tìm kiếm theo Tên, Email hoặc SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                <option value="all">Tất cả vai trò</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm khóa</option>
              </select>

              {isMainBranchUser && branches.length > 0 && (
                <select
                  value={branchFilter}
                  onChange={(e) => {
                    setBranchFilter(e.target.value);
                    loadStaffData(e.target.value);
                  }}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-semibold text-[#176044]"
                >
                  <option value="all">🏢 Tất cả chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.name} {b.isMainBranch ? '(HQ)' : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Staff List Cards */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-sm font-bold">Không tìm thấy nhân viên phù hợp</p>
                <p className="text-xs">Vui lòng thử từ khóa tìm kiếm hoặc bộ lọc khác</p>
              </div>
            ) : (
              filteredUsers.map((usr) => {
                const isActive = usr.status !== 'INACTIVE';
                return (
                  <Card
                    key={usr.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#09271d] to-[#176044] text-white font-black grid place-items-center text-sm shrink-0 shadow-xs">
                        {usr.fullName.charAt(0)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-sm font-extrabold text-slate-900 block truncate">
                            {usr.fullName}
                          </strong>
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
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {usr.phone}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            <Building2 className="w-3 h-3 text-emerald-700" />
                            {usr.branchName || 'Chi nhánh chính'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                      {/* Nút Điều chuyển chi nhánh (Chỉ Trụ sở chính / Admin) */}
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
                    </div>
                  </Card>
                );
              })
            )}
          </div>
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

            {/* <Button
              variant="outline"
              icon={<Plus className="w-4 h-4 text-[#176044]" />}
              onClick={() => handleOpenRoleModal()}
              className="cursor-pointer text-xs"
            >
              + Tạo mới phân quyền
            </Button> */}
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {roles.map((r) => {
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
                      <button
                        onClick={() => handleOpenRoleModal(r)}
                        className="p-1.5 text-slate-500 hover:text-[#176044] hover:bg-emerald-50 rounded-lg cursor-pointer"
                        title="Chỉnh sửa quyền hạn"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!r.isSystem && (
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
                      <span>{userCount} nhân sự đang giữ vai trò này</span>
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
        maxWidth="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Họ và tên nhân viên *</label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn Nam"
              value={userFullName}
              onChange={(e) => setUserFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email đăng nhập *</label>
              <input
                type="email"
                required
                placeholder="nam.nguyen@sample.vn"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại *</label>
              <input
                type="tel"
                required
                placeholder="0901234567"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Vai trò phân quyền *</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.code}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Chi nhánh làm việc *</label>
              <select
                value={userBranchId}
                onChange={(e) => {
                  const bId = e.target.value;
                  setUserBranchId(bId);
                  const selectedB = branches.find((b) => (b._id || b.id) === bId);
                  setUserBranch(selectedB?.name || '');
                }}
                disabled={!isMainBranchUser && Boolean(currentUser?.branchId)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white disabled:bg-slate-100"
              >
                {branches.map((b) => (
                  <option key={b._id || b.id} value={b._id || b.id}>
                    {b.name} {b.isMainBranch ? '(HQ)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mật khẩu khởi tạo</label>
              <input
                type="text"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Trạng thái hoạt động</label>
              <select
                value={userStatus}
                onChange={(e) => setUserStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                <option value="ACTIVE">Kích hoạt (Hoạt động)</option>
                <option value="INACTIVE">Tạm khóa (Không thể đăng nhập)</option>
              </select>
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
              <select
                required
                value={targetBranchId}
                onChange={(e) => setTargetBranchId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              >
                <option value="" disabled>
                  -- Chọn chi nhánh tiếp nhận --
                </option>
                {branches
                  .filter((b) => (b._id || b.id) !== transferUser.branchId)
                  .map((b) => (
                    <option key={b._id || b.id} value={b._id || b.id}>
                      {b.name} {b.isMainBranch ? '(Trụ sở chính HQ)' : ''} - {b.address}
                    </option>
                  ))}
              </select>
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
