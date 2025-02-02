// hooks/usePostEngagement.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';
import { useState } from 'react';

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
  [key: string]: any;
}

interface EngagementState {
  like: boolean;
  dislike: boolean;
  love: boolean;
  hate: boolean;
  save: boolean;
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
    report: false,
  });

  // Helper to update post metrics in cache
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
      const response = await fetch(`/posts/${post.post_id}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likes: 1,
          dislikes: 0,
          loves: 0,
          hates: 0,
          saves: 0
        }),
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
      updatePostCache({ likes_count: (post.likes_count || 0) + 1 });
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post liked successfully",
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, like: false }));
      queryClient.invalidateQueries({ queryKey: ['posts', post.post_id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Dislike mutation
  const dislikeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/posts/${post.post_id}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likes: 0,
          dislikes: 1,
          loves: 0,
          hates: 0,
          saves: 0
        }),
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
      updatePostCache({ dislikes_count: (post.dislikes_count || 0) + 1 });
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post disliked successfully",
      });
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, dislike: false }));
      queryClient.invalidateQueries({ queryKey: ['posts', post.post_id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Love mutation
  const loveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/posts/${post.post_id}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likes: 0,
          dislikes: 0,
          loves: 1,
          hates: 0,
          saves: 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to love post');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, love: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);
      updatePostCache({ loves_count: (post.loves_count || 0) + 1 });
      return { previousPost };
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, love: false }));
      queryClient.invalidateQueries({ queryKey: ['posts', post.post_id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Hate mutation
  const hateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/posts/${post.post_id}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          likes: 0,
          dislikes: 0,
          loves: 0,
          hates: 1,
          saves: 0
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to hate post');
      }

      return response.json();
    },
    onMutate: async () => {
      setIsLoading(prev => ({ ...prev, hate: true }));
      await queryClient.cancelQueries({ queryKey: ['posts', post.post_id] });
      const previousPost = queryClient.getQueryData(['posts', post.post_id]);
      updatePostCache({ hates_count: (post.hates_count || 0) + 1 });
      return { previousPost };
    },
    onSettled: () => {
      setIsLoading(prev => ({ ...prev, hate: false }));
      queryClient.invalidateQueries({ queryKey: ['posts', post.post_id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/posts/${post.post_id}/save`, {
        method: 'POST',
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
      updatePostCache({ saves_count: (post.saves_count || 0) + 1 });
      return { previousPost };
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
      const response = await fetch(`/posts/${post.post_id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to report post');
      }

      return response.json();
    },
    onSuccess: () => {
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
  });

  return {
    handleLike: () => likeMutation.mutate(),
    handleDislike: () => dislikeMutation.mutate(),
    handleLove: () => loveMutation.mutate(),
    handleHate: () => hateMutation.mutate(),
    handleSave: () => saveMutation.mutate(),
    handleReport: (reason: string) => reportMutation.mutate(reason),
    isLoading,
    isError: {
      like: likeMutation.isError,
      dislike: dislikeMutation.isError,
      love: loveMutation.isError,
      hate: hateMutation.isError,
      save: saveMutation.isError,
      report: reportMutation.isError,
    }
  } as const;
}

export default usePostEngagement;