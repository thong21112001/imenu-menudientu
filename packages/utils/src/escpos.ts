import { ReceiptData, ReceiptItemLine } from '@imenu/types';

/**
 * Loại bỏ toàn bộ dấu tiếng Việt sang ký tự ASCII thuần túy (7-bit)
 * Phù hợp 100% với ROM máy in nhiệt nội địa ESC/POS không hỗ trợ UTF-8.
 */
export function stripAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
    .replace(/[^\x20-\x7E\n\r\t]/g, '');
}

/**
 * Helper căn lề chuỗi ký tự
 */
export function padRight(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return str + ' '.repeat(len - str.length);
}

export function padLeft(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return ' '.repeat(len - str.length) + str;
}

export function centerText(str: string, width: number): string {
  if (str.length >= width) return str.slice(0, width);
  const left = Math.floor((width - str.length) / 2);
  const right = width - str.length - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}

export function twoColumnRow(leftStr: string, rightStr: string, width: number = 48): string {
  const leftClean = leftStr || '';
  const rightClean = rightStr || '';
  const spaceNeeded = width - leftClean.length - rightClean.length;

  if (spaceNeeded >= 1) {
    return leftClean + ' '.repeat(spaceNeeded) + rightClean;
  }

  // Nếu quá dài, cắt bớt bên trái để ưu tiên hiển thị đủ số liệu bên phải
  const maxLeft = Math.max(0, width - rightClean.length - 1);
  return leftClean.slice(0, maxLeft) + ' ' + rightClean;
}

export interface EscPosOptions {
  paperWidth?: '80mm' | '58mm';
  kickDrawerOnCash?: boolean;
  qrSize?: number;
}

/**
 * Lớp mã hóa dữ liệu hóa đơn ReceiptData sang tập lệnh nhị phân ESC/POS (Uint8Array)
 * Tuân thủ nghiêm ngặt đặc tả tại Section 5 của thermal-printer-spec.md
 */
export class EscPosEncoder {
  private buffer: number[] = [];
  private paperWidth: '80mm' | '58mm' = '80mm';
  private columnWidth: number = 48; // 80mm: 48 ký tự, 58mm: 32 ký tự

  constructor(paperWidth: '80mm' | '58mm' = '80mm') {
    this.setPaperWidth(paperWidth);
  }

  public setPaperWidth(width: '80mm' | '58mm'): this {
    this.paperWidth = width;
    this.columnWidth = width === '58mm' ? 32 : 48;
    return this;
  }

  public getColumnWidth(): number {
    return this.columnWidth;
  }

  /**
   * Reset trạng thái máy in (ESC @: 1B 40)
   */
  public initialize(): this {
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  /**
   * Căn lề: Trái (0x00), Giữa (0x01), Phải (0x02) - ESC a n: 1B 61 n
   */
  public align(alignment: 'left' | 'center' | 'right'): this {
    const code = alignment === 'center' ? 0x01 : alignment === 'right' ? 0x02 : 0x00;
    this.buffer.push(0x1b, 0x61, code);
    return this;
  }

  /**
   * In đậm: On (0x01), Off (0x00) - ESC E n: 1B 45 n
   */
  public bold(enable: boolean = true): this {
    this.buffer.push(0x1b, 0x45, enable ? 0x01 : 0x00);
    return this;
  }

  /**
   * Phóng to chữ theo chiều cao (GS ! 0x01) hoặc cả 2 chiều (GS ! 0x11)
   */
  public doubleHeight(enable: boolean = true): this {
    this.buffer.push(0x1d, 0x21, enable ? 0x01 : 0x00);
    return this;
  }

  public doubleSize(enable: boolean = true): this {
    this.buffer.push(0x1d, 0x21, enable ? 0x11 : 0x00);
    return this;
  }

  public normalSize(): this {
    this.buffer.push(0x1d, 0x21, 0x00);
    return this;
  }

  /**
   * Xuống dòng (LF: 0x0A)
   */
  public lineFeed(count: number = 1): this {
    for (let i = 0; i < count; i++) {
      this.buffer.push(0x0a);
    }
    return this;
  }

  /**
   * Đẩy dữ liệu chuỗi ký tự (mặc định stripAccents loại bỏ dấu tiếng Việt an toàn)
   */
  public text(str: string, strip: boolean = true): this {
    if (!str) return this;
    const clean = strip ? stripAccents(str) : str;
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      this.buffer.push(code <= 0xff ? code : 0x3f); // Fallback sang '?' nếu vượt 8-bit
    }
    return this;
  }

  /**
   * Đẩy dòng chữ kèm LF
   */
  public textLine(str: string = '', strip: boolean = true): this {
    this.text(str, strip);
    this.lineFeed(1);
    return this;
  }

