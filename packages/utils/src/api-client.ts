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
  },

  branches: {
    async list() {
      return request<any[]>('/branches');
    },

    async get(id: string) {
      return request<any>(`/branches/${id}`);
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
  },
};
