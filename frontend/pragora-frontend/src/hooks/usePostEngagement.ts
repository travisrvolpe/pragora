// hooks/usePostEngagement.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';
import { useState } from 'react';

// Types
interface PostEngagementMetrics {
  likes_count: number;
  dislikes_count: number;
  saves_count: number;
  shares_count: number;
  reports_count: number;
}

interface PostEngagementState {
  like: boolean;
  dislike: boolean;
  save: boolean;
  report: boolean;
}

interface Post extends PostEngagementMetrics, PostEngagementState {
  post_id: number;
  user_id: number;
}

interface EngagementState {
  like: boolean;
  dislike: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
}

interface EngagementResponse {
  message: string;
  likes_count?: number;
  dislikes_count?: number;
  saves_count?: number;
  shares_count?: number;
  reports_count?: number;
  like?: boolean;
  dislike?: boolean;
  save?: boolean;
  report?: boolean;
}

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ENGAGEMENT_URL = `${API_URL}/posts/engagement`;
const TOKEN_KEY = 'access_token';

// Helper Functions
const getAuthToken = () => {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  console.log('Retrieved token:', token ? 'Present' : 'Missing');
  return token;
};

const makeAuthenticatedRequest = async (
  url: string,
  method: string,
  body?: unknown
): Promise<EngagementResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Please log in to interact with posts');
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        throw new Error('Please log in to interact with posts');
      }
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to process request');
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

function usePostEngagement(post: Post) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<EngagementState>({
    like: false,
    dislike: false,
    save: false,
    share: false,
    report: false,
  });

  // Update post cache with proper type checking
  const updatePostCache = (updates: Partial<Post>) => {
    // Helper to safely update numbers
    const safeNumber = (value: number | undefined, fallback: number) =>
      typeof value === 'number' ? Math.max(0, value) : fallback;

    // Update single post cache
    queryClient.setQueryData(['posts', post.post_id], (oldPost: Post | undefined) => {
      if (!oldPost) return oldPost;
      return {
        ...oldPost,
        ...updates,
        // Ensure counts never go below 0
        likes_count: safeNumber(updates.likes_count, oldPost.likes_count),
        dislikes_count: safeNumber(updates.dislikes_count, oldPost.dislikes_count),
        saves_count: safeNumber(updates.saves_count, oldPost.saves_count),
        shares_count: safeNumber(updates.shares_count, oldPost.shares_count),
        // Update boolean states
        like: updates.like ?? oldPost.like,
        dislike: updates.dislike ?? oldPost.dislike,
        save: updates.save ?? oldPost.save,
        report: updates.report ?? oldPost.report,
      };
    });

    // Update posts list cache
    queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          posts: page.posts.map((p: Post) =>
            p.post_id === post.post_id ? {
              ...p,
              ...updates,
              // Ensure counts never go below 0
              likes_count: safeNumber(updates.likes_count, p.likes_count),
              dislikes_count: safeNumber(updates.dislikes_count, p.dislikes_count),
              saves_count: safeNumber(updates.saves_count, p.saves_count),
              shares_count: safeNumber(updates.shares_count, p.shares_count),
              // Update boolean states
              like: updates.like ?? p.like,
              dislike: updates.dislike ?? p.dislike,
              save: updates.save ?? p.save,
              report: updates.report ?? p.report,
            } : p
          )
        }))
      };
    });
  };

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      console.log('Like mutation triggered');
      console.log(`Making request to: ${ENGAGEMENT_URL}/${post.post_id}/like`);
      return makeAuthenticatedRequest(`${ENGAGEMENT_URL}/${post.post_id}/like`, 'POST');
      },

    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, like: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);

      // Optimistic update
      updatePostCache({
        likes_count: post.like ? post.likes_count - 1 : post.likes_count + 1,
        like: !post.like,
        // Remove dislike if it exists
        dislikes_count: post.dislike ? post.dislikes_count - 1 : post.dislikes_count,
        dislike: false,
      });

      return { previousPost };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousPost) {
        updatePostCache(context.previousPost);
      }
      console.error('Like mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      updatePostCache(data);
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, like: false }));
      queryClient.invalidateQueries({ queryKey: ['posts', post.post_id] });
    },
  });

  // Dislike mutation
  const dislikeMutation = useMutation({
    mutationFn: async () => {
      return makeAuthenticatedRequest(`${ENGAGEMENT_URL}/${post.post_id}/dislike`, 'POST');
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, dislike: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);

      // Optimistic update
      updatePostCache({
        dislikes_count: post.dislike ? post.dislikes_count - 1 : post.dislikes_count + 1,
        dislike: !post.dislike,
        // Remove like if it exists
        likes_count: post.like ? post.likes_count - 1 : post.likes_count,
        like: false,
      });

      return { previousPost };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousPost) {
        updatePostCache(context.previousPost);
      }
      console.error('Dislike mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      updatePostCache(data);
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, dislike: false }));
      queryClient.invalidateQueries({ queryKey: ['posts', post.post_id] });
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      return makeAuthenticatedRequest(`${ENGAGEMENT_URL}/${post.post_id}/save`, 'POST');
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, save: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);

      // Optimistic update
      updatePostCache({
        saves_count: post.save ? post.saves_count - 1 : post.saves_count + 1,
        save: !post.save,
      });

      return { previousPost };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousPost) {
        updatePostCache(context.previousPost);
      }
      console.error('Save mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      updatePostCache(data);
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, save: false }));
      queryClient.invalidateQueries({ queryKey: ['posts', post.post_id] });
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
    },
  });

  // Report mutation
  const reportMutation = useMutation({
    mutationFn: async (reason: string) => {
      return makeAuthenticatedRequest(
        `${ENGAGEMENT_URL}/${post.post_id}/report`,
        'POST',
        { reason }
      );
    },
    onMutate: () => {
      setIsLoading(prev => ({ ...prev, report: true }));
    },
    onError: (error: Error) => {
      console.error('Report mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      updatePostCache({
        reports_count: data.reports_count,
        report: true,
      });
      toast({
        title: "Report Submitted",
        description: "Thank you for helping maintain community standards.",
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, report: false }));
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      return makeAuthenticatedRequest(`${ENGAGEMENT_URL}/${post.post_id}/share`, 'POST');
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, share: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);

      // Optimistic update
      updatePostCache({
        shares_count: (post.shares_count || 0) + 1,
      });

      return { previousPost };
    },
    onError: (error: Error, _, context) => {
      if (context?.previousPost) {
        updatePostCache(context.previousPost);
      }
      console.error('Share mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      updatePostCache(data);
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, share: false }));
      queryClient.invalidateQueries({ queryKey: ['posts', post.post_id] });
    },
  });

  return {
    handleLike: () => likeMutation.mutate(),
    handleDislike: () => dislikeMutation.mutate(),
    handleSave: () => saveMutation.mutate(),
    handleShare: () => shareMutation.mutate(),
    handleReport: (reason: string) => reportMutation.mutate(reason),
    isLoading,
    isError: {
      like: likeMutation.isError,
      dislike: dislikeMutation.isError,
      save: saveMutation.isError,
      share: shareMutation.isError,
      report: reportMutation.isError,
    }
  };
}

export default usePostEngagement;