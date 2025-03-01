// applib/services/posts/postService.ts
import api from '@/applib/api/client';
import { Post } from '@/types/posts/post-types';
import { PostsResponse } from '@/types/posts/page-types';
import { API_ENDPOINTS } from '@/applib/api/endpoints';
import { authService } from '@/applib/services/auth/authService';
import {PostInteractionState, PostMetrics, PostWithEngagement} from "@/types/posts";


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
  savePost(postId: number): Promise<{ message: string }>;
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
  // Update your postService.ts
  async getPostById(postId: number, timestamp?: number): Promise<PostWithEngagement> {
    try {
      const token = authService.getToken();
      if (!token) {
        console.warn('No auth token available for post fetch');
      } else {
        console.log('Using token for post fetch:', token.substring(0, 15) + '...');
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const cacheParam = timestamp ? `?_t=${timestamp}` : '';

      console.log(`Fetching post ${postId} from server`);

      const response = await fetch(`${apiUrl}/posts/${postId}${cacheParam}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        credentials: 'include'
      });

      console.log(`Post fetch response status: ${response.status}`);
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication error fetching post. Token might be invalid.');
          // Optionally refresh token or redirect to login
        }
        throw new Error(`Failed to fetch post: ${response.status}`);
      }

      const data = await response.json();
      console.log('Raw API response for post:', data);

      // Get the post data from any response structure
      const postData = data?.data?.post || data?.post || data;

      console.log('Original metrics data:', postData.metrics);

      // Create metrics object from flat properties
      const metrics = {
        like_count: typeof postData.like_count === 'number' ? postData.like_count : 0,
        dislike_count: typeof postData.dislike_count === 'number' ? postData.dislike_count : 0,
        save_count: typeof postData.save_count === 'number' ? postData.save_count : 0,
        share_count: typeof postData.share_count === 'number' ? postData.share_count : 0,
        comment_count: typeof postData.comment_count === 'number' ? postData.comment_count : 0,
        report_count: typeof postData.report_count === 'number' ? postData.report_count : 0,
      };

      // Create interaction_state object from flat properties
      const interaction_state = {
        like: Boolean(postData.like),
        dislike: Boolean(postData.dislike),
        save: Boolean(postData.save),
        share: Boolean(postData.share),
        report: Boolean(postData.report),
      };

      console.log('Normalized interaction_state:', interaction_state);

      console.log(`Post ${postId} data from server:`, {
        metrics,
        interaction_state
      });

      // Construct a properly typed return value with all required fields
      const result: PostWithEngagement = {
        ...postData,
        // Ensure all required fields exist
        post_id: postData.post_id,
        user_id: postData.user_id,
        content: postData.content || '',
        post_type_id: postData.post_type_id || 1,
        // Replace any existing metrics/interaction_state with our constructed objects
        metrics,
        interaction_state,
        status: postData.status || 'active',
        created_at: postData.created_at || new Date().toISOString(),
      };

      return result;
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
      throw error;
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

  getSavedPosts: async (): Promise<{ saved_posts: number[] }> => {
    try {
      console.log('Fetching saved posts from:', API_ENDPOINTS.PROFILE_SAVED_POSTS);
      const response = await api.get(API_ENDPOINTS.PROFILE_SAVED_POSTS);

      console.log('Saved posts response:', response.data);

      // Handle when the response is directly an array of post IDs
      if (Array.isArray(response.data)) {
        return { saved_posts: response.data };
      }

      // Check if response has the expected structure with saved_posts
      if (response.data && Array.isArray(response.data.saved_posts)) {
        return response.data;
      }

      // Handle nested data structure
      if (response.data && response.data.data && Array.isArray(response.data.data.saved_posts)) {
        return { saved_posts: response.data.data.saved_posts };
      }

      console.warn('Unexpected response format from saved posts endpoint:', response.data);
      // Default to empty array
      return { saved_posts: [] };
    } catch (error: any) {
      console.error('Error fetching saved posts:', error);
      // Return empty array on error for graceful handling
      return { saved_posts: [] };
    }
  },
  //Do I really need this? If I am doing this for savePost should I do it for all engagements?
  savePost: async (postId: number): Promise<{ message: string }> => {
    // This function is implemented in engageService.ts
    // Use engagementService.save(postId) instead
    console.warn('postService.savePost is deprecated. Use engagementService.save(postId) instead');
    const { engagementService } = await import('@/applib/services/engagement/engageService');
    return engagementService.save(postId);
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