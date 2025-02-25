// lib/services/posts/postService.ts
import api from '@/lib/api/client';
import { Post } from '@/types/posts/post-types';
import { PostsResponse } from '@/types/posts/page-types';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { authService } from '@/lib/services/auth/authService';
import {PostInteractionState, PostMetrics} from "@/types/posts";


interface FetchPostsParams {
  skip?: number
  limit?: number
  tab?: string
  category?: number
  subcategory?: number
  search?: string
}

interface CreatePostData {
  title?: string
  content: string
  post_type_id: number
  category_id?: number
  subcategory_id?: number
  tags?: string[]
  image_url?: string
}

interface PostResponse {
  data: {
    posts: Array<{
      post_id: number;
      title: string;
      content: string;
      created_at: string;
      updated_at: string;
      status: string;
      like_count: number;
      comment_count: number;
      share_count: number;
      views: number;
    }>;
  };
}

interface PostData {
  post_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  status: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  views: number;
}

interface PostListResponse {
  status: string;
  message: string;
  data: {
    posts: PostData[];
  };
}

interface UserPost {
  post_id: number;
  title: string | null;
  content: string;
  created_at: string;
  updated_at?: string;
  status: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  image_url?: string | null;
}

interface UserPostsResponse {
  success?: boolean;
  count?: number;
  error?: string;
  posts: UserPost[];
}

