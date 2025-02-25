// lib/services/engagement/engageService.ts
import api from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
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
 * Default response handler to ensure consistent response format
 */
const handleResponse = <T>(response: any): T => {
  // If the response already has the expected data format, return it
  if (response.data && (
    response.data.like !== undefined ||
    response.data.dislike !== undefined ||
    response.data.save !== undefined ||
    response.data.share !== undefined ||
    response.data.report !== undefined ||
    response.data.metrics !== undefined
  )) {
    return response.data;
  }

  // If response has a message but no counts, create a structured response
  if (response.data && response.data.message) {
    return {
      message: response.data.message,
      // Include any metrics from response
      like_count: response.data.like_count,
      dislike_count: response.data.dislike_count,
      save_count: response.data.save_count,
      share_count: response.data.share_count,
      comment_count: response.data.comment_count,
      report_count: response.data.report_count,
      // Include interaction state if available
      like: response.data.like,
      dislike: response.data.dislike,
      save: response.data.save,
      share: response.data.share,
      report: response.data.report
    } as T;
  }

  // Fall back to raw response data
  return response.data as T;
};

/**
 * Error handler that provides consistent error objects with detailed information
 */
const handleError = (operation: string, postId: number, error: any): Error => {
  // Create descriptive error message
  const baseMsg = `Error ${operation} post ${postId}`;

  // Extract error details if available
  let detail = '';
  if (error.response?.data?.detail) {
    detail = `: ${error.response.data.detail}`;
  } else if (error.message) {
    detail = `: ${error.message}`;
  }

  console.error(`${baseMsg}${detail}`, error);

  // If it's an auth error, rethrow with specific message
  if (error.response?.status === 401) {
    return new Error('Authentication required');
  }

  // Return formatted error
  return new Error(`${baseMsg}${detail}`);
};

export const engagementService: EngagementService = {
  like: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling like API for post ${postId}`);
      const response = await api.post(API_ENDPOINTS.POST_LIKE(postId));
      console.log(`Like API response for post ${postId}:`, response.data);
      return handleResponse<EngagementResponse>(response);
    } catch (error) {
      throw handleError('liking', postId, error);
    }
  },

  dislike: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling dislike API for post ${postId}`);
      const response = await api.post(API_ENDPOINTS.POST_DISLIKE(postId));
      console.log(`Dislike API response for post ${postId}:`, response.data);
      return handleResponse<EngagementResponse>(response);
    } catch (error) {
      throw handleError('disliking', postId, error);
    }
  },

  save: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling save API for post ${postId}`);
      const response = await api.post(API_ENDPOINTS.POST_SAVE(postId));
      console.log(`Save API response for post ${postId}:`, response.data);
      return handleResponse<EngagementResponse>(response);
    } catch (error) {
      throw handleError('saving', postId, error);
    }
  },

  share: async (postId: number): Promise<EngagementResponse> => {
    try {
      console.log(`Calling share API for post ${postId}`);
      const response = await api.post(API_ENDPOINTS.POST_SHARE(postId));
      console.log(`Share API response for post ${postId}:`, response.data);
      return handleResponse<EngagementResponse>(response);
    } catch (error) {
      throw handleError('sharing', postId, error);
    }
  },

  report: async (postId: number, reason: string): Promise<EngagementResponse> => {
    try {
      console.log(`Calling report API for post ${postId} with reason: ${reason}`);
      // Some backends expect 'reason' as a query param, others as body
      // This handles both cases by including it in both places
      const response = await api.post(
        `${API_ENDPOINTS.POST_REPORT(postId)}?reason=${encodeURIComponent(reason)}`,
        { reason }
      );
      console.log(`Report API response for post ${postId}:`, response.data);
      return handleResponse<EngagementResponse>(response);
    } catch (error) {
      throw handleError('reporting', postId, error);
    }
  },

  updateMetrics: async (postId: number, metrics: Partial<MetricsData>): Promise<EngagementResponse> => {
    try {
      console.log(`Updating metrics for post ${postId}:`, metrics);
      const response = await api.post(
        API_ENDPOINTS.POST_UPDATE_METRICS(postId),
        metrics
      );
      console.log(`Update metrics response for post ${postId}:`, response.data);
      return handleResponse<EngagementResponse>(response);
    } catch (error) {
      throw handleError('updating metrics for', postId, error);
    }
  },

  // Debug endpoint to verify backend state
  getDebugInfo: async (postId: number): Promise<any> => {
    try {
      const response = await api.get(`${API_ENDPOINTS.POST_LIKE(postId).replace('/like', '')}/debug`);
      console.log(`Debug info for post ${postId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error getting debug info for post ${postId}:`, error);
      throw new Error(`Failed to get debug info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
};