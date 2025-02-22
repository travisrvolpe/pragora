// hooks/usePostEngagement.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {useMemo, useState, useCallback} from 'react';
import { toast } from './use-toast';
import {
  PostWithEngagement,
  EngagementResponse,
  PostInteractionState,
  LoadingStates,
  ErrorStates, MetricsData, EngagementType
} from '@/types/posts/engagement';
import { updatePostCache } from '@/lib/utils/postCache';
import { engagementService } from '@/lib/services/engagement/engageService';
import {router} from "next/client";

type MutationFnType = (args?: { reason?: string }) => Promise<void>;
type InteractionType = 'like' | 'dislike' | 'save' | 'report';

interface UsePostEngagement {
  handleLike: () => Promise<void>;
  handleDislike: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleShare: () => Promise<void>;
  handleReport: (reason: string) => Promise<void>;  // Update this type
  isLoading: LoadingStates;
  isError: ErrorStates;
}

export function usePostEngagement(post: PostWithEngagement) {
  const queryClient = useQueryClient();

  const handleEngagementError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      authService.removeToken();
      window.location.href = '/auth/login';
      return;
    }

    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "Failed to process interaction",
      variant: "destructive"
    });
  }, []);

  /*const metrics: MetricsData = useMemo(() => ({
    like_count: post.metrics?.like_count ?? post.like_count ?? 0,
    dislike_count: post.metrics?.dislike_count ?? post.dislike_count ?? 0,
    comment_count: post.metrics?.comment_count ?? post.comment_count ?? 0,
    share_count: post.metrics?.share_count ?? post.share_count ?? 0,
    save_count: post.metrics?.save_count ?? post.save_count ?? 0,
    report_count: post.metrics?.report_count ?? post.report_count ?? 0,
  }), [post.metrics, post.like_count, post.dislike_count, post.comment_count, post.share_count, post.save_count, post.report_count]);*/


  const [isLoading, setIsLoading] = useState({
    like: false,
    dislike: false,
    save: false,
    share: false,
    report: false,
  });

  const [isError, setIsError] = useState({
    like: false,
    dislike: false,
    save: false,
    share: false,
    report: false,
  });

  const handleError = (error: Error) => {
    console.error('Engagement error:', error);
    toast({
      title: "Error",
      description: error.message || 'Failed to process interaction',
      variant: "destructive",
    });
  };

const handleSuccess = (data: EngagementResponse, actionType: InteractionType) => {
  console.log('Engagement success data:', data);
  console.log('Current post state:', post);

  if (!data) return;

  // Use server-provided values for metrics
  const newMetrics = {
    ...post.metrics,
    [`${actionType}_count`]: data[`${actionType}_count`],
    // If adding a like, decrement dislike count if it was disliked
    like_count: data.like_count ?? post.metrics.like_count,
    dislike_count: data.dislike_count ?? (
      actionType === 'like' && post.interaction_state.dislike
        ? Math.max(0, post.metrics.dislike_count - 1)
        : post.metrics.dislike_count
    ),
    // If adding a dislike, decrement like count if it was liked
    ...(actionType === 'dislike' && post.interaction_state.like
      ? { like_count: Math.max(0, post.metrics.like_count - 1) }
      : {}
    ),
    save_count: data.save_count ?? post.metrics.save_count,
    share_count: data.share_count ?? post.metrics.share_count,
    report_count: data.report_count ?? post.metrics.report_count,
  };

  // Use server-provided values for interaction state
  // Update both like and dislike states when either changes
  const newInteractionState: PostInteractionState = {
    ...post.interaction_state,
    [actionType]: data[actionType],
    // If liking, remove dislike; if disliking, remove like
    ...(actionType === 'like' ? { dislike: false } : {}),
    ...(actionType === 'dislike' ? { like: false } : {})
  };

  // Debug logs
  console.log('New metrics:', newMetrics);
  console.log('New interaction state:', newInteractionState);

  // Update the post in the cache
  //TODO - Using `any` type loses TypeScript's type safety benefits. Should define proper types for the data structure.
  queryClient.setQueriesData(
    { queryKey: ['posts'] },
    (oldData: any): any => {
      console.log('Cache update - oldData structure:', oldData);

      if (!oldData?.pages) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => {
          console.log('Processing page:', page);

          if (!page?.data?.posts) return page;

          const updatedPosts = page.data.posts.map((p: PostWithEngagement) =>
            p.post_id === post.post_id
              ? {
                  ...p,
                  metrics: newMetrics,
                  interaction_state: newInteractionState,
                }
              : p
          );

          return {
            ...page,
            data: {
              ...page.data,
              posts: updatedPosts,
            },
          };
        }),
      };
    }
  );

  queryClient.invalidateQueries({
    queryKey: ['posts'],
    refetchType: 'active'
  });

  if (post.post_id) {
    queryClient.invalidateQueries({
      queryKey: ['post', post.post_id],
      refetchType: 'active'
    });
  }

  // Show success toast
  toast({
    title: "Success",
    description: data.message,
  });
  };

  // Optional: Background refresh to ensure consistency
  // This can be removed if the cache updates are working correctly
  // queryClient.invalidateQueries({ queryKey: ['posts'] });

    // Background refresh
    //queryClient.invalidateQueries({ queryKey: ['posts'] });
   // };

