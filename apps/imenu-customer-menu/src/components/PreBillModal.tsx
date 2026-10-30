'use client';

import React from 'react';
import { Restaurant, Table, Order } from '@imenu/types';
import { formatCurrencyVND } from '@imenu/utils';
import { Modal, Button } from '@imenu/ui';
import { Download, Printer, QrCode, Star, Loader2 } from 'lucide-react';

export interface PreBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  table: Table;
  activeOrder: Order | null;
  isRenderingPng: boolean;
  onDownloadBillPng: () => void;
  onPrintBill: () => void;
  isRequestingPayment: boolean;
  onRequestPayment: (method: 'VietQR' | 'Cash') => void;
  // Review Props
  hasReviewed: boolean;
  reviewRating: number;
  onRatingChange: (rating: number) => void;
  reviewQuickTags: string[];
  onToggleQuickTag: (tag: string) => void;
  reviewComment: string;
  onCommentChange: (comment: string) => void;
  isSubmittingReview: boolean;
  onSubmitReview: () => void;
}

const QUICK_TAG_OPTIONS = [
  'Món ăn ngon',
  'Phục vụ chu đáo',
  'Lên món nhanh',
  'Không gian đẹp',
  'Giá cả hợp lý',
];

export const PreBillModal: React.FC<PreBillModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  table,
  activeOrder,
  isRenderingPng,
  onDownloadBillPng,
  onPrintBill,
  isRequestingPayment,
  onRequestPayment,
  hasReviewed,
  reviewRating,
  onRatingChange,
  reviewQuickTags,
  onToggleQuickTag,
  reviewComment,
  onCommentChange,
  isSubmittingReview,
  onSubmitReview,
}) => {
  if (!activeOrder) return null;

  const validItems = activeOrder.items?.filter((it) => it.status !== 'Cancelled') || [];
  const subTotal = activeOrder.subTotal ?? validItems.reduce((sum, it) => sum + (it.itemTotal || 0), 0);
  const discount = activeOrder.discountAmount || 0;
  const serviceFee = activeOrder.serviceFee || 0;
  const vat = activeOrder.vatAmount || 0;
  const total = activeOrder.totalAmount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Phiếu tạm tính hóa đơn"
      subtitle={`${restaurant.name} · ${table.name}`}
    >
      <div className="space-y-4">
        {/* Receipt Container */}
        <div className="p-4 bg-[#FAF7F0] border border-[#E8E4DA] rounded-2xl space-y-3 font-mono text-xs shadow-2xs">
          <div className="text-center pb-3 border-b border-dashed border-[#D5D0C3]">
            <strong className="text-sm font-sans block text-[#282923]">{restaurant.name}</strong>
            <span className="text-[11px] text-[#5F6055]">
              {table.name} · #{activeOrder.orderCode}
            </span>
          </div>

          <div className="space-y-2 py-1">
            {validItems.length > 0 ? (
              validItems.map((it) => (
                <div key={it.id || (it as any)._id} className="border-b border-[#F0ECE3] pb-1.5 last:border-b-0">
                  <div className="flex justify-between items-start text-[11px]">
                    <span className="text-[#282923] font-semibold">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-bold text-[#282923]">
                      {formatCurrencyVND(it.itemTotal)}
                    </span>
                  </div>
                  {it.selectedOptions && it.selectedOptions.length > 0 && (
                    <div className="text-[10px] text-[#77776C] pl-4 mt-0.5">
                      {it.selectedOptions.map((opt) => opt.valueName || opt.groupName).join(', ')}
                    </div>
                  )}
                  {it.note && (
                    <div className="text-[10px] text-[#C2542E] italic pl-4 mt-0.5">
                      Ghi chú: {it.note}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-[#5F6055] text-xs py-2">
                Không có món hợp lệ nào
              </div>
            )}
          </div>

          {/* Breakdown */}
          <div className="pt-2 border-t border-dashed border-[#D5D0C3] space-y-1 text-[11px]">
            <div className="flex justify-between text-[#5F6055]">
              <span>Tạm tính món:</span>
              <span>{formatCurrencyVND(subTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#C2542E]">
                <span>Giảm giá / Ưu đãi:</span>
                <span>-{formatCurrencyVND(discount)}</span>
              </div>
            )}
            {serviceFee > 0 && (
              <div className="flex justify-between text-[#5F6055]">
                <span>Phí dịch vụ:</span>
                <span>+{formatCurrencyVND(serviceFee)}</span>
              </div>
            )}
            {vat > 0 && (
              <div className="flex justify-between text-[#5F6055]">
                <span>Thuế VAT:</span>
                <span>+{formatCurrencyVND(vat)}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="pt-2 border-t-2 border-[#282923] flex justify-between items-center text-sm font-bold font-sans">
            <span>TỔNG CỘNG:</span>
            <span className="text-base text-[#244B3C] font-black">
              {formatCurrencyVND(total)}
            </span>
          </div>
        </div>

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

        {/* Khu vực Đánh giá chất lượng dịch vụ khi đã gọi thanh toán */}
        {(activeOrder.status === 'PaymentRequested' || activeOrder.isPaid) && (
          <div className="p-3.5 bg-[#FAF7F0] border border-[#E8E4DA] rounded-2xl space-y-3 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#282923] flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#E9B84C] fill-[#E9B84C]" />
                Đánh giá bữa ăn
              </span>
              {hasReviewed && (
                <span className="text-[11px] font-semibold text-[#244B3C] bg-[#E9F0EC] px-2 py-0.5 rounded-full border border-[#C5DACF]">
                  Đã gửi đánh giá
                </span>
              )}
            </div>

            {hasReviewed ? (
              <p className="text-xs text-[#5F6055] italic">
                Cảm ơn quý khách đã gửi nhận xét đánh giá chất lượng dịch vụ!
              </p>
            ) : (
              <div className="space-y-2.5">
                {/* Chọn số sao */}
                <div className="flex items-center gap-1.5 justify-center py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onRatingChange(star)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'text-[#E9B84C] fill-[#E9B84C] drop-shadow-xs'
                            : 'text-[#D5D0C3]'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Quick tags */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAG_OPTIONS.map((tag) => {
                    const isSelected = reviewQuickTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onToggleQuickTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#244B3C] text-white border-[#244B3C]'
                            : 'bg-white text-[#5F6055] border-[#E8E4DA] hover:border-[#D5D0C3]'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                {/* Ghi chú nhận xét */}
                <textarea
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  placeholder="Thêm góp ý giúp nhà hàng nâng cao chất lượng phục vụ..."
                  maxLength={500}
                  className="w-full px-3 py-1.5 text-xs border border-[#E8E4DA] rounded-xl bg-white text-[#282923] placeholder:text-[#8C8D82] focus:outline-none focus:border-[#244B3C] transition-colors resize-none"
                />

                <Button
                  variant="fnb-primary"
                  onClick={onSubmitReview}
                  disabled={isSubmittingReview}
                  className="w-full py-2 text-xs font-bold cursor-pointer"
                >
                  {isSubmittingReview ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi đánh giá...</span>
                    </div>
                  ) : (
                    'Gửi đánh giá dịch vụ'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Các nút gọi thanh toán */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => onRequestPayment('Cash')}
            disabled={isRequestingPayment}
            className="py-3 font-bold cursor-pointer"
          >
            💵 Tiền mặt
          </Button>
          <Button
            variant="amber"
            onClick={() => onRequestPayment('VietQR')}
            disabled={isRequestingPayment}
            className="py-3 font-bold cursor-pointer"
          >
            <QrCode className="w-4 h-4 mr-1.5" /> Quét VietQR
          </Button>
        </div>
      </div>
    </Modal>
  );
};

