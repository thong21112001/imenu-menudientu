export interface VietQROptions {
  bankId: string; // Mã ngân hàng VietQR e.g. 'MB', 'VCB', 'TCB', 'ICB', 'ACB'
  accountNo: string;
  accountName: string;
  amount: number;
  memo: string;
  template?: 'compact' | 'compact2' | 'qr_only' | 'print';
}

export interface BankInfo {
  id: string;
  name: string;
  shortName: string;
  bin: string;
  logo: string;
}

export const POPULAR_BANKS: BankInfo[] = [
  { id: 'MB', name: 'Ngân hàng Quân Đội', shortName: 'MBBank', bin: '970422', logo: 'https://api.vietqr.io/img/MB.png' },
  { id: 'VCB', name: 'Ngoại Thương Việt Nam', shortName: 'Vietcombank', bin: '970436', logo: 'https://api.vietqr.io/img/VCB.png' },
  { id: 'TCB', name: 'Kỹ Thương Việt Nam', shortName: 'Techcombank', bin: '970407', logo: 'https://api.vietqr.io/img/TCB.png' },
  { id: 'ICB', name: 'Công Thương Việt Nam', shortName: 'VietinBank', bin: '970415', logo: 'https://api.vietqr.io/img/ICB.png' },
  { id: 'ACB', name: 'Á Châu', shortName: 'ACB', bin: '970416', logo: 'https://api.vietqr.io/img/ACB.png' },
  { id: 'VPB', name: 'Việt Nam Thịnh Vượng', shortName: 'VPBank', bin: '970432', logo: 'https://api.vietqr.io/img/VPB.png' },
  { id: 'TPB', name: 'Tiên Phong', shortName: 'TPBank', bin: '970423', logo: 'https://api.vietqr.io/img/TPB.png' }
];

export function generateVietQRUrl(options: VietQROptions): string {
  const {
    bankId = 'MB',
    accountNo = '0901234567',
    accountName = 'IMENU RESTAURANT',
    amount = 0,
    memo = 'Thanh toan don hang',
    template = 'compact2'
  } = options;

  const encodedMemo = encodeURIComponent(memo);
  const encodedName = encodeURIComponent(accountName);
  
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${encodedMemo}&accountName=${encodedName}`;
}

/**
 * Phân giải tài khoản ngân hàng thụ hưởng theo thứ bậc ưu tiên:
 * 1. Ưu tiên Chi nhánh (branch.bankAccount) nếu có số tài khoản
 * 2. Fallback về Nhà hàng (restaurant.bankAccount) nếu chi nhánh không cấu hình
 */
export function resolveEffectiveBankAccount(
  restaurant: any,
  branch?: any,
): {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  template?: string;
  resolvedFrom: 'BRANCH' | 'RESTAURANT';
} | null {
  if (branch?.bankAccount?.accountNo?.trim()) {
    return {
      bankId: branch.bankAccount.bankId || 'MB',
      bankName: branch.bankAccount.bankName || 'Ngân hàng thụ hưởng',
      accountNo: branch.bankAccount.accountNo.trim(),
      accountName: branch.bankAccount.accountName || restaurant?.name || 'IMENU',
      template: branch.bankAccount.template || 'compact2',
      resolvedFrom: 'BRANCH',
    };
  }

  if (restaurant?.bankAccount?.accountNo?.trim()) {
    return {
      bankId: restaurant.bankAccount.bankId || 'MB',
      bankName: restaurant.bankAccount.bankName || 'Ngân hàng thụ hưởng',
      accountNo: restaurant.bankAccount.accountNo.trim(),
      accountName: restaurant.bankAccount.accountName || restaurant?.name || 'IMENU',
      template: restaurant.bankAccount.template || 'compact2',
      resolvedFrom: 'RESTAURANT',
    };
  }

  return null;
}

/**
 * Sinh nội dung chuyển khoản chuẩn hóa cho VietQR Napas 24/7
 * Định dạng: IMENU <orderCode> (loại bỏ ký tự đặc biệt)
 */
export function generateVietQRMemo(orderCode: string): string {
  const cleanCode = (orderCode || '').replace(/[^a-zA-Z0-9-]/g, '').trim();
  return `IMENU ${cleanCode}`.trim();
}

/**
 * Che mặt nạ số tài khoản ngân hàng bảo vệ an toàn tài chính (Mục 19 Blueprint)
 * Giữ 4 số cuối: ví dụ "0901234567" -> "***4567"
 */
export function maskBankAccount(accountNo: string): string {
  if (!accountNo) return '';
  const clean = accountNo.trim();
  if (clean.length <= 4) return clean;
  return `***${clean.slice(-4)}`;
}

