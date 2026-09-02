import { Order, OrderStatus } from './order';
import { TableStatus } from './table';

export type RealtimeEventType = 
  | 'NEW_ORDER'
  | 'ORDER_STATUS_UPDATED'
  | 'TABLE_STATUS_UPDATED'
  | 'CALL_STAFF'
  | 'PAYMENT_REQUESTED'
  | 'PAYMENT_COMPLETED'
  | 'MENU_AVAILABILITY_CHANGED';

export interface RealtimePayload<T = any> {
  type: RealtimeEventType;
  restaurantId: string;
  timestamp: number;
  data: T;
}
