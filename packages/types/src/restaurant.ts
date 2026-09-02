export interface RestaurantBranch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isMainBranch?: boolean;
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
  plan: 'Basic' | 'Standard' | 'Advanced';
  createdAt: string;
}
