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
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  itemsCount?: number;
}