interface PostService {
  fetchPosts(params?: FetchPostsParams): Promise<PostsResponse>;
  getPostById(postId: number): Promise<Post>;
  createPost(data: CreatePostData | FormData): Promise<Post>;
  updatePost(postId: number, data: Partial<CreatePostData>): Promise<Post>;
  deletePost(postId: number): Promise<void>;
  uploadPostImage(postId: number, file: File): Promise<{ image_url: string }>;
  getMyPosts(): Promise<UserPostsResponse>;
  getMyPostsDebug(): Promise<UserPostsResponse>;
  getSavedPosts(): Promise<{ saved_posts: number[] }>;
  getTrendingPosts(timeframe?: string): Promise<Post[]>;
  getRecommendedPosts(): Promise<Post[]>;
}

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const postService = {
  fetchPosts: async ({
    skip = 0,
    limit = 20,
    tab = 'recent',
    category,
    subcategory,
    search
  }: FetchPostsParams = {}): Promise<PostsResponse> => {
    try {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
        tab,
        ...(category && { category: category.toString() }),
        ...(subcategory && { subcategory: subcategory.toString() }),
        ...(search && { search })
      });

      console.log('Fetching posts from:', `${API_ENDPOINTS.POSTS}?${params}`);
      const response = await api.get(`${API_ENDPOINTS.POSTS}?${params}`);

      console.log('Raw API Response:', response.data);

      return {
        ...response.data,
        data: {
          ...response.data.data,
          hasMore: response.data.data.posts.length >= limit
        }
      };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  getPostById: async (postId: number): Promise<Post> => {
    try {
      console.log(`Fetching post ${postId} details...`);

      const response = await api.get(API_ENDPOINTS.POST_BY_ID(postId), {
        headers: {
          'Cache-Control': 'no-cache',
          ...getAuthHeaders() // Make sure auth headers are included
        }
      });

      console.log(`Raw API response for post ${postId}:`, response.data);

      // Extract post from response, handling different response formats
      let post = response.data?.data?.post || response.data?.post || response.data;

      if (!post) {
        console.error('Invalid post response format:', response.data);
        throw new Error('Invalid response format - post data not found');
      }

      // Ensure metrics are properly normalized with defaults for all fields
      const metrics: PostMetrics = {
        like_count: post.metrics?.like_count ?? post.like_count ?? 0,
        dislike_count: post.metrics?.dislike_count ?? post.dislike_count ?? 0,
        save_count: post.metrics?.save_count ?? post.save_count ?? 0,
        share_count: post.metrics?.share_count ?? post.share_count ?? 0,
        comment_count: post.metrics?.comment_count ?? post.comment_count ?? 0,
        report_count: post.metrics?.report_count ?? post.report_count ?? 0,
      };

      // Ensure interaction_state is properly structured with defaults
      const interaction_state: PostInteractionState = {
        like: post.interaction_state?.like ?? false,
        dislike: post.interaction_state?.dislike ?? false,
        save: post.interaction_state?.save ?? false,
        share: post.interaction_state?.share ?? false,
        report: post.interaction_state?.report ?? false
      };

      // Normalize user data if present
      let normalizedUser = post.user;
      if (!normalizedUser && post.user_id) {
        normalizedUser = {
          user_id: post.user_id,
          username: post.username || `user_${post.user_id}`,
          avatar_url: post.avatar_img || post.avatar_url,
          reputation_score: post.reputation_score || 0
        };
      }

      // Build the normalized post object
      const normalizedPost = {
        ...post,
        metrics, // Replace with normalized metrics
        interaction_state, // Replace with normalized interaction state
        user: normalizedUser // Add normalized user data
      };

      console.log(`Normalized post ${postId} data:`, {
        metrics: normalizedPost.metrics,
        interaction_state: normalizedPost.interaction_state
      });

      return normalizedPost;
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      throw error instanceof Error
        ? error
        : new Error(`Failed to fetch post ${postId}`);
    }
  },

  createPost: async (data: CreatePostData | FormData): Promise<Post> => {
    try {
      const headers = {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      };

      const response = await api.post(API_ENDPOINTS.POST_CREATE, data, { headers });
      return response.data?.data?.post || response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  updatePost: async (postId: number, data: Partial<CreatePostData>): Promise<Post> => {
    try {
      const response = await api.put(API_ENDPOINTS.POST_BY_ID(postId), data);
      return response.data.data.post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  deletePost: async (postId: number): Promise<void> => {
    try {
      await api.delete(API_ENDPOINTS.POST_BY_ID(postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  uploadPostImage: async (postId: number, file: File): Promise<{ image_url: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      const response = await api.post(
        API_ENDPOINTS.POST_UPLOAD_IMAGE(postId),
        formData,
        { headers }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },
  getMyPosts: async (): Promise<UserPostsResponse> => {
    try {
      console.log('Making request to:', API_ENDPOINTS.POST_MY_POSTS);

      const response = await api.get(API_ENDPOINTS.POST_MY_POSTS, {
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('User posts response:', response.data);

      // Check if response has the expected structure
      if (response.data && Array.isArray(response.data.posts)) {
        return {
          success: response.data.success,
          count: response.data.count,
          posts: response.data.posts
        };
      }

      // Alternative structure
      if (response.data && response.data.data && Array.isArray(response.data.data.posts)) {
        return {
          success: response.data.status === 'success',
          count: response.data.data.posts.length,
          posts: response.data.data.posts
        };
      }

      console.warn('Unexpected response format:', response.data);
      return { success: false, count: 0, posts: [] };

    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      // Return empty array on error for graceful UI handling
      return { success: false, count: 0, posts: [] };
    }
  },

  // Keep the debug method for now
  getMyPostsDebug: async (): Promise<UserPostsResponse> => {
    try {
      console.log('Making request to debug endpoint...');

      const token = authService.getToken();
      const debugUrl = `${API_ENDPOINTS.POST_MY_POSTS}/debug`;

      const response = await fetch(debugUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      console.log('Debug response status:', response.status);
      const responseText = await response.text();
      console.log('Debug response text:', responseText);

      // Try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed debug response:', data);
      } catch (err) {
        console.error('Failed to parse debug response as JSON');
        data = { posts: [] };
      }

      // If we got a successful response with posts
      if (data && data.posts && Array.isArray(data.posts)) {
        // Ensure all posts have the required fields with defaults
        const normalizedPosts = data.posts.map((post: any) => ({
          post_id: post.post_id,
          title: post.title,
          content: post.content,
          created_at: post.created_at,
          updated_at: post.updated_at,
          status: post.status || 'active',
          likes: post.likes || 0,
          comments: post.comments || 0,
          shares: post.shares || 0,
          views: post.views || 0,
          image_url: post.image_url || null
        }));

        return { posts: normalizedPosts };
      }

      // Fall back to empty array
      return { posts: [] };

    } catch (error: any) {
      console.error('Debug request failed:', error);
      return { posts: [] };
    }
  },

  getTrendingPosts: async (timeframe: string = 'week'): Promise<Post[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.POST_TRENDING(timeframe));
      return response.data.data.posts;
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      throw error;
    }
  },

  getRecommendedPosts: async (): Promise<Post[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.POST_RECOMMENDED);
      return response.data.data.posts;
    } catch (error) {
      console.error('Error fetching recommended posts:', error);
      throw error;
    }
  }
};

export default postService;