  /**
   * Đường phân cách ngang (e.g. "------------------------------------------------")
   */
  public separator(char: string = '-', width?: number): this {
    const w = width || this.columnWidth;
    this.textLine(char.repeat(w).slice(0, w));
    return this;
  }

  /**
   * In một dòng chia 2 cột đối xứng (ví dụ: Tạm tính ........... 150.000)
   */
  public twoColumns(leftStr: string, rightStr: string, width?: number): this {
    const w = width || this.columnWidth;
    const line = twoColumnRow(leftStr, rightStr, w);
    this.textLine(line);
    return this;
  }

  /**
   * Cắt giấy một phần (Feed & Partial Cut - GS V 66 0: 1D 56 42 00)
   */
  public cut(mode: 'partial' | 'full' = 'partial'): this {
    // Đẩy giấy thêm 3 dòng qua khỏi lưỡi dao trước khi cắt
    this.lineFeed(3);
    if (mode === 'full') {
      this.buffer.push(0x1d, 0x56, 0x00); // Full cut
    } else {
      this.buffer.push(0x1d, 0x56, 0x42, 0x00); // Partial cut (GS V B 0)
    }
    return this;
  }

  /**
   * Kích xung mở két tiền (ESC p 0 25 250: 1B 70 00 19 FA)
   * Tạo xung 50ms (25 * 2ms) mở ngăn kéo đựng tiền thu ngân tự động
   */
  public kickDrawer(pin: 0 | 1 = 0): this {
    this.buffer.push(0x1b, 0x70, pin, 0x19, 0xfa);
    return this;
  }

  /**
   * In mã QR Code 2D native (ESC/POS GS ( k)
   * 1. Thiết lập Model 2: 1D 28 6B 04 00 31 41 32 00
   * 2. Thiết lập kích thước Module (size 1-16): 1D 28 6B 03 00 31 43 <size>
   * 3. Thiết lập mức sửa lỗi M: 1D 28 6B 03 00 31 45 31
   * 4. Nạp dữ liệu vào bộ nhớ tạm: 1D 28 6B <pL> <pH> 31 50 30 <data>
   * 5. In mã QR: 1D 28 6B 03 00 31 51 30
   */
  public qrCode(content: string, size: number = 6): this {
    if (!content) return this;
    const cleanContent = stripAccents(content);
    const dataBytes: number[] = [];
    for (let i = 0; i < cleanContent.length; i++) {
      dataBytes.push(cleanContent.charCodeAt(i) & 0xff);
    }

    // 1. Model 2
    this.buffer.push(0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);

    // 2. Size (mặc định 6 cho khổ 80mm, 4 cho khổ 58mm)
    const validSize = Math.max(1, Math.min(16, size));
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, validSize);

