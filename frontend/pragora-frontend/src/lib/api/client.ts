// lib/api/client.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { authService } from '@/lib/services/auth/authService';
import { API_ENDPOINTS } from './endpoints';

export const TOKEN_KEY = 'access_token';

export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _authSkip?: boolean;
  _retry?: boolean;
}

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _authSkip?: boolean;
  _retry?: boolean;
}
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

export const api: AxiosInstance & {
  get<T = any>(url: string, config?: ExtendedAxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: ExtendedAxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: ExtendedAxiosRequestConfig): Promise<T>;
} = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Process failed requests queue
const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Add request interceptor for authentication
api.interceptors.request.use(
  (config: CustomInternalAxiosRequestConfig) => {
    if (config._authSkip || config.url?.includes('/auth/')) {
      return config;
    }

    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      if (originalRequest._retry) {
        authService.removeToken();
        return Promise.reject({
          message: 'Session expired',
          status: 401,
          originalError: error
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        authService.removeToken();
        isRefreshing = false;
        processQueue(error);

        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }

        return Promise.reject({
          message: 'Authentication required',
          status: 401,
          originalError: error
        });
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const updateApiAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;