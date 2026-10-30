'use client';

import React from 'react';
import { Restaurant, Table } from '@imenu/types';
import { Store, Wifi, Copy, Check } from 'lucide-react';

export interface TableUtilityBarProps {
  restaurant: Restaurant | null;
  table: Table | null;
  wifiSsid: string;
  wifiPassword: string;
  copiedWifi: boolean;
  onCopyWifi: () => void;
}

export const TableUtilityBar: React.FC<TableUtilityBarProps> = ({
  restaurant,
  table,
  wifiSsid,
  wifiPassword,
  copiedWifi,
  onCopyWifi,
}) => {
  return (
    <div className="bg-[#FAF7F0] border-b border-[#E8E4DA] px-4 py-2 text-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Restaurant Address & Live Connection Status */}
        <div className="flex items-center gap-2 text-[#5F6055]">
          <Store className="w-3.5 h-3.5 text-[#244B3C] shrink-0" />
          <span className="text-xs truncate max-w-[200px] sm:max-w-none">
            {restaurant?.address || 'Phục vụ tại bàn'} • Mở cửa 08:00 - 22:30
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#17382D] bg-[#E9F0EC] px-2 py-0.5 rounded-full border border-[#C5DACF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            Đang kết nối
          </span>
        </div>

        {/* Wifi Info with 1-click copy */}
        <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-[#E8E4DA] text-[#282923] shadow-2xs">
          <Wifi className="w-3.5 h-3.5 text-[#244B3C] shrink-0" />
          <span className="text-[11px] font-medium">
            Wifi: <strong className="font-bold text-[#282923]">{wifiSsid}</strong>
          </span>
          <span className="text-[#C5C6BB]">•</span>
          <span className="text-[11px] text-[#5F6055]">
            MK: <code className="font-mono font-bold text-[#282923]">{wifiPassword}</code>
          </span>
          <button
            type="button"
            onClick={onCopyWifi}
            className="text-[10px] font-bold text-[#244B3C] hover:text-[#17382D] bg-[#FAF7F0] hover:bg-[#E9F0EC] px-2 py-0.5 rounded-lg border border-[#C5DACF] transition-colors shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
            title="Sao chép mật khẩu Wifi"
            aria-label="Sao chép mật khẩu Wifi"
          >
            {copiedWifi ? (
              <>
                <Check className="w-3 h-3 text-[#10b981]" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#244B3C]" />
                <span>Chép MK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

