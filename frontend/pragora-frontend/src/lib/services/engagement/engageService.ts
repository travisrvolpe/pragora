// lib/services/engagement/engageService.ts
import axios, { AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { EngagementResponse } from '@/types/posts/engagement';
import { authService } from '@/lib/services/auth/authService';
import api from '@/lib/api/client';

// Configuration
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Track pending requests
const pendingRequests = new Map<string, Promise<any>>();

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
    // Handle specific error types
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    }
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait a moment.');
    }
    throw new Error(error.response?.data?.detail || 'Failed to process interaction');
  }

  // For non-Axios errors
  throw error instanceof Error ? error : new Error('An unexpected error occurred');
};

const executeRequest = async <T>(
  requestKey: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  let retryCount = 0;

  const attemptRequest = async (): Promise<T> => {
    try {
      const response = await requestFn();
      pendingRequests.delete(requestKey);
      return response;
    } catch (error) {
      // Retry on network errors or timeouts
      if (retryCount < MAX_RETRIES && error instanceof Error &&
          (error.message.includes('timeout') ||
           error.message.includes('network') ||
           (axios.isAxiosError(error) && error.code === 'ECONNABORTED'))) {
        retryCount++;
        console.log(`Retrying request (${retryCount}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
        return attemptRequest();
      }
      pendingRequests.delete(requestKey);
      throw handleEngagementError(error);
    }
  };

  // Check for existing request
  const existingRequest = pendingRequests.get(requestKey);
  if (existingRequest) {
    return existingRequest as Promise<T>;
  }

  // Create and track new request
  const request = attemptRequest();
  pendingRequests.set(requestKey, request);
  return request;
};

export const engagementService = {
  async like(postId: number): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'like');
    return executeRequest(requestKey, async () => {
      const response = await api.post<EngagementResponse>(
        API_ENDPOINTS.POST_LIKE(postId),
        {},
        {
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    });
  },

  async dislike(postId: number): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'dislike');
    return executeRequest(requestKey, async () => {
      const response = await api.post<EngagementResponse>(
        API_ENDPOINTS.POST_DISLIKE(postId),
        {},
        {
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    });
  },

  async save(postId: number): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'save');
    return executeRequest(requestKey, async () => {
      const response = await api.post<EngagementResponse>(
        API_ENDPOINTS.POST_SAVE(postId),
        {},
        {
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    });
  },

  async share(postId: number): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'share');
    return executeRequest(requestKey, async () => {
      const response = await api.post<EngagementResponse>(
        API_ENDPOINTS.POST_SHARE(postId),
        {},
        {
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    });
  },

  async report(postId: number, reason: string): Promise<EngagementResponse> {
    const requestKey = getRequestKey(postId, 'report');
    return executeRequest(requestKey, async () => {
      const response = await api.post<EngagementResponse>(
        API_ENDPOINTS.POST_REPORT(postId),
        { reason },
        {
          timeout: REQUEST_TIMEOUT,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    });
  }
};

// Clean up any orphaned requests on window unload
if (typeof window !== 'undefined') {
  window.addEventListener('unload', () => {
    pendingRequests.clear();
  });
}