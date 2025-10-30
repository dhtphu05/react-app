import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@/config/constants';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/features/auth/tokenStore';
import type { ApiResponse, RefreshResponse } from '@/features/auth/types';

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

type PendingRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let pendingRequests: PendingRequest[] = [];

const queueRequest = (pending: PendingRequest): void => {
  pendingRequests.push(pending);
};

const processQueue = (error: unknown, token: string | null): void => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error ?? new Error('Unable to refresh token'));
    } else {
      resolve(token);
    }
  });
  pendingRequests = [];
};

const parseRefreshResponse = (
  payload: ApiResponse<RefreshResponse>
): RefreshResponse => {
  if (!payload.success) {
    throw new Error(payload.error.message);
  }
  return payload.data;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    if (status !== 401 && status !== 403) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url ?? '';
    if (requestUrl.includes('/auth/refresh')) {
      clearTokens();
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      processQueue(error, null);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queueRequest({
          resolve: (newAccessToken) => {
            const headers: AxiosRequestConfig['headers'] = {
              ...(originalRequest.headers ?? {}),
              Authorization: `Bearer ${newAccessToken}`,
            };
            originalRequest.headers = headers;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post<ApiResponse<RefreshResponse>>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const tokens = parseRefreshResponse(refreshResponse.data);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      processQueue(null, tokens.accessToken);

      originalRequest.headers = {
        ...(originalRequest.headers ?? {}),
        Authorization: `Bearer ${tokens.accessToken}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