    // 3. Error correction Level M (0x31)
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31);

    // 4. Store data
    const len = dataBytes.length + 3;
    const pL = len % 256;
    const pH = Math.floor(len / 256);
    this.buffer.push(0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30, ...dataBytes);

    // 5. Print QR symbol
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);
    this.lineFeed(1);
    return this;
  }

  /**
   * Định dạng bảng món ăn
   */
  public formatItemTable(items: ReceiptItemLine[]): this {
    const is80mm = this.paperWidth === '80mm';

    if (is80mm) {
      // Khổ 80mm (48 ký tự): Tên (22) + SL (4) + Đơn giá (11) + T.Tiền (11)
      const headerRow =
        padRight('Ten mon', 22) +
        padLeft('SL', 4) +
        padLeft('Don gia', 11) +
        padLeft('T.Tien', 11);
      this.bold(true);
      this.textLine(headerRow);
      this.bold(false);
      this.separator('-');

      for (const item of items) {
        const name = stripAccents(item.name || 'Mon');
        const qtyStr = String(item.quantity || 1);
        const priceStr = new Intl.NumberFormat('vi-VN').format(item.unitPrice || 0);
        const amountStr = new Intl.NumberFormat('vi-VN').format(item.amount || 0);

        if (name.length <= 22) {
          const line =
            padRight(name, 22) +
            padLeft(qtyStr, 4) +
            padLeft(priceStr, 11) +
            padLeft(amountStr, 11);
          this.textLine(line);
        } else {
          // Xuống dòng nếu tên món dài hơn 22 ký tự
          this.textLine(name);
          const line =
            padRight('', 22) +
            padLeft(qtyStr, 4) +
            padLeft(priceStr, 11) +
            padLeft(amountStr, 11);
          this.textLine(line);
        }

        // In tùy chọn nếu có
        if (item.selectedOptionsNote) {
          this.textLine(`  + ${stripAccents(item.selectedOptionsNote)}`);
        }

        // In ghi chú nếu có
        if (item.note) {
          this.textLine(`  * GC: ${stripAccents(item.note)}`);
        }
      }
    } else {
      // Khổ 58mm (32 ký tự):
      // Dòng 1: Tên món
      // Dòng 2: SL x Đơn giá = Thành tiền
      this.bold(true);
      this.twoColumns('Ten mon', 'T.Tien');
      this.bold(false);
      this.separator('-');

      for (const item of items) {
        const name = stripAccents(item.name || 'Mon');
        const qtyStr = String(item.quantity || 1);
        const priceStr = new Intl.NumberFormat('vi-VN').format(item.unitPrice || 0);
        const amountStr = new Intl.NumberFormat('vi-VN').format(item.amount || 0);

        this.textLine(name);
        const subRow = `  ${qtyStr} x ${priceStr}`;
        this.twoColumns(subRow, amountStr);

        if (item.selectedOptionsNote) {
          this.textLine(`  + ${stripAccents(item.selectedOptionsNote)}`);
        }
        if (item.note) {
          this.textLine(`  * ${stripAccents(item.note)}`);
        }
      }
    }

    return this;
  }

  /**
   * Biên dịch trọn gói một đối tượng ReceiptData thành luồng nhị phân ESC/POS
   */
  public encodeReceipt(data: ReceiptData, options?: EscPosOptions): Uint8Array {
    this.buffer = [];
    if (options?.paperWidth) {
      this.setPaperWidth(options.paperWidth);
    }

    const isCash = data.financials.paymentMethod === 'Cash';
    const kickDrawer = options?.kickDrawerOnCash !== false && isCash;
    const is80mm = this.paperWidth === '80mm';
    const qrSize = options?.qrSize || (is80mm ? 6 : 4);

    this.initialize();

    // 1. Kích két tiền nếu thanh toán bằng tiền mặt
    if (kickDrawer) {
      this.kickDrawer(0);
    }

    // 2. HEADER
    this.align('center');
    this.bold(true);
    this.doubleHeight(true);
    this.textLine(data.header.restaurantName);
    this.normalSize();
    this.bold(false);

    if (data.header.brandTagline) {
      this.textLine(data.header.brandTagline);
    }
    if (data.header.branchName) {
      this.textLine(`Chi nhanh: ${data.header.branchName}`);
    }
    if (data.header.address) {
      this.textLine(data.header.address);
    }
    if (data.header.hotline) {
      this.textLine(`Hotline: ${data.header.hotline}`);
    }
    if (data.header.wifiSsid) {
      this.textLine(`Wifi: ${data.header.wifiSsid} ${data.header.wifiPassword ? `| Pass: ${data.header.wifiPassword}` : ''}`);
    }

    this.separator('=');

    // 3. TITLE & METADATA
    this.bold(true);
    this.doubleHeight(true);
    const title =
      data.metadata.receiptType === 'FINAL_BILL'
        ? 'HOA DON THANH TOAN'
        : 'PHIEU TAM TINH (PRE-BILL)';
    this.textLine(title);
    this.normalSize();
    this.bold(false);

    if (data.metadata.billCode) {
      this.textLine(`Ma HD: ${data.metadata.billCode}`);
    }
    this.textLine(`Ma don: ${data.metadata.orderCode}`);

    this.align('left');
    this.twoColumns(`Ban: ${data.metadata.tableName}`, `Thu ngan: ${data.metadata.cashierName}`);

    const dateStr =
      data.metadata.createdAt instanceof Date
        ? data.metadata.createdAt.toLocaleString('vi-VN')
        : String(data.metadata.createdAt || '');
    this.textLine(`Gio vao: ${dateStr}`);

    if (data.metadata.paidAt) {
      const paidStr =
        data.metadata.paidAt instanceof Date
          ? data.metadata.paidAt.toLocaleString('vi-VN')
          : String(data.metadata.paidAt);
      this.textLine(`Thanh toan: ${paidStr}`);
    }

    this.separator('-');

    // 4. DANH SÁCH MÓN ĂN
    this.formatItemTable(data.items);
    this.separator('-');

    // 5. TÀI CHÍNH & TỔNG KẾT
    const formatMoney = (val: number) => `${new Intl.NumberFormat('vi-VN').format(val)} d`;

    this.twoColumns('Tam tinh:', formatMoney(data.financials.subTotal));

    if (data.financials.discountAmount > 0) {
      const discPercent = data.financials.discountPercent
        ? ` (${data.financials.discountPercent}%)`
        : '';
      this.twoColumns(`Giam gia${discPercent}:`, `-${formatMoney(data.financials.discountAmount)}`);
    }

    if (data.financials.serviceFee > 0) {
      const feePercent = data.financials.serviceFeePercent
        ? ` (${data.financials.serviceFeePercent}%)`
        : '';
      this.twoColumns(`Phi dich vu${feePercent}:`, formatMoney(data.financials.serviceFee));
    }

    if (data.financials.vatAmount > 0) {
      const vatPercent = data.financials.vatPercent
        ? ` (${data.financials.vatPercent}%)`
        : '';
      this.twoColumns(`Thue VAT${vatPercent}:`, formatMoney(data.financials.vatAmount));
    }

    this.separator('=');

    // TỔNG TIỀN (IN ĐẬM, PHÓNG TO)
    this.bold(true);
    this.doubleHeight(true);
    this.twoColumns('TONG CONG:', formatMoney(data.financials.totalAmount));
    this.normalSize();
    this.bold(false);

    // PHƯƠNG THỨC THANH TOÁN
    const methodMap: Record<string, string> = {
      Cash: 'Tien mat',
      VietQR: 'Chuyen khoan VietQR',
      Card: 'The ngan hang',
      Transfer: 'Chuyen khoan',
    };
    const methodName = methodMap[data.financials.paymentMethod || ''] || data.financials.paymentMethod || 'Tien mat';
    this.twoColumns('Phuong thuc:', methodName);

    if (data.financials.cashGiven !== undefined && data.financials.cashGiven > 0) {
      this.twoColumns('Tien khach dua:', formatMoney(data.financials.cashGiven));
      if (data.financials.cashChange !== undefined) {
        this.twoColumns('Tien thua tra khach:', formatMoney(data.financials.cashChange));
      }
    }

    // 6. VIETQR CODE NẾU CÓ
    if (data.paymentQr && data.paymentQr.accountNo) {
      this.separator('-');
      this.align('center');
      this.bold(true);
      this.textLine('QUET MA DE THANH TOAN VIETQR');
      this.bold(false);
      this.textLine(`Ngan hang: ${data.paymentQr.bankName}`);
      this.textLine(`STK: ${data.paymentQr.accountNo} - ${data.paymentQr.accountName}`);
      if (data.paymentQr.memo) {
        this.textLine(`Noi dung: ${data.paymentQr.memo}`);
      }

      // In mã QR Barcode native ESC/POS
      if (data.paymentQr.vietQrPayloadUrl) {
        this.qrCode(data.paymentQr.vietQrPayloadUrl, qrSize);
      }
    }

    // 7. FOOTER & CUT
    this.separator('-');
    this.align('center');
    this.textLine(data.footer.thankYouMessage);
    this.textLine(data.footer.softwareCredit);

    // Cắt giấy tự động
    this.cut('partial');

    return this.getBuffer();
  }

  public getBuffer(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  public toBase64(): string {
    const bytes = this.getBuffer();
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }
    // Browser fallback
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  public toHex(): string {
    return Array.from(this.getBuffer())
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');
  }
}

