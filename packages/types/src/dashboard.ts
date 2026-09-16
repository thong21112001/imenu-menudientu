export interface HourlyRevenueItem {
  hour: number;
  revenue: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderCode?: string;
  tableName: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  createdAt: string;
}

export interface DashboardOverviewData {
  branchId?: string | null;
  branchName?: string;
  isMainBranch?: boolean;
  revenueToday: number;
  revenueGrowthRate: number;
  occupiedTables: number;
  totalTables: number;
  occupancyRate: number;
  kitchenPendingOrders: number;
  completedOrdersToday: number;
  averageOrderValue: number;
  hourlyRevenue: HourlyRevenueItem[];
  recentOrders: DashboardRecentOrder[];
}
