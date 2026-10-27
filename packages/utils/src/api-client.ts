import { storageService } from './storage';
import {
  Order,
  CustomerTableContext,
  CustomerCreateOrderPayload,
  CustomerAddItemsPayload,
  PayOrderPayload,
  BillPreviewQuery,
  BillPreviewResult,
  MergeTablesPayload,
  MoveTableItemsPayload,
  ReceiptData,
  Bill,
  VietQrPaymentInfo,
  DashboardOverviewData,
  RevenueReportData,
  TopItemsResponseData,
  PublicRestaurantTablesData,
  ReviewItem,
  CreateCustomerReviewPayload,
  ReviewSummaryResult,
  QueryReviewsParams,
  SalesApplicationPayload,
  ValidatedReferralInfo,
  SalesDashboardData,
  ReferredRestaurantItem,
  CommissionItem,
  SalesTeamMember,
  CreateAssistedRestaurantPayload,
  PayoutBankAccount,
  QueryCommissionsParams,
  QueryReferredRestaurantsParams,
  PlatformOverviewDto,
  PlatformRestaurantItem,
  PlatformRestaurantsResponse,
  PlatformRevenueReport,
  PlatformSaaSRevenueDto,
  PlatformSalesRepItem,
  PayoutBatchDto,
  PayoutBatchResult,
  PlatformCommissionItem,
  QueryPlatformCommissionsParams,
  PlatformCommissionsResponse,
} from '@imenu/types';

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
  error?: string;
}

export interface RegisterRestaurantPayload {
  restaurant: {
    name: string;
    phone: string;
    address: string;
  };
  owner: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
  };
  referralCode?: string;
  acquisitionChannel?: string;
}

export interface LoginPayload {
  email?: string;
  username?: string;
  password: string;
  rememberMe?: boolean;
}

export interface UpdateRestaurantPayload {
  name?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  coverUrl?: string;
  tagline?: string;
  openingHours?: string;
  isOpen?: boolean;
  bankAccount?: {
    bankId?: string;
    bankName?: string;
    accountNo?: string;
    accountName?: string;
    template?: string;
  };
}

export interface BranchPayload {
  name: string;
  address: string;
  phone: string;
  restaurantId?: string;
  isMainBranch?: boolean;
  bankAccount?: {
    bankId?: string;
    bankName?: string;
    accountNo?: string;
    accountName?: string;
    template?: string;
  };
  openingHours?: string;
  tagline?: string;
}

const DEFAULT_API_URL = 'http://localhost:3001/api';

function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return DEFAULT_API_URL;
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = storageService.getAccessToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if ((options as any)?.idempotencyKey && !headers['idempotency-key']) {
    headers['idempotency-key'] = (options as any).idempotencyKey;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Tu dong thu Refresh Token neu gap loi 401 Unauthorized
      if (
        res.status === 401 &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/refresh') &&
        !(options as any)?._isRetry
      ) {
        const refreshToken = storageService.getRefreshToken();
        if (refreshToken) {
          try {
            const refreshRes = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            const refreshData = await refreshRes.json().catch(() => ({}));
            if (refreshRes.ok && refreshData?.data?.accessToken) {
              storageService.setAccessToken(refreshData.data.accessToken);
              return await request<T>(endpoint, {
                ...options,
                headers: {
                  ...headers,
                  Authorization: `Bearer ${refreshData.data.accessToken}`,
                },
                _isRetry: true,
              } as any);
            }
          } catch {
            // Refresh token that bai
          }
        }
        // Neu khong the lam moi token thi xoa auth va thong bao da vang nguoi dung
        storageService.clearAuth();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('imenu:unauthorized'));
        }
      }

      const errorMessage =
        data?.message ||
        data?.error?.message ||
        data?.error ||
        `Yêu cầu thất bại với mã lỗi ${res.status}`;
      const err: any = new Error(
        Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
      );
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error: any) {
    // Neu la loi ket noi mang (Network error / Fetch failed)
    if (!error.status) {
      const netErr: any = new Error(
        'Không thể kết nối tới máy chủ Backend iMenu API (port 3001). Vui lòng kiểm tra server đang chạy.',
      );
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw error;
  }
}