/**
 * Service quản lý in hóa đơn nhiệt qua WebUSB, WebSerial hoặc Trình duyệt
 */
export const thermalPrinterService = {
  /**
   * Sinh gói dữ liệu in hóa đơn (Buffer, Base64, Hex)
   */
  generatePrintPayload(
    receiptData: ReceiptData,
    options?: EscPosOptions,
  ): {
    buffer: Uint8Array;
    base64: string;
    hex: string;
    textPreview: string;
  } {
    const encoder = new EscPosEncoder(options?.paperWidth || '80mm');
    const buffer = encoder.encodeReceipt(receiptData, options);
    const base64 = encoder.toBase64();
    const hex = encoder.toHex();

    // Dựng văn bản xem trước thuần túy
    const textPreview = stripAccents(
      [
        dataToTextPreview(receiptData, options?.paperWidth || '80mm'),
      ].join('\n'),
    );

    return {
      buffer,
      base64,
      hex,
      textPreview,
    };
  },

  /**
   * In hóa đơn bằng Web Print (@media print / window.print)
   */
  printReceiptWeb(): boolean {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
      return true;
    }
    return false;
  },

  /**
   * Kiểm tra xem trình duyệt có hỗ trợ WebUSB không
   */
  isWebUsbSupported(): boolean {
    return typeof navigator !== 'undefined' && 'usb' in navigator;
  },

  /**
   * Kiểm tra xem trình duyệt có hỗ trợ WebSerial không
   */
  isWebSerialSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  },

  /**
   * Gửi tập lệnh ESC/POS trực tiếp qua WebUSB (nếu thiết bị đã được ghép nối)
   */
  async printReceiptUsb(
    receiptData: ReceiptData,
    usbDevice?: any,
    options?: EscPosOptions,
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.isWebUsbSupported()) {
      return { success: false, message: 'Trình duyệt không hỗ trợ WebUSB' };
    }

    try {
      let device = usbDevice;
      if (!device) {
        device = await (navigator as any).usb.requestDevice({
          filters: [],
        });
      }

      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      await device.claimInterface(0);

      const payload = this.generatePrintPayload(receiptData, options);
      // Tìm endpoint OUT
      const outEndpoint = device.configuration?.interfaces[0]?.alternate?.endpoints?.find(
        (e: any) => e.direction === 'out',
      );
      const endpointNumber = outEndpoint?.endpointNumber || 1;

      await device.transferOut(endpointNumber, payload.buffer);
      await device.close();

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Lỗi giao tiếp WebUSB' };
    }
  },

  /**
   * Gửi tập lệnh ESC/POS trực tiếp qua WebSerial
   */
  async printReceiptSerial(
    receiptData: ReceiptData,
    serialPort?: any,
    options?: EscPosOptions,
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.isWebSerialSupported()) {
      return { success: false, message: 'Trình duyệt không hỗ trợ WebSerial' };
    }

    try {
      let port = serialPort;
      if (!port) {
        port = await (navigator as any).serial.requestPort();
      }

      await port.open({ baudRate: 9600 });
      const writer = port.writable.getWriter();
      const payload = this.generatePrintPayload(receiptData, options);

      await writer.write(payload.buffer);
      writer.releaseLock();
      await port.close();

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Lỗi giao tiếp WebSerial' };
    }
  },
};

