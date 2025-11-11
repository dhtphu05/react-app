import api from '@/lib/api/axiosConfig';
import type {
  ApiResponse,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from './types';

const unwrap = <T>(payload: ApiResponse<T>): T => {
  if (!payload.success) {
    throw new Error(payload.error.message);
  }
  return payload.data;
};

export const authApi = {
  async login(email: string): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email });
    return unwrap(response.data);
  },

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await api.post<ApiResponse<RefreshResponse>>('/auth/refresh', {
      refreshToken,
    });
    return unwrap(response.data);
  },

  async logout(refreshToken: string): Promise<void> {
    const response = await api.post<ApiResponse<{ message: string }>>('/auth/logout', {
      refreshToken,
    });
    unwrap(response.data);
  },

  async me(): Promise<MeResponse> {
    const response = await api.get<ApiResponse<MeResponse>>('/auth/me');
    return unwrap(response.data);
  },
};