const createMutation = (actionType: EngagementType) => {
  return useMutation({
    mutationFn: async (variables: { reason?: string } = {}) => {
      setIsLoading(prev => ({ ...prev, [actionType]: true }));
      console.log(`🔍 Starting ${actionType} mutation for post ${post.post_id}`);
      console.log('Current metrics state:', post.metrics);

      try {
        let response: EngagementResponse;
        switch (actionType) {
          case 'like':
            console.log('📤 Sending like request');
            response = await engagementService.like(post.post_id);
            console.log('📥 Like response:', response);
            break;
          case 'dislike':
            response = await engagementService.dislike(post.post_id);
            break;
          case 'save':
            response = await engagementService.save(post.post_id);
            break;
          case 'report':
            if (!variables.reason) throw new Error('Report reason is required');
            response = await engagementService.report(post.post_id, variables.reason);
            break;
          default:
            throw new Error(`Unsupported action type: ${actionType}`);
        }
        return response;
      } catch (error) {
        // Don't clear auth state on error
        if (error instanceof Error && error.message === 'Authentication required') {
          throw error;
        }
        throw error;
      } finally {
        setIsLoading(prev => ({ ...prev, [actionType]: false }));
      }
    },
    onMutate: async () => {
      console.log('🔄 Starting optimistic update');
      console.log('Previous metrics:', post.metrics);

      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['post', post.post_id] });

      const previousPost = queryClient.getQueryData<PostWithEngagement>(['post', post.post_id]);
      console.log('Previous post state:', previousPost);

      const optimisticPost = {
        ...post,
        metrics: {
          ...post.metrics,
          [`${actionType}_count`]: post.metrics[`${actionType}_count`] +
            (post.interaction_state[actionType] ? -1 : 1)
        },
        interaction_state: {
          ...post.interaction_state,
          [actionType]: !post.interaction_state[actionType]
        }
      };

      console.log('Optimistic update:', optimisticPost);
      queryClient.setQueryData(['post', post.post_id], optimisticPost);

      return { previousPost };
    },
    onError: (error, variables, context) => {
      if (error instanceof Error && error.message === 'Authentication required') {
        // Redirect to login without clearing auth state
        router.push('/auth/login');
        return;
      }
      console.log('Error in mutation:', error);
      if (context?.previousPost) {
        queryClient.setQueryData(['post', post.post_id], context.previousPost);
      }
      handleError(error as Error);
      setIsError(prev => ({ ...prev, [actionType]: true }));
    },

    onSuccess: (data) => {
      console.log('✅ Mutation success:', data);
      console.log('Current post state:', post);

      // Log metrics updates
      const updatedMetrics = {
        ...post.metrics,
        [`${actionType}_count`]: data[`${actionType}_count`] ?? post.metrics[`${actionType}_count`]
      };
      console.log('Updated metrics:', updatedMetrics);

      // Update cache
      const updatedPost = {
        ...post,
        metrics: updatedMetrics,
        interaction_state: {
          ...post.interaction_state,
          [actionType]: data[actionType] ?? !post.interaction_state[actionType]
        }
      };

      // Update both the individual post and the posts list
      queryClient.setQueryData(['post', post.post_id], updatedPost);
      console.log('Cache updated for post:', post.post_id);
      queryClient.setQueriesData(
        { queryKey: ['posts'] },
        (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                posts: page.data.posts.map((p: PostWithEngagement) =>
                  p.post_id === post.post_id ? updatedPost : p
                ),
              },
            })),
          };
        }
      );

      toast({
        title: "Success",
        description: data.message,
      });
    },
    onSettled: () => {

      // Force cache revalidation
      queryClient.invalidateQueries({
        queryKey: ['posts'],
        refetchType: 'active'
      });

      if (post.post_id) {
        queryClient.invalidateQueries({
          queryKey: ['post', post.post_id],
          refetchType: 'active'
        });
      }
    }
  });
};

  const likeMutation = createMutation('like');
  const dislikeMutation = createMutation('dislike');
  const saveMutation = createMutation('save');
  const reportMutation = createMutation('report');

  return {
    handleLike: () => likeMutation.mutate({}),
    handleDislike: () => dislikeMutation.mutate({}),
    handleSave: () => saveMutation.mutate({}),
    handleShare: async () => {
      setIsLoading(prev => ({ ...prev, share: true }));
      try {
        const response = await engagementService.share(post.post_id);
        // Handle share count increment without toggling state
        const updatedPost = {
          ...post,
          metrics: {
            ...post.metrics,
            share_count: response.share_count ?? (post.metrics.share_count + 1)
          }
        };
        queryClient.setQueryData(['post', post.post_id], updatedPost);
        toast({
          title: "Success",
          description: "Post shared successfully",
        });
      } catch (error) {
        handleError(error as Error);
      } finally {
        setIsLoading(prev => ({ ...prev, share: false }));
      }
    },
    handleReport: (reason: string) => reportMutation.mutate({ reason }),
    isLoading,
    isError: {
      like: likeMutation.isError,
      dislike: dislikeMutation.isError,
      save: saveMutation.isError,
      share: false,
      report: reportMutation.isError,}
  };
}
