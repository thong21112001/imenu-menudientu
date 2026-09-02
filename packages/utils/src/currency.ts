/**
 * Format số tiền sang định dạng tiền Việt Nam (VND), ví dụ: 69.000₫
 */
export function formatCurrencyVND(amount: number = 0): string {
  if (isNaN(amount)) return '0₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount).replace('₫', '').trim() + '₫';
}

export function parseCurrency(formattedStr: string): number {
  const clean = formattedStr.replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
}