export const apiClient = {
  auth: {
    async register(payload: RegisterRestaurantPayload) {
      const res = await request<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.data?.accessToken) {
        storageService.setAccessToken(res.data.accessToken);
        if (res.data.refreshToken) {
          storageService.setRefreshToken(res.data.refreshToken);
        }
      }
      if (res.data?.user) {
        storageService.setCurrentUser(res.data.user);
      }
      if (res.data?.restaurant) {
        storageService.saveRestaurant(res.data.restaurant);
      }

      return res;
    },

    async login(payload: LoginPayload) {
      const res = await request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.data?.accessToken) {
        storageService.setAccessToken(res.data.accessToken);
        if (res.data.refreshToken) {
          storageService.setRefreshToken(res.data.refreshToken);
        }
      }
      if (res.data?.user) {
        storageService.setCurrentUser(res.data.user);
      }
      if (res.data?.permissions) {
        storageService.setPermissions(res.data.permissions);
      }

      return res;
    },

    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch {
        // Ignored if offline
      } finally {
        storageService.clearAuth();
      }
    },

    async getMe() {
      const res = await request<any>('/auth/me');
      if (res.data?.user) {
        storageService.setCurrentUser(res.data.user);
      }
      if (res.data?.permissions) {
        storageService.setPermissions(res.data.permissions);
      }
      return res;
    },

    async refresh(refreshToken: string) {
      const res = await request<any>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      if (res.data?.accessToken) {
        storageService.setAccessToken(res.data.accessToken);
      }
      return res;
    },
  },

  restaurant: {
    async getCurrent() {
      const res = await request<any>('/restaurants/current');
      if (res.data) {
        storageService.saveRestaurant(res.data);
      }
      return res;
    },

    async updateCurrent(payload: UpdateRestaurantPayload) {
      const res = await request<any>('/restaurants/current', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.data) {
        storageService.saveRestaurant(res.data);
      }
      return res;
    },

    async listAll() {
      return request<any[]>('/restaurants');
    },

    async getById(id: string) {
      return request<any>(`/restaurants/${id}`);
    },

    async updateById(id: string, payload: UpdateRestaurantPayload) {
      return request<any>(`/restaurants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
  },

  branches: {
    async list(restaurantId?: string) {
      const q = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
      return request<any[]>(`/branches${q}`);
    },

    async get(id: string, restaurantId?: string) {
      const q = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
      return request<any>(`/branches/${id}${q}`);
    },

    async create(payload: BranchPayload) {
      return request<any>('/branches', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: Partial<BranchPayload>) {
      return request<any>(`/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async delete(id: string) {
      return request<any>(`/branches/${id}`, {
        method: 'DELETE',
      });
    },

    async close(id: string, reason?: string) {
      return request<any>(`/branches/${id}/close`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },

    async reopen(id: string) {
      return request<any>(`/branches/${id}/reopen`, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
    },

    async deactivate(id: string, reason?: string) {
      return request<any>(`/branches/${id}/deactivate`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    },
  },

  staff: {
    async list(params?: {
      restaurantId?: string;
      branchId?: string;
      search?: string;
      status?: string;
      roleId?: string;
      role?: string;
      page?: number;
      limit?: number;
    }) {
      const q = new URLSearchParams();
      if (params?.restaurantId && params.restaurantId !== 'all') q.append('restaurantId', params.restaurantId);
      if (params?.branchId && params.branchId !== 'all') q.append('branchId', params.branchId);
      if (params?.status && params.status !== 'all') q.append('status', params.status);
      if (params?.roleId && params.roleId !== 'all') q.append('roleId', params.roleId);
      if (params?.role && params.role !== 'all') q.append('role', params.role);
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const queryStr = q.toString();
      return request<any>(`/users${queryStr ? `?${queryStr}` : ''}`);
    },

    async get(id: string) {
      return request<any>(`/users/${id}`);
    },

    async create(payload: any) {
      return request<any>('/users', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: any) {
      return request<any>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async toggleStatus(id: string) {
      return request<any>(`/users/${id}/toggle-status`, {
        method: 'PATCH',
      });
    },

    async delete(id: string) {
      return request<any>(`/users/${id}`, {
        method: 'DELETE',
      });
    },

    async transfer(id: string, targetBranchId: string) {
      return request<any>(`/users/${id}/transfer`, {
        method: 'POST',
        body: JSON.stringify({ targetBranchId }),
      });
    },
  },

  roles: {
    async list(restaurantId?: string) {
      const q = restaurantId && restaurantId !== 'all' ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
      return request<any>(`/roles${q}`);
    },

    async get(id: string) {
      return request<any>(`/roles/${id}`);
    },

    async getPermissionsMatrix() {
      return request<any>('/roles/permissions/matrix');
    },

    async create(payload: { name: string; slug: string; description?: string; color?: string; permissionIds?: string[]; restaurantId?: string }) {
      return request<any>('/roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: { name?: string; description?: string; color?: string; permissionIds?: string[] }) {
      return request<any>(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async delete(id: string) {
      return request<any>(`/roles/${id}`, {
        method: 'DELETE',
      });
    },
  },

  permissions: {
    async list() {
      return request<any>('/permissions');
    },
  },

  dashboard: {
    async getOverview(params?: { branchId?: string; date?: string } | string | null) {
      const q = new URLSearchParams();
      if (typeof params === 'string') {
        if (params && params !== 'all') q.append('branchId', params);
      } else if (params) {
        if (params.branchId && params.branchId !== 'all') q.append('branchId', params.branchId);
        if (params.date) q.append('date', params.date);
      }
      const qs = q.toString();
      return request<DashboardOverviewData>(`/dashboard/overview${qs ? `?${qs}` : ''}`);
    },
  },

  reports: {
    async getRevenue(params?: {
      startDate?: string;
      endDate?: string;
      period?: 'daily' | 'weekly' | 'monthly';
      groupBy?: 'day' | 'week' | 'month';
      branchId?: string | null;
    }) {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.period) q.append('period', params.period);
      if (params?.groupBy) q.append('groupBy', params.groupBy);
      if (params?.branchId && params.branchId !== 'all') q.append('branchId', params.branchId);
      const qs = q.toString();
      return request<RevenueReportData>(`/reports/revenue${qs ? `?${qs}` : ''}`);
    },

    async getTopItems(params?: {
      startDate?: string;
      endDate?: string;
      branchId?: string | null;
      limit?: number;
    }) {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.branchId && params.branchId !== 'all') q.append('branchId', params.branchId);
      if (params?.limit) q.append('limit', String(params.limit));
      const qs = q.toString();
      return request<TopItemsResponseData>(`/reports/top-items${qs ? `?${qs}` : ''}`);
    },

    async exportReport(params?: {
      startDate?: string;
      endDate?: string;
      branchId?: string;
      format?: 'csv' | 'json';
    }): Promise<Blob> {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.branchId && params.branchId !== 'all') q.append('branchId', params.branchId);
      if (params?.format) q.append('format', params.format);
      const qs = q.toString();

      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl.replace(/\/$/, '')}/reports/export${qs ? `?${qs}` : ''}`;
      const token = storageService.getAccessToken();
      const res = await fetch(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Xuất báo cáo thất bại với mã lỗi ${res.status}`);
      }
      return await res.blob();
    },
  },

  categories: {
    async list(params?: string | { restaurantId?: string; branchId?: string; isActive?: boolean }) {
      const q = new URLSearchParams();
      if (typeof params === 'string') {
        if (params) q.append('branchId', params);
      } else if (params) {
        if (params.restaurantId) q.append('restaurantId', params.restaurantId);
        if (params.branchId) q.append('branchId', params.branchId);
        if (params.isActive !== undefined) q.append('isActive', String(params.isActive));
      }
      const qs = q.toString();
      return request<any[]>(`/categories${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request<any>(`/categories/${id}`);
    },

    async create(payload: { name: string; slug?: string; icon?: string; order?: number; isActive?: boolean; branchIds?: string[] }) {
      return request<any>('/categories', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: { name?: string; slug?: string; icon?: string; order?: number; isActive?: boolean; branchIds?: string[] }) {
      return request<any>(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async delete(id: string) {
      return request<any>(`/categories/${id}`, {
        method: 'DELETE',
      });
    },

    async listPublic(params?: { restaurantId?: string; branchId?: string; slug?: string }) {
      const q = new URLSearchParams();
      if (params?.restaurantId) q.append('restaurantId', params.restaurantId);
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.slug) q.append('slug', params.slug);
      const qs = q.toString();
      return request<any[]>(`/categories/public${qs ? `?${qs}` : ''}`);
    },

    async seedDefault(restaurantId?: string) {
      const q = restaurantId ? `?restaurantId=${encodeURIComponent(restaurantId)}` : '';
      return request<any>(`/categories/seed-default${q}`, {
        method: 'POST',
      });
    },
  },

  menuItems: {
    async list(params?: {
      restaurantId?: string;
      branchId?: string;
      categoryId?: string;
      isAvailable?: boolean;
      isPopular?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    }) {
      const q = new URLSearchParams();
      if (params?.restaurantId) q.append('restaurantId', params.restaurantId);
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.categoryId && params.categoryId !== 'all') q.append('categoryId', params.categoryId);
      if (params?.isAvailable !== undefined) q.append('isAvailable', String(params.isAvailable));
      if (params?.isPopular !== undefined) q.append('isPopular', String(params.isPopular));
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/menu-items${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request<any>(`/menu-items/${id}`);
    },

    async create(payload: any) {
      return request<any>('/menu-items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: any) {
      return request<any>(`/menu-items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async toggleStatus(id: string, isAvailable?: boolean, branchId?: string) {
      return request<any>(`/menu-items/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          ...(isAvailable !== undefined ? { isAvailable } : {}),
          ...(branchId ? { branchId } : {}),
        }),
      });
    },

    async delete(id: string) {
      return request<any>(`/menu-items/${id}`, {
        method: 'DELETE',
      });
    },

    async listPublic(params?: {
      restaurantId?: string;
      branchId?: string;
      slug?: string;
      categoryId?: string;
      search?: string;
    }) {
      const q = new URLSearchParams();
      if (params?.restaurantId) q.append('restaurantId', params.restaurantId);
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.slug) q.append('slug', params.slug);
      if (params?.categoryId) q.append('categoryId', params.categoryId);
      if (params?.search) q.append('search', params.search);
      const qs = q.toString();
      return request<any[]>(`/menu-items/public${qs ? `?${qs}` : ''}`);
    },
  },

  tables: {
    async list(params?: {
      restaurantId?: string;
      branchId?: string;
      zoneId?: string;
      status?: string;
      search?: string;
    }) {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.zoneId && params.zoneId !== 'all') q.append('zoneId', params.zoneId);
      if (params?.status && params.status !== 'all') q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      const qs = q.toString();
      return request<any[]>(`/tables${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request<any>(`/tables/${id}`);
    },

    async create(payload: any) {
      return request<any>('/tables', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: any) {
      return request<any>(`/tables/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async updateStatus(id: string, status: string, totalGuests?: number) {
      return request<any>(`/tables/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...(totalGuests !== undefined ? { totalGuests } : {}) }),
      });
    },

    async transfer(payload: { fromTableId: string; toTableId: string; reason?: string }) {
      return request<any>('/tables/transfer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async merge(payload: { fromTableIds: string[]; targetTableId: string; note?: string }) {
      return request<any>('/tables/merge', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async moveItems(payload: MoveTableItemsPayload) {
      return request<any>('/tables/move-items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async delete(id: string) {
      return request<any>(`/tables/${id}`, {
        method: 'DELETE',
      });
    },

    async seedDefault(branchId?: string) {
      const q = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
      return request<any>(`/tables/seed-default${q}`, {
        method: 'POST',
      });
    },

    async listPublicBySlug(restaurantSlug: string) {
      return request<PublicRestaurantTablesData>(`/tables/public/by-restaurant/${encodeURIComponent(restaurantSlug)}`);
    },

    async callStaff(
      tableId: string,
      payload: {
        reason: string;
        note?: string;
        qrToken?: string;
        restaurantSlug?: string;
      },
    ) {
      return request<{
        notificationId: string;
        tableId: string;
        tableName: string;
        cooldownActive?: boolean;
        remainingSeconds?: number;
        message?: string;
      }>(`/tables/${tableId}/call-staff`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async acknowledgeCall(tableId: string) {
      return request<any>(`/tables/${tableId}/acknowledge-call`, {
        method: 'POST',
      });
    },
  },

  tableZones: {
    async list(params?: { branchId?: string }) {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      const qs = q.toString();
      return request<any[]>(`/table-zones${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request<any>(`/table-zones/${id}`);
    },

    async create(payload: { name: string; description?: string; branchId?: string }) {
      return request<any>('/table-zones', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, payload: { name?: string; description?: string }) {
      return request<any>(`/table-zones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },

    async delete(id: string) {
      return request<any>(`/table-zones/${id}`, {
        method: 'DELETE',
      });
    },
  },

  orders: {
    async list(params?: {
      branchId?: string;
      tableId?: string;
      status?: string;
      isPaid?: boolean;
      page?: number;
      limit?: number;
    }) {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.tableId) q.append('tableId', params.tableId);
      if (params?.status && params.status !== 'all') q.append('status', params.status);
      if (params?.isPaid !== undefined) q.append('isPaid', String(params.isPaid));
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/orders${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request<Order>(`/orders/${id}`);
    },

    async getByTable(tableId: string) {
      return request<Order | null>(`/orders/by-table/${tableId}`);
    },

    async create(
      payload: {
        tableId: string;
        items: any[];
        orderSource?: string;
        branchId?: string;
        customerNote?: string;
      },
      options?: { idempotencyKey?: string },
    ) {
      return request<Order>('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: options?.idempotencyKey ? { 'idempotency-key': options.idempotencyKey } : undefined,
      });
    },

    async addItems(
      id: string,
      payload: { items: any[]; note?: string },
      options?: { idempotencyKey?: string },
    ) {
      return request<Order>(`/orders/${id}/items`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: options?.idempotencyKey ? { 'idempotency-key': options.idempotencyKey } : undefined,
      });
    },

    async confirmRound(orderId: string, roundNumber: number) {
      return request<Order>(`/orders/${orderId}/rounds/${roundNumber}/confirm`, {
        method: 'POST',
      });
    },

    async cancelRound(orderId: string, roundNumber: number, reason?: string) {
      return request<Order>(`/orders/${orderId}/rounds/${roundNumber}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Từ chối lượt gọi món' }),
      });
    },

    async confirm(id: string) {
      return request<Order>(`/orders/${id}/confirm`, {
        method: 'POST',
      });
    },

    async cancelItem(orderId: string, itemId: string, reason?: string) {
      return request<Order>(`/orders/${orderId}/items/${itemId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Hủy món' }),
      });
    },

    async updateItemStatus(
      orderId: string,
      itemId: string,
      status: 'Waiting' | 'Cooking' | 'Ready' | 'Served' | 'Cancelled',
    ) {
      return request<any>(`/orders/${orderId}/items/${itemId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    async updateStatus(id: string, status: string, reason?: string) {
      return request<any>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
      });
    },

    async requestPayment(id: string, paymentMethod?: string) {
      return request<Order>(`/orders/${id}/request-payment`, {
        method: 'POST',
        body: JSON.stringify({ paymentMethod: paymentMethod || 'Cash' }),
      });
    },

    async revertPaymentRequest(id: string) {
      return request<Order>(`/orders/${id}/revert-payment-request`, {
        method: 'POST',
      });
    },

    async previewBill(id: string, query?: BillPreviewQuery) {
      const q = new URLSearchParams();
      if (query?.discountAmount !== undefined) q.append('discountAmount', String(query.discountAmount));
      if (query?.discountPercent !== undefined) q.append('discountPercent', String(query.discountPercent));
      if (query?.serviceFee !== undefined) q.append('serviceFee', String(query.serviceFee));
      if (query?.serviceFeePercent !== undefined) q.append('serviceFeePercent', String(query.serviceFeePercent));
      if (query?.vatAmount !== undefined) q.append('vatAmount', String(query.vatAmount));
      if (query?.vatPercent !== undefined) q.append('vatPercent', String(query.vatPercent));
      const qs = q.toString();
      return request<BillPreviewResult>(`/orders/${id}/bill-preview${qs ? `?${qs}` : ''}`);
    },

    async pay(
      id: string,
      payload?: PayOrderPayload,
      options?: { idempotencyKey?: string },
    ) {
      return request<any>(`/orders/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify(payload || {}),
        headers: options?.idempotencyKey ? { 'idempotency-key': options.idempotencyKey } : undefined,
      });
    },

    async completePayment(
      id: string,
      payload?: PayOrderPayload,
      options?: { idempotencyKey?: string },
    ) {
      return request<any>(`/orders/${id}/complete-payment`, {
        method: 'POST',
        body: JSON.stringify(payload || {}),
        headers: options?.idempotencyKey ? { 'idempotency-key': options.idempotencyKey } : undefined,
      });
    },

    async getReceipt(id: string, query?: BillPreviewQuery) {
      const q = new URLSearchParams();
      if (query?.discountAmount !== undefined) q.append('discountAmount', String(query.discountAmount));
      if (query?.discountPercent !== undefined) q.append('discountPercent', String(query.discountPercent));
      if (query?.serviceFee !== undefined) q.append('serviceFee', String(query.serviceFee));
      if (query?.serviceFeePercent !== undefined) q.append('serviceFeePercent', String(query.serviceFeePercent));
      if (query?.vatAmount !== undefined) q.append('vatAmount', String(query.vatAmount));
      if (query?.vatPercent !== undefined) q.append('vatPercent', String(query.vatPercent));
      const qs = q.toString();
      return request<ReceiptData>(`/orders/${id}/receipt${qs ? `?${qs}` : ''}`);
    },

    async getVietQr(id: string) {
      return request<VietQrPaymentInfo>(`/orders/${id}/vietqr`);
    },

    async cancel(id: string, reason?: string) {
      return request<any>(`/orders/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason || 'Hủy đơn hàng' }),
      });
    },
  },

  customerOrders: {
    async getTableContext(params: {
      restaurantSlug: string;
      tableCode: string;
      qrToken?: string;
    }) {
      const q = new URLSearchParams();
      q.append('restaurantSlug', params.restaurantSlug);
      q.append('tableCode', params.tableCode);
      if (params.qrToken) q.append('qrToken', params.qrToken);
      return request<CustomerTableContext>(`/orders/public/table-context?${q.toString()}`);
    },

    async create(payload: CustomerCreateOrderPayload, options?: { idempotencyKey?: string }) {
      return request<Order>('/orders/customer', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: options?.idempotencyKey ? { 'idempotency-key': options.idempotencyKey } : undefined,
      });
    },

    async addItems(
      orderId: string,
      payload: CustomerAddItemsPayload,
      options?: { idempotencyKey?: string },
    ) {
      return request<Order>('/orders/customer/items', {
        method: 'POST',
        body: JSON.stringify({ ...payload, orderId: payload.orderId || orderId }),
        headers: options?.idempotencyKey ? { 'idempotency-key': options.idempotencyKey } : undefined,
      });
    },

    async getActiveOrder(orderId: string) {
      return request<Order>(`/orders/customer/${orderId}`);
    },

    async requestPayment(
      orderId: string,
      payload: {
        restaurantSlug: string;
        tableCode: string;
        qrToken: string;
        paymentMethod: 'VietQR' | 'Cash';
      },
    ) {
      return request<Order>(`/orders/customer/${orderId}/request-payment`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getVietQr(
      orderId: string,
      params: { restaurantSlug: string; tableCode: string; qrToken?: string },
    ) {
      const q = new URLSearchParams();
      q.append('restaurantSlug', params.restaurantSlug);
      q.append('tableCode', params.tableCode);
      if (params.qrToken) q.append('qrToken', params.qrToken);
      return request<VietQrPaymentInfo>(`/orders/customer/${orderId}/vietqr?${q.toString()}`);
    },

    async getReceipt(
      orderId: string,
      params: { restaurantSlug?: string; tableCode?: string; qrToken?: string; receiptAccessToken?: string },
    ) {
      const q = new URLSearchParams();
      if (params.restaurantSlug) q.append('restaurantSlug', params.restaurantSlug);
      if (params.tableCode) q.append('tableCode', params.tableCode);
      if (params.qrToken) q.append('qrToken', params.qrToken);
      if (params.receiptAccessToken) q.append('receiptAccessToken', params.receiptAccessToken);
      return request<ReceiptData>(`/orders/customer/${orderId}/receipt?${q.toString()}`);
    },

    async downloadBill(
      orderId: string,
      params: { restaurantSlug?: string; tableCode?: string; qrToken?: string; receiptAccessToken?: string },
    ) {
      const q = new URLSearchParams();
      if (params.restaurantSlug) q.append('restaurantSlug', params.restaurantSlug);
      if (params.tableCode) q.append('tableCode', params.tableCode);
      if (params.qrToken) q.append('qrToken', params.qrToken);
      if (params.receiptAccessToken) q.append('receiptAccessToken', params.receiptAccessToken);
      return request<ReceiptData>(`/orders/customer/${orderId}/download-bill?${q.toString()}`);
    },

    async callStaff(
      tableId: string,
      payload: {
        reason: string;
        note?: string;
        qrToken?: string;
        restaurantSlug?: string;
      },
    ) {
      return request<{
        notificationId: string;
        tableId: string;
        tableName: string;
        cooldownActive?: boolean;
        remainingSeconds?: number;
        message?: string;
      }>(`/tables/${tableId}/call-staff`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  kitchen: {
    async getOrders(params?: {
      branchId?: string;
      zoneId?: string;
      tableId?: string;
      status?: string;
      search?: string;
      includeUnconfirmed?: boolean;
    }) {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.zoneId) q.append('zoneId', params.zoneId);
      if (params?.tableId) q.append('tableId', params.tableId);
      if (params?.status && params.status !== 'all') q.append('status', params.status);
      if (params?.search && params.search.trim()) q.append('search', params.search.trim());
      if (params?.includeUnconfirmed !== undefined) q.append('includeUnconfirmed', String(params.includeUnconfirmed));
      const qs = q.toString();
      return request<Order[]>(`/kitchen/orders${qs ? `?${qs}` : ''}`);
    },

    async getItemsSummary(params?: { branchId?: string }) {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      const qs = q.toString();
      return request<{
        totalWaitingItems: number;
        totalCookingItems: number;
        summary: Array<{
          menuItemId: string;
          name: string;
          waitingQty: number;
          cookingQty: number;
          totalActiveQty: number;
          notes: string[];
          tables: string[];
        }>;
      }>(`/kitchen/items-summary${qs ? `?${qs}` : ''}`);
    },

    async startCookingItem(itemId: string, orderId?: string) {
      if (orderId) {
        return request<Order>(`/kitchen/orders/${orderId}/items/${itemId}/start-cooking`, {
          method: 'POST',
        });
      }
      return request<Order>(`/order-items/${itemId}/start-cooking`, {
        method: 'POST',
      });
    },

    async markItemReady(itemId: string, orderId?: string) {
      if (orderId) {
        return request<Order>(`/kitchen/orders/${orderId}/items/${itemId}/mark-ready`, {
          method: 'POST',
        });
      }
      return request<Order>(`/order-items/${itemId}/mark-ready`, {
        method: 'POST',
      });
    },

    async markItemServed(itemId: string, orderId?: string) {
      if (orderId) {
        return request<Order>(`/kitchen/orders/${orderId}/items/${itemId}/mark-served`, {
          method: 'POST',
        });
      }
      return request<Order>(`/order-items/${itemId}/mark-served`, {
        method: 'POST',
      });
    },

    async startCookingAll(orderId: string, roundNumber?: number) {
      return request<Order>(`/kitchen/orders/${orderId}/start-cooking-all`, {
        method: 'POST',
        body: JSON.stringify(roundNumber ? { roundNumber } : {}),
      });
    },

    async markReadyAll(orderId: string, roundNumber?: number) {
      return request<Order>(`/kitchen/orders/${orderId}/mark-ready-all`, {
        method: 'POST',
        body: JSON.stringify(roundNumber ? { roundNumber } : {}),
      });
    },

    async getMenuItems(params?: { branchId?: string; categoryId?: string; search?: string }) {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.categoryId && params.categoryId !== 'all') q.append('categoryId', params.categoryId);
      if (params?.search && params.search.trim()) q.append('search', params.search.trim());
      const qs = q.toString();
      return request<any>(`/kitchen/menu-items${qs ? `?${qs}` : ''}`);
    },

    async toggleItemAvailability(itemId: string, isAvailable: boolean, branchId?: string) {
      return request<any>(`/kitchen/menu-items/${itemId}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({ isAvailable, ...(branchId ? { branchId } : {}) }),
      });
    },
  },

  bills: {
    async list(params?: {
      branchId?: string;
      paymentMethod?: string;
      paymentStatus?: string;
      fromDate?: string;
      toDate?: string;
      search?: string;
      page?: number;
      limit?: number;
    }) {
      const q = new URLSearchParams();
      if (params?.branchId && params.branchId !== 'all') q.append('branchId', params.branchId);
      if (params?.paymentMethod && params.paymentMethod !== 'all') q.append('paymentMethod', params.paymentMethod);
      if (params?.paymentStatus && params.paymentStatus !== 'all') q.append('paymentStatus', params.paymentStatus);
      if (params?.fromDate) q.append('fromDate', params.fromDate);
      if (params?.toDate) q.append('toDate', params.toDate);
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const qs = q.toString();
      return request<{
        data: Bill[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/bills${qs ? `?${qs}` : ''}`);
    },

    async get(id: string) {
      return request<{ bill: Bill; receiptData: ReceiptData }>(`/bills/${id}`);
    },

    async getByOrder(orderId: string) {
      return request<{ bill: Bill; receiptData: ReceiptData }>(`/bills/by-order/${orderId}`);
    },

    async logPrint(id: string) {
      return request<{ bill: Bill; receiptData: ReceiptData; base64EscPos?: string }>(`/bills/${id}/print`, {
        method: 'POST',
      });
    },
  },

  activityLogs: {
    async list(params?: {
      module?: string;
      action?: string;
      branchId?: string;
      targetId?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      limit?: number;
    }) {
      const q = new URLSearchParams();
      if (params?.module && params.module !== 'all') q.append('module', params.module);
      if (params?.action && params.action !== 'all') q.append('action', params.action);
      if (params?.branchId && params.branchId !== 'all') q.append('branchId', params.branchId);
      if (params?.targetId) q.append('targetId', params.targetId);
      if (params?.fromDate) q.append('fromDate', params.fromDate);
      if (params?.toDate) q.append('toDate', params.toDate);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const qs = q.toString();
      return request<any>(`/activity-logs${qs ? `?${qs}` : ''}`);
    },
  },

  reviews: {
    async createCustomerReview(payload: CreateCustomerReviewPayload) {
      return request<ReviewItem>('/reviews/customer', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getCustomerReviewByOrder(
      orderId: string,
      params?: {
        restaurantSlug?: string;
        tableCode?: string;
        qrToken?: string;
        receiptAccessToken?: string;
      },
    ) {
      const q = new URLSearchParams();
      if (params?.restaurantSlug) q.append('restaurantSlug', params.restaurantSlug);
      if (params?.tableCode) q.append('tableCode', params.tableCode);
      if (params?.qrToken) q.append('qrToken', params.qrToken);
      if (params?.receiptAccessToken) q.append('receiptAccessToken', params.receiptAccessToken);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<ReviewItem>(`/reviews/customer/by-order/${orderId}${queryStr}`);
    },

    async list(params?: QueryReviewsParams) {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.rating) q.append('rating', String(params.rating));
      if (params?.hasReply !== undefined) q.append('hasReply', String(params.hasReply));
      if (params?.fromDate) q.append('fromDate', params.fromDate);
      if (params?.toDate) q.append('toDate', params.toDate);
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ items: ReviewItem[]; total: number; page: number; limit: number; totalPages: number }>(
        `/reviews${queryStr}`,
      );
    },

    async getSummary(params?: { branchId?: string }) {
      const q = new URLSearchParams();
      if (params?.branchId) q.append('branchId', params.branchId);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<ReviewSummaryResult>(`/reviews/summary${queryStr}`);
    },

    async reply(id: string, payload: { content: string }) {
      return request<ReviewItem>(`/reviews/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async toggleHidden(id: string) {
      return request<ReviewItem>(`/reviews/${id}/toggle-hidden`, {
        method: 'PATCH',
      });
    },
  },

  referrals: {
    async validateCode(code: string) {
      return request<ValidatedReferralInfo>(`/referrals/validate/${encodeURIComponent(code)}`);
    },

    async submitApplication(payload: SalesApplicationPayload) {
      return request<{ success: boolean; message: string; applicationId?: string }>('/referrals/apply', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  sales: {
    async getDashboard() {
      return request<SalesDashboardData>('/sales/dashboard');
    },

    async getRestaurants(params?: QueryReferredRestaurantsParams) {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.subscriptionStatus) q.append('subscriptionStatus', params.subscriptionStatus);
      if (params?.isActivationQualified !== undefined && params?.isActivationQualified !== '') {
        q.append('isActivationQualified', String(params.isActivationQualified));
      }
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ data: ReferredRestaurantItem[]; total: number; page: number; limit: number; totalPages: number }>(
        `/sales/restaurants${queryStr}`,
      );
    },

    async createRestaurant(payload: CreateAssistedRestaurantPayload) {
      return request<{
        success: boolean;
        message: string;
        restaurant: { id: string; name: string; slug: string; phone: string; address: string };
        owner: { id: string; fullName: string; email: string; phone: string };
      }>('/sales/restaurants', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getCommissions(params?: QueryCommissionsParams) {
      const q = new URLSearchParams();
      if (params?.commissionType) q.append('commissionType', params.commissionType);
      if (params?.status) q.append('status', params.status);
      if (params?.payoutPeriod) q.append('payoutPeriod', params.payoutPeriod);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request<{ data: CommissionItem[]; total: number; page: number; limit: number; totalPages: number }>(
        `/sales/commissions${queryStr}`,
      );
    },

    async getSubTeam() {
      return request<{ total: number; members: SalesTeamMember[] }>('/sales/sub-team');
    },

    async updatePayoutBank(payload: PayoutBankAccount) {
      return request<{ success: boolean; message: string; payoutBankAccount: PayoutBankAccount }>(
        '/sales/profile/bank-account',
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
      );
    },
  },

  platform: {
    async getOverview() {
      return request<PlatformOverviewDto>('/platform/overview');
    },

    async getRestaurants(params?: {
      search?: string;
      plan?: string;
      subscriptionStatus?: string;
      isSuspended?: boolean | string;
      salesId?: string;
      sortBy?: string;
      sortOrder?: string;
      page?: number;
      limit?: number;
    }) {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.plan) q.append('plan', params.plan);
      if (params?.subscriptionStatus) q.append('subscriptionStatus', params.subscriptionStatus);
      if (params?.isSuspended !== undefined && params?.isSuspended !== '') {
        q.append('isSuspended', String(params.isSuspended));
      }
      if (params?.salesId) q.append('salesId', params.salesId);
      if (params?.sortBy) q.append('sortBy', params.sortBy);
      if (params?.sortOrder) q.append('sortOrder', params.sortOrder);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<PlatformRestaurantsResponse>(`/platform/restaurants${qs}`);
    },

    async updateRestaurantStatus(id: string, payload: { isSuspended: boolean; suspendReason?: string }) {
      return request<any>(`/platform/restaurants/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    async updateRestaurantSubscription(
      id: string,
      payload: {
        plan: string;
        billingCycle?: string;
        transactionType: 'INITIAL_SETUP' | 'RENEWAL';
        netAmount: number;
        planExpiresAt?: string | Date;
        note?: string;
      },
    ) {
      return request<any>(`/platform/restaurants/${id}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    async getRestaurantRevenues(params?: {
      timeRange?: string;
      startDate?: string;
      endDate?: string;
      restaurantId?: string;
    }) {
      const q = new URLSearchParams();
      if (params?.timeRange) q.append('timeRange', params.timeRange);
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.restaurantId) q.append('restaurantId', params.restaurantId);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<PlatformRevenueReport>(`/platform/revenues/restaurants${qs}`);
    },

    async getSaaSRevenues(params?: {
      timeRange?: string;
      startDate?: string;
      endDate?: string;
    }) {
      const q = new URLSearchParams();
      if (params?.timeRange) q.append('timeRange', params.timeRange);
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<PlatformSaaSRevenueDto>(`/platform/revenues/saas${qs}`);
    },

    async getSalesReps() {
      return request<PlatformSalesRepItem[]>('/platform/sales-reps');
    },

    async createSalesRep(payload: {
      fullName: string;
      email: string;
      phone: string;
      password?: string;
      referralCode?: string;
      parentSalesId?: string;
      setupCommissionRate?: number;
      renewalCommissionRate?: number;
      activationBonusAmount?: number;
      teamBonusAmount?: number;
      payoutBankAccount?: any;
    }) {
      return request<{ success: boolean; data: any }>('/platform/sales-reps', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async updateSalesRep(id: string, payload: {
      status?: 'ACTIVE' | 'INACTIVE';
      referralCode?: string;
      setupCommissionRate?: number;
      renewalCommissionRate?: number;
      activationBonusAmount?: number;
      teamBonusAmount?: number;
      payoutBankAccount?: any;
    }) {
      return request<{ success: boolean; data: any }>(`/platform/sales-reps/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },

    async getSalesApplications() {
      return request<any[]>('/platform/sales-applications');
    },

    async approveSalesApplication(id: string) {
      return request<{ success: boolean; message: string; user: any }>(
        `/platform/sales-applications/${id}/approve`,
        {
          method: 'POST',
        },
      );
    },

    async executePayoutBatch(payload: PayoutBatchDto) {
      return request<PayoutBatchResult>('/platform/commissions/payout-batch', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async getCommissions(params?: QueryPlatformCommissionsParams) {
      const q = new URLSearchParams();
      if (params?.status && params.status !== 'ALL') q.append('status', params.status);
      if (params?.salesId) q.append('salesId', params.salesId);
      if (params?.payoutPeriod) q.append('payoutPeriod', params.payoutPeriod);
      if (params?.search) q.append('search', params.search);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      const qs = q.toString() ? `?${q.toString()}` : '';
      return request<PlatformCommissionsResponse>(`/platform/commissions${qs}`);
    },
  },
};



