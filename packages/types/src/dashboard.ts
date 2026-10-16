export interface HourlyRevenueItem {
  hour: number;
  hourLabel?: string;
  revenue: number;
  ordersCount?: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderCode?: string;
  tableName: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  paymentMethod?: string | null;
  orderSource?: string;
  createdAt: string;
}

export interface DashboardPaymentMethodSummary {
  byMethod?: Record<string, { count: number; revenue: number }>;
  vietQrRevenue?: number;
  vietQrPercentage?: number;
  VietQR?: number;
  Cash?: number;
  Card?: number;
  Transfer?: number;
}

export interface DashboardBranchBreakdownItem {
  branchId: string;
  branchName: string;
  isMainBranch?: boolean;
  status?: string;
  todayRevenue?: number;
  revenue?: number;
  ordersCount?: number;
  orderCount?: number;
  percentage?: number;
}

export interface DashboardOverviewData {
  date?: string;
  branchId?: string | null;
  branchName?: string;
  effectiveBranchId?: string;
  isConsolidated?: boolean;
  isMainBranch?: boolean;

  // Doanh thu
  revenueToday: number;
  todayRevenue?: number;
  yesterdayRevenue?: number;
  revenueGrowthRate: number;
  revenueChangePercent?: number;

  // Bàn ăn
  occupiedTables: number;
  occupiedTablesCount?: number;
  totalTables: number;
  totalTablesCount?: number;
  occupancyRate: number;

  // Bếp
  kitchenPendingOrders: number;
  kitchenPendingCount?: number;
  pendingKitchenOrders?: number;

  // Đơn hoàn thành & AOV
  completedOrdersToday: number;
  completedOrdersCount?: number;
  averageOrderValue: number;

  // Chi tiết biểu đồ & danh sách
  hourlyRevenue: HourlyRevenueItem[];
  recentOrders: DashboardRecentOrder[];
  activeOrders?: DashboardRecentOrder[];
  paymentMethodSummary?: DashboardPaymentMethodSummary;
  branchBreakdown?: DashboardBranchBreakdownItem[];
}
