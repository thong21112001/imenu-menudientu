export interface PlatformKpiBreakdown {
  TRIAL: number;
  ACTIVE_FREE: number;
  ACTIVE_PAID: number;
  SUSPENDED: number;
}

export interface PlatformCommissionsOverview {
  pending: number;
  approved: number;
  paid: number;
  totalIncurred: number;
}

export interface PlatformOverviewKpi {
  totalRestaurants: number;
  statusBreakdown: PlatformKpiBreakdown;
  totalBranches: number;
  totalUsers: number;
  totalPaidOrders: number;
  totalGmvRevenue: number;
  totalSaaSRevenue: number;
  totalSalesReps: number;
  commissions: PlatformCommissionsOverview;
}

export interface PlatformTopRestaurantItem {
  restaurantId: string;
  name: string;
  slug: string;
  plan: string;
  logoUrl?: string;
  totalGmv: number;
  ordersCount: number;
}

export interface PlatformOverviewDto {
  kpi: PlatformOverviewKpi;
  topRestaurants: PlatformTopRestaurantItem[];
}

export interface PlatformRestaurantItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  logoUrl?: string;
  plan: string;
  subscriptionStatus: string;
  isSuspended: boolean;
  suspendReason?: string;
  suspendedAt?: string;
  planExpiresAt?: string;
  branchesCount: number;
  staffCount: number;
  paidOrdersCount: number;
  totalGmvRevenue: number;
  owner?: {
    fullName: string;
    email: string;
    phone: string;
  } | null;
  referredBySales?: {
    id: string;
    fullName: string;
    email: string;
    referralCode?: string;
  } | null;
  createdAt: string;
}

export interface PlatformRestaurantsResponse {
  items: PlatformRestaurantItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlatformPaymentMethodsSummary {
  Cash: number;
  VietQR: number;
  Card: number;
  Transfer: number;
}

export interface PlatformRestaurantRevenueItem {
  restaurantId: string;
  name: string;
  slug: string;
  plan: string;
  logoUrl?: string;
  totalRevenue: number;
  orderCount: number;
  paymentMethods: PlatformPaymentMethodsSummary;
}

export interface PlatformBranchRevenueItem {
  branchId: string;
  branchName: string;
  totalRevenue: number;
  orderCount: number;
  paymentMethods: PlatformPaymentMethodsSummary;
}

export interface PlatformRevenueReport {
  isDrillDown: boolean;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    paymentMethods?: PlatformPaymentMethodsSummary;
  };
  restaurants?: PlatformRestaurantRevenueItem[];
  branches?: PlatformBranchRevenueItem[];
}

export interface PlatformSaaSTransactionItem {
  id: string;
  transactionCode: string;
  restaurantName: string;
  salesName: string;
  plan: string;
  transactionType: string;
  netAmount: number;
  paidAt: string;
}

export interface PlatformSaaSRevenueDto {
  summary: {
    totalSaaSRevenue: number;
    initialSetupRevenue: number;
    renewalRevenue: number;
    commissions: {
      pending: number;
      approved: number;
      paid: number;
      totalIncurred: number;
    };
    profits: {
      accrualNetProfit: number;
      cashFlowNetProfit: number;
      profitMarginPercent: number;
    };
  };
  recentTransactions: PlatformSaaSTransactionItem[];
}

export interface PlatformSalesRepItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  referralCode?: string;
  salesCommissionPolicy?: {
    setupCommissionRate: number;
    renewalCommissionRate: number;
    activationBonusAmount: number;
    teamBonusAmount: number;
  };
  setupCommissionRate?: number;
  renewalCommissionRate?: number;
  activationBonusAmount?: number;
  teamBonusAmount?: number;
  payoutBankAccount?: {
    bankId?: string;
    bankName?: string;
    accountNo?: string;
    accountName?: string;
  };
  stats: {
    referredCount: number;
    qualifiedCount: number;
    paidCount: number;
    totalGmv: number;
    totalSaaSRevenue: number;
    commissions: {
      pending: number;
      approved: number;
      paid: number;
      total: number;
    };
  };
  createdAt: string;
}

export interface PayoutBatchDto {
  ledgerIds: string[];
  action: 'APPROVE' | 'PAY';
  payoutReference?: string;
  note?: string;
}

export interface PayoutBatchResult {
  success: boolean;
  action: 'APPROVE' | 'PAY';
  processedCount: number;
  message: string;
  payoutReference?: string;
}

export interface PlatformCommissionItem {
  id: string;
  _id?: string;
  ledgerCode: string;
  salesId?: {
    id: string;
    _id?: string;
    fullName: string;
    email: string;
    phone?: string;
    referralCode?: string;
  } | null;
  restaurantId?: {
    id: string;
    _id?: string;
    name: string;
    slug?: string;
  } | null;
  commissionType: string;
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  formulaSnapshot: string;
  status: 'PENDING' | 'APPROVED' | 'PAID';
  payoutPeriod: string;
  payoutReference?: string;
  paidAt?: string;
  createdAt: string;
}

export interface QueryPlatformCommissionsParams {
  status?: string;
  salesId?: string;
  payoutPeriod?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PlatformCommissionsResponse {
  items: PlatformCommissionItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

