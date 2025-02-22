// lib/services/engagement/engageService.ts
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { EngagementResponse } from '@/types/posts/engagement';
import { authService } from '@/lib/services/auth/authService';
import api from '@/lib/api/client';

let pendingRequests = new Map<string, Promise<any>>();

const getRequestKey = (postId: number, action: string) => `${postId}-${action}`;

const handleEngagementError = (error: unknown): never => {
  // Clear pending request on error
  if (error instanceof Error && 'config' in error) {
    const axiosError = error as AxiosError;
    const url = axiosError.config?.url;
    if (url) {
      pendingRequests.delete(url);
    }
  }

  if (axios.isAxiosError(error)) {
    // Handle different error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.response?.status === 401) {
      // Don't throw on auth errors, let the auth service handle it
      throw new Error('Authentication required');
    }
    throw new Error(error.response?.data?.detail || 'Failed to process interaction');
  }
  throw error;
};

const executeRequest = async <T>(
  requestKey: string,
  requestFn: () => Promise<T>,
  timeout = 5000
): Promise<T> => {
  // Check for existing request
  const existingRequest = pendingRequests.get(requestKey);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  // Create new request with timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeout);
  });

  const request = Promise.race([
    requestFn(),
    timeoutPromise
  ]).finally(() => {
    pendingRequests.delete(requestKey);
  });

  pendingRequests.set(requestKey, request);
  return request;
};

export const engagementService = {
  async like(postId: number): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'like');
    return executeRequest(requestKey, async () => {
      try {
        const response = await api.post<EngagementResponse>(
          API_ENDPOINTS.POST_LIKE(postId),
          {},
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw handleEngagementError(error);
      }
    });
  },

  async dislike(postId: number): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'dislike');
    return executeRequest(requestKey, async () => {
      try {
        const response = await api.post<EngagementResponse>(
          API_ENDPOINTS.POST_DISLIKE(postId),
          {},
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw handleEngagementError(error);
      }
    });
  },

  async save(postId: number): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'save');
    return executeRequest(requestKey, async () => {
      try {
        const response = await api.post<EngagementResponse>(
          API_ENDPOINTS.POST_SAVE(postId),
          {},
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw handleEngagementError(error);
      }
    });
  },

  async share(postId: number): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'share');
    return executeRequest(requestKey, async () => {
      try {
        const response = await api.post<EngagementResponse>(
          API_ENDPOINTS.POST_SHARE(postId),
          {},
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw handleEngagementError(error);
      }
    });
  },

  async report(postId: number, reason: string): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'report');
    return executeRequest(requestKey, async () => {
      try {
        const response = await api.post<EngagementResponse>(
          API_ENDPOINTS.POST_REPORT(postId),
          { reason },
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      } catch (error) {
        throw handleEngagementError(error);
      }
    });
  }
};