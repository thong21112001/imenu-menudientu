export type BranchStatus = 'ACTIVE' | 'TEMPORARILY_CLOSED' | 'INACTIVE';

export interface RestaurantBranch {
  _id?: string;
  id: string;
  name: string;
  address: string;
  phone: string;
  isMainBranch?: boolean;
  status?: BranchStatus;
  closedAt?: string | null;
  closedReason?: string | null;
}

export interface CreateBranchDto {
  name: string;
  address: string;
  phone: string;
  isMainBranch?: boolean;
  status?: BranchStatus;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  phone?: string;
  status?: BranchStatus;
  closedReason?: string;
}

export interface CloseBranchDto {
  reason?: string;
}

export interface DeactivateBranchDto {
  reason?: string;
}

export interface BankAccountConfig {
  bankId: string; // e.g., 'MB', 'VCB', 'TCB'
  bankName: string;
  accountNo: string;
  accountName: string;
  template?: 'compact' | 'qr_only' | 'print';
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  logoUrl?: string;
  coverUrl?: string;
  tagline?: string;
  openingHours?: string;
  isOpen?: boolean;
  bankAccount?: BankAccountConfig;
  branches: RestaurantBranch[];
  plan: 'Basic' | 'Standard' | 'Advanced' | 'Pro' | 'Enterprise';
  createdAt: string;
}
