'use client';

import React, { useState, useEffect } from 'react';
import { apiClient, storageService } from '@imenu/utils';
import { RestaurantBranch, BranchStatus } from '@imenu/types';
import { Card, Button, StatusChip, useToast } from '@imenu/ui';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Store,
  Power,
  RotateCcw,
  Loader2,
  ShieldCheck,
  Calendar,
  Shield,
} from 'lucide-react';

export default function BranchesPage() {
  const toast = useToast();
  const [branches, setBranches] = useState<RestaurantBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(storageService.getCurrentUser());
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<RestaurantBranch | null>(null);

  // Form states
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isMainBranchUser = Boolean(user?.isMainBranch);
  const isDemo = Boolean(user?.isDemo || user?.email === 'owner@sample.vn');

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await apiClient.branches.list();
      if (res.data && Array.isArray(res.data)) {
        setBranches(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể tải danh sách chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(storageService.getCurrentUser());
    loadBranches();
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(text);
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 6000);
    }
  };

  // 1. Thêm chi nhánh mới
  const handleOpenAddModal = () => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể tạo chi nhánh.');
      return;
    }
    setBranchName('');
    setBranchAddress('');
    setBranchPhone('');
    setIsAddModalOpen(true);
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchAddress.trim() || !branchPhone.trim()) {
      toast.error('Vui lòng điền đầy đủ tên, địa chỉ và số điện thoại chi nhánh');
      return;
    }
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể tạo chi nhánh.');
      return;
    }
    setActionLoading(true);
    try {
      await apiClient.branches.create({
        name: branchName.trim(),
        address: branchAddress.trim(),
        phone: branchPhone.trim(),
      });
      setIsAddModalOpen(false);
      toast.success(`Đã tạo mới chi nhánh "${branchName}" thành công!`);
      showNotification('success', `Đã tạo mới chi nhánh "${branchName}" thành công!`);
      await loadBranches();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi tạo chi nhánh mới');
      showNotification('error', err.message || 'Lỗi tạo chi nhánh mới');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Chỉnh sửa chi nhánh
  const handleOpenEditModal = (b: RestaurantBranch) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể sửa chi nhánh.');
      return;
    }
    setSelectedBranch(b);
    setBranchName(b.name);
    setBranchAddress(b.address);
    setBranchPhone(b.phone);
    setIsEditModalOpen(true);
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể sửa chi nhánh.');
      return;
    }
    const branchId = selectedBranch._id || selectedBranch.id;
    setActionLoading(true);
    try {
      await apiClient.branches.update(branchId, {
        name: branchName.trim(),
        address: branchAddress.trim(),
        phone: branchPhone.trim(),
      });
      setIsEditModalOpen(false);
      toast.success(`Đã cập nhật chi nhánh "${branchName}"!`);
      showNotification('success', `Đã cập nhật chi nhánh "${branchName}"!`);
      await loadBranches();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật chi nhánh');
      showNotification('error', err.message || 'Lỗi cập nhật chi nhánh');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Tạm đóng cửa chi nhánh (Áp dụng cho cả chi nhánh chính và chi nhánh con)
  const handleOpenCloseModal = (b: RestaurantBranch) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể tạm đóng chi nhánh.');
      return;
    }
    setSelectedBranch(b);
    setActionReason(b.isMainBranch ? 'Hết giờ làm việc trong ngày' : '');
    setIsCloseModalOpen(true);
  };

  const handleConfirmClose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể tạm đóng chi nhánh.');
      return;
    }
    const branchId = selectedBranch._id || selectedBranch.id;
    setActionLoading(true);
    try {
      await apiClient.branches.close(branchId, actionReason.trim());
      setIsCloseModalOpen(false);
      toast.success(`Đã tạm đóng chi nhánh "${selectedBranch.name}"!`);
      showNotification('success', `Đã tạm đóng chi nhánh "${selectedBranch.name}"!`);
      await loadBranches();
    } catch (err: any) {
      toast.error(err.message || 'Không thể tạm đóng chi nhánh');
      showNotification('error', err.message || 'Không thể tạm đóng chi nhánh');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Mở cửa trở lại
  const handleReopenBranch = async (b: RestaurantBranch) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể mở lại chi nhánh.');
      return;
    }
    const branchId = b._id || b.id;
    setActionLoading(true);
    try {
      await apiClient.branches.reopen(branchId);
      toast.success(`Chi nhánh "${b.name}" đã mở cửa hoạt động trở lại!`);
      showNotification('success', `Chi nhánh "${b.name}" đã mở cửa hoạt động trở lại!`);
      await loadBranches();
    } catch (err: any) {
      toast.error(err.message || 'Không thể mở cửa chi nhánh');
      showNotification('error', err.message || 'Không thể mở cửa chi nhánh');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Ngừng hoạt động (INACTIVE)
  const handleOpenDeactivateModal = (b: RestaurantBranch) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể ngừng hoạt động chi nhánh.');
      return;
    }
    if (b.isMainBranch) {
      toast.error('Không thể ngừng hoạt động vĩnh viễn chi nhánh chính.');
      return;
    }
    setSelectedBranch(b);
    setActionReason('');
    setIsDeactivateModalOpen(true);
  };

  const handleConfirmDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể ngừng hoạt động chi nhánh.');
      return;
    }
    const branchId = selectedBranch._id || selectedBranch.id;
    setActionLoading(true);
    try {
      await apiClient.branches.deactivate(branchId, actionReason.trim());
      setIsDeactivateModalOpen(false);
      toast.success(`Đã chuyển chi nhánh "${selectedBranch.name}" sang trạng thái Ngừng hoạt động!`);
      showNotification('success', `Đã chuyển chi nhánh "${selectedBranch.name}" sang trạng thái Ngừng hoạt động!`);
      await loadBranches();
    } catch (err: any) {
      toast.error(err.message || 'Không thể ngừng hoạt động chi nhánh');
      showNotification('error', err.message || 'Không thể ngừng hoạt động chi nhánh');
    } finally {
      setActionLoading(false);
    }
  };

  // 6. Xóa chi nhánh (với kiểm tra lịch sử đơn)
  const handleDeleteBranch = async (b: RestaurantBranch) => {
    if (isDemo) {
      toast.error('Tài khoản trải nghiệm (Demo) chỉ có quyền xem, không thể xóa chi nhánh.');
      return;
    }
    if (b.isMainBranch) {
      toast.error('Không thể xóa chi nhánh chính.');
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${b.name}" không?`)) {
      return;
    }

    const branchId = b._id || b.id;
    try {
      await apiClient.branches.delete(branchId);
      toast.success(`Đã xóa chi nhánh "${b.name}" thành công!`);
      showNotification('success', `Đã xóa chi nhánh "${b.name}" thành công!`);
      await loadBranches();
    } catch (err: any) {
      // Bắt lỗi lịch sử đơn hàng
      if (err.message && err.message.includes('lịch sử')) {
        if (
          confirm(
            `${err.message}\n\nBạn có muốn chuyển chi nhánh này sang trạng thái "Ngừng hoạt động (INACTIVE)" thay vì xóa không?`,
          )
        ) {
          handleOpenDeactivateModal(b);
        }
      } else {
        toast.error(err.message || 'Không thể xóa chi nhánh');
        showNotification('error', err.message || 'Không thể xóa chi nhánh');
      }
    }
  };

  const totalBranches = branches.length;
  const activeCount = branches.filter((b) => !b.status || b.status === 'ACTIVE').length;
  const closedCount = branches.filter((b) => b.status === 'TEMPORARILY_CLOSED').length;
  const inactiveCount = branches.filter((b) => b.status === 'INACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d] flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#176044]" /> Quản Lý Hệ Thống Chi Nhánh
          </h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Quản trị mạng lưới chi nhánh, giám sát vòng đời hoạt động và đảm bảo bất biến trụ sở chính
          </p>
        </div>

        {isMainBranchUser && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Thêm chi nhánh mới
          </Button>
        )}
      </div>

      {/* Demo Account Notice */}
      {isDemo && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-amber-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 grid place-items-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Chế độ trải nghiệm (Demo Account)</p>
              <p className="text-xs text-amber-700/90">
                Bạn đang xem dữ liệu hệ thống chi nhánh với quyền xem mẫu. Thao tác thêm chi nhánh, chỉnh sửa, đóng/mở và xóa đã được bảo vệ an toàn.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-200/70 text-amber-900">
            Chỉ xem (View Only)
          </span>
        </div>
      )}

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 font-semibold animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500">Tổng số chi nhánh</span>
            <div className="text-2xl font-black text-[#09271d]">{totalBranches}</div>
            <span className="text-[10px] text-slate-400">Quy mô toàn chuỗi</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 grid place-items-center">
            <Store className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500">Đang hoạt động</span>
            <div className="text-2xl font-black text-[#176044]">{activeCount}</div>
            <span className="text-[10px] text-emerald-600 font-bold">Mở cửa đón khách</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#176044] grid place-items-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500">Tạm đóng cửa</span>
            <div className="text-2xl font-black text-amber-600">{closedCount}</div>
            <span className="text-[10px] text-amber-600 font-bold">Bảo trì / Tạm nghỉ</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 grid place-items-center">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500">Ngừng hoạt động</span>
            <div className="text-2xl font-black text-slate-500">{inactiveCount}</div>
            <span className="text-[10px] text-slate-400">Lưu trữ kế toán</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 grid place-items-center">
            <Power className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Branch Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#176044]" /> Đang tải danh sách chi nhánh...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {branches.map((branch) => {
            const branchId = branch._id || branch.id;
            const status = branch.status || 'ACTIVE';
            const isMain = branch.isMainBranch;

            return (
              <Card
                key={branchId}
                className={`p-5 flex flex-col justify-between space-y-4 border transition-all ${
                  isMain
                    ? 'border-amber-300 bg-linear-to-b from-amber-50/40 via-white to-white shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Name & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 truncate">{branch.name}</h3>
                      </div>
                      {isMain ? (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-bold">
                          <Lock className="w-3 h-3 text-amber-700" /> Trụ sở chính (HQ)
                        </span>
                      ) : (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          Chi nhánh con
                        </span>
                      )}
                    </div>

                    <StatusChip status={status} size="sm" />
                  </div>

                  {/* Details: Address & Phone */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  </div>

                  {/* Status Notes for Closed or Inactive */}
                  {status !== 'ACTIVE' && branch.closedReason && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="font-semibold text-slate-700">Lý do: {branch.closedReason}</div>
                      {branch.closedAt && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(branch.closedAt).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEditModal(branch)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1 font-semibold"
                    title="Chỉnh sửa thông tin chi nhánh"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Sửa
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Lifecycle Buttons */}
                    {status === 'ACTIVE' ? (
                      <button
                        onClick={() => handleOpenCloseModal(branch)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                        title={isMain ? 'Tạm đóng cửa chi nhánh chính (hết giờ làm việc)' : 'Tạm đóng cửa chi nhánh'}
                      >
                        <Clock className="w-3.5 h-3.5" /> Tạm đóng
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReopenBranch(branch)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                        title="Mở cửa hoạt động trở lại"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Mở lại
                      </button>
                    )}

                    {/* Delete / Deactivate for Child branches */}
                    {!isMain && (
                      <>
                        {status !== 'INACTIVE' && (
                          <button
                            onClick={() => handleOpenDeactivateModal(branch)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="Ngừng hoạt động chi nhánh"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteBranch(branch)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa chi nhánh"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Thêm Chi Nhánh Mới */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#176044] grid place-items-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Thêm Chi Nhánh Mới</h3>
                <p className="text-xs text-slate-500">Mở rộng mạng lưới phục vụ của nhà hàng</p>
              </div>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên chi nhánh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chi nhánh Quận 3 - Nam Kỳ Khởi Nghĩa"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ chi nhánh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, đường, phường, quận/huyện, thành phố"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại hotline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="0908 xxx xxx"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-[#176044] hover:bg-[#124a36] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Tạo chi nhánh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Chi Nhánh */}
      {isEditModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 grid place-items-center shrink-0">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Chỉnh Sửa Chi Nhánh</h3>
                <p className="text-xs text-slate-500">{selectedBranch.name}</p>
              </div>
            </div>

            <form onSubmit={handleUpdateBranch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên chi nhánh</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  required
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  required
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-[#176044] hover:bg-[#124a36] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tạm Đóng Cửa Chi Nhánh */}
      {isCloseModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 grid place-items-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Tạm Đóng Cửa Chi Nhánh</h3>
                <p className="text-xs text-slate-500">{selectedBranch.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Chi nhánh sẽ chuyển sang trạng thái <strong>Tạm đóng cửa</strong>. Lưu ý hệ thống sẽ chặn thao tác nếu chi
              nhánh còn đơn hàng đang phục vụ chưa thanh toán.
            </p>

            <form onSubmit={handleConfirmClose} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do tạm đóng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Vệ sinh định kỳ, Nâng cấp cơ sở vật chất..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Xác nhận tạm đóng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ngừng Hoạt Động Chi Nhánh */}
      {isDeactivateModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 grid place-items-center shrink-0">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ngừng Hoạt Động Chi Nhánh</h3>
                <p className="text-xs text-slate-500">{selectedBranch.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Chi nhánh sẽ chuyển sang trạng thái <strong>Ngừng hoạt động (INACTIVE)</strong>. Toàn bộ đơn hàng và lịch
              sử doanh thu vẫn được bảo toàn nguyên vẹn trong báo cáo tài chính.
            </p>

            <form onSubmit={handleConfirmDeactivate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lý do ngừng hoạt động (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Kết thúc hợp đồng thuê mặt bằng..."
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#176044] outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeactivateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Xác nhận ngừng hoạt động
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
