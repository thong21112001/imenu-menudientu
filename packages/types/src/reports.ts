export interface RevenueTimelineItem {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface BranchBreakdownItem {
  branchId: string;
  branchName: string;
  isMainBranch: boolean;
  revenue: number;
  orderCount: number;
  percentage?: number;
}

export interface RevenueReportData {
  branchId?: string | null;
  startDate?: string;
  endDate?: string;
  totalRevenue: number;
  orderCount: number;
  completedOrders: number;
  averageOrderValue: number;
  timeline: RevenueTimelineItem[];
  branchBreakdown: BranchBreakdownItem[];
}

export interface TopItemData {
  itemId: string;
  name: string;
  categoryName?: string;
  quantity: number;
  revenue: number;
}
