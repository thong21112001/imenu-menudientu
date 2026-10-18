export interface SalesApplicationPayload {
  fullName: string;
  phone: string;
  email: string;
  city?: string;
  note?: string;
  parentReferralCode?: string;
}

export interface ValidatedReferralInfo {
  valid: boolean;
  salesId: string;
  fullName: string;
  phone?: string;
  referralCode: string;
}

export interface CommissionPolicy {
  setupCommissionRate: number;
  renewalCommissionRate: number;
  activationBonusAmount: number;
  teamBonusAmount: number;
}

export interface PayoutBankAccount {
  bankId?: string;
  bankName?: string;
  accountNo?: string;
  accountName?: string;
}

export interface SalesDashboardKPI {
  totalReferred: number;
  totalAssisted: number;
  totalQualified: number;
  totalPaid: number;
  totalRevenueGenerated: number;
  totalCommissionEarned: number;
  currentPeriodCommission: number;
  subTeamCount: number;
}

export interface SalesDashboardData {
  kpi: SalesDashboardKPI;
  affiliate: {
    referralCode: string;
    affiliateUrl: string;
    recruitAffiliateUrl: string;
    payoutPeriod: string;
  };
  policy: CommissionPolicy;
  bankAccount: PayoutBankAccount;
}

export interface ReferredRestaurantItem {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  plan: string;
  subscriptionStatus: string;
  planExpiresAt?: string;
  isActivationQualified: boolean;
  activationQualifiedAt?: string;
  activationPaidBillsCount: number;
  activationTargetBills: number;
  acquisitionChannel: string;
  createdAt: string;
}

export interface CommissionItem {
  id: string;
  ledgerCode: string;
  commissionType: 'SETUP_COMMISSION' | 'RENEWAL_COMMISSION' | 'ACTIVATION_BONUS' | 'TEAM_OVERRIDE_BONUS';
  baseAmount: number;
  commissionRate?: number;
  commissionAmount: number;
  formulaSnapshot: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'VOIDED';
  payoutPeriod: string;
  paidAt?: string;
  payoutReference?: string;
  restaurant?: {
    id: string;
    name: string;
    slug: string;
  };
  sourceSales?: {
    id: string;
    fullName: string;
    referralCode: string;
  };
  createdAt: string;
}

export interface SalesTeamMember {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  referralCode: string;
  status: string;
  createdAt: string;
  performance: {
    totalReferred: number;
    totalQualified: number;
    totalPaid: number;
  };
}

export interface CreateAssistedRestaurantPayload {
  restaurant: {
    name: string;
    phone: string;
    address: string;
    tagline?: string;
  };
  owner: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
  };
  seedDemoTables?: boolean;
  seedDemoMenu?: boolean;
}

export interface QueryCommissionsParams {
  commissionType?: string;
  status?: string;
  payoutPeriod?: string;
  page?: number;
  limit?: number;
}

export interface QueryReferredRestaurantsParams {
  search?: string;
  subscriptionStatus?: string;
  isActivationQualified?: boolean | string;
  page?: number;
  limit?: number;
}
