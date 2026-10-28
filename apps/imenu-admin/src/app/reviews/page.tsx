'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  storageService,
  formatDateTime,
  apiClient,
  realtimeHub,
} from '@imenu/utils';
import { ReviewItem, ReviewSummaryResult, RestaurantBranch } from '@imenu/types';
import { Card, Button, StatusChip } from '@imenu/ui';
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  CornerDownRight,
  Send,
  Loader2,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ThumbsUp,
  Tag,
  Clock,
  User,
  Phone,
  Sparkles,
} from 'lucide-react';

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummaryResult | null>(null);
  const [branches, setBranches] = useState<RestaurantBranch[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasNewLiveReview, setHasNewLiveReview] = useState<boolean>(false);

  // Filters
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');
  const [selectedReplyFilter, setSelectedReplyFilter] = useState<'ALL' | 'UNREPLIED' | 'REPLIED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Reply Modal
  const [replyingReview, setReplyingReview] = useState<ReviewItem | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  // Moderation state
  const [togglingHiddenId, setTogglingHiddenId] = useState<string | null>(null);

  const isSuperAdmin = useMemo(() => {
    const role = String(currentUser?.role || '').toLowerCase();
    return Boolean(currentUser?.isSuperAdmin || role === 'system_admin' || role === 'super_admin');
  }, [currentUser]);

  const isOwnerOrAdmin = useMemo(() => {
    const role = String(currentUser?.role || '').toLowerCase();
    return isSuperAdmin || role === 'restaurant_admin';
  }, [currentUser, isSuperAdmin]);

  const canReply = useMemo(() => {
    const perms = storageService.getPermissions() || [];
    return isSuperAdmin || isOwnerOrAdmin || perms.includes('perm-review-reply');
  }, [isSuperAdmin, isOwnerOrAdmin]);

  // Load Initial Data
  const loadReviewsData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const branchIdParam = selectedBranchId !== 'ALL' ? selectedBranchId : undefined;
      const ratingParam = selectedRating !== 'ALL' ? Number(selectedRating) : undefined;
      const hasReplyParam =
        selectedReplyFilter === 'REPLIED' ? true : selectedReplyFilter === 'UNREPLIED' ? false : undefined;

      const [listRes, summaryRes] = await Promise.all([
        apiClient.reviews.list({
          branchId: branchIdParam,
          rating: ratingParam,
          hasReply: hasReplyParam,
          search: searchQuery.trim() || undefined,
          page,
          limit: 20,
        }),
        apiClient.reviews.getSummary({
          branchId: branchIdParam,
        }),
      ]);

      const items = (listRes.data as any)?.items || (Array.isArray(listRes.data) ? listRes.data : []);
      const total = (listRes.data as any)?.total || items.length;

      setReviews(items);
      setTotalCount(total);
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đánh giá:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setHasNewLiveReview(false);
    }
  }, [selectedBranchId, selectedRating, selectedReplyFilter, searchQuery, page]);

  useEffect(() => {
    const usr = storageService.getCurrentUser();
    setCurrentUser(usr);

    // Fetch branches for filter dropdown
    apiClient.branches
      .list()
      .then((res) => {
        const branchList = Array.isArray(res.data) ? res.data : (res.data as any)?.branches || [];
        setBranches(branchList);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadReviewsData();
  }, [loadReviewsData]);

  // Realtime subscription for incoming reviews
  useEffect(() => {
    const unsub = realtimeHub.subscribe('*', (payload) => {
      if (payload.type === 'NEW_REVIEW' || payload.type === 'review:created') {
        setHasNewLiveReview(true);
      }
    });

    return () => unsub();
  }, []);

  // Quick reply templates
  const QUICK_REPLY_TEMPLATES = [
    'Dạ nhà hàng xin chân thành cảm ơn quý khách đã dành thời gian gửi lời đánh giá tích cực! Rất mong được phục vụ quý khách vào những dịp tới ạ.',
    'Dạ nhà hàng rất tiếc vì trải nghiệm chưa trọn vẹn của quý khách. Chúng tôi đã ghi nhận góp ý và sẽ trao đổi ngay với bếp và nhân viên để khắc phục ạ.',
    'Cảm ơn quý khách đã ghé thăm và ủng hộ! Chúc quý khách một ngày thật vui vẻ và nhiều may mắn ạ.',
  ];

  const handleOpenReplyModal = (review: ReviewItem) => {
    setReplyingReview(review);
    setReplyMessage(review.merchantReply?.content || '');
  };

  const handleSubmitReply = async () => {
    if (!replyingReview || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      const reviewId = replyingReview._id || replyingReview.id;
      if (!reviewId) return;

      const res = await apiClient.reviews.reply(reviewId, {
        content: replyMessage.trim(),
      });

      if (res && res.data) {
        const updated = res.data;
        setReviews((prev) =>
          prev.map((r) => ((r._id || r.id) === reviewId ? { ...r, merchantReply: updated.merchantReply } : r))
        );
      }
      setReplyingReview(null);
      setReplyMessage('');
    } catch (err: any) {
      alert(err.message || 'Không thể gửi phản hồi lúc này');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleToggleHidden = async (review: ReviewItem) => {
    const reviewId = review._id || review.id;
    if (!reviewId) return;

    const nextHidden = !review.isHidden;
    const confirmMsg = nextHidden
      ? 'Bạn có chắc chắn muốn ẩn đánh giá này khỏi các báo cáo công khai?'
      : 'Bạn muốn bỏ ẩn đánh giá này?';

    if (!window.confirm(confirmMsg)) return;

    setTogglingHiddenId(reviewId);
    try {
      const res = await apiClient.reviews.toggleHidden(reviewId);
      if (res && res.data) {
        const updated = res.data;
        setReviews((prev) =>
          prev.map((r) => ((r._id || r.id) === reviewId ? { ...r, isHidden: updated.isHidden } : r))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Không thể cập nhật trạng thái ẩn');
    } finally {
      setTogglingHiddenId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Realtime New Review Banner */}
      {hasNewLiveReview && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
            <span>Có đánh giá mới vừa được khách hàng gửi!</span>
          </div>
          <Button
            variant="primary"
            onClick={() => loadReviewsData(true)}
            className="py-1.5 px-3 text-xs"
          >
            Tải lại ngay
          </Button>
        </div>
      )}

      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
            Đánh Giá & Trải Nghiệm Khách Hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi chỉ số hài lòng CSAT, đánh giá món ăn và phản hồi trực tiếp khách hàng theo từng chi nhánh.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => loadReviewsData(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* CSAT KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-slate-200/80 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-amber-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Điểm CSAT Trung Bình</span>
              <div className="p-2 bg-amber-100/80 text-amber-700 rounded-xl">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{summary.averageOverall.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-medium">/ 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-600">
              <span>Đồ ăn: <b>{summary.averageFood ? summary.averageFood.toFixed(1) : summary.averageOverall.toFixed(1)}★</b></span>
              <span className="mx-1">•</span>
              <span>Phục vụ: <b>{summary.averageService ? summary.averageService.toFixed(1) : summary.averageOverall.toFixed(1)}★</b></span>
            </div>
          </Card>

          <Card className="p-4 border-slate-200/80 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-blue-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Đánh Giá</span>
              <div className="p-2 bg-blue-100/80 text-blue-700 rounded-xl">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{summary.totalReviews}</span>
              <span className="text-xs text-slate-500">lượt đánh giá</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Đánh giá từ khách quét mã QR tại bàn
            </p>
          </Card>

          <Card className="p-4 border-slate-200/80 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ Lệ 5 Sao Tuyệt Đối</span>
              <div className="p-2 bg-emerald-100/80 text-emerald-700 rounded-xl">
                <ThumbsUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">{summary.fiveStarRate}%</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Khách hàng hoàn toàn hài lòng với bữa ăn
            </p>
          </Card>

          <Card className="p-4 border-slate-200/80 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tỷ Lệ Đã Phản Hồi</span>
              <div className="p-2 bg-indigo-100/80 text-indigo-700 rounded-xl">
                <CornerDownRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-indigo-700">{summary.responseRate}%</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Nhà hàng đã gửi lời cảm ơn / giải quyết
            </p>
          </Card>
        </div>
      )}

      {/* Breakdown Panels */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Rating Distribution */}
          <Card className="p-4 border-slate-200/80 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Phân bố số sao
            </h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = summary.ratingDistribution?.[star] || 0;
                const pct = summary.totalReviews > 0 ? Math.round((count / summary.totalReviews) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-7 font-bold text-slate-700 flex items-center gap-0.5">
                      {star} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          star >= 4 ? 'bg-amber-400' : star === 3 ? 'bg-amber-300' : 'bg-rose-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-medium text-slate-500 text-[11px]">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Top Tags Cloud */}
          <Card className="p-4 border-slate-200/80 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              Từ khóa khách nhắc đến nhiều
            </h3>
            {summary.topTags && summary.topTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {summary.topTags.map((item) => (
                  <span
                    key={item.tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-[#edf6f1] hover:text-[#176044] transition-colors"
                  >
                    <span>{item.tag}</span>
                    <span className="px-1.5 py-0.2 bg-white rounded-full text-[10px] font-bold text-slate-600 shadow-xs">
                      {item.count}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có đủ dữ liệu từ khóa</p>
            )}
          </Card>

          {/* Branch Comparison */}
          <Card className="p-4 border-slate-200/80 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Điểm CSAT theo chi nhánh
            </h3>
            {summary.branchBreakdown && summary.branchBreakdown.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {summary.branchBreakdown.map((b) => (
                  <div
                    key={b.branchId}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="truncate max-w-[160px]">
                      <p className="font-semibold text-slate-800 truncate">{b.branchName}</p>
                      <p className="text-[10px] text-slate-500">{b.totalReviews} lượt đánh giá</p>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-amber-600 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{b.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chỉ có 1 chi nhánh hoặc chưa có đánh giá</p>
            )}
          </Card>
        </div>
      )}

      {/* Filter Toolbar */}
      <Card className="p-4 border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Branch Select */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Chi nhánh
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => {
                setSelectedBranchId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#176044]"
            >
              <option value="ALL">Toàn bộ chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id || (b as any)._id} value={b.id || (b as any)._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Select */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Số sao đánh giá
            </label>
            <select
              value={selectedRating}
              onChange={(e) => {
                setSelectedRating(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#176044]"
            >
              <option value="ALL">Tất cả số sao</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 sao)</option>
              <option value="3">⭐⭐⭐ (3 sao)</option>
              <option value="2">⭐⭐ (2 sao - Cần chú ý)</option>
              <option value="1">⭐ (1 sao - Rất kém)</option>
            </select>
          </div>

          {/* Reply Status Select */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Trạng thái phản hồi
            </label>
            <select
              value={selectedReplyFilter}
              onChange={(e) => {
                setSelectedReplyFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#176044]"
            >
              <option value="ALL">Tất cả</option>
              <option value="UNREPLIED">Chưa phản hồi khách</option>
              <option value="REPLIED">Đã phản hồi</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadReviewsData()}
                placeholder="Mã đơn, bàn, nhận xét..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#176044]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Tìm thấy <b>{totalCount}</b> đánh giá</span>
          <span>Trang {page}</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#176044]" />
            <p className="text-xs">Đang tải danh sách đánh giá...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 border-dashed border-2">
            <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Chưa có đánh giá nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Hãy thử nới lỏng bộ lọc hoặc chọn chi nhánh khác.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => {
              const revId = rev._id || rev.id || '';
              const isLow = rev.overallRating <= 2;
              return (
                <Card
                  key={revId}
                  className={`p-4 sm:p-5 border transition-all ${
                    rev.isHidden
                      ? 'bg-slate-50/70 border-slate-200 opacity-75'
                      : isLow
                      ? 'bg-rose-50/30 border-rose-200/80 shadow-xs'
                      : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    {/* Customer & Rating Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Rating Stars */}
                        <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200/60">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.overallRating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-bold text-amber-700">
                            {rev.overallRating}.0
                          </span>
                        </div>

                        {/* Order & Table Badge */}
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          #{rev.orderCode}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {rev.tableName}
                        </span>

                        {/* Branch badge */}
                        {rev.branchName && (
                          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {rev.branchName}
                          </span>
                        )}

                        {/* Warning badge if low rating */}
                        {isLow && (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Cần cải thiện
                          </span>
                        )}

                        {/* Hidden badge */}
                        {rev.isHidden && (
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Đã ẩn
                          </span>
                        )}
                      </div>

                      {/* Quick Tags */}
                      {rev.quickTags && rev.quickTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {rev.quickTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Customer Comment */}
                      {rev.comment ? (
                        <p className="text-xs sm:text-sm text-slate-800 bg-white/70 p-3 rounded-xl border border-slate-200/60 leading-relaxed font-normal">
                          "{rev.comment}"
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Không có nhận xét bổ sung</p>
                      )}

                      {/* Customer info & Created At */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(String(rev.createdAt))}
                        </span>
                        {rev.customerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {rev.customerName}
                          </span>
                        )}
                        {rev.customerPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {rev.customerPhone}
                          </span>
                        )}
                      </div>

                      {/* Merchant Reply if exists */}
                      {rev.merchantReply && (
                        <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-emerald-800 font-semibold text-[11px]">
                            <span className="flex items-center gap-1.5">
                              <CornerDownRight className="w-3.5 h-3.5 text-emerald-600" />
                              Phản hồi từ {rev.merchantReply.repliedByName || 'Nhà hàng'}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-normal">
                              {formatDateTime(String(rev.merchantReply.repliedAt))}
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed pl-5">
                            {rev.merchantReply.content}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {canReply && (
                        <Button
                          variant={rev.merchantReply ? 'outline' : 'primary'}
                          onClick={() => handleOpenReplyModal(rev)}
                          className="py-1.5 px-3 text-xs flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{rev.merchantReply ? 'Sửa phản hồi' : 'Phản hồi'}</span>
                        </Button>
                      )}

                      {isOwnerOrAdmin && (
                        <Button
                          variant="outline"
                          onClick={() => handleToggleHidden(rev)}
                          disabled={togglingHiddenId === revId}
                          className="py-1.5 px-3 text-xs flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
                        >
                          {togglingHiddenId === revId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : rev.isHidden ? (
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span>{rev.isHidden ? 'Bỏ ẩn' : 'Ẩn review'}</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination buttons */}
        {totalCount > 20 && (
          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs py-1.5 px-3"
            >
              Trang trước
            </Button>
            <span className="text-xs text-slate-600 flex items-center px-2">
              Trang {page} / {Math.ceil(totalCount / 20)}
            </span>
            <Button
              variant="outline"
              disabled={page * 20 >= totalCount || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs py-1.5 px-3"
            >
              Trang sau
            </Button>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Phản hồi khách hàng</h3>
                <p className="text-xs text-slate-500">
                  Đơn #{replyingReview.orderCode} • Bàn {replyingReview.tableName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReplyingReview(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Review quote snippet */}
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
              <div className="flex items-center gap-1 text-amber-600 font-bold">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${s <= replyingReview.overallRating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`}
                  />
                ))}
                <span>{replyingReview.overallRating} sao</span>
              </div>
              <p className="text-slate-700 italic">
                "{replyingReview.comment || 'Không có nhận xét'}"
              </p>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600">Mẫu phản hồi nhanh:</label>
              <div className="space-y-1">
                {QUICK_REPLY_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReplyMessage(tmpl)}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-[#edf6f1] text-[11px] text-slate-600 hover:text-[#176044] border border-slate-100 hover:border-emerald-200 transition-colors"
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nội dung phản hồi:</label>
              <textarea
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Nhập nội dung phản hồi chân thành đến khách hàng..."
                maxLength={1000}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#176044] resize-none"
              />
              <div className="text-right text-[10px] text-slate-400">
                {replyMessage.length}/1000 ký tự
              </div>
            </div>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setReplyingReview(null)}
                disabled={isSubmittingReply}
                className="py-2.5 text-xs"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitReply}
                disabled={isSubmittingReply || !replyMessage.trim()}
                className="py-2.5 text-xs flex items-center justify-center gap-1.5"
              >
                {isSubmittingReply ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Gửi phản hồi</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
