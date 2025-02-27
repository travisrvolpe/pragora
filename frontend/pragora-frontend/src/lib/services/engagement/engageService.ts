// lib/services/engagement/engageService.ts
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { authService } from '@/lib/services/auth/authService';
import {
  EngagementResponse,
  MetricsData,
  PostInteractionState
} from '@/types/posts/engagement';

/**
 * Engagement service for interacting with post engagement endpoints
 * Handles likes, dislikes, saves, shares, reports, and metric updates
 */
interface EngagementService {
  like(postId: number): Promise<EngagementResponse>;
  dislike(postId: number): Promise<EngagementResponse>;
  save(postId: number): Promise<EngagementResponse>;
  share(postId: number): Promise<EngagementResponse>;
  report(postId: number, reason: string): Promise<EngagementResponse>;
  updateMetrics(postId: number, metrics: Partial<MetricsData>): Promise<EngagementResponse>;
  getDebugInfo(postId: number): Promise<any>;
}

/**
 * Helper to get base API URL based on context
 */
const getApiUrl = () => {
  // Check if we should use the API routes instead of direct calls
  // Only use API routes for post detail pages to avoid breaking working pages
  if (typeof window !== 'undefined') {
    // Check if we're on a post detail page by looking at the URL
    const isPostDetailPage = window.location.pathname.startsWith('/dialectica/') &&
                            !window.location.pathname.endsWith('/dialectica/');

    if (isPostDetailPage) {
      console.log('Using API route for engagement from post detail page');
      return '/api'; // Use Next.js API routes on post detail pages
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

/**
 * Helper to get authentication headers
 * Now always gets a fresh token from storage
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = authService.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Default response handler to ensure consistent response format
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    // Special handling for 401 errors
    if (response.status === 401) {
      console.warn('Authentication error during engagement operation');
      // We'll let the caller handle this to avoid redirects during API calls
      throw new Error('Authentication required');
    }

    try {
      // Try to get JSON error response
      const errorData = await response.json();
      throw new Error(errorData.message || `Request failed with status: ${response.status}`);
    } catch (jsonError) {
      // Fallback to text if not JSON
      const errorText = await response.text();
      throw new Error(`Request failed: ${response.status} - ${errorText}`);
    }
  }

  try {
    const responseData = await response.json();

    // Process response correctly
    if (responseData?.data) {
      return responseData.data as T;
    }

    return responseData as T;
  } catch (error) {
    console.error('Error parsing response:', error);
    throw new Error(`Invalid response format: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Error handler that provides consistent error objects with detailed information
 */
const handleError = (operation: string, postId: number, error: unknown): Error => {
  // Create descriptive error message
  const baseMsg = `Error ${operation} post ${postId}`;

  // Handle different error types
  let detail = '';
  if (error instanceof Error) {
    detail = `: ${error.message}`;
  } else if (error instanceof Response) {
    detail = `: HTTP error ${error.status}`;
  } else {
    detail = ': Unknown error';
  }

  console.error(`${baseMsg}${detail}`, error);

  // Return formatted error
  return new Error(`${baseMsg}${detail}`);
};

/**
 * Make an engagement request with retry logic
 */
const makeEngagementRequest = async (url: string, method: string = 'POST', body?: any): Promise<Response> => {
  const maxRetries = 2;
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      // Always get fresh headers with current token
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const options: RequestInit = {
        method,
        headers,
        credentials: 'include'
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt <= maxRetries) {
        console.log(`Engagement request failed, retrying (${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
};

export const engagementService: EngagementService = {
  like: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling like API for post ${postId}`);
      const apiUrl = getApiUrl();
      const url = `${apiUrl}/posts/engagement/${postId}/like`;

      // Dispatch pre-engagement event if on post detail page
      if (typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/dialectica/') &&
          !window.location.pathname.endsWith('/dialectica/')) {
        // This backup approach ensures the event is dispatched even if not done by PostMetrics
        console.log('Dispatching pre-engagement event from engagementService');
        window.dispatchEvent(new CustomEvent('pre-engagement'));
      }

      const response = await makeEngagementRequest(url);
      const data = await handleResponse<EngagementResponse>(response);
      console.log(`Like API response for post ${postId}:`, data);
      return data;
    } catch (error) {
      throw handleError('liking', postId, error);
    }
  },

  dislike: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling dislike API for post ${postId}`);
      const apiUrl = getApiUrl();
      const url = `${apiUrl}/posts/engagement/${postId}/dislike`;

      // Dispatch pre-engagement event if on post detail page
      if (typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/dialectica/') &&
          !window.location.pathname.endsWith('/dialectica/')) {
        console.log('Dispatching pre-engagement event from engagementService');
        window.dispatchEvent(new CustomEvent('pre-engagement'));
      }

      const response = await makeEngagementRequest(url);
      const data = await handleResponse<EngagementResponse>(response);
      console.log(`Dislike API response for post ${postId}:`, data);
      return data;
    } catch (error) {
      throw handleError('disliking', postId, error);
    }
  },

  save: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling save API for post ${postId}`);
      const apiUrl = getApiUrl();
      const url = `${apiUrl}/posts/engagement/${postId}/save`;

      // Dispatch pre-engagement event if on post detail page
      if (typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/dialectica/') &&
          !window.location.pathname.endsWith('/dialectica/')) {
        console.log('Dispatching pre-engagement event from engagementService');
        window.dispatchEvent(new CustomEvent('pre-engagement'));
      }

      const response = await makeEngagementRequest(url);
      const data = await handleResponse<EngagementResponse>(response);
      console.log(`Save API response for post ${postId}:`, data);
      return data;
    } catch (error) {
      throw handleError('saving', postId, error);
    }
  },

  share: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling share API for post ${postId}`);
      const apiUrl = getApiUrl();
      const url = `${apiUrl}/posts/engagement/${postId}/share`;

      // Dispatch pre-engagement event if on post detail page
      if (typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/dialectica/') &&
          !window.location.pathname.endsWith('/dialectica/')) {
        console.log('Dispatching pre-engagement event from engagementService');
        window.dispatchEvent(new CustomEvent('pre-engagement'));
      }

      const response = await makeEngagementRequest(url);
      const data = await handleResponse<EngagementResponse>(response);
      console.log(`Share API response for post ${postId}:`, data);
      return data;
    } catch (error) {
      throw handleError('sharing', postId, error);
    }
  },

  report: async (postId: number, reason: string): Promise<EngagementResponse> => {
    try {
      console.log(`Calling report API for post ${postId} with reason: ${reason}`);
      const apiUrl = getApiUrl();

      // Dispatch pre-engagement event if on post detail page
      if (typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/dialectica/') &&
          !window.location.pathname.endsWith('/dialectica/')) {
        console.log('Dispatching pre-engagement event from engagementService');
        window.dispatchEvent(new CustomEvent('pre-engagement'));
      }

      // Include reason as query parameter
      const url = new URL(`${apiUrl}/posts/engagement/${postId}/report`);
      url.searchParams.append('reason', reason);

      const response = await makeEngagementRequest(url.toString(), 'POST', { reason });
      const data = await handleResponse<EngagementResponse>(response);
      console.log(`Report API response for post ${postId}:`, data);
      return data;
    } catch (error) {
      throw handleError('reporting', postId, error);
    }
  },

  updateMetrics: async (postId: number, metrics: Partial<MetricsData>): Promise<EngagementResponse> => {
    try {
      console.log(`Updating metrics for post ${postId}:`, metrics);
      const apiUrl = getApiUrl();
      const url = `${apiUrl}/posts/engagement/${postId}/metrics`;

      const response = await makeEngagementRequest(url, 'POST', metrics);
      const data = await handleResponse<EngagementResponse>(response);
      console.log(`Update metrics response for post ${postId}:`, data);
      return data;
    } catch (error) {
      throw handleError('updating metrics for', postId, error);
    }
  },

  // Debug endpoint to verify backend state
  getDebugInfo: async (postId: number): Promise<any> => {
    try {
      const apiUrl = getApiUrl();
      const url = `${apiUrl}/posts/engagement/${postId}/debug`;

      const response = await makeEngagementRequest(url, 'GET');

      try {
        const data = await response.json();
        console.log(`Debug info for post ${postId}:`, data);
        return data;
      } catch (error) {
        console.error('Error parsing debug info:', error);
        throw new Error('Invalid debug response format');
      }
    } catch (error) {
      console.error(`Error getting debug info for post ${postId}:`, error);
      throw new Error(`Failed to get debug info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};