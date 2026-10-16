export type TableStatus = 'Available' | 'Occupied' | 'PaymentRequested' | 'Reserved' | 'Cleaning';

export interface TableZone {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  tableCount?: number;
  restaurantId?: string;
  branchId?: string;
}

export interface Table {
  _id?: string;
  id: string;
  code: string; // e.g. "B01"
  name: string; // e.g. "Bàn 01"
  zone?: TableZone | string;
  zoneId: string; // e.g. "tang-1"
  zoneName: string; // e.g. "Tầng 1"
  capacity: number; // e.g. 4
  status: TableStatus;
  currentOrderId?: any;
  totalGuests?: number;
  qrCodeUrl?: string;
  activeSince?: string;
  qrStatus?: 'active' | 'revoked' | 'inactive';
  qrToken?: string;
  qrGeneratedAt?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  customUrl?: string;
  restaurantId?: string;
  branchId?: string;
  isDeleted?: boolean;
}

export interface MergeTablesPayload {
  fromTableIds: string[];
  targetTableId: string;
  note?: string;
}

export interface MoveTableItemSelection {
  itemId: string;
  quantity?: number;
}

export interface MoveTableItemsPayload {
  fromTableId: string;
  toTableId: string;
  items: MoveTableItemSelection[];
  reason?: string;
}

export interface PublicRestaurantInfo {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  logoUrl?: string;
  isOpen?: boolean;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  branches?: any[];
}

export interface PublicTableItem {
  id: string;
  code: string;
  name: string;
  capacity: number;
  status: TableStatus | string;
  zoneId?: string;
  zoneName?: string;
  branchId?: string;
  qrToken: string;
  wifiSsid?: string | null;
  wifiPassword?: string | null;
  currentOrderId?: string | null;
}

export interface PublicRestaurantTablesData {
  restaurant: PublicRestaurantInfo;
  zones: {
    id: string;
    name: string;
    branchId?: string;
  }[];
  tables: PublicTableItem[];
}
