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

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  selectedOptions?: SelectedOption[];
  note?: string;
  status: 'Waiting' | 'Cooking' | 'Ready' | 'Served' | 'Cancelled';
  itemTotal: number;
}

export interface Order {
  id: string;
  orderCode: string; // e.g. "IM-240902-001"
  tableId: string;
  tableName: string;
  restaurantId: string;
  items: OrderItem[];
  subTotal: number;
  discountAmount?: number;
  serviceFee?: number;
  vatAmount?: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  isPaid: boolean;
  orderSource: 'QR_CUSTOMER' | 'STAFF_POS';
  customerNote?: string;
  createdAt: string;
  updatedAt: string;
}
