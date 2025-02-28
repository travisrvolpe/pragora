// applib/services/auth/authService.ts
import { api, TOKEN_KEY, updateApiAuthHeader, ExtendedAxiosRequestConfig } from '@/applib/api/client';
import { API_ENDPOINTS } from '@/applib/api/endpoints';
import { AuthResponse, LoginFormData, RegisterFormData, User } from '@/types/auth';
import { apolloClient } from '@/applib/graphql/apollo-client';
import { QueryClient } from '@tanstack/react-query';

const AUTH_PERSIST_KEY = 'auth_persist';
let currentAuthCheckPromise: Promise<User> | null = null;
let tokenRefreshTimeout: NodeJS.Timeout | null = null;
let queryClient: QueryClient | null = null;

const persistAuthState = (token: string) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(AUTH_PERSIST_KEY, 'true');
    localStorage.setItem('token_created_at', Date.now().toString());
  } catch (error) {
    console.error('Error persisting auth state:', error);
  }
};

const clearAuthState = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_PERSIST_KEY);
    localStorage.removeItem('token_created_at');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};

export const setQueryClient = (client: QueryClient) => {
  queryClient = client;
};

export const authService = {
  getToken: () => {
    if (typeof window === 'undefined') return null;

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;

      // Basic token validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        authService.removeToken();
        return null;
      }

      // Check expiration
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        authService.removeToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Token validation error:', error);
      authService.removeToken();
      return null;
    }
  },

  setToken: (token: string) => {
    try {
      persistAuthState(token);
      updateApiAuthHeader(token);

      // Schedule token refresh
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
      tokenRefreshTimeout = setTimeout(() => {
        authService.refreshToken().catch(console.error);
      }, 15 * 60 * 1000); // 15 minutes
    } catch (error) {
      console.error('Error setting token:', error);
      throw error;
    }
  },

  removeToken: () => {
    try {
      clearAuthState();
      updateApiAuthHeader(null);
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
      currentAuthCheckPromise = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  async refreshToken(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        // Reset auth check promise to force re-validation
        currentAuthCheckPromise = null;
        // Schedule next refresh
        tokenRefreshTimeout = setTimeout(() => {
          authService.refreshToken().catch(console.error);
        }, 15 * 60 * 1000);
      } else {
        throw new Error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await authService.logout();
    }
  },

  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const config: ExtendedAxiosRequestConfig = {
        _authSkip: true,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, credentials, config);
      const token = response.data.access_token;

      if (!token) {
        throw new Error('No access token received');
      }

      authService.setToken(token);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      authService.removeToken();
      throw error;
    }
  },

  async register(userData: RegisterFormData): Promise<AuthResponse> {
    try {
      const config: ExtendedAxiosRequestConfig = {
        _authSkip: true,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await api.post(API_ENDPOINTS.AUTH_REGISTER, userData, config);
      const token = response.data.access_token;

      if (!token) {
        throw new Error('No access token received');
      }

      authService.setToken(token);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      authService.removeToken();
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User> => {
    if (typeof window === 'undefined') {
      throw new Error('Cannot get current user during SSR');
    }

    try {
      if (currentAuthCheckPromise) {
        return await currentAuthCheckPromise;
      }

      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      currentAuthCheckPromise = (async () => {
        try {
          const config: ExtendedAxiosRequestConfig = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };

          const response = await api.get(API_ENDPOINTS.AUTH_GET_USER, config);
          return response.data.data || response.data;
        } catch (error) {
          currentAuthCheckPromise = null;
          throw error;
        }
      })();

      return await currentAuthCheckPromise;
    } catch (error) {
      console.error('Error getting current user:', error);
      currentAuthCheckPromise = null;
      throw error;
    }
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    const token = authService.getToken();
    const isPersisted = localStorage.getItem(AUTH_PERSIST_KEY) === 'true';
    return !!token && isPersisted;
  },

  async clearCache(): Promise<void> {
    try {
      // Clear Apollo cache
      await apolloClient.clearStore();

      // Clear React Query cache if available
      if (queryClient) {
        await queryClient.clear();
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  logout: async () => {
    try {
      // Clear auth state first
      authService.removeToken();

      // Clear caches
      await authService.clearCache();

      // Reset auth check state
      currentAuthCheckPromise = null;
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }

      // Only redirect if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Ensure redirect happens even on error
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  }
};