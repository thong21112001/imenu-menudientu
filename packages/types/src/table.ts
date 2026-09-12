export type TableStatus = 'Available' | 'Occupied' | 'PaymentRequested' | 'Reserved' | 'Cleaning';

export interface TableZone {
  id: string;
  name: string;
  description?: string;
  tableCount?: number;
}

export interface Table {
  id: string;
  code: string; // e.g. "ban-01"
  name: string; // e.g. "Bàn 01"
  zoneId: string; // e.g. "tang-1"
  zoneName: string; // e.g. "Tầng 1"
  capacity: number; // e.g. 4
  status: TableStatus;
  currentOrderId?: string;
  totalGuests?: number;
  qrCodeUrl?: string;
  activeSince?: string;
  qrStatus?: 'active' | 'revoked' | 'inactive';
  qrToken?: string;
  qrGeneratedAt?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  customUrl?: string;
}

