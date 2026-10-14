export type OrderStatus =
  | 'WaitingConfirmation'  // Khách mới gửi QR, chờ nhân viên/bếp nhận
  | 'Confirmed'            // Nhân viên đã xác nhận
  | 'Preparing'            // Bếp đang chế biến
  | 'Ready'                // Bếp nấu xong, sẵn sàng mang ra bàn
  | 'Served'               // Đã phục vụ ra bàn
  | 'PaymentRequested'     // Khách bấm gọi thanh toán
  | 'Paid'                 // Đã hoàn tất thanh toán
  | 'Cancelled';           // Đã hủy

export type PaymentMethod = 'VietQR' | 'Cash' | 'Card' | 'Transfer';

export interface SelectedOption {
  groupId: string;
  groupName: string;
  valueId: string;
  valueName: string;
  priceDelta: number;
}

export type RoundStatus = 'WaitingConfirmation' | 'Confirmed' | 'Cancelled';
export type OrderSource = 'STAFF_POS' | 'QR_CUSTOMER';

export interface OrderRound {
  roundNumber: number;
  source: OrderSource;
  status: RoundStatus;
  createdAt: string | Date;
  confirmedAt?: string | Date;
  confirmedBy?: string;
  cancelledAt?: string | Date;
  cancelledBy?: string;
  cancelReason?: string;
  roundSubTotal: number;
}

export interface OrderItem {
  _id?: string;
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions?: SelectedOption[];
  note?: string;
  status: 'WaitingConfirmation' | 'Waiting' | 'Cooking' | 'Ready' | 'Served' | 'Cancelled';
  roundNumber?: number;
  itemTotal: number;
}

export interface Order {
  _id?: string;
  id: string;
  orderCode: string; // e.g. "ORD-261001-001"
  tableId: string;
  tableName: string;
  restaurantId: string;
  branchId?: string;
  rounds?: OrderRound[];
  items: OrderItem[];
  subTotal: number;
  discountAmount?: number;
  serviceFee?: number;
  vatAmount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  isPaid: boolean;
  orderSource?: 'QR_CUSTOMER' | 'STAFF_POS' | string;
  customerNote?: string;
  openedAt?: string | Date;
  closedAt?: string | Date;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTableContext {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  };
  table: {
    id: string;
    code: string;
    name: string;
    branchId?: string;
    zoneId?: string;
    capacity?: number;
    qrStatus?: string;
  };
  activeOrder: Order | null;
}

export interface CustomerCreateOrderItemPayload {
  menuItemId: string;
  quantity: number;
  selectedOptions?: SelectedOption[];
  note?: string;
}

export interface CustomerCreateOrderPayload {
  restaurantSlug: string;
  tableCode: string;
  qrToken: string;
  customerNote?: string;
  items: CustomerCreateOrderItemPayload[];
}

export interface CustomerAddItemsPayload {
  restaurantSlug: string;
  tableCode: string;
  qrToken: string;
  orderId?: string;
  note?: string;
  items: CustomerCreateOrderItemPayload[];
}

export interface PayOrderPayload {
  paymentMethod?: PaymentMethod;
  discountAmount?: number;
  discountPercent?: number;
  serviceFee?: number;
  serviceFeePercent?: number;
  vatAmount?: number;
  vatPercent?: number;
  amountReceived?: number;
  cashGiven?: number;
  note?: string;
}

export interface BillPreviewQuery {
  discountAmount?: number;
  discountPercent?: number;
  serviceFee?: number;
  serviceFeePercent?: number;
  vatAmount?: number;
  vatPercent?: number;
}

export interface BillPreviewResult {
  orderId: string;
  orderCode: string;
  subTotal: number;
  discountAmount: number;
  discountPercent?: number;
  serviceFee: number;
  serviceFeePercent?: number;
  vatAmount: number;
  vatPercent?: number;
  totalAmount: number;
  itemsCount: number;
}
