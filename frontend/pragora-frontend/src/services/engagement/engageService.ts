// src/services/engageService.ts
import axios from 'axios';
import API_ENDPOINTS from '../../api/apiConfig';

// Response interfaces
interface BaseResponse {
  message: string;
}

interface LikeResponse extends BaseResponse {
  like: boolean;
  like_count: number;
}

interface DislikeResponse extends BaseResponse {
  dislike: boolean;
  dislike_count: number;
}

interface SaveResponse extends BaseResponse {
  save: boolean;
  save_count: number;
}

interface ShareResponse extends BaseResponse {
  share: boolean;
  share_count: number;
}

interface ReportResponse extends BaseResponse {
  report: boolean;
  report_count: number;
}

interface MetricsUpdateResponse extends BaseResponse {
  metrics: {
    like_count: number;
    dislike_count: number;
    save_count: number;
    share_count: number;
    comment_count: number;
    report_count: number;
  };
}

// Request interfaces
interface MetricsUpdateRequest {
  like_count?: number;
  dislike_count?: number;
  save_count?: number;
  share_count?: number;
  comment_count?: number;
  report_count?: number;
}

const voteService = {
  /**
   * Toggle like on a post
   */
  likePost: async (postId: number): Promise<LikeResponse> => {
    try {
      const response = await axios.post<LikeResponse>(
        API_ENDPOINTS.POST_LIKE(postId)
      );
      return response.data;
    } catch (error) {
      console.error('Error in likePost:', error);
      throw error;
    }
  },

  /**
   * Toggle dislike on a post
   */
  dislikePost: async (postId: number): Promise<DislikeResponse> => {
    try {
      const response = await axios.post<DislikeResponse>(
        API_ENDPOINTS.POST_DISLIKE(postId)
      );
      return response.data;
    } catch (error) {
      console.error('Error in dislikePost:', error);
      throw error;
    }
  },

  /**
   * Toggle save on a post
   */
  savePost: async (postId: number): Promise<SaveResponse> => {
    try {
      const response = await axios.post<SaveResponse>(
        API_ENDPOINTS.POST_SAVE(postId)
      );
      return response.data;
    } catch (error) {
      console.error('Error in savePost:', error);
      throw error;
    }
  },

  /**
   * Share a post
   */
  sharePost: async (postId: number): Promise<ShareResponse> => {
    try {
      const response = await axios.post<ShareResponse>(
        API_ENDPOINTS.POST_SHARE(postId)
      );
      return response.data;
    } catch (error) {
      console.error('Error in sharePost:', error);
      throw error;
    }
  },

  /**
   * Report a post with a reason
   */
  reportPost: async (postId: number, reason: string): Promise<ReportResponse> => {
    try {
      const response = await axios.post<ReportResponse>(
        API_ENDPOINTS.POST_REPORT(postId),
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error('Error in reportPost:', error);
      throw error;
    }
  },

  /**
   * Update multiple metrics for a post at once
   */
  updateMetrics: async (
    postId: number,
    metrics: MetricsUpdateRequest
  ): Promise<MetricsUpdateResponse> => {
    try {
      const response = await axios.post<MetricsUpdateResponse>(
        API_ENDPOINTS.POST_UPDATE_METRICS(postId),
        metrics
      );
      return response.data;
    } catch (error) {
      console.error('Error in updateMetrics:', error);
      throw error;
    }
  },

  /**
   * Get user interactions for multiple posts
   */
  getUserInteractions: async (postIds: number[]): Promise<Record<number, string[]>> => {
    try {
      const response = await axios.get(API_ENDPOINTS.POSTS, {
        params: { post_ids: postIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error in getUserInteractions:', error);
      throw error;
    }
  }
};

// Create an interceptor to handle the auth token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create an interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          console.error('Unauthorized request');
          // You might want to redirect to login or refresh token
          break;
        case 403:
          // Handle forbidden
          console.error('Forbidden request');
          break;
        case 404:
          // Handle not found
          console.error('Resource not found');
          break;
        default:
          // Handle other errors
          console.error('An error occurred:', error.response.data);
      }
    } else if (error.request) {
      // Handle network errors
      console.error('Network error:', error.request);
    } else {
      // Handle other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default voteService;