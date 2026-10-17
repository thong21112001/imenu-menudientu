import {
  Order,
  Bill,
  ReceiptData,
  ReceiptItemLine,
  SelectedOption,
  PaymentMethod,
} from '@imenu/types';
import {
  generateVietQRUrl,
  generateVietQRMemo,
  resolveEffectiveBankAccount,
} from './vietqr';

export interface ReceiptBuildOptions {
  receiptType?: 'PRE_BILL' | 'FINAL_BILL';
  billCode?: string;
  cashierName?: string;
  paidAt?: string | Date;
  printCount?: number;
  discountPercent?: number;
  serviceFeePercent?: number;
  vatPercent?: number;
  paymentMethod?: PaymentMethod | string;
  cashGiven?: number;
  cashChange?: number;
  thankYouMessage?: string;
  branch?: any;
}

/**
 * Định dạng ghi chú tùy chọn món ăn: "Tô lớn (+20.000đ), Cay nhiều"
 */
export function formatSelectedOptionsNote(options?: SelectedOption[]): string {
  if (!options || !Array.isArray(options) || options.length === 0) {
    return '';
  }

  return options
    .map((opt) => {
      if (!opt) return '';
      const name = opt.valueName || (opt as any).name || '';
      const delta = opt.priceDelta || 0;
      if (delta > 0) {
        const deltaFormatted = new Intl.NumberFormat('vi-VN').format(delta);
        return `${name} (+${deltaFormatted}đ)`;
      }
      return name;
    })
    .filter(Boolean)
    .join(', ');
}

/**
 * Xây dựng đối tượng dữ liệu hóa đơn chuẩn ReceiptData từ Order hoặc Bill
 * Đảm bảo:
 * 1. Lọc bỏ 100% món bị hủy (status === 'Cancelled')
 * 2. Tự động tổng hợp selectedOptionsNote
 * 3. Phân giải tài khoản ngân hàng chi nhánh -> nhà hàng và sinh link VietQR
 * 4. Tính toán toàn bộ thông số tài chính và metadata
 */
