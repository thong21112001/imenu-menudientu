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
    <div className="bg-[#121a16] border-b border-[#26352e] px-4 py-2 text-xs text-[#ede7da]">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Restaurant Address & Live Connection Status */}
        <div className="flex items-center gap-2 text-[#98a69e]">
          <Store className="w-3.5 h-3.5 text-[#34a87a] shrink-0" />
          <span className="text-xs truncate max-w-[200px] sm:max-w-none text-[#ede7da]">
            {restaurant?.address || 'Phục vụ tại bàn'} • Mở cửa 08:00 - 22:30
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#34a87a] bg-[#245846]/20 px-2 py-0.5 rounded-full border border-[#245846]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34a87a] animate-pulse" />
            Đang kết nối
          </span>
        </div>

        {/* Wifi Info with 1-click copy */}
        <div className="flex items-center gap-2 bg-[#151f1b] px-3 py-1 rounded-xl border border-[#26352e] text-[#ede7da] shadow-xs">
          <Wifi className="w-3.5 h-3.5 text-[#dfa035] shrink-0" />
          <span className="text-[11px] font-medium text-[#98a69e]">
            Wifi: <strong className="font-bold text-[#ede7da]">{wifiSsid}</strong>
          </span>
          <span className="text-[#3b4e44]">•</span>
          <span className="text-[11px] text-[#98a69e]">
            MK: <code className="font-mono font-bold text-[#dfa035]">{wifiPassword}</code>
          </span>
          <button
            type="button"
            onClick={onCopyWifi}
            className="text-[10px] font-bold text-[#ede7da] bg-[#245846]/30 hover:bg-[#245846] px-2 py-0.5 rounded-lg border border-[#245846]/50 transition-colors shadow-xs cursor-pointer flex items-center gap-1 active:scale-95"
            title="Sao chép mật khẩu Wifi"
            aria-label="Sao chép mật khẩu Wifi"
          >
            {copiedWifi ? (
              <>
                <Check className="w-3 h-3 text-[#34a87a]" />
                <span className="text-[#34a87a]">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#dfa035]" />
                <span>Chép MK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
