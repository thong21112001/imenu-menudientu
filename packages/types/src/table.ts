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
