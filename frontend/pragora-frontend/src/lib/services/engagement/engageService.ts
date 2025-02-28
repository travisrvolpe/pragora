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
 * Helper to get base API URL
 */
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

/**
 * Helper to get authentication headers
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = authService.getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// And then in each method, fix the headers merging:
const headers: Record<string, string> = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  ...getAuthHeaders() // Now this will be type-safe
};


/**
 * Default response handler to ensure consistent response format
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} - ${errorText}`);
  }

  const responseData = await response.json();

  // Process response correctly
  if (responseData?.data) {
    return responseData.data as T;
  }

  return responseData as T;
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

export const engagementService: EngagementService = {
  like: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling like API for post ${postId}`);
      const apiUrl = getApiUrl();
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const response = await fetch(`${apiUrl}/posts/engagement/${postId}/like`, {
        method: 'POST',
        headers
      });

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
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const response = await fetch(`${apiUrl}/posts/engagement/${postId}/dislike`, {
        method: 'POST',
        headers
      });

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
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const response = await fetch(`${apiUrl}/posts/engagement/${postId}/save`, {
        method: 'POST',
        headers
      });

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
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const response = await fetch(`${apiUrl}/posts/engagement/${postId}/share`, {
        method: 'POST',
        headers
      });

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
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      // Include reason as query parameter
      const url = new URL(`${apiUrl}/posts/engagement/${postId}/report`);
      url.searchParams.append('reason', reason);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }) // Also include in body
      });

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
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const response = await fetch(`${apiUrl}/posts/engagement/${postId}/metrics`, {
        method: 'POST',
        headers,
        body: JSON.stringify(metrics)
      });

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
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      };

      const response = await fetch(`${apiUrl}/posts/engagement/${postId}/debug`, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      console.log(`Debug info for post ${postId}:`, data);
      return data;
    } catch (error) {
      console.error(`Error getting debug info for post ${postId}:`, error);
      throw new Error(`Failed to get debug info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};