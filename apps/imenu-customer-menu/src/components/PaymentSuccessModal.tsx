'use client';

import React from 'react';
import { Table } from '@imenu/types';
import { formatCurrencyVND } from '@imenu/utils';
import { Modal, Button } from '@imenu/ui';
import { CheckCircle2, Download, Printer, Loader2 } from 'lucide-react';
import { ReviewForm } from './ReviewForm';

export interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  paidSummary: any;
  isRenderingPng: boolean;
  onDownloadBillPng: () => void;
  onPrintBill: () => void;
  hasReviewed: boolean;
  reviewRating: number;
  onRatingChange: (rating: number) => void;
  reviewQuickTags: string[];
  onToggleQuickTag: (tag: string) => void;
  reviewComment: string;
  onCommentChange: (comment: string) => void;
  isSubmittingReview: boolean;
  onSubmitReview: () => void;
  onContinueOrdering: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  table,
  paidSummary,
  isRenderingPng,
  onDownloadBillPng,
  onPrintBill,
  hasReviewed,
  reviewRating,
  onRatingChange,
  reviewQuickTags,
  onToggleQuickTag,
  reviewComment,
  onCommentChange,
  isSubmittingReview,
  onSubmitReview,
  onContinueOrdering,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thanh toán thành công"
      subtitle="Hóa đơn đã được hoàn tất"
    >
      <div className="text-center space-y-4 py-2">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-[#E9F0EC] text-[#244B3C] rounded-full flex items-center justify-center mx-auto shadow-xs border border-[#C5DACF]">
          <CheckCircle2 className="w-9 h-9 text-[#10b981]" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#282923]">
            Cảm ơn quý khách!
          </h3>
          <p className="text-xs text-[#5F6055] mt-1">
            Đơn hàng tại bàn {table?.name || ''} đã được thu ngân xác nhận thanh toán thành công.
          </p>
        </div>

        {/* Paid Summary Box */}
        {paidSummary && (
          <div className="p-4 bg-[#FAF7F0] border border-[#E8E4DA] rounded-2xl text-left font-mono text-xs space-y-2 shadow-2xs">
            <div className="flex justify-between text-[#5F6055]">
              <span>Mã đơn:</span>
              <span className="font-bold text-[#282923]">#{paidSummary.orderCode}</span>
            </div>
            {paidSummary.billCode && (
              <div className="flex justify-between text-[#5F6055]">
                <span>Mã hóa đơn:</span>
                <span className="font-bold text-[#282923]">{paidSummary.billCode}</span>
              </div>
            )}
            <div className="flex justify-between text-[#5F6055]">
              <span>Phương thức:</span>
              <span className="font-semibold text-[#282923]">
                {paidSummary.paymentMethod === 'VietQR'
                  ? 'Chuyển khoản VietQR'
                  : paidSummary.paymentMethod === 'Card'
                  ? 'Thẻ'
                  : 'Tiền mặt'}
              </span>
            </div>
            <div className="pt-2 border-t border-[#E8E4DA] flex justify-between items-center text-sm font-bold font-sans">
              <span className="text-[#282923]">Đã thanh toán:</span>
              <span className="text-[#244B3C] text-base font-black">
                {formatCurrencyVND(paidSummary.finalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Nút tải ảnh và in hóa đơn */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            onClick={onDownloadBillPng}
            disabled={isRenderingPng}
            className="py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isRenderingPng ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-[#244B3C]" />
            )}
            <span>Lưu Ảnh Bill (PNG)</span>
          </Button>
          <Button
            variant="outline"
            onClick={onPrintBill}
            className="py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#282923]" />
            <span>In / Lưu PDF</span>
          </Button>
        </div>

        {/* Khu vực Đánh giá chất lượng dịch vụ */}
        <ReviewForm
          className="shadow-2xs"
          title="Đánh giá chất lượng phục vụ"
          hasReviewed={hasReviewed}
          reviewRating={reviewRating}
          onRatingChange={onRatingChange}
          reviewQuickTags={reviewQuickTags}
          onToggleQuickTag={onToggleQuickTag}
          reviewComment={reviewComment}
          onCommentChange={onCommentChange}
          isSubmittingReview={isSubmittingReview}
          onSubmitReview={onSubmitReview}
        />

        <Button
          variant="fnb-primary"
          size="xl"
          onClick={onContinueOrdering}
          className="w-full py-3 font-bold cursor-pointer"
        >
          Tiếp tục gọi món mới / Đóng
        </Button>
      </div>
    </Modal>
  );
};

