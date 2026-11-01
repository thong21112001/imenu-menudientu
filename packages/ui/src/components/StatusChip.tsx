'use client';

import React from 'react';
import { TableStatus, OrderStatus } from '@imenu/types';

interface StatusChipProps {
  status: TableStatus | OrderStatus | string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  let label = status;
  let bg = 'bg-zinc-100 text-zinc-700 border-zinc-200/90';
  let dot = 'bg-zinc-500';

  switch (status) {
    // Table Statuses
    case 'Available':
      label = 'Bàn trống';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      dot = 'bg-emerald-600';
      break;
    case 'Occupied':
      label = 'Đang dùng';
      bg = 'bg-amber-50 text-amber-900 border-amber-200/80';
      dot = 'bg-amber-600';
      break;
    case 'PaymentRequested':
      label = 'Chờ thanh toán';
      bg = 'bg-rose-50 text-rose-900 border-rose-200/80';
      dot = 'bg-rose-600';
      break;
    case 'Reserved':
      label = 'Đã đặt trước';
      bg = 'bg-blue-50 text-blue-800 border-blue-200/80';
      dot = 'bg-blue-600';
      break;
    case 'Cleaning':
      label = 'Đang dọn dẹp';
      bg = 'bg-purple-50 text-purple-800 border-purple-200/80';
      dot = 'bg-purple-600';
      break;

    // Order Statuses
    case 'WaitingConfirmation':
      label = 'Chờ xác nhận';
      bg = 'bg-amber-50 text-amber-900 border-amber-200/80';
      dot = 'bg-amber-600';
      break;
    case 'Confirmed':
      label = 'Đã nhận đơn';
      bg = 'bg-blue-50 text-blue-800 border-blue-200/80';
      dot = 'bg-blue-600';
      break;
    case 'Preparing':
      label = 'Bếp đang nấu';
      bg = 'bg-purple-50 text-purple-900 border-purple-200/80';
      dot = 'bg-purple-600';
      break;
    case 'Ready':
      label = 'Món sẵn sàng';
      bg = 'bg-teal-50 text-teal-800 border-teal-200/80';
      dot = 'bg-teal-600';
      break;
    case 'Served':
      label = 'Đã phục vụ';
      bg = 'bg-zinc-100 text-zinc-700 border-zinc-200/90';
      dot = 'bg-zinc-500';
      break;
    case 'Paid':
      label = 'Đã thanh toán';
      bg = 'bg-emerald-50 text-emerald-900 border-emerald-200/80';
      dot = 'bg-emerald-600';
      break;
    case 'Cancelled':
      label = 'Đã hủy';
      bg = 'bg-rose-50 text-rose-800 border-rose-200/80';
      dot = 'bg-rose-600';
      break;

    // Branch Statuses
    case 'ACTIVE':
      label = 'Đang hoạt động';
      bg = 'bg-emerald-50 text-emerald-900 border-emerald-200/80';
      dot = 'bg-emerald-600';
      break;
    case 'TEMPORARILY_CLOSED':
      label = 'Tạm đóng cửa';
      bg = 'bg-amber-50 text-amber-900 border-amber-200/80';
      dot = 'bg-amber-600';
      break;
    case 'INACTIVE':
      label = 'Ngừng hoạt động';
      bg = 'bg-zinc-100 text-zinc-600 border-zinc-200/90';
      dot = 'bg-zinc-400';
      break;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px] font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border ${padding} ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span>{label}</span>
    </span>
  );
};
