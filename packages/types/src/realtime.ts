import { Order } from './order';
import { Table, TableStatus } from './table';

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'RECONNECTING' | 'DISCONNECTED';

export type RealtimeEventType =
  | 'NEW_ORDER'
  | 'ORDER_STATUS_UPDATED'
  | 'TABLE_STATUS_UPDATED'
  | 'CALL_STAFF'
  | 'CALL_STAFF_ACKNOWLEDGED'
  | 'TABLE_QR_UPDATED'
  | 'PAYMENT_REQUESTED'
  | 'PAYMENT_COMPLETED'
  | 'ROUND_ADDED'
  | 'ROUND_CONFIRMED'
  | 'ROUND_CANCELLED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CANCELLED'
  | 'ITEM_CANCELLED'
  | 'MENU_AVAILABILITY_CHANGED'
  | 'SOCKET_RECONNECTED'
  | 'order:created'
  | 'order:item_status_updated'
  | 'order:round_added'
  | 'order:round_confirmed'
  | 'order:round_cancelled'
  | 'order:confirmed'
  | 'order:cancelled'
  | 'order:item_cancelled'
  | 'order:payment_requested'
  | 'order:payment_completed'
  | 'order:updated'
  | 'table:status_updated'
  | 'table:call_staff'
  | 'table:call_acknowledged'
  | 'table:qr_updated'
  | 'menu:availability_changed';

export interface RealtimePayload<T = any> {
  type: RealtimeEventType | string;
  restaurantId: string;
  branchId?: string;
  timestamp: number;
  data: T;
}

export interface CallStaffPayload {
  notificationId?: string;
  tableId: string;
  tableName: string;
  tableCode?: string;
  branchId?: string;
  restaurantId: string;
  reason: string;
  note?: string;
  createdAt?: string;
  timestamp?: number;
}

export interface CallStaffAcknowledgedPayload {
  tableId: string;
  tableName?: string;
  tableCode?: string;
  branchId?: string;
  restaurantId: string;
  acknowledgedBy: string;
  acknowledgedAt: string;
  timestamp?: number;
}

export interface TableQrUpdatedPayload {
  tableId: string;
  qrStatus: string;
  qrToken?: string;
  restaurantId: string;
  branchId?: string;
}

export interface AdminNotificationItem {
  id: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'INFO';
  type: 'CALL_STAFF' | 'PAYMENT_REQUESTED' | 'NEW_ORDER' | 'ROUND_ADDED' | 'ITEM_READY' | 'SYSTEM';
  title: string;
  message: string;
  tableId?: string;
  tableName?: string;
  orderId?: string;
  orderCode?: string;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
}
