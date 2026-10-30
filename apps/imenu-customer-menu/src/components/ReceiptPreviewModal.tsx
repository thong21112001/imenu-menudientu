'use client';

import React from 'react';
import { Modal, Button } from '@imenu/ui';
import { Download } from 'lucide-react';

export interface ReceiptPreviewModalProps {
  receiptPreviewUrl: string | null;
  onClose: () => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  receiptPreviewUrl,
  onClose,
}) => {
  if (!receiptPreviewUrl) return null;

  return (
    <Modal
      isOpen={!!receiptPreviewUrl}
      onClose={onClose}
      title="Hóa đơn thanh toán"
      subtitle="Chạm và giữ ảnh để lưu về máy (iOS / Zalo Browser)"
    >
      <div className="space-y-3 text-center text-[#111815]">
        <div className="max-h-[60vh] overflow-y-auto p-2 bg-[#e5dfd3] rounded-2xl flex justify-center border border-[#ded8cb]">
          <img
            src={receiptPreviewUrl}
            alt="Hóa đơn"
            className="w-full max-w-xs shadow-md rounded-lg"
          />
        </div>
        <p className="text-[11px] text-[#718077]">
          💡 Hướng dẫn: Chạm và giữ vào ảnh hóa đơn, sau đó chọn <b>"Lưu hình ảnh"</b> hoặc <b>"Chia sẻ"</b>.
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={receiptPreviewUrl}
            download="hoa-don-imenu.png"
            className="py-2.5 px-3 rounded-xl bg-[#245846] text-[#efeae0] text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#1a4133] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải lại ảnh</span>
          </a>
          <Button
            variant="secondary"
            onClick={onClose}
            className="py-2.5 text-xs font-bold cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};
