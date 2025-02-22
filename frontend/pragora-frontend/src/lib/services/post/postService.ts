// lib/services/posts/postService.ts
import api from '@/lib/api/client';
import { Post } from '@/types/posts/post-types';
import { PostsResponse } from '@/types/posts/page-types';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { authService } from '@/lib/services/auth/authService';

interface PostService {
  createPost(data: CreatePostData): Promise<Post>;
  createPost(data: FormData): Promise<Post>;
  getPostById(postId: number): Promise<Post>;
}

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
      const response = await api.get(API_ENDPOINTS.POST_BY_ID(postId), {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      console.log('Raw post response:', response.data);

      let post = response.data?.data?.post || response.data?.post || response.data;

      if (!post) {
        console.error('Invalid post response:', response.data);
        throw new Error('Invalid response format');
      }

      post = {
        ...post,
        metrics: {
          like_count: post.metrics?.like_count ?? post.like_count ?? 0,
          dislike_count: post.metrics?.dislike_count ?? post.dislike_count ?? 0,
          save_count: post.metrics?.save_count ?? post.save_count ?? 0,
          share_count: post.metrics?.share_count ?? post.share_count ?? 0,
          comment_count: post.metrics?.comment_count ?? post.comment_count ?? 0,
          report_count: post.metrics?.report_count ?? post.report_count ?? 0,
        },
        interaction_state: {
          like: post.interaction_state?.like ?? false,
          dislike: post.interaction_state?.dislike ?? false,
          save: post.interaction_state?.save ?? false,
          report: post.interaction_state?.report ?? false
        }
      };

      console.log('Processed post data:', post);
      return post;
    } catch (error) {
      console.error('Error fetching post:', error);
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

  getMyPosts: async (): Promise<Post[]> => {
    try {
      const response = await api.get(API_ENDPOINTS.POST_MY_POSTS);
      return response.data.data.posts;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  getSavedPosts: async (): Promise<{ saved_posts: number[] }> => {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE_SAVED_POSTS);
      return response.data;
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      throw error;
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