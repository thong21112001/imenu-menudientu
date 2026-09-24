export type UserRole = 
  | 'SYSTEM_ADMIN'        // Toàn quyền hệ thống SaaS
  | 'CHAIN_ADMIN'         // Quản trị chuỗi nhà hàng
  | 'RESTAURANT_ADMIN'    // Chủ nhà hàng / Chi nhánh
  | 'RESTAURANT_MANAGER'  // Quản lý ca
  | 'CASHIER'             // Thu ngân POS
  | 'KITCHEN'             // Nhân viên Bếp KDS
  | 'WAITER'              // Nhân viên phục vụ bàn
  | 'STAFF'               // Nhân viên chung
  | string;               // Cho phép vai trò tùy chỉnh

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface User {
  id: string;
  username?: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  restaurantId?: string;
  restaurantName?: string;
  branchId?: string;
  branchName?: string;
  isMainBranch?: boolean;
  avatarUrl?: string;
  status?: UserStatus;
  isDeleted?: boolean;
  deletedAt?: string;
  isSuperAdmin?: boolean;
  isDemo?: boolean;
  createdAt?: string;
}

export interface TransferStaffDto {
  targetBranchId: string;
}

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
}

export interface PermissionGroup {
  id: string;
  groupName: string;
  icon?: string;
  permissions: PermissionItem[];
}

export interface RoleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem?: boolean;
  color?: string;
  permissions: string[]; // List of permission IDs
  createdAt?: string;
}
