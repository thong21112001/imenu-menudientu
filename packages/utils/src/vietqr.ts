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
