// applib/api/client.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { authService } from '@/applib/services/auth/authService';
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

    // Always get a fresh token on each request
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token but this isn't an auth request, log it
      console.warn('Making authenticated request without token:', config.url);
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

    // Only handle 401s that aren't from auth endpoints and haven't been retried
    if (error.response?.status === 401 &&
        !originalRequest.url?.includes('/auth/') &&
        !originalRequest._retry) {

      console.log("Authentication error detected");

      // For API requests, don't auto-redirect to login, just return the error
      // This allows components to handle auth errors appropriately
      if (originalRequest.url?.includes('/api/') ||
          originalRequest.url?.includes('/posts/')) {
        console.log("API auth error, returning to caller");
        return Promise.reject(error);
      }

      // For other requests, redirect after a delay
      console.log("Navigation auth error, redirecting to login in 3 seconds");

      // Clear any auth tokens
      authService.removeToken();

      // Add a delay before redirect to avoid interrupting other operations
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log("Redirecting to login page");
          window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }, 3000);
    }

    return Promise.reject(error);
  }
);


// Debug interceptor for requests
api.interceptors.request.use(request => {
  // Safely log request details
  console.log('API Request:', {
    url: request.url,
    method: request.method,
    // Log Authorization header safely if it exists and is a string
    headers: {
      ...request.headers,
      Authorization: typeof request.headers.Authorization === 'string'
        ? `${request.headers.Authorization.substring(0, 15)}...`
        : 'none'
    }
  });
  return request;
});

// Debug interceptor for responses
api.interceptors.response.use(
  response => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const updateApiAuthHeader = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Updated API auth header with token');
  } else {
    delete api.defaults.headers.common['Authorization'];
    console.log('Removed API auth header');
  }
};

export default api;