/**
 * Helper sinh text xem trước hóa đơn trên màn hình
 */
function dataToTextPreview(data: ReceiptData, widthType: '80mm' | '58mm'): string {
  const width = widthType === '58mm' ? 32 : 48;
  const lines: string[] = [];

  lines.push(centerText(data.header.restaurantName, width));
  if (data.header.branchName) lines.push(centerText(data.header.branchName, width));
  if (data.header.address) lines.push(centerText(data.header.address, width));
  if (data.header.hotline) lines.push(centerText(`Hotline: ${data.header.hotline}`, width));
  lines.push('='.repeat(width));

  const title =
    data.metadata.receiptType === 'FINAL_BILL'
      ? 'HOA DON THANH TOAN'
      : 'PHIEU TAM TINH (PRE-BILL)';
  lines.push(centerText(title, width));
  if (data.metadata.billCode) lines.push(`Ma HD: ${data.metadata.billCode}`);
  lines.push(`Ma don: ${data.metadata.orderCode}`);
  lines.push(twoColumnRow(`Ban: ${data.metadata.tableName}`, `Thu ngan: ${data.metadata.cashierName}`, width));
  lines.push('-'.repeat(width));

  for (const item of data.items) {
    const qtyPrice = `${item.quantity} x ${new Intl.NumberFormat('vi-VN').format(item.unitPrice)}`;
    const total = `${new Intl.NumberFormat('vi-VN').format(item.amount)} d`;
    lines.push(item.name);
    lines.push(twoColumnRow(`  ${qtyPrice}`, total, width));
    if (item.selectedOptionsNote) {
      lines.push(`  + ${item.selectedOptionsNote}`);
    }
  }

  lines.push('-'.repeat(width));
  const formatMoney = (v: number) => `${new Intl.NumberFormat('vi-VN').format(v)} d`;
  lines.push(twoColumnRow('Tam tinh:', formatMoney(data.financials.subTotal), width));
  if (data.financials.discountAmount > 0) {
    lines.push(twoColumnRow('Giam gia:', `-${formatMoney(data.financials.discountAmount)}`, width));
  }
  if (data.financials.serviceFee > 0) {
    lines.push(twoColumnRow('Phi DV:', formatMoney(data.financials.serviceFee), width));
  }
  if (data.financials.vatAmount > 0) {
    lines.push(twoColumnRow('VAT:', formatMoney(data.financials.vatAmount), width));
  }
  lines.push('='.repeat(width));
  lines.push(twoColumnRow('TONG CONG:', formatMoney(data.financials.totalAmount), width));
  lines.push(twoColumnRow('Phuong thuc:', data.financials.paymentMethod || 'Tien mat', width));
  lines.push('='.repeat(width));
  lines.push(centerText(data.footer.thankYouMessage, width));
  lines.push(centerText(data.footer.softwareCredit, width));

  return lines.join('\n');
}
