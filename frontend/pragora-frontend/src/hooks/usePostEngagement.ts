// hooks/usePostEngagement.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';
import { useState } from 'react';

// API endpoint configuration
const API_URL = 'http://localhost:8000';

interface PostEngagementMetrics {
  likes_count?: number;
  dislikes_count?: number;
  loves_count?: number;
  hates_count?: number;
  saves_count?: number;
  shares_count?: number;
  reports_count?: number;
}

interface Post {
  post_id: number;
  user_id: number;
  likes_count: number;
  dislikes_count: number;
  loves_count: number;
  hates_count: number;
  saves_count: number;
  shares_count: number;
  reports_count: number;
  liked: boolean;
  disliked: boolean;
  loved: boolean;
  hated: boolean;
  saved: boolean;
  reported: boolean;
  [key: string]: any;
}

interface EngagementState {
  like: boolean;
  dislike: boolean;
  love: boolean;
  hate: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
  [key: string]: boolean;
}

function usePostEngagement(post: Post) {
  const queryClient = useQueryClient();

  // Track loading states for each interaction type
  const [isLoading, setIsLoading] = useState<EngagementState>({
    like: false,
    dislike: false,
    love: false,
    hate: false,
    save: false,
    share: false,
    report: false,
  });

  // Helper to update post cache
  const updatePostCache = (updates: PostEngagementMetrics) => {
    queryClient.setQueryData(['posts', post.post_id], (oldPost: Post | undefined) => {
      if (!oldPost) return oldPost;
      return { ...oldPost, ...updates };
    });

    // Update post lists/feeds
    queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: any) => {
      if (!oldData?.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          posts: page.posts.map((p: Post) =>
            p.post_id === post.post_id ? { ...p, ...updates } : p
          )
        }))
      };
    });
  };

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/posts/${post.post_id}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, like: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);

      // Optimistically update the UI
      updatePostCache({
        likes_count: post.liked ? post.likes_count - 1 : post.likes_count + 1
      });

      return { previousPost };
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        updatePostCache(context.previousPost);
      }
      toast({
        title: "Error",
        description: "Failed to like post",
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
      const response = await fetch(`${API_URL}/posts/${post.post_id}/dislike`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to dislike post');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, dislike: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);

      updatePostCache({
        dislikes_count: post.disliked ? post.dislikes_count - 1 : post.dislikes_count + 1
      });

      return { previousPost };
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        updatePostCache(context.previousPost);
      }
      toast({
        title: "Error",
        description: "Failed to dislike post",
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
      const response = await fetch(`${API_URL}/posts/${post.post_id}/save`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, save: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);

      updatePostCache({
        saves_count: post.saved ? post.saves_count - 1 : post.saves_count + 1
      });

      return { previousPost };
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        updatePostCache(context.previousPost);
      }
      toast({
        title: "Error",
        description: "Failed to save post",
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
      const response = await fetch(`${API_URL}/posts/${post.post_id}/report`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to report post');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, report: true }));
    },
    onSuccess: (data) => {
      toast({
        title: "Report Submitted",
        description: "Thank you for helping maintain community standards.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, report: false }));
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/posts/${post.post_id}/share`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to share post');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, share: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);

      updatePostCache({
        shares_count: (post.shares_count || 0) + 1
      });

      return { previousPost };
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        updatePostCache(context.previousPost);
      }
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      updatePostCache(data);
      toast({
        title: "Success",
        description: "Post shared successfully",
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