export interface RevenueTimelineItem {
  date: string;
  revenue: number;
  orderCount: number;
  avgOrderValue?: number;
}

export interface BranchBreakdownItem {
  branchId: string;
  branchName: string;
  isMainBranch?: boolean;
  status?: string;
  revenue: number;
  orderCount: number;
  percentage?: number;
  averageOrderValue?: number;
}

export interface PaymentMethodStatItem {
  method: string;
  label: string;
  orderCount: number;
  revenue: number;
  percentage: number;
}

export interface RevenueReportSummary {
  totalRevenue: number;
  subTotal?: number;
  totalDiscount?: number;
  totalServiceFee?: number;
  totalVat?: number;
  totalOrders?: number;
  completedOrders?: number;
  cancelledOrders?: number;
  totalGuests?: number;
  avgOrderValue?: number;
  averageOrderValue?: number;
  vietQrPercentage?: number;
  mainBranchRevenue?: number;
  childBranchesRevenue?: number;
  startDate?: string;
  endDate?: string;
}

export interface RevenueReportData {
  branchId?: string | null;
  effectiveBranchId?: string;
  isConsolidated?: boolean;
  startDate?: string;
  endDate?: string;

  // Tài chính
  totalRevenue: number;
  subTotal?: number;
  totalDiscount?: number;
  totalServiceFee?: number;
  totalVat?: number;

  // Đơn & Khách
  orderCount: number;
  completedOrders: number;
  cancelledOrders?: number;
  totalGuests?: number;
  averageOrderValue: number;

  // Kênh thanh toán & Chi nhánh
  vietQrPercentage?: number;
  paymentMethodStats?: PaymentMethodStatItem[];
  branchBreakdown: BranchBreakdownItem[];
  timeline: RevenueTimelineItem[];

  // Khối summary & byBranch tương thích kép
  summary?: RevenueReportSummary;
  byBranch?: BranchBreakdownItem[];
}

export interface TopItemData {
  rank?: number;
  itemId: string;
  name: string;
  categoryName?: string;
  quantity: number;
  revenue: number;
  percentageOfRevenue?: number;
}

export interface CategoryBreakdownItem {
  categoryName: string;
  quantity: number;
  revenue: number;
  percentage: number;
}

export interface TopItemsResponseData {
  startDate?: string;
  endDate?: string;
  effectiveBranchId?: string;
  totalRevenue?: number;
  items: TopItemData[];
  categoryBreakdown?: CategoryBreakdownItem[];
}
