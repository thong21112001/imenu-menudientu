export interface DailySalesMetric {
  date: string;
  revenue: number;
  ordersCount: number;
  customersCount: number;
  averageOrderValue: number;
}

export interface HourlySalesMetric {
  hour: string; // "10:00", "11:00", etc.
  revenue: number;
  ordersCount: number;
}

export interface TopSellingItem {
  id: string;
  name: string;
  categoryName: string;
  quantitySold: number;
  revenue: number;
  imageUrl: string;
}
