'use client';

import React from 'react';
import { TableStatus, OrderStatus } from '@imenu/types';

interface StatusChipProps {
  status: TableStatus | OrderStatus | string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  let label = status;
  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-500';

  switch (status) {
    // Table Statuses
    case 'Available':
      label = 'Bàn trống';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dot = 'bg-emerald-500';
      break;
    case 'Occupied':
      label = 'Đang dùng';
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'PaymentRequested':
      label = 'Chờ thanh toán';
      bg = 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse';
      dot = 'bg-rose-500';
      break;
    case 'Reserved':
      label = 'Đã đặt trước';
      bg = 'bg-blue-50 text-blue-800 border-blue-200';
      dot = 'bg-blue-500';
      break;
    case 'Cleaning':
      label = 'Đang dọn dẹp';
      bg = 'bg-purple-50 text-purple-800 border-purple-200';
      dot = 'bg-purple-500';
      break;

    // Order Statuses
    case 'WaitingConfirmation':
      label = 'Chờ xác nhận';
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'Confirmed':
      label = 'Đã nhận đơn';
      bg = 'bg-blue-50 text-blue-800 border-blue-200';
      dot = 'bg-blue-500';
      break;
    case 'Preparing':
      label = 'Bếp đang nấu';
      bg = 'bg-purple-50 text-purple-800 border-purple-200';
      dot = 'bg-purple-500 animate-spin';
      break;
    case 'Ready':
      label = 'Món sẵn sàng';
      bg = 'bg-teal-50 text-teal-800 border-teal-200';
      dot = 'bg-teal-500';
      break;
    case 'Served':
      label = 'Đã phục vụ';
      bg = 'bg-slate-100 text-slate-700 border-slate-200';
      dot = 'bg-slate-500';
      break;
    case 'Paid':
      label = 'Đã thanh toán';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dot = 'bg-emerald-600';
      break;
    case 'Cancelled':
      label = 'Đã hủy';
      bg = 'bg-red-50 text-red-700 border-red-200';
      dot = 'bg-red-500';
      break;

    // Branch Statuses
    case 'ACTIVE':
      label = 'Đang hoạt động';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dot = 'bg-emerald-500 animate-pulse';
      break;
    case 'TEMPORARILY_CLOSED':
      label = 'Tạm đóng cửa';
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      dot = 'bg-amber-500';
      break;
    case 'INACTIVE':
      label = 'Ngừng hoạt động';
      bg = 'bg-slate-100 text-slate-600 border-slate-300';
      dot = 'bg-slate-400';
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${padding} ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};
