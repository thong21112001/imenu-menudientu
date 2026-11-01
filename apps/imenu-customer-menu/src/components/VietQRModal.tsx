'use client';

import React from 'react';
import { Restaurant, Order } from '@imenu/types';
import { formatCurrencyVND, generateVietQRUrl } from '@imenu/utils';
import { Modal, Button } from '@imenu/ui';
import { AlertCircle } from 'lucide-react';

export interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeOrder: Order | null;
  restaurant: Restaurant;
  effectiveBankAccount?: any;
  onSwitchToCash: () => void;
  onConfirmTransferred: () => void;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({
  isOpen,
  onClose,
  activeOrder,
  restaurant,
  effectiveBankAccount,
  onSwitchToCash,
  onConfirmTransferred,
}) => {
  if (!activeOrder) return null;

  const bank = effectiveBankAccount || restaurant.bankAccount;
  const bankId = bank?.bankId || 'MB';
  const accountNo = bank?.accountNo || '';
  const accountName = bank?.accountName || restaurant.name || 'NHA HANG';
  const memo = `IMENU ${activeOrder.orderCode}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thanh toán VietQR Napas 24/7"
      subtitle="Mở app ngân hàng bất kỳ để quét mã thanh toán chính xác"
    >
      {!accountNo ? (
        <div className="text-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#282923]">Chưa cấu hình tài khoản ngân hàng</h4>
          <p className="text-xs text-[#5F6055] leading-relaxed">
            Nhà hàng chưa cập nhật số tài khoản nhận tiền chuyển khoản. Quý khách vui lòng chọn thanh toán bằng Tiền mặt hoặc gọi nhân viên phục vụ hỗ trợ.
          </p>
          <Button
            variant="fnb-primary"
            onClick={onSwitchToCash}
            className="w-full font-bold cursor-pointer"
          >
            Đổi sang Thanh toán Tiền mặt
          </Button>
        </div>
      ) : (() => {
        const qrUrl = generateVietQRUrl({
          bankId,
          accountNo,
          accountName,
          amount: activeOrder.totalAmount,
          memo,
        });

        return (
          <div className="text-center space-y-4">
            <div className="p-4 bg-white rounded-2xl border border-[#E8E4DA] shadow-xs flex flex-col items-center">
              <img
                src={qrUrl}
                alt="VietQR Payment"
                className="w-56 h-auto rounded-xl shadow-xs border border-[#ECE7DC]"
              />
              <div className="mt-3 text-xs space-y-1 w-full max-w-xs text-left bg-[#FAF7F0] p-2.5 rounded-xl border border-[#E8E4DA]">
                <div className="flex justify-between text-[#5F6055] text-[11px]">
                  <span>Ngân hàng:</span>
                  <span className="font-bold text-[#282923]">{bankId}</span>
                </div>
                <div className="flex justify-between text-[#5F6055] text-[11px]">
                  <span>Số tài khoản:</span>
                  <span className="font-mono font-bold text-[#282923]">{accountNo}</span>
                </div>
                <div className="flex justify-between text-[#5F6055] text-[11px]">
                  <span>Chủ tài khoản:</span>
                  <span className="font-semibold text-[#282923]">{accountName}</span>
                </div>
                <div className="flex justify-between text-[#5F6055] text-[11px]">
                  <span>Nội dung CK:</span>
                  <span className="font-mono font-bold text-[#244B3C]">{memo}</span>
                </div>
                <div className="pt-1.5 border-t border-[#E8E4DA] flex justify-between items-center text-sm font-bold">
                  <span className="text-[#282923]">Số tiền:</span>
                  <span className="text-base text-[#244B3C] font-black">
                    {formatCurrencyVND(activeOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5F6055]">
              Sau khi chuyển khoản thành công, hệ thống thu ngân sẽ tự động xác nhận đơn hàng tại bàn của bạn.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={onClose}
                className="w-full cursor-pointer font-bold"
              >
                Đóng
              </Button>
              <Button
                variant="fnb-primary"
                onClick={onConfirmTransferred}
                className="w-full cursor-pointer font-bold"
              >
                Đã chuyển khoản
              </Button>
            </div>
          </div>
        );
      })()}
    </Modal>
  );
};

