import { Order } from './order';
import { Table, TableStatus } from './table';

export type RealtimeEventType =
  | 'NEW_ORDER'
  | 'ORDER_STATUS_UPDATED'
  | 'TABLE_STATUS_UPDATED'
  | 'CALL_STAFF'
  | 'PAYMENT_REQUESTED'
  | 'PAYMENT_COMPLETED'
  | 'ROUND_ADDED'
  | 'ROUND_CONFIRMED'
  | 'ROUND_CANCELLED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_CANCELLED'
  | 'ITEM_CANCELLED'
  | 'MENU_AVAILABILITY_CHANGED'
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
  | 'menu:availability_changed';

export interface RealtimePayload<T = any> {
  type: RealtimeEventType | string;
  restaurantId: string;
  branchId?: string;
  timestamp: number;
  data: T;
}