export function buildReceiptData(
  order: (Order | Bill | any),
  restaurant: any,
  options?: ReceiptBuildOptions,
): ReceiptData {
  if (!order) {
    throw new Error('Dữ liệu đơn hàng hoặc hóa đơn không hợp lệ');
  }

  // 1. Phân giải Chi nhánh & Thông tin Header
  const branch =
    options?.branch ||
    restaurant?.branches?.find(
      (b: any) =>
        (b.id && b.id === order.branchId) ||
        (b._id && String(b._id) === String(order.branchId)),
    );

  const restaurantName =
    order.headerSnapshot?.restaurantName ||
    restaurant?.name ||
    'iMenu Restaurant';

  const brandTagline =
    order.headerSnapshot?.brandTagline ||
    restaurant?.tagline ||
    'Ẩm thực chuẩn vị - Phục vụ tận tâm';

  const branchName =
    order.branchName ||
    order.headerSnapshot?.branchName ||
    branch?.name ||
    'Trụ sở chính';

  const address =
    order.headerSnapshot?.address ||
    branch?.address ||
    restaurant?.address ||
    '';

  const hotline =
    order.headerSnapshot?.hotline ||
    branch?.phone ||
    restaurant?.phone ||
    restaurant?.hotline ||
    '';

  const wifiSsid =
    order.headerSnapshot?.wifiSsid ||
    branch?.wifiSsid ||
    restaurant?.wifiSsid ||
    '';

  const wifiPassword =
    order.headerSnapshot?.wifiPassword ||
    branch?.wifiPassword ||
    restaurant?.wifiPassword ||
    '';

  // 2. Lọc danh sách món ăn: BỎ 100% MÓN STATUS === 'Cancelled'
  const rawItems: any[] = Array.isArray(order.items) ? order.items : [];
  const activeItems = rawItems.filter((item) => item && item.status !== 'Cancelled');

  const receiptItems: ReceiptItemLine[] = activeItems.map((item) => {
    const unitPrice = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);
    const amount = Number(item.itemTotal ?? unitPrice * quantity);

    let selectedOptionsNote = item.selectedOptionsNote || '';
    if (!selectedOptionsNote && Array.isArray(item.selectedOptions) && item.selectedOptions.length > 0) {
      selectedOptionsNote = formatSelectedOptionsNote(item.selectedOptions);
    }

    return {
      name: item.name || 'Món ăn',
      quantity,
      unitPrice,
      amount,
      selectedOptionsNote: selectedOptionsNote || undefined,
      note: item.note || undefined,
      roundNumber: item.roundNumber,
    };
  });

  // 3. Tính toán các chỉ số Tài chính (Financials)
  const subTotal = Number(order.subTotal || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const discountPercent =
    options?.discountPercent ?? Number(order.discountPercent || 0);

  const taxableBase =
    Number(order.taxableBase ?? Math.max(0, subTotal - discountAmount));

  const serviceFee = Number(order.serviceFee || 0);
  const serviceFeePercent =
    options?.serviceFeePercent ?? Number(order.serviceFeePercent || 0);

  const vatAmount = Number(order.vatAmount || 0);
  const vatPercent =
    options?.vatPercent ?? Number(order.vatPercent || 0);

  const totalAmount = Number(
    order.finalAmount ?? order.totalAmount ?? taxableBase + serviceFee + vatAmount,
  );

  const paymentMethod =
    options?.paymentMethod ||
    order.paymentMethod ||
    'Cash';

  const cashGiven =
    options?.cashGiven ??
    order.amountReceived ??
    order.cashGiven;

  const cashChange =
    options?.cashChange ??
    order.changeAmount ??
    order.cashChange;

  // 4. Phân giải VietQR thụ hưởng
  let paymentQr: ReceiptData['paymentQr'] = undefined;
  const effectiveBank =
    order.bankAccountSnapshot ||
    resolveEffectiveBankAccount(restaurant, branch);

  if (effectiveBank && effectiveBank.accountNo) {
    const memo = generateVietQRMemo(order.orderCode || '');
    const vietQrPayloadUrl =
      order.vietQrUrl ||
      generateVietQRUrl({
        bankId: effectiveBank.bankId,
        accountNo: effectiveBank.accountNo,
        accountName: effectiveBank.accountName,
        amount: totalAmount,
        memo,
        template: (effectiveBank.template as any) || 'compact2',
      });

    paymentQr = {
      vietQrPayloadUrl,
      accountNo: effectiveBank.accountNo,
      bankName: effectiveBank.bankName,
      accountName: effectiveBank.accountName,
      memo,
    };
  }

  // 5. Xác định loại hóa đơn (PRE_BILL hoặc FINAL_BILL)
  const isPaid =
    order.isPaid === true ||
    order.status === 'Paid' ||
    order.paymentStatus === 'PAID';

  const receiptType =
    options?.receiptType || (isPaid ? 'FINAL_BILL' : 'PRE_BILL');

  return {
    header: {
      restaurantName,
      brandTagline,
      branchName,
      address,
      hotline,
      wifiSsid: wifiSsid || undefined,
      wifiPassword: wifiPassword || undefined,
    },
    metadata: {
      receiptType,
      billCode: order.billCode || options?.billCode,
      orderCode: order.orderCode || '',
      tableName: order.tableName || 'Mang về',
      cashierName:
        options?.cashierName ||
        order.cashierName ||
        'Thu ngân',
      createdAt: order.createdAt || new Date(),
      paidAt: isPaid ? (order.paidAt || order.closedAt || options?.paidAt || new Date()) : undefined,
      printCount: order.printCount ?? options?.printCount ?? 0,
    },
    items: receiptItems,
    financials: {
      subTotal,
      discountAmount,
      discountPercent: discountPercent > 0 ? discountPercent : undefined,
      taxableAmount: taxableBase,
      serviceFee,
      serviceFeePercent: serviceFeePercent > 0 ? serviceFeePercent : undefined,
      vatPercent,
      vatAmount,
      totalAmount,
      paymentMethod,
      cashGiven: cashGiven !== undefined ? Number(cashGiven) : undefined,
      cashChange: cashChange !== undefined ? Number(cashChange) : undefined,
    },
    paymentQr,
    footer: {
      thankYouMessage:
        options?.thankYouMessage || 'Cảm ơn Quý khách & Hẹn gặp lại!',
      softwareCredit: 'iMenu - Hệ Thống Quản Lý F&B Hiện Đại',
    },
  };
}

