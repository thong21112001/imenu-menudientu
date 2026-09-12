'use client';

import React, { useState, useEffect } from 'react';
import { storageService } from '@imenu/utils';
import { Table, Restaurant, TableZone } from '@imenu/types';
import { Card, Button, QrCodeRenderer, Badge, Modal } from '@imenu/ui';
import {
  Printer,
  Download,
  QrCode,
  Filter,
  Wifi,
  Sparkles,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Plus,
  Search,
  RotateCw,
  Edit2,
  Trash2,
  Copy,
  Check,
  Ban,
  ShieldCheck,
  AlertCircle,
  X,
  Lock,
  Layers,
  MapPin,
} from 'lucide-react';

export default function QrCodesGeneratorPage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(storageService.getRestaurant());
  const [tables, setTables] = useState<Table[]>([]);
  const [zones, setZones] = useState<TableZone[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedQrStatus, setSelectedQrStatus] = useState<'all' | 'active' | 'revoked'>('all');
  const [printSize, setPrintSize] = useState<'A6' | 'STICKER'>('A6');

  // Printing state
  const [printingTableId, setPrintingTableId] = useState<string | null>(null);

  // Copy feedback state
  const [copiedTableId, setCopiedTableId] = useState<string | null>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modal 1: Add New Table & QR
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTableName, setNewTableName] = useState<string>('');
  const [newTableCode, setNewTableCode] = useState<string>('');
  const [newTableZoneId, setNewTableZoneId] = useState<string>('zone-1');
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);
  const [newWifiSsid, setNewWifiSsid] = useState<string>('BepNha_Free');
  const [newWifiPassword, setNewWifiPassword] = useState<string>('bepnha88');
  // Custom Zone inline in Add modal
  const [isCustomZoneInAdd, setIsCustomZoneInAdd] = useState<boolean>(false);
  const [customZoneNameInAdd, setCustomZoneNameInAdd] = useState<string>('');

  // Modal 2: Edit Table & QR
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [editTableName, setEditTableName] = useState<string>('');
  const [editTableCode, setEditTableCode] = useState<string>('');
  const [editTableZoneId, setEditTableZoneId] = useState<string>('zone-1');
  const [editTableCapacity, setEditTableCapacity] = useState<number>(4);
  const [editWifiSsid, setEditWifiSsid] = useState<string>('');
  const [editWifiPassword, setEditWifiPassword] = useState<string>('');
  const [editQrStatus, setEditQrStatus] = useState<'active' | 'revoked'>('active');
  // Custom Zone inline in Edit modal
  const [isCustomZoneInEdit, setIsCustomZoneInEdit] = useState<boolean>(false);
  const [customZoneNameInEdit, setCustomZoneNameInEdit] = useState<string>('');

  // Modal 3: Revoke / Delete Confirmation
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [targetTable, setTargetTable] = useState<Table | null>(null);

  // Modal 4: Zone Management (Tạo / Sửa / Xóa Khu Vực Bàn)
  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [zoneInputName, setZoneInputName] = useState<string>('');
  const [editingZone, setEditingZone] = useState<TableZone | null>(null);

  useEffect(() => {
    setRestaurant(storageService.getRestaurant());
    setTables(storageService.getTables());
    setZones(storageService.getZones());
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper: Get zone name
  const getZoneName = (zoneId: string): string => {
    const found = zones.find((z) => z.id === zoneId);
    return found ? found.name : 'Tầng 1';
  };

  // Helper: Build QR Table URL
  const getTableUrl = (tbl: Table): string => {
    if (tbl.customUrl) return tbl.customUrl;
    const tokenPart = tbl.qrToken ? `?t=${tbl.qrToken}` : '';
    return `http://localhost:3005/menu/bep-nha/${tbl.code}${tokenPart}`;
  };

  // Filtered Tables
  const filteredTables = tables.filter((tbl) => {
    const matchesSearch =
      tbl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tbl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tbl.zoneName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = selectedZone === 'all' || tbl.zoneId === selectedZone;

    const isRevoked = tbl.qrStatus === 'revoked';
    const matchesStatus =
      selectedQrStatus === 'all' ||
      (selectedQrStatus === 'revoked' && isRevoked) ||
      (selectedQrStatus === 'active' && !isRevoked);

    return matchesSearch && matchesZone && matchesStatus;
  });

  // Stats calculation
  const totalTablesCount = tables.length;
  const activeQrCount = tables.filter((t) => t.qrStatus !== 'revoked').length;
  const revokedQrCount = tables.filter((t) => t.qrStatus === 'revoked').length;

  // ================= ACTION HANDLERS (ZONE MANAGEMENT) =================

  const handleOpenZoneModal = (z?: TableZone) => {
    if (z) {
      setEditingZone(z);
      setZoneInputName(z.name);
    } else {
      setEditingZone(null);
      setZoneInputName('');
    }
    setIsZoneModalOpen(true);
  };

  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneInputName.trim()) return;

    if (editingZone) {
      // Update zone
      const updatedZones = zones.map((z) =>
        z.id === editingZone.id ? { ...z, name: zoneInputName.trim() } : z
      );
      setZones(updatedZones);
      storageService.saveZones(updatedZones);

      // Update table zoneName in tables as well
      const updatedTables = tables.map((t) =>
        t.zoneId === editingZone.id ? { ...t, zoneName: zoneInputName.trim() } : t
      );
      setTables(updatedTables);
      storageService.saveTables(updatedTables);

      showToast(`Đã đổi tên khu vực thành "${zoneInputName.trim()}"!`, 'success');
    } else {
      // Create new zone
      const newZoneId = `zone-${Date.now().toString().slice(-4)}`;
      const newZone: TableZone = {
        id: newZoneId,
        name: zoneInputName.trim(),
      };
      const updatedZones = [...zones, newZone];
      setZones(updatedZones);
      storageService.saveZones(updatedZones);
      showToast(`Đã tạo mới khu vực "${newZone.name}"!`, 'success');
    }

    setIsZoneModalOpen(false);
    setZoneInputName('');
  };

  const handleDeleteZone = (zoneId: string) => {
    const tablesInZone = tables.filter((t) => t.zoneId === zoneId);
    if (tablesInZone.length > 0) {
      alert(
        `Không thể xóa khu vực này vì đang có ${tablesInZone.length} bàn ăn thuộc khu vực này. Vui lòng chuyển các bàn sang khu vực khác trước.`
      );
      return;
    }

    if (confirm('Bạn có chắc chắn muốn xóa khu vực này?')) {
      const updatedZones = zones.filter((z) => z.id !== zoneId);
      setZones(updatedZones);
      storageService.saveZones(updatedZones);
      if (selectedZone === zoneId) setSelectedZone('all');
      showToast('Đã xóa khu vực!', 'info');
    }
  };

  // ================= ACTION HANDLERS (TABLE CRUD) =================

  // 1. Open Add Table Modal
  const handleOpenAddModal = () => {
    const nextIndex = tables.length + 1;
    const code = nextIndex < 10 ? `ban-0${nextIndex}` : `ban-${nextIndex}`;
    const name = nextIndex < 10 ? `Bàn 0${nextIndex}` : `Bàn ${nextIndex}`;

    setNewTableName(name);
    setNewTableCode(code);
    setNewTableZoneId(zones[0]?.id || 'zone-1');
    setNewTableCapacity(4);
    setNewWifiSsid('BepNha_Free');
    setNewWifiPassword('bepnha88');
    setIsCustomZoneInAdd(false);
    setCustomZoneNameInAdd('');
    setIsAddModalOpen(true);
  };

  // 2. Auto-slug for code
  const handleNewNameChange = (name: string) => {
    setNewTableName(name);
    const code = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setNewTableCode(code || `ban-${Date.now().toString().slice(-4)}`);
  };

  // 3. Submit Add Table & QR
  const handleCreateNewTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim() || !newTableCode.trim()) return;

    // Check duplicate code
    if (tables.some((t) => t.code.toLowerCase() === newTableCode.trim().toLowerCase())) {
      alert('Mã bàn này đã tồn tại! Vui lòng chọn mã khác.');
      return;
    }

    // Determine final zoneId & zoneName
    let finalZoneId = newTableZoneId;
    let finalZoneName = getZoneName(newTableZoneId);

    if (isCustomZoneInAdd && customZoneNameInAdd.trim()) {
      const newZoneId = `zone-${Date.now().toString().slice(-4)}`;
      const newZone: TableZone = {
        id: newZoneId,
        name: customZoneNameInAdd.trim(),
      };
      const updatedZones = [...zones, newZone];
      setZones(updatedZones);
      storageService.saveZones(updatedZones);
      finalZoneId = newZoneId;
      finalZoneName = newZone.name;
    }

    const randomToken = Math.random().toString(36).substring(2, 8);
    const newTable: Table = {
      id: `tbl-${Date.now()}`,
      code: newTableCode.trim().toLowerCase(),
      name: newTableName.trim(),
      zoneId: finalZoneId,
      zoneName: finalZoneName,
      capacity: newTableCapacity,
      status: 'Available',
      qrStatus: 'active',
      qrToken: randomToken,
      qrGeneratedAt: new Date().toISOString(),
      wifiSsid: newWifiSsid.trim() || 'BepNha_Free',
      wifiPassword: newWifiPassword.trim() || 'bepnha88',
    };

    const updated = [...tables, newTable];
    setTables(updated);
    storageService.saveTables(updated);
    setIsAddModalOpen(false);
    showToast(`Đã tạo thành công ${newTable.name} thuộc khu vực ${finalZoneName}!`, 'success');
  };

  // 4. Open Edit Table Modal
  const handleOpenEditModal = (tbl: Table) => {
    setEditingTable(tbl);
    setEditTableName(tbl.name);
    setEditTableCode(tbl.code);
    setEditTableZoneId(tbl.zoneId);
    setEditTableCapacity(tbl.capacity || 4);
    setEditWifiSsid(tbl.wifiSsid || 'BepNha_Free');
    setEditWifiPassword(tbl.wifiPassword || 'bepnha88');
    setEditQrStatus(tbl.qrStatus === 'revoked' ? 'revoked' : 'active');
    setIsCustomZoneInEdit(false);
    setCustomZoneNameInEdit('');
    setIsEditModalOpen(true);
  };

  // 5. Submit Update Table & QR
  const handleSaveEditTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editTableName.trim() || !editTableCode.trim()) return;

    if (
      tables.some(
        (t) => t.id !== editingTable.id && t.code.toLowerCase() === editTableCode.trim().toLowerCase()
      )
    ) {
      alert('Mã bàn này đã trùng với một bàn khác! Vui lòng chọn mã khác.');
      return;
    }

    let finalZoneId = editTableZoneId;
    let finalZoneName = getZoneName(editTableZoneId);

    if (isCustomZoneInEdit && customZoneNameInEdit.trim()) {
      const newZoneId = `zone-${Date.now().toString().slice(-4)}`;
      const newZone: TableZone = {
        id: newZoneId,
        name: customZoneNameInEdit.trim(),
      };
      const updatedZones = [...zones, newZone];
      setZones(updatedZones);
      storageService.saveZones(updatedZones);
      finalZoneId = newZoneId;
      finalZoneName = newZone.name;
    }

    const updated = tables.map((t) =>
      t.id === editingTable.id
        ? {
            ...t,
            name: editTableName.trim(),
            code: editTableCode.trim().toLowerCase(),
            zoneId: finalZoneId,
            zoneName: finalZoneName,
            capacity: editTableCapacity,
            wifiSsid: editWifiSsid.trim() || 'BepNha_Free',
            wifiPassword: editWifiPassword.trim() || 'bepnha88',
            qrStatus: editQrStatus,
          }
        : t
    );

    setTables(updated);
    storageService.saveTables(updated);
    setIsEditModalOpen(false);
    showToast(`Đã cập nhật thông tin mã QR cho ${editTableName.trim()}!`, 'success');
  };

  // 6. Regenerate QR Code for Single Table (Refresh Token)
  const handleRegenerateQR = (tableId: string) => {
    const tbl = tables.find((t) => t.id === tableId);
    if (!tbl) return;

    if (
      confirm(
        `Bạn có chắc chắn muốn cấp lại mã QR mới cho "${tbl.name}"?\nMã QR cũ sẽ hết hiệu lực, khách hàng quét mã cũ sẽ không thể đặt món.`
      )
    ) {
      const newToken = Math.random().toString(36).substring(2, 8);
      const updated = tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              qrToken: newToken,
              qrStatus: 'active' as const,
              qrGeneratedAt: new Date().toISOString(),
            }
          : t
      );

      setTables(updated);
      storageService.saveTables(updated);
      showToast(`Đã tạo mới mã QR bảo mật cho "${tbl.name}" thành công!`, 'success');
    }
  };

  // 7. Open Revoke/Delete Confirmation Modal
  const handleOpenRevokeModal = (tbl: Table) => {
    setTargetTable(tbl);
    setIsConfirmModalOpen(true);
  };

  // 8. Revoke QR (Disable QR but keep Table)
  const handleRevokeQR = () => {
    if (!targetTable) return;

    const updated = tables.map((t) =>
      t.id === targetTable.id ? { ...t, qrStatus: 'revoked' as const } : t
    );

    setTables(updated);
    storageService.saveTables(updated);
    setIsConfirmModalOpen(false);
    showToast(`Đã thu hồi mã QR của "${targetTable.name}". Mã quét hiện đã bị vô hiệu hóa!`, 'info');
  };

  // 9. Reactivate QR (Re-enable revoked QR)
  const handleReactivateQR = (tableId: string) => {
    const tbl = tables.find((t) => t.id === tableId);
    if (!tbl) return;

    const newToken = Math.random().toString(36).substring(2, 8);
    const updated = tables.map((t) =>
      t.id === tableId
        ? {
            ...t,
            qrStatus: 'active' as const,
            qrToken: newToken,
            qrGeneratedAt: new Date().toISOString(),
          }
        : t
    );

    setTables(updated);
    storageService.saveTables(updated);
    showToast(`Đã kích hoạt lại mã QR cho "${tbl.name}"!`, 'success');
  };

  // 10. Completely Delete Table & QR
  const handleDeleteTable = () => {
    if (!targetTable) return;

    const updated = tables.filter((t) => t.id !== targetTable.id);
    setTables(updated);
    storageService.saveTables(updated);
    setIsConfirmModalOpen(false);
    showToast(`Đã xóa hoàn toàn "${targetTable.name}" và mã QR khỏi hệ thống!`, 'success');
  };

  // 11. Copy URL
  const handleCopyUrl = (tbl: Table) => {
    const url = getTableUrl(tbl);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedTableId(tbl.id);
      setTimeout(() => setCopiedTableId(null), 2500);
      showToast(`Đã sao chép liên kết ${tbl.name}!`, 'info');
    }
  };

  // 12. Download QR Image
  const handleDownloadQR = (tbl: Table) => {
    const url = getTableUrl(tbl);
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(url)}&margin=2`;

    const a = document.createElement('a');
    a.href = qrImgSrc;
    a.target = '_blank';
    a.download = `IMENU_QR_${tbl.code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Đang tải ảnh mã QR của ${tbl.name}...`, 'info');
  };

  // 13. Print Handling
  const handlePrint = (singleTableId?: string) => {
    if (singleTableId) {
      setPrintingTableId(singleTableId);
      setTimeout(() => {
        window.print();
        setPrintingTableId(null);
      }, 100);
    } else {
      setPrintingTableId(null);
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  const printableTables = printingTableId
    ? tables.filter((t) => t.id === printingTableId)
    : filteredTables;

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
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

      {/* ================= HEADER BAR ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#09271d] flex items-center gap-2">
            <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-[#176044] shrink-0" />
            <span className="truncate">Tạo & Quản Lý Mã QR Bàn Ăn</span>
          </h1>
          <p className="text-xs text-[#66736d] mt-0.5 line-clamp-1 sm:line-clamp-none">
            Quản lý cấp mới, cập nhật, thu hồi mã QR cho từng bàn và xuất in chuẩn Standee A6, Tem dán bàn
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <Button
            variant="outline"
            onClick={() => handlePrint()}
            icon={<Printer className="w-4 h-4 text-slate-600" />}
            className="cursor-pointer bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-2xs w-full sm:w-auto text-xs py-2 px-2.5 justify-center"
          >
            In toàn bộ ({filteredTables.length})
          </Button>

          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
            className="cursor-pointer shadow-md bg-[#124a36] hover:bg-[#09271d] w-full sm:w-auto text-xs py-2 px-2.5 justify-center"
          >
            + Thêm bàn & Tạo mã QR
          </Button>
        </div>
      </div>

      {/* ================= STATS SUMMARY CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full min-w-0">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#124a36] grid place-items-center font-bold shrink-0">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">Tổng số bàn QR</span>
            <strong className="text-base sm:text-xl font-black text-slate-900 block truncate">{totalTablesCount}</strong>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-700 grid place-items-center font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">Đang kích hoạt</span>
            <strong className="text-base sm:text-xl font-black text-emerald-700 block truncate">{activeQrCount}</strong>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 grid place-items-center font-bold shrink-0">
            <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">Đã thu hồi / Khóa</span>
            <strong className="text-base sm:text-xl font-black text-amber-700 block truncate">{revokedQrCount}</strong>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 text-slate-700 grid place-items-center font-bold shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 block truncate">Khu vực bàn</span>
            <strong className="text-base sm:text-xl font-black text-slate-900 block truncate">{zones.length}</strong>
          </div>
        </div>
      </div>

      {/* ================= SEARCH & CONTROL FILTER BAR ================= */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 w-full">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm theo Tên bàn (Bàn 01), mã (ban-01), khu vực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50/50 min-w-0"
            />
          </div>

          {/* QR Status Filter & Print format buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start shrink-0">
            <select
              value={selectedQrStatus}
              onChange={(e) => setSelectedQrStatus(e.target.value as any)}
              className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white font-bold text-slate-700 flex-1 sm:flex-initial"
            >
              <option value="all">Tất cả ({tables.length})</option>
              <option value="active">Kích hoạt ({activeQrCount})</option>
              <option value="revoked">Đã thu hồi ({revokedQrCount})</option>
            </select>

            {/* Print Size Selection */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setPrintSize('A6')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  printSize === 'A6'
                    ? 'bg-white text-[#124a36] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Standee A6
              </button>
              <button
                type="button"
                onClick={() => setPrintSize('STICKER')}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  printSize === 'STICKER'
                    ? 'bg-white text-[#124a36] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tem dán
              </button>
            </div>
          </div>
        </div>

        {/* ================= ZONE FILTER & DYNAMIC ZONE CREATION ================= */}
        <div className="border-t border-slate-100 pt-2.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-[#176044] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Phân loại khu vực bàn ({zones.length})</span>
            </span>

            {/* Quick Add Custom Zone Button */}
            <button
              onClick={() => handleOpenZoneModal()}
              className="text-xs font-bold text-[#176044] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tạo khu vực riêng mới
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 w-full min-w-0">
            <button
              onClick={() => setSelectedZone('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedZone === 'all'
                  ? 'bg-[#124a36] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Tất cả khu vực</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedZone === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tables.length}
              </span>
            </button>

            {zones.map((z) => {
              const count = tables.filter((t) => t.zoneId === z.id).length;
              const isSelected = selectedZone === z.id;
              return (
                <div key={z.id} className="inline-flex items-center gap-0.5 shrink-0 bg-slate-50 p-0.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setSelectedZone(z.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#124a36] text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>{z.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>

                  <button
                    onClick={() => handleOpenZoneModal(z)}
                    className="p-1 rounded-md text-slate-400 hover:text-[#176044] hover:bg-slate-200 transition-colors cursor-pointer"
                    title={`Sửa khu vực ${z.name}`}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {filteredTables.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-3 w-full min-w-0">
          <QrCode className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-extrabold text-slate-700">Không tìm thấy mã QR bàn phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thử tìm kiếm với từ khóa khác hoặc bấm nút bên dưới để tạo mới mã QR bàn ăn
          </p>
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
            className="cursor-pointer mx-auto"
          >
            Tạo mã QR bàn mới
          </Button>
        </div>
      )}

      {/* ================= PRINTABLE & PREVIEW CONTAINER ================= */}
      <div id="qr-print-area" className="w-full min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 print-qr-grid w-full min-w-0">
          {printableTables.map((tbl) => {
            const tableUrl = getTableUrl(tbl);
            const isRevoked = tbl.qrStatus === 'revoked';
            const isCopied = copiedTableId === tbl.id;

            return (
              <div
                key={tbl.id}
                className={`print-qr-card bg-white rounded-2xl border-2 transition-all flex flex-col justify-between items-center text-center p-4 sm:p-5 relative group min-w-0 w-full ${
                  isRevoked
                    ? 'border-amber-200/80 bg-amber-50/20'
                    : 'border-slate-200 hover:border-[#124a36]/40 hover:shadow-lg'
                }`}
              >
                {/* Brand Header */}
                <div className="space-y-1 w-full border-b border-slate-100 pb-2.5">
                  <div className="flex items-center justify-between gap-1 w-full">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#124a36] text-[10px] font-extrabold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate max-w-[110px]">{restaurant.name || 'Bếp Nhà'}</span>
                    </div>

                    {/* QR Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 ${
                        isRevoked
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isRevoked ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                      />
                      {isRevoked ? 'Đã thu hồi' : 'Hoạt động'}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-[#09271d] tracking-tight mt-1 truncate">
                    {tbl.name}
                  </h2>
                  <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500 truncate">
                    <span className="truncate">{tbl.zoneName}</span>
                    <span>•</span>
                    <span className="shrink-0">{tbl.capacity || 4} chỗ</span>
                  </div>
                </div>

                {/* QR Code Graphic Box */}
                <div className="my-3 w-full flex flex-col items-center justify-center">
                  {isRevoked ? (
                    <div className="w-[160px] h-[160px] rounded-2xl bg-slate-100 border-2 border-dashed border-amber-300 flex flex-col items-center justify-center p-3 text-center space-y-2">
                      <Lock className="w-7 h-7 text-amber-600" />
                      <span className="text-xs font-bold text-amber-900">Mã QR đã thu hồi</span>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        Khách không thể quét món vào bàn này
                      </p>
                      <button
                        onClick={() => handleReactivateQR(tbl.id)}
                        className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[10px] font-bold hover:bg-emerald-800 transition-colors cursor-pointer"
                      >
                        + Cấp mã QR mới
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-white rounded-2xl border-2 border-emerald-950/20 shadow-xs flex flex-col items-center justify-center">
                      <QrCodeRenderer value={tableUrl} size={145} title="" />
                    </div>
                  )}
                </div>

                {/* 3-Step Instruction Guide */}
                <div className="w-full bg-slate-50/90 rounded-xl p-2.5 text-slate-700 text-[11px] space-y-1 border border-slate-200/70 text-left">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Smartphone className="w-3.5 h-3.5 text-[#176044] shrink-0" />
                    <span>Hướng dẫn gọi món:</span>
                  </div>
                  <ol className="list-decimal list-inside text-[10px] text-slate-600 space-y-0.5 pl-0.5">
                    <li>Mở Camera điện thoại quét mã QR</li>
                    <li>Xem thực đơn & chọn món ưa thích</li>
                    <li>Xác nhận gửi đơn đến bếp tức thì</li>
                  </ol>
                </div>

                {/* Wi-Fi & System Footer Strip */}
                <div className="w-full pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1 text-slate-600 font-medium truncate">
                    <Wifi className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">Wi-Fi: {tbl.wifiSsid || 'BepNha_Free'}</span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 shrink-0 ml-1">
                    Pass: {tbl.wifiPassword || 'bepnha88'}
                  </span>
                </div>

                {/* ================= SCREEN-ONLY ACTION BAR ================= */}
                <div className="w-full pt-3 mt-1 screen-only border-t border-slate-100 space-y-2">
                  {/* Test Link & Quick Copy URL */}
                  <div className="flex items-center justify-between text-[11px]">
                    <a
                      href={tableUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#176044] hover:underline flex items-center gap-1"
                      title="Mở tab khách quét mã"
                    >
                      Test menu <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => handleCopyUrl(tbl)}
                      className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Sao chép liên kết bàn"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Operational Action Buttons (Regenerate, Edit, Revoke/Delete, Download) */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {/* 1. Regenerate QR token */}
                    <button
                      onClick={() => handleRegenerateQR(tbl.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                      title="Tạo lại mã QR bảo mật mới (Làm mới token)"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold">Làm mới</span>
                    </button>

                    {/* 2. Edit table info & QR */}
                    <button
                      onClick={() => handleOpenEditModal(tbl)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                      title="Chỉnh sửa thông tin bàn & mã QR"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold">Sửa</span>
                    </button>

                    {/* 3. Download QR Image */}
                    <button
                      onClick={() => handleDownloadQR(tbl)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                      title="Tải file ảnh mã QR PNG chất lượng cao"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold">Tải ảnh</span>
                    </button>

                    {/* 4. Revoke / Delete Table */}
                    <button
                      onClick={() => handleOpenRevokeModal(tbl)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5"
                      title="Thu hồi hoặc xóa mã QR bàn này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-bold">Xóa/Khóa</span>
                    </button>
                  </div>

                  {/* 5. Print Single Table Standee */}
                  <button
                    onClick={() => handlePrint(tbl.id)}
                    className="w-full py-1.5 px-3 rounded-xl bg-[#124a36] hover:bg-[#09271d] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> In Standee Bàn Này
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MODAL 1: TẠO BÀN & MÃ QR MỚI ================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tạo Mới Mã QR & Thêm Bàn Ăn"
        subtitle="Hệ thống sẽ tự động sinh mã định danh và token bảo mật để tạo QR Code tức thì"
        maxWidth="md"
      >
        <form onSubmit={handleCreateNewTable} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên bàn hiển thị *</label>
              <input
                type="text"
                required
                placeholder="VD: Bàn 13, Bàn VIP 02..."
                value={newTableName}
                onChange={(e) => handleNewNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mã code định danh *</label>
              <input
                type="text"
                required
                placeholder="VD: ban-13"
                value={newTableCode}
                onChange={(e) => setNewTableCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Zone Selection & Custom Zone creation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Khu vực bàn *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomZoneInAdd(!isCustomZoneInAdd)}
                  className="text-[11px] font-bold text-[#176044] hover:underline cursor-pointer"
                >
                  {isCustomZoneInAdd ? 'Chọn có sẵn' : '+ Tạo khu vực mới'}
                </button>
              </div>

              {isCustomZoneInAdd ? (
                <input
                  type="text"
                  required
                  placeholder="Nhập tên khu vực mới (VD: Tầng 3, Sân thượng...)"
                  value={customZoneNameInAdd}
                  onChange={(e) => setCustomZoneNameInAdd(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-400 bg-emerald-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                />
              ) : (
                <select
                  value={newTableZoneId}
                  onChange={(e) => setNewTableZoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số lượng ghế ngồi</label>
              <input
                type="number"
                min={1}
                max={50}
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(parseInt(e.target.value, 10) || 4)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Wi-Fi Info for Standee */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-600" /> Thông tin Wi-Fi in kèm thẻ bàn:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Tên Wi-Fi (SSID)</label>
                <input
                  type="text"
                  value={newWifiSsid}
                  onChange={(e) => setNewWifiSsid(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Mật khẩu Wi-Fi</label>
                <input
                  type="text"
                  value={newWifiPassword}
                  onChange={(e) => setNewWifiPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit">
              Tạo mã QR & Thêm bàn
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 2: CẬP NHẬT THÔNG TIN MÃ QR & BÀN ================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingTable ? `Cập Nhật Mã QR: ${editingTable.name}` : 'Cập Nhật Mã QR Bàn'}
        subtitle="Chỉnh sửa thông tin bàn, cấu hình Wi-Fi và trạng thái kích hoạt của mã QR"
        maxWidth="md"
      >
        <form onSubmit={handleSaveEditTable} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên bàn hiển thị *</label>
              <input
                type="text"
                required
                value={editTableName}
                onChange={(e) => setEditTableName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mã code định danh *</label>
              <input
                type="text"
                required
                value={editTableCode}
                onChange={(e) => setEditTableCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Zone Selection & Custom Zone creation */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Khu vực bàn *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomZoneInEdit(!isCustomZoneInEdit)}
                  className="text-[11px] font-bold text-[#176044] hover:underline cursor-pointer"
                >
                  {isCustomZoneInEdit ? 'Chọn có sẵn' : '+ Tạo khu vực mới'}
                </button>
              </div>

              {isCustomZoneInEdit ? (
                <input
                  type="text"
                  required
                  placeholder="Nhập tên khu vực mới..."
                  value={customZoneNameInEdit}
                  onChange={(e) => setCustomZoneNameInEdit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-400 bg-emerald-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                />
              ) : (
                <select
                  value={editTableZoneId}
                  onChange={(e) => setEditTableZoneId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số lượng ghế ngồi</label>
              <input
                type="number"
                min={1}
                max={50}
                value={editTableCapacity}
                onChange={(e) => setEditTableCapacity(parseInt(e.target.value, 10) || 4)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Trạng thái mã QR</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setEditQrStatus('active')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  editQrStatus === 'active'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Đang kích hoạt</span>
              </button>

              <button
                type="button"
                onClick={() => setEditQrStatus('revoked')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  editQrStatus === 'revoked'
                    ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Ban className="w-4 h-4 text-amber-600" />
                <span>Thu hồi / Tạm khóa</span>
              </button>
            </div>
          </div>

          {/* Wi-Fi Info for Standee */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-600" /> Thông tin Wi-Fi in kèm thẻ bàn:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Tên Wi-Fi (SSID)</label>
                <input
                  type="text"
                  value={editWifiSsid}
                  onChange={(e) => setEditWifiSsid(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Mật khẩu Wi-Fi</label>
                <input
                  type="text"
                  value={editWifiPassword}
                  onChange={(e) => setEditWifiPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit">
              Lưu thay đổi mã QR
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 3: XÁC NHẬN THU HỒI HOẶC XÓA MÃ QR ================= */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={targetTable ? `Tùy Chọn Xóa / Thu Hồi: ${targetTable.name}` : 'Xóa / Thu Hồi Mã QR'}
        subtitle="Chọn phương án xử lý mã QR phù hợp với nghiệp vụ vận hành của nhà hàng"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Lựa chọn hành động cho {targetTable?.name}:</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Bạn có thể chọn <strong>Thu hồi mã QR</strong> (bàn vẫn giữ nguyên trên sơ đồ nhưng khách quét vào sẽ không gọi món được), hoặc <strong>Xóa hoàn toàn</strong> bàn này khỏi hệ thống.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleRevokeQR}
              className="w-full p-3.5 rounded-xl border-2 border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 text-left transition-all cursor-pointer flex items-start gap-3"
            >
              <Ban className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-amber-950 block">
                  1. Thu hồi mã QR hiện tại (Khuyên dùng)
                </strong>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Vô hiệu hóa mã quét của bàn này. Khi cần mở lại, bạn chỉ cần bấm nút "Cấp mã QR mới".
                </p>
              </div>
            </button>

            <button
              onClick={handleDeleteTable}
              className="w-full p-3.5 rounded-xl border-2 border-red-200 hover:border-red-500 bg-red-50/40 hover:bg-red-50 text-left transition-all cursor-pointer flex items-start gap-3"
            >
              <Trash2 className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-red-950 block">
                  2. Xóa vĩnh viễn bàn & mã QR
                </strong>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Xóa hoàn toàn bàn này khỏi danh sách và sơ đồ nhà hàng. Hành động này không thể hoàn tác.
                </p>
              </div>
            </button>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Đóng lại
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL 4: QUẢN LÝ KHU VỰC BÀN (TẠO / SỬA / XÓA) ================= */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        title={editingZone ? `Chỉnh Sửa Khu Vực: ${editingZone.name}` : 'Tạo Khu Vực Bàn Mới'}
        subtitle="Khu vực giúp bạn phân bổ bàn ăn theo tầng, phòng VIP, sân vườn hoặc ban công"
        maxWidth="md"
      >
        <form onSubmit={handleSaveZone} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tên khu vực *</label>
            <input
              type="text"
              required
              placeholder="VD: Tầng 3 (Máy lạnh), Ban công ngoài trời, Khu Bar Lounge..."
              value={zoneInputName}
              onChange={(e) => setZoneInputName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Existing Zones List Overview */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">Các khu vực hiện có ({zones.length}):</span>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {zones.map((z) => {
                const count = tables.filter((t) => t.zoneId === z.id).length;
                return (
                  <div
                    key={z.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs"
                  >
                    <span className="font-medium text-slate-800">{z.name}</span>
                    <span className="text-[10px] text-slate-500">({count} bàn)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingZone(z);
                        setZoneInputName(z.name);
                      }}
                      className="text-slate-400 hover:text-emerald-700 p-0.5 cursor-pointer"
                      title="Sửa tên"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {count === 0 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteZone(z.id)}
                        className="text-slate-400 hover:text-red-700 p-0.5 cursor-pointer"
                        title="Xóa khu vực không có bàn"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            {editingZone && (
              <button
                type="button"
                onClick={() => handleDeleteZone(editingZone.id)}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa khu vực này
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" type="button" onClick={() => setIsZoneModalOpen(false)}>
                Hủy bỏ
              </Button>
              <Button variant="primary" type="submit">
                {editingZone ? 'Lưu thay đổi' : 'Tạo khu vực'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
