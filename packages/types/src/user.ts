export type UserRole = 
  | 'SYSTEM_ADMIN'        // Toàn quyền hệ thống SaaS
  | 'CHAIN_ADMIN'         // Quản trị chuỗi nhà hàng
  | 'RESTAURANT_ADMIN'    // Chủ nhà hàng / Chi nhánh
  | 'RESTAURANT_MANAGER'  // Quản lý ca
  | 'STAFF';              // Nhân viên phục vụ / Thu ngân / Bếp

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  restaurantId?: string;
  branchId?: string;
  avatarUrl?: string;
}
