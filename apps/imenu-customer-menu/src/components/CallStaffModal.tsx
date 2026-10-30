'use client';

import React from 'react';
import { Modal, Button } from '@imenu/ui';
import { ChevronRight, PhoneCall, Loader2 } from 'lucide-react';

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
      <div className="space-y-4">
        {/* 5 Quick Reason Options */}
        <div className="grid grid-cols-1 gap-2">
          {QUICK_REASONS.map((reason) => (
            <button
              key={reason}
              type="button"
              disabled={isSending || cooldown > 0}
              onClick={() => onSendCallStaff(reason)}
              className="p-3 rounded-xl bg-[#FAF7F0] hover:bg-[#E9F0EC] border border-[#E8E4DA] hover:border-[#244B3C] text-xs font-semibold text-[#282923] hover:text-[#244B3C] text-left transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <span>{reason}</span>
              <ChevronRight className="w-4 h-4 text-[#8C8D82]" />
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="pt-3 border-t border-[#E8E4DA] space-y-2">
          <label className="text-xs font-semibold text-[#282923]">
            Yêu cầu khác hoặc ghi chú chi tiết:
          </label>
          <input
            type="text"
            value={customReason}
            onChange={(e) => onCustomReasonChange(e.target.value)}
            placeholder="VD: Cần ghế trẻ em, thêm tương ớt..."
            maxLength={200}
            disabled={isSending || cooldown > 0}
            className="w-full px-3 py-2 text-xs border border-[#E8E4DA] rounded-xl bg-white text-[#282923] placeholder:text-[#8C8D82] focus:outline-none focus:ring-2 focus:ring-[#244B3C]/30 focus:border-[#244B3C] transition-colors"
          />
          <Button
            variant="fnb-primary"
            className="w-full py-2.5 font-bold cursor-pointer"
            disabled={isSending || cooldown > 0 || !customReason.trim()}
            onClick={() => onSendCallStaff()}
          >
            {isSending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
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

