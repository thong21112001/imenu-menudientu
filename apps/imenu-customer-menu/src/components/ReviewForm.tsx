'use client';

import React from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@imenu/ui';

export const QUICK_TAG_OPTIONS = [
  'Món ăn ngon',
  'Phục vụ chu đáo',
  'Lên món nhanh',
  'Không gian đẹp',
  'Giá cả hợp lý',
];

export interface ReviewFormProps {
  title?: string;
  hasReviewed: boolean;
  reviewRating: number;
  onRatingChange: (rating: number) => void;
  reviewQuickTags: string[];
  onToggleQuickTag: (tag: string) => void;
  reviewComment: string;
  onCommentChange: (comment: string) => void;
  isSubmittingReview: boolean;
  onSubmitReview: () => void;
  quickTags?: string[];
  className?: string;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  title = 'Đánh giá chất lượng phục vụ',
  hasReviewed,
  reviewRating,
  onRatingChange,
  reviewQuickTags,
  onToggleQuickTag,
  reviewComment,
  onCommentChange,
  isSubmittingReview,
  onSubmitReview,
  quickTags = QUICK_TAG_OPTIONS,
  className = '',
}) => {
  return (
    <div className={`p-3.5 bg-[#FAF7F0] border border-[#E8E4DA] rounded-2xl space-y-3 text-left ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#282923] flex items-center gap-1.5">
          <Star className="w-4 h-4 text-[#E9B84C] fill-[#E9B84C]" />
          {title}
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
                aria-label={`${star} sao`}
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
            {quickTags.map((tag) => {
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
  );
};

