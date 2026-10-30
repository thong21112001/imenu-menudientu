'use client';

import React from 'react';
import { Modal, Button } from '@imenu/ui';
import { ChevronRight, Loader2 } from 'lucide-react';

export interface CallStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  customReason: string;
  onCustomReasonChange: (reason: string) => void;
  isSending: boolean;
  cooldown: number;
  onSendCallStaff: (quickReason?: string) => void;
}

const QUICK_REASONS = [
  'Xin thêm đá lạnh',
  'Xin thêm nước lọc / Trà đá',
  'Xin thêm chén dĩa / Đũa muỗng',
  'Cần lau dọn bàn',
  'Cần gọi nhân viên tư vấn',
];

export const CallStaffModal: React.FC<CallStaffModalProps> = ({
  isOpen,
  onClose,
  customReason,
  onCustomReasonChange,
  isSending,
  cooldown,
  onSendCallStaff,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gọi nhân viên phục vụ"
      subtitle="Chọn yêu cầu nhanh hoặc nhập nội dung cần hỗ trợ"
    >
      <div className="space-y-4 text-[#111815]">
        {/* 5 Quick Reason Options */}
        <div className="grid grid-cols-1 gap-2">
          {QUICK_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              disabled={isSending || cooldown > 0}
              onClick={() => onSendCallStaff(reason)}
              className="p-3 rounded-xl bg-[#e5dfd3]/80 hover:bg-[#ded8cb] border border-[#ded8cb] hover:border-[#245846] text-xs font-semibold text-[#111815] hover:text-[#245846] text-left transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <span>{reason}</span>
              <ChevronRight className="w-4 h-4 text-[#718077]" />
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="pt-3 border-t border-[#ded8cb] space-y-2">
          <label className="text-xs font-semibold text-[#111815]">
            Yêu cầu khác hoặc ghi chú chi tiết:
          </label>
          <input
            type="text"
            value={customReason}
            onChange={(e) => onCustomReasonChange(e.target.value)}
            placeholder="VD: Cần ghế trẻ em, thêm tương ớt..."
            maxLength={200}
            disabled={isSending || cooldown > 0}
            className="w-full px-3 py-2 text-xs border border-[#ded8cb] rounded-xl bg-[#f0ece3] text-[#111815] placeholder:text-[#9aa89f] focus:outline-none focus:ring-2 focus:ring-[#245846]/30 focus:border-[#245846] transition-colors"
          />
          <Button
            variant="amber"
            className="w-full py-2.5 font-bold cursor-pointer"
            disabled={isSending || cooldown > 0 || !customReason.trim()}
            onClick={() => onSendCallStaff()}
          >
            {isSending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#080c0a]" />
                <span>Đang gửi yêu cầu...</span>
              </div>
            ) : cooldown > 0 ? (
              `Vui lòng chờ (${cooldown}s)`
            ) : (
              'Gửi yêu cầu hỗ trợ'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
