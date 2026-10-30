'use client';

import React from 'react';
import { TableStatus, OrderStatus } from '@imenu/types';

interface StatusChipProps {
  status: TableStatus | OrderStatus | string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md' }) => {
  let label = status;
  let bg = 'bg-[#ded8cb] text-[#2c3b34] border-[#c8c0b0]';
  let dot = 'bg-[#738379]';

  switch (status) {
    // Table Statuses
    case 'Available':
      label = 'Bàn trống';
      bg = 'bg-[#34a87a]/15 text-[#1f7050] border-[#34a87a]/30';
      dot = 'bg-[#34a87a]';
      break;
    case 'Occupied':
      label = 'Đang dùng';
      bg = 'bg-[#dfa035]/15 text-[#b87c1c] border-[#dfa035]/35';
      dot = 'bg-[#dfa035]';
      break;
    case 'PaymentRequested':
      label = 'Chờ thanh toán';
      bg = 'bg-[#c85a32]/15 text-[#a64522] border-[#c85a32]/30';
      dot = 'bg-[#c85a32]';
      break;
    case 'Reserved':
      label = 'Đã đặt trước';
      bg = 'bg-[#4a7bb0]/15 text-[#2d5784] border-[#4a7bb0]/30';
      dot = 'bg-[#4a7bb0]';
      break;
    case 'Cleaning':
      label = 'Đang dọn dẹp';
      bg = 'bg-[#906fc4]/15 text-[#6c48a3] border-[#906fc4]/30';
      dot = 'bg-[#906fc4]';
      break;

    // Order Statuses
    case 'WaitingConfirmation':
      label = 'Chờ xác nhận';
      bg = 'bg-[#dfa035]/15 text-[#b87c1c] border-[#dfa035]/35';
      dot = 'bg-[#dfa035]';
      break;
    case 'Confirmed':
      label = 'Đã nhận đơn';
      bg = 'bg-[#4a7bb0]/15 text-[#2d5784] border-[#4a7bb0]/30';
      dot = 'bg-[#4a7bb0]';
      break;
    case 'Preparing':
      label = 'Bếp đang nấu';
      bg = 'bg-[#906fc4]/15 text-[#6c48a3] border-[#906fc4]/30';
      dot = 'bg-[#906fc4]';
      break;
    case 'Ready':
      label = 'Món sẵn sàng';
      bg = 'bg-[#2e9e73]/15 text-[#1a6e4e] border-[#2e9e73]/30';
      dot = 'bg-[#2e9e73]';
      break;
    case 'Served':
      label = 'Đã phục vụ';
      bg = 'bg-[#ded8cb] text-[#2c3b34] border-[#c8c0b0]';
      dot = 'bg-[#738379]';
      break;
    case 'Paid':
      label = 'Đã thanh toán';
      bg = 'bg-[#34a87a]/15 text-[#1f7050] border-[#34a87a]/30';
      dot = 'bg-[#34a87a]';
      break;
    case 'Cancelled':
      label = 'Đã hủy';
      bg = 'bg-[#c85a32]/15 text-[#a64522] border-[#c85a32]/30';
      dot = 'bg-[#c85a32]';
      break;

    // Branch Statuses
    case 'ACTIVE':
      label = 'Đang hoạt động';
      bg = 'bg-[#34a87a]/15 text-[#1f7050] border-[#34a87a]/30';
      dot = 'bg-[#34a87a]';
      break;
    case 'TEMPORARILY_CLOSED':
      label = 'Tạm đóng cửa';
      bg = 'bg-[#dfa035]/15 text-[#b87c1c] border-[#dfa035]/35';
      dot = 'bg-[#dfa035]';
      break;
    case 'INACTIVE':
      label = 'Ngừng hoạt động';
      bg = 'bg-[#ded8cb] text-[#4a5b52] border-[#c8c0b0]';
      dot = 'bg-[#9aa89f]';
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
