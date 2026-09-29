export interface MenuItemOptionValue {
  id: string;
  name: string;
  priceDelta: number; // e.g., +10,000 for Large size
}

export interface MenuItemOptionGroup {
  id: string;
  name: string; // e.g., "Kích cỡ", "Lượng đường", "Mức cay", "Topping"
  required: boolean;
  multiple: boolean;
  values: MenuItemOptionValue[];
}

export interface BranchPriceOverride {
  branchId: string;
  price?: number;            // Giá bán riêng tại chi nhánh này (VNĐ)
  originalPrice?: number;    // Giá deal / khuyến mãi riêng
  isAvailable: boolean;      // Trạng thái còn/hết riêng của chi nhánh này
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  isAvailable: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  options?: MenuItemOptionGroup[];
  // Multi-branch fields
  branchIds?: string[];                  // Danh sách chi nhánh áp dụng (Rỗng = Tất cả)
  branchOverrides?: BranchPriceOverride[]; // Tùy biến giá và trạng thái theo chi nhánh
  effectivePrice?: number;               // Giá hiệu lực cho chi nhánh đang truy vấn
  effectiveOriginalPrice?: number;       // Giá deal hiệu lực cho chi nhánh đang truy vấn
  effectiveIsAvailable?: boolean;        // Trạng thái hiệu lực cho chi nhánh đang truy vấn
  // Soft delete fields
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  itemsCount?: number;
  branchIds?: string[];                  // Danh sách chi nhánh áp dụng (Rỗng = Tất cả)
  isDeleted?: boolean;
  deletedAt?: string;
}
