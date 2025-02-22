// hooks/usePostEngagement.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { toast} from './use-toast/use-toast';
import {
  PostWithEngagement,
  EngagementResponse,
  EngagementType,
  LoadingStates,
  ErrorStates,
  MetricsData,
  PostInteractionState
} from '@/types/posts/engagement';
import { engagementService } from '@/lib/services/engagement/engageService';
import { updatePostCache } from '@/lib/utils/postCache';

export function usePostEngagement(post: PostWithEngagement) {
  const queryClient = useQueryClient();
  const pendingMutations = useRef(new Set<string>());

  // Memoize initial metrics to prevent unnecessary re-renders
  const initialMetrics = useMemo(() => ({
    like_count: post.metrics?.like_count ?? 0,
    dislike_count: post.metrics?.dislike_count ?? 0,
    comment_count: post.metrics?.comment_count ?? 0,
    share_count: post.metrics?.share_count ?? 0,
    save_count: post.metrics?.save_count ?? 0,
    report_count: post.metrics?.report_count ?? 0,
  }), [post.metrics]);

  // Loading and error states
  const [isLoading, setIsLoading] = useState<LoadingStates>({
    like: false,
    dislike: false,
    save: false,
    share: false,
    report: false,
  });

  const [isError, setIsError] = useState<ErrorStates>({
    like: false,
    dislike: false,
    save: false,
    share: false,
    report: false,
  });

  // Helper to validate post data
  const validatePost = useCallback(() => {
    if (!post?.post_id) {
      throw new Error('Invalid post data');
    }
    return true;
  }, [post]);

  // Helper to handle errors consistently
  const handleError = useCallback((error: unknown, type: EngagementType) => {
    console.error(`Error in ${type} mutation:`, error);

    setIsError(prev => ({ ...prev, [type]: true }));

    const errorMessage = error instanceof Error ? error.message : 'Failed to process interaction';

    // Don't show toast for authentication errors - they're handled by auth redirect
    if (!(error instanceof Error) || !errorMessage.includes('Authentication required')) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }

    // Reset error state after a delay
    setTimeout(() => {
      setIsError(prev => ({ ...prev, [type]: false }));
    }, 3000);
  }, []);

  // Helper to update cache with new metrics
  const updateMetricsCache = useCallback(async (
    actionType: EngagementType,
    newMetrics: Partial<MetricsData>,
    newState: Partial<PostInteractionState>
  ) => {
    try {
      await updatePostCache({
        queryClient,
        postId: post.post_id,
        updates: {
          metrics: newMetrics,
          interaction_state: newState
        }
      });
    } catch (error) {
      console.error('Cache update error:', error);
      // Force a refetch rather than showing an error
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (post.post_id) {
        await queryClient.invalidateQueries({ queryKey: ['post', post.post_id] });
      }
    }
  }, [queryClient, post.post_id]);

  // Create optimized mutation
  const createMutation = (actionType: EngagementType) => {
    return useMutation({
      mutationFn: async (variables: { reason?: string } = {}) => {
        validatePost();

        // Prevent duplicate mutations
        const mutationKey = `${actionType}-${post.post_id}`;
        if (pendingMutations.current.has(mutationKey)) {
          throw new Error('Action already in progress');
        }

        setIsLoading(prev => ({ ...prev, [actionType]: true }));
        pendingMutations.current.add(mutationKey);

        try {
          let response: EngagementResponse;
          switch (actionType) {
            case 'like':
              response = await engagementService.like(post.post_id);
              break;
            case 'dislike':
              response = await engagementService.dislike(post.post_id);
              break;
            case 'save':
              response = await engagementService.save(post.post_id);
              break;
            case 'report':
              if (!variables.reason) {
                throw new Error('Report reason is required');
              }
              response = await engagementService.report(post.post_id, variables.reason);
              break;
            default:
              throw new Error(`Unsupported action type: ${actionType}`);
          }
          return response;
        } finally {
          setIsLoading(prev => ({ ...prev, [actionType]: false }));
          pendingMutations.current.delete(mutationKey);
        }
      },

      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['posts'] });
        await queryClient.cancelQueries({ queryKey: ['post', post.post_id] });

        // Snapshot the previous value
        const previousPost = queryClient.getQueryData<PostWithEngagement>(
          ['post', post.post_id]
        );

        if (!previousPost) {
          return { previousPost: undefined };
        }

        // Calculate new metrics optimistically
        const newMetrics = {
          ...previousPost.metrics,
          [`${actionType}_count`]: previousPost.metrics[`${actionType}_count`] +
            (previousPost.interaction_state[actionType] ? -1 : 1)
        };

        // Handle mutual exclusivity (like/dislike)
        if (actionType === 'like' && previousPost.interaction_state.dislike) {
          newMetrics.dislike_count = Math.max(0, previousPost.metrics.dislike_count - 1);
        } else if (actionType === 'dislike' && previousPost.interaction_state.like) {
          newMetrics.like_count = Math.max(0, previousPost.metrics.like_count - 1);
        }

        const newState = {
          ...previousPost.interaction_state,
          [actionType]: !previousPost.interaction_state[actionType],
          ...(actionType === 'like' ? { dislike: false } : {}),
          ...(actionType === 'dislike' ? { like: false } : {})
        };

        // Perform optimistic update
        const optimisticPost = {
          ...previousPost,
          metrics: newMetrics,
          interaction_state: newState
        };

        queryClient.setQueryData(['post', post.post_id], optimisticPost);

        // Return context for rollback
        return { previousPost };
      },

      onSettled: async (data, error, variables, context) => {
        // Always refetch to ensure consistency
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['posts'] }),
          post.post_id && queryClient.invalidateQueries({
            queryKey: ['post', post.post_id]
          })
        ]);
      },

      onError: (error, variables, context) => {
        // Revert optimistic update
        if (context?.previousPost) {
          queryClient.setQueryData(
            ['post', post.post_id],
            context.previousPost
          );
        }
        handleError(error, actionType);
      },

      onSuccess: (data) => {
        // Update metrics with server values
        const newMetrics = {
          ...post.metrics,
          [`${actionType}_count`]: data[`${actionType}_count`]
        };

        // Handle mutual exclusivity in success case
        if (actionType === 'like' && data.like && post.interaction_state.dislike) {
          newMetrics.dislike_count = Math.max(0, post.metrics.dislike_count - 1);
        } else if (actionType === 'dislike' && data.dislike && post.interaction_state.like) {
          newMetrics.like_count = Math.max(0, post.metrics.like_count - 1);
        }

        const newState = {
          ...post.interaction_state,
          [actionType]: data[actionType],
          ...(actionType === 'like' && data.like ? { dislike: false } : {}),
          ...(actionType === 'dislike' && data.dislike ? { like: false } : {})
        };

        updateMetricsCache(actionType, newMetrics, newState);

        // Show success toast
        toast({
          title: "Success",
          description: data.message
        });
      }
    });
  };

  // Create mutations
  const likeMutation = createMutation('like');
  const dislikeMutation = createMutation('dislike');
  const saveMutation = createMutation('save');
  const reportMutation = createMutation('report');

  // Share handler (special case as it's not toggle-based)
  const handleShare = useCallback(async () => {
    const mutationKey = `share-${post.post_id}`;
    if (pendingMutations.current.has(mutationKey)) {
      return;
    }

    setIsLoading(prev => ({ ...prev, share: true }));
    pendingMutations.current.add(mutationKey);

    try {
      validatePost();

      // Optimistic update
      const previousCount = post.metrics.share_count;
      const newCount = previousCount + 1;

      queryClient.setQueryData(['post', post.post_id], {
        ...post,
        metrics: {
          ...post.metrics,
          share_count: newCount
        }
      });

      // Perform share
      const response = await engagementService.share(post.post_id);

      // Update with server value
      const serverCount = response.share_count ?? newCount;
      await updateMetricsCache('share', { share_count: serverCount }, {});

      toast({
        title: "Success",
        description: "Post shared successfully"
      });
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(['post', post.post_id], post);
      handleError(error, 'share');
    } finally {
      setIsLoading(prev => ({ ...prev, share: false }));
      pendingMutations.current.delete(mutationKey);
    }
  }, [post, queryClient, validatePost, handleError, updateMetricsCache]);

  // Cleanup pending mutations on unmount
  useEffect(() => {
    return () => {
      pendingMutations.current.clear();
    };
  }, []);

  return {
    handleLike: useCallback(() => likeMutation.mutate({}), [likeMutation]),
    handleDislike: useCallback(() => dislikeMutation.mutate({}), [dislikeMutation]),
    handleSave: useCallback(() => saveMutation.mutate({}), [saveMutation]),
    handleShare,
    handleReport: useCallback((reason: string) =>
      reportMutation.mutate({ reason }), [reportMutation]),
    isLoading,
    isError: {
      like: likeMutation.isError,
      dislike: dislikeMutation.isError,
      save: saveMutation.isError,
      share: isError.share,
      report: reportMutation.isError
    }
  };
}

