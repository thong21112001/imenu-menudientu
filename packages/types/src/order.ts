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
  cancelReason?: string;
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
  elapsedMinutes?: number;
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
    bankAccount?: {
      bankId?: string;
      bankName?: string;
      accountNo?: string;
      accountName?: string;
      template?: string;
      resolvedFrom?: 'BRANCH' | 'RESTAURANT';
    };
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
  bankAccount?: {
    bankId?: string;
    bankName?: string;
    accountNo?: string;
    accountName?: string;
    template?: string;
    resolvedFrom?: 'BRANCH' | 'RESTAURANT';
  };
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

export interface KitchenItemsSummaryItem {
  menuItemId: string;
  name: string;
  waitingQty: number;
  cookingQty: number;
  totalActiveQty: number;
  notes: string[];
  tables: string[];
}

export interface KitchenItemsSummaryResponse {
  totalWaitingItems: number;
  totalCookingItems: number;
  summary: KitchenItemsSummaryItem[];
}

export interface KitchenOrderFilterParams {
  branchId?: string;
  zoneId?: string;
  tableId?: string;
  status?: string;
  search?: string;
  includeUnconfirmed?: boolean;
}

// ============================================================================
// PHASE 8: THERMAL PRINTER 80MM (ESC/POS) & BILL CONTRACTS
// ============================================================================

export interface ReceiptItemLine {
  name: string;              // Tên món (tối đa 24 ký tự trên 1 dòng khổ 80mm)
  quantity: number;          // Số lượng
  unitPrice: number;         // Đơn giá snapshot
  amount: number;            // Thành tiền dòng
  selectedOptionsNote?: string; // Tùy chọn đi kèm: "Phần lớn (+15.000đ), Ít cay"
  note?: string;             // Ghi chú đặc biệt
  roundNumber?: number;
}

export interface ReceiptHeader {
  restaurantName: string;
  brandTagline?: string;
  branchName: string;
  address: string;
  hotline: string;
  wifiSsid?: string;
  wifiPassword?: string;
}

export interface ReceiptMetadata {
  receiptType: 'PRE_BILL' | 'FINAL_BILL';
  billCode?: string;
  orderCode: string;
  tableName: string;
  cashierName: string;
  createdAt: string | Date;
  paidAt?: string | Date;
  printCount?: number;
}

export interface ReceiptFinancials {
  subTotal: number;
  discountAmount: number;
  discountPercent?: number;
  taxableAmount: number;
  serviceFee: number;
  serviceFeePercent?: number;
  vatPercent: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod | string;
  cashGiven?: number;
  cashChange?: number;
}

export interface ReceiptPaymentQr {
  vietQrPayloadUrl: string; // URL sinh ảnh mã VietQR Napas 24/7
  accountNo: string;
  bankName: string;
  accountName: string;
  memo?: string;
}

export interface ReceiptFooter {
  thankYouMessage: string;
  softwareCredit: string;
}

export interface ReceiptData {
  header: ReceiptHeader;
  metadata: ReceiptMetadata;
  items: ReceiptItemLine[];
  financials: ReceiptFinancials;
  paymentQr?: ReceiptPaymentQr;
  footer: ReceiptFooter;
}

export interface VietQrPaymentInfo {
  vietQrUrl: string;
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  memo: string;
  orderCode: string;
  tableName: string;
}

// ============================================================================
// PHASE 8: BILL ENTITY & SNAPSHOT INTERFACES (1:1 VỚI BACKEND BILLS)
// ============================================================================

export interface BillItemSnapshot {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  itemTotal: number;
  selectedOptions?: SelectedOption[];
  selectedOptionsNote?: string;
  note?: string;
  roundNumber?: number;
}

export interface BillHeaderSnapshot {
  restaurantName: string;
  branchName?: string;
  address?: string;
  hotline?: string;
  wifiSsid?: string;
  wifiPassword?: string;
}

export interface BillBankAccountSnapshot {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  template?: string;
  resolvedFrom?: 'BRANCH' | 'RESTAURANT';
}

export interface Bill {
  _id?: string;
  id?: string;
  billCode: string; // BILL-240913-001
  orderId: string;
  orderCode: string;
  tableId: string;
  tableName: string;
  restaurantId: string;
  branchId?: string;
  branchName?: string;
  headerSnapshot?: BillHeaderSnapshot;
  items: BillItemSnapshot[];
  subTotal: number;
  discountAmount?: number;
  discountPercent?: number;
  taxableBase?: number;
  serviceFee?: number;
  serviceFeePercent?: number;
  vatAmount?: number;
  vatPercent?: number;
  finalAmount: number;
  paymentMethod: PaymentMethod | string;
  amountReceived?: number;
  changeAmount?: number;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | string;
  paidAt: string | Date;
  cashierId?: string;
  cashierName?: string;
  bankAccountSnapshot?: BillBankAccountSnapshot;
  vietQrUrl?: string;
  note?: string;
  printCount: number;
  lastPrintedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}


