import { storageService } from './storage';

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

  dashboard: {
    async getOverview(branchId?: string | null) {
      const q = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';
      return request<any>(`/dashboard/overview${q}`);
    },
  },

  reports: {
    async getRevenue(params?: { startDate?: string; endDate?: string; branchId?: string | null }) {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.branchId) q.append('branchId', params.branchId);
      const queryStr = q.toString();
      return request<any>(`/reports/revenue${queryStr ? `?${queryStr}` : ''}`);
    },

    async getTopItems(params?: { startDate?: string; endDate?: string; branchId?: string | null; limit?: number }) {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.branchId) q.append('branchId', params.branchId);
      if (params?.limit) q.append('limit', String(params.limit));
      const queryStr = q.toString();
      return request<any>(`/reports/top-items${queryStr ? `?${queryStr}` : ''}`);
    },
  },
};

