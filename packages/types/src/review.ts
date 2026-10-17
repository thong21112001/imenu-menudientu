export interface ReviewItemFeedback {
  menuItemId?: string;
  menuItemName?: string;
  rating?: number;
  comment?: string;
}

export interface ReviewMerchantReply {
  content: string;
  repliedBy?: string;
  repliedByName?: string;
  repliedAt: string | Date;
}

export interface ReviewItem {
  id?: string;
  _id?: string;
  restaurantId: string;
  branchId: string;
  branchName?: string;
  orderId: string;
  orderCode: string;
  billId?: string;
  tableId: string;
  tableName: string;
  overallRating: number;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  quickTags: string[];
  comment?: string;
  itemFeedbacks?: ReviewItemFeedback[];
  customerName?: string;
  customerPhone?: string;
  merchantReply?: ReviewMerchantReply;
  isHidden?: boolean;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CreateCustomerReviewPayload {
  orderId: string;
  overallRating: number;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  quickTags?: string[];
  comment?: string;
  itemFeedbacks?: ReviewItemFeedback[];
  customerName?: string;
  customerPhone?: string;
  restaurantSlug?: string;
  tableCode?: string;
  qrToken?: string;
  receiptAccessToken?: string;
}

export interface ReviewSummaryResult {
  totalReviews: number;
  averageOverall: number;
  averageFood: number;
  averageService: number;
  averageAmbiance: number;
  fiveStarRate: number;
  responseRate: number;
  ratingDistribution: Record<number, number>;
  topTags: Array<{ tag: string; count: number }>;
  branchBreakdown: Array<{
    branchId: string;
    branchName: string;
    totalReviews: number;
    averageRating: number;
  }>;
}

export interface QueryReviewsParams {
  branchId?: string;
  rating?: number;
  hasReply?: boolean;
  fromDate?: string;
  toDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}