/**
 * Phase 11: Render ReceiptData thành ảnh Data URL PNG khổ nhiệt 80mm sắc nét bằng Canvas 2D API thuần.
 * Tương thích 100% cả môi trường Trình duyệt (Canvas 2D) và Node.js test runner (Safe Fallback).
 */
export async function renderReceiptToPngDataUrl(receipt: ReceiptData): Promise<string> {
  if (!receipt) {
    throw new Error('Dữ liệu hóa đơn không hợp lệ');
  }

  // Fallback an toàn cho môi trường Node.js (test runner / server-side) khi không có DOM document
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    const dummySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="576" height="800">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text x="50%" y="40" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#111827">${receipt.header.restaurantName}</text>
      <text x="50%" y="70" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#4b5563">${receipt.metadata.receiptType}</text>
      <text x="50%" y="100" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#111827">Đơn: ${receipt.metadata.orderCode}</text>
      <text x="50%" y="130" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="#059669">Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(receipt.financials.totalAmount)} đ</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dummySvg)}`;
  }

  const canvasWidth = 576; // 80mm khổ in nhiệt chuẩn (~576px tại 203 DPI)
  const scale = 2; // Hi-DPI scale 2x chống vỡ hạt trên mobile Retina/OLED
  const paddingX = 24;

  // Tính toán sơ bộ chiều cao canvas
  let estimatedHeight = 360;
  estimatedHeight += (receipt.items || []).length * 48;
  if (receipt.header.wifiSsid) estimatedHeight += 24;
  if (receipt.header.hotline) estimatedHeight += 24;
  if (receipt.header.address) estimatedHeight += 36;
  if (receipt.financials.discountAmount > 0) estimatedHeight += 24;
  if (receipt.financials.serviceFee > 0) estimatedHeight += 24;
  if (receipt.financials.vatAmount > 0) estimatedHeight += 24;
  if (receipt.paymentQr) estimatedHeight += 50;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * scale;
  canvas.height = estimatedHeight * scale;

  const rawCtx = canvas.getContext('2d');
  if (!rawCtx) {
    throw new Error('Không thể khởi tạo Canvas 2D context');
  }
  const ctx: CanvasRenderingContext2D = rawCtx;

  ctx.scale(scale, scale);

  // Nền trắng giấy in nhiệt
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, estimatedHeight);

  // Viền trang trí nhẹ
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 4, canvasWidth - 8, estimatedHeight - 8);

  let curY = 32;

  // Header: Tên nhà hàng
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillText(receipt.header.restaurantName.toUpperCase(), canvasWidth / 2, curY);
  curY += 24;

  // Brand Tagline
  if (receipt.header.brandTagline) {
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 12px system-ui, sans-serif';
    ctx.fillText(receipt.header.brandTagline, canvasWidth / 2, curY);
    curY += 20;
  }

  // Branch Name & Address
  ctx.fillStyle = '#334155';
  ctx.font = '600 13px system-ui, sans-serif';
  ctx.fillText(receipt.header.branchName, canvasWidth / 2, curY);
  curY += 18;

  if (receipt.header.address) {
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(receipt.header.address, canvasWidth / 2, curY);
    curY += 18;
  }

  if (receipt.header.hotline) {
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Hotline: ${receipt.header.hotline}`, canvasWidth / 2, curY);
    curY += 18;
  }

  if (receipt.header.wifiSsid) {
    ctx.font = '11px monospace, system-ui';
    ctx.fillStyle = '#64748b';
    ctx.fillText(
      `Wifi: ${receipt.header.wifiSsid} · Pass: ${receipt.header.wifiPassword || ''}`,
      canvasWidth / 2,
      curY,
    );
    curY += 20;
  }

  // Dashed Separator
  function drawDashedLine(y: number) {
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.moveTo(paddingX, y);
    ctx.lineTo(canvasWidth - paddingX, y);
    ctx.stroke();
    ctx.restore();
  }

  curY += 6;
  drawDashedLine(curY);
  curY += 24;

  // Bill Type Title
  ctx.textAlign = 'center';
  const isFinal = receipt.metadata.receiptType === 'FINAL_BILL';
  ctx.font = 'bold 16px system-ui, sans-serif';
  ctx.fillStyle = isFinal ? '#047857' : '#b45309';
  ctx.fillText(
    isFinal ? 'HÓA ĐƠN THANH TOÁN' : 'PHIẾU TẠM TÍNH HÓA ĐƠN',
    canvasWidth / 2,
    curY,
  );
  curY += 24;

  // Metadata block: OrderCode, TableName, Cashier, Date
  ctx.textAlign = 'left';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#334155';

  const leftX = paddingX;
  const rightX = canvasWidth - paddingX;

  // Line 1: Table & Order Code
  ctx.fillText(`Bàn: ${receipt.metadata.tableName}`, leftX, curY);
  ctx.textAlign = 'right';
  ctx.fillText(`Mã đơn: ${receipt.metadata.orderCode}`, rightX, curY);
  curY += 18;

  // Line 2: Bill Code (if any) & Cashier
  ctx.textAlign = 'left';
  if (receipt.metadata.billCode) {
    ctx.fillText(`Mã HĐ: ${receipt.metadata.billCode}`, leftX, curY);
  } else {
    ctx.fillText(`Thu ngân: ${receipt.metadata.cashierName || 'Quầy POS'}`, leftX, curY);
  }
  ctx.textAlign = 'right';
  const dateFormatted = new Date(receipt.metadata.paidAt || receipt.metadata.createdAt).toLocaleString('vi-VN');
  ctx.fillText(dateFormatted, rightX, curY);
  curY += 16;

  drawDashedLine(curY);
  curY += 20;

  // Table header for items
  ctx.textAlign = 'left';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Món ăn', leftX, curY);
  ctx.textAlign = 'center';
  ctx.fillText('SL', leftX + 260, curY);
  ctx.textAlign = 'right';
  ctx.fillText('Đơn giá', leftX + 370, curY);
  ctx.fillText('Thành tiền', rightX, curY);
  curY += 14;

  drawDashedLine(curY);
  curY += 18;

  // Items List
  const formatVND = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + 'đ';

  for (const it of receipt.items) {
    ctx.textAlign = 'left';
    ctx.font = '600 13px system-ui, sans-serif';
    ctx.fillStyle = '#0f172a';

    // Món ăn có thể dài, truncate nếu vượt quá 240px
    let itemName = it.name;
    if (itemName.length > 28) {
      itemName = itemName.slice(0, 26) + '...';
    }
    ctx.fillText(itemName, leftX, curY);

    ctx.textAlign = 'center';
    ctx.font = '13px monospace, system-ui';
    ctx.fillStyle = '#334155';
    ctx.fillText(String(it.quantity), leftX + 260, curY);

    ctx.textAlign = 'right';
    ctx.fillText(formatVND(it.unitPrice), leftX + 370, curY);
    ctx.font = 'bold 13px monospace, system-ui';
    ctx.fillText(formatVND(it.amount), rightX, curY);
    curY += 16;

    if (it.selectedOptionsNote) {
      ctx.textAlign = 'left';
      ctx.font = 'italic 11px system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`+ ${it.selectedOptionsNote}`, leftX + 12, curY);
      curY += 14;
    }

    if (it.note) {
      ctx.textAlign = 'left';
      ctx.font = 'italic 10px system-ui, sans-serif';
      ctx.fillStyle = '#b45309';
      ctx.fillText(`* ${it.note}`, leftX + 12, curY);
      curY += 14;
    }

    curY += 4;
  }

  drawDashedLine(curY);
  curY += 20;

  // Financials block
  const drawRow = (label: string, value: string, bold = false, color = '#334155', fontSize = 13) => {
    ctx.textAlign = 'left';
    ctx.font = `${bold ? 'bold ' : ''}${fontSize}px system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(label, leftX, curY);

    ctx.textAlign = 'right';
    ctx.font = `${bold ? 'bold ' : ''}${fontSize}px monospace, system-ui`;
    ctx.fillText(value, rightX, curY);
    curY += fontSize + 6;
  };

  drawRow('Tạm tính:', formatVND(receipt.financials.subTotal));

  if (receipt.financials.discountAmount > 0) {
    drawRow(
      `Giảm giá${receipt.financials.discountPercent ? ` (${receipt.financials.discountPercent}%)` : ''}:`,
      `-${formatVND(receipt.financials.discountAmount)}`,
      false,
      '#dc2626',
    );
  }

  if (receipt.financials.serviceFee > 0) {
    drawRow('Phí dịch vụ:', `+${formatVND(receipt.financials.serviceFee)}`);
  }

  if (receipt.financials.vatAmount > 0) {
    drawRow(
      `Thuế VAT (${receipt.financials.vatPercent || 0}%):`,
      `+${formatVND(receipt.financials.vatAmount)}`,
    );
  }

  // Solid double line for TOTAL
  ctx.beginPath();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.moveTo(paddingX, curY);
  ctx.lineTo(canvasWidth - paddingX, curY);
  ctx.stroke();
  curY += 18;

  // TỔNG CỘNG TIỀN THANH TOÁN
  drawRow('TỔNG THANH TOÁN:', formatVND(receipt.financials.totalAmount), true, '#047857', 18);

  const methodLabel =
    receipt.financials.paymentMethod === 'VietQR'
      ? 'Chuyển khoản VietQR'
      : receipt.financials.paymentMethod === 'Card'
      ? 'Quẹt thẻ'
      : 'Tiền mặt';
  drawRow('Phương thức:', methodLabel, false, '#475569', 12);

  if (receipt.financials.cashGiven !== undefined && receipt.financials.cashGiven > 0) {
    drawRow('Tiền khách đưa:', formatVND(receipt.financials.cashGiven), false, '#64748b', 12);
  }
  if (receipt.financials.cashChange !== undefined && receipt.financials.cashChange > 0) {
    drawRow('Tiền trả lại:', formatVND(receipt.financials.cashChange), false, '#64748b', 12);
  }

  curY += 8;
  drawDashedLine(curY);
  curY += 24;

  // Footer message
  ctx.textAlign = 'center';
  ctx.font = 'italic 13px system-ui, sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(receipt.footer.thankYouMessage || 'Cảm ơn Quý khách & Hẹn gặp lại!', canvasWidth / 2, curY);
  curY += 18;

  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(receipt.footer.softwareCredit || 'iMenu - Hệ Thống Quản Lý F&B Hiện Đại', canvasWidth / 2, curY);

  return canvas.toDataURL('image/png');
}

/**
 * Tự động tải file PNG hóa đơn về máy người dùng
 */
export async function downloadReceiptAsPng(receipt: ReceiptData, filename?: string): Promise<string> {
  const dataUrl = await renderReceiptToPngDataUrl(receipt);

  if (typeof document !== 'undefined') {
    const defaultName = `hoa-don-${receipt.metadata.billCode || receipt.metadata.orderCode}.png`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = dataUrl;
    downloadAnchor.download = filename || defaultName;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  }

  return dataUrl;
}
