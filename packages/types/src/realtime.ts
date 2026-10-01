import { Order } from './order';
import { Table, TableStatus } from './table';

export type RealtimeEventType =
  | 'NEW_ORDER'
  | 'ORDER_STATUS_UPDATED'
  | 'TABLE_STATUS_UPDATED'
  | 'CALL_STAFF'
  | 'PAYMENT_REQUESTED'
  | 'PAYMENT_COMPLETED'
  | 'MENU_AVAILABILITY_CHANGED'
  | 'order:created'
  | 'order:item_status_updated'
  | 'table:status_updated'
  | 'order:payment_completed';

export interface RealtimePayload<T = any> {
  type: RealtimeEventType | string;
  restaurantId: string;
  branchId?: string;
  timestamp: number;
  data: T;
}
