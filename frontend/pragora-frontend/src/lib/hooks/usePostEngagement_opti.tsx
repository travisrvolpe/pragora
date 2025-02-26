// hooks/usePostEngagement.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { toast } from './use-toast/use-toast';
import {
  PostWithEngagement,
  EngagementResponse,
  EngagementType,
  LoadingStates,
  ErrorStates,
  MetricsData,
  PostInteractionState,
  PostMetrics
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
    newMetrics: Partial<PostMetrics>,
    newState: Partial<PostInteractionState>
  ) => {
    try {
      console.log('Updating cache with new metrics:', {
        postId: post.post_id,
        actionType,
        metrics: newMetrics,
        state: newState
      });

      // Ensure newMetrics contains all required fields
      const safeMetrics: Partial<PostMetrics> = {
        ...newMetrics
      };

      // Ensure newState contains all required fields
      const safeState: Partial<PostInteractionState> = {
        ...newState
      };

      // Update the cache with new values
      await updatePostCache({
        queryClient,
        postId: post.post_id,
        updates: {
          metrics: safeMetrics,
          interaction_state: safeState
        }
      });

      // Force refresh to ensure UI updates
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['post', post.post_id]
        });
      }, 100);
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
          console.log(`Mutation ${mutationKey} already in progress, skipping`);
          throw new Error('Action already in progress');
        }

        console.log(`Starting ${actionType} operation for post ${post.post_id}`);
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
          console.log(`${actionType} operation successful:`, response);
          return response;
        } finally {
          setIsLoading(prev => ({ ...prev, [actionType]: false }));
          pendingMutations.current.delete(mutationKey);
          console.log(`Completed ${actionType} operation for post ${post.post_id}`);
        }
      },

      onMutate: async (variables) => {
        console.log(`Optimistic update for ${actionType} DISABLED - testing server state`);

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
          ...previousPost.metrics
        };

        const isActive = !previousPost.interaction_state[actionType];
        newMetrics[`${actionType}_count`] = previousPost.metrics[`${actionType}_count`] + (isActive ? 1 : -1);

        // Handle mutual exclusivity (like/dislike)
        if (actionType === 'like' && isActive && previousPost.interaction_state.dislike) {
          newMetrics.dislike_count = Math.max(0, previousPost.metrics.dislike_count - 1);
        } else if (actionType === 'dislike' && isActive && previousPost.interaction_state.like) {
          newMetrics.like_count = Math.max(0, previousPost.metrics.like_count - 1);
        }

        const newState = {
          ...previousPost.interaction_state,
          [actionType]: isActive
        };

        // Handle mutual exclusivity in state
        if (actionType === 'like' && isActive) {
          newState.dislike = false;
        } else if (actionType === 'dislike' && isActive) {
          newState.like = false;
        }

        // Perform optimistic update
        console.log('Applying optimistic update:', {
          oldMetrics: previousPost.metrics,
          newMetrics,
          oldState: previousPost.interaction_state,
          newState
        });

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
        console.log(`Mutation settled for ${actionType} on post ${post.post_id}`);

        // Always refetch to ensure consistency, but with a slight delay
        // to ensure our local updates are applied first
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          if (post.post_id) {
            queryClient.invalidateQueries({
              queryKey: ['post', post.post_id]
            });
          }
        }, 100);
      },

      onError: (error, variables, context) => {
        console.error(`Error in ${actionType} operation:`, error);

        // Revert optimistic update
        if (context?.previousPost) {
          console.log('Reverting optimistic update');
          queryClient.setQueryData(
            ['post', post.post_id],
            context.previousPost
          );
        }
        handleError(error, actionType);
      },
      onSuccess: (data) => {
        console.log(`${actionType} mutation succeeded:`, data);

        // Extract server values
        const isActive = data[actionType] === true;
        const newCount = data[`${actionType}_count`] ?? 0;

        // First, set query data explicitly to ensure persistence
        queryClient.setQueryData(['post', post.post_id], (oldData: any) => {
          if (!oldData) return oldData;

          // Create updated post with the new state
          const updatedPost = {
            ...oldData,
            metrics: {
              ...oldData.metrics,
              [`${actionType}_count`]: newCount
            },
            interaction_state: {
              ...oldData.interaction_state,
              [actionType]: isActive
            }
          };

          // Handle mutual exclusivity in the cache
          if (actionType === 'like' && isActive && oldData.interaction_state.dislike) {
            updatedPost.interaction_state.dislike = false;
            updatedPost.metrics.dislike_count = Math.max(0, oldData.metrics.dislike_count - 1);
          } else if (actionType === 'dislike' && isActive && oldData.interaction_state.like) {
            updatedPost.interaction_state.like = false;
            updatedPost.metrics.like_count = Math.max(0, oldData.metrics.like_count - 1);
          }

          return updatedPost;
        });

        // Cancel any pending refetches that might override our update
        queryClient.cancelQueries({ queryKey: ['post', post.post_id] });

        // Create a metrics update object based on available data
        const metricsUpdate: Partial<PostMetrics> = {};

        // If the backend returns full metrics object, use it
        if (data.metrics) {
          console.log('Server provided complete metrics:', data.metrics);
          updateMetricsCache(actionType, data.metrics, {
            ...post.interaction_state,
            [actionType]: typeof data[actionType] === 'boolean' ? data[actionType] : !post.interaction_state[actionType]
          });
          return;
        }

        // Otherwise use individual count fields if available
        if (typeof data.like_count === 'number') metricsUpdate.like_count = data.like_count;
        if (typeof data.dislike_count === 'number') metricsUpdate.dislike_count = data.dislike_count;
        if (typeof data.save_count === 'number') metricsUpdate.save_count = data.save_count;
        if (typeof data.share_count === 'number') metricsUpdate.share_count = data.share_count;
        if (typeof data.comment_count === 'number') metricsUpdate.comment_count = data.comment_count;
        if (typeof data.report_count === 'number') metricsUpdate.report_count = data.report_count;

        // If we have at least one valid count
        if (Object.keys(metricsUpdate).length > 0) {
          console.log('Server provided partial metrics:', metricsUpdate);
          updateMetricsCache(actionType, metricsUpdate, {
            ...post.interaction_state,
            [actionType]: typeof data[actionType] === 'boolean' ? data[actionType] : !post.interaction_state[actionType]
          });
          return;
        }

        // Fallback: Calculate new metrics based on current state
        const isActiveState = typeof data[actionType] === 'boolean' ? data[actionType] : !post.interaction_state[actionType];
        const newMetricsData = {
          ...post.metrics
        };

        newMetricsData[`${actionType}_count`] = Math.max(0,
          post.metrics[`${actionType}_count`] + (isActiveState ? 1 : -1)
        );

        // Handle mutual exclusivity
        if (actionType === 'like' && isActiveState && post.interaction_state.dislike) {
          newMetricsData.dislike_count = Math.max(0, post.metrics.dislike_count - 1);
        } else if (actionType === 'dislike' && isActiveState && post.interaction_state.like) {
          newMetricsData.like_count = Math.max(0, post.metrics.like_count - 1);
        }

        // Update interaction state
        const newState = {
          ...post.interaction_state,
          [actionType]: isActiveState
        };

        // Handle mutual exclusivity in state
        if (actionType === 'like' && isActiveState) {
          newState.dislike = false;
        } else if (actionType === 'dislike' && isActiveState) {
          newState.like = false;
        }

        console.log('Calculated metrics update:', newMetricsData);
        updateMetricsCache(actionType, newMetricsData, newState);

        // Force a refresh after a short delay to ensure consistent state
        setTimeout(() => {
          // Invalidate only the specific post
          queryClient.invalidateQueries({
            queryKey: ['post', post.post_id],
            exact: true,
            refetchActive: true
          });
        }, 500); // Increased delay to ensure UI has time to update
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
        console.log('Share operation already in progress, skipping');
        return;
      }

      console.log('Starting share operation for post', post.post_id);
      setIsLoading(prev => ({ ...prev, share: true }));
      pendingMutations.current.add(mutationKey);

      try {
        validatePost();

        // Optimistic update
        const previousCount = post.metrics.share_count;
        const newCount = previousCount + 1;
        console.log(`Optimistically updating share count: ${previousCount} -> ${newCount}`);

        // Update local state first
        queryClient.setQueryData(['post', post.post_id], (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            metrics: {
              ...oldData.metrics,
              share_count: newCount
            }
          };
        });

        // Perform share API call
        console.log('Calling share API');
        const response = await engagementService.share(post.post_id);
        console.log('Share API response:', response);

        // Update with server value if available
        const serverCount = response.share_count ?? newCount;
        console.log(`Updating share count to server value: ${serverCount}`);

        // Update cache and UI
        await updateMetricsCache('share', { share_count: serverCount }, {});

        // Show success message
        toast({
          title: "Success",
          description: "Post shared successfully"
        });

        // Invalidate after short delay to ensure consistent state
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['post', post.post_id],
            exact: true
          });
        }, 100);

      } catch (error) {
        console.error('Share operation failed:', error);
        // Revert on error
        queryClient.setQueryData(['post', post.post_id], post);
        handleError(error, 'share');
      } finally {
        setIsLoading(prev => ({ ...prev, share: false }));
        pendingMutations.current.delete(mutationKey);
        console.log('Share operation completed');
      }
    }, [post, queryClient, validatePost, handleError, updateMetricsCache]);

  // Cleanup pending mutations on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up pending mutations');
      pendingMutations.current.clear();
    };
  }, []);

  // Debug: Log current interaction state when it changes
  useEffect(() => {
    console.log(`Post ${post.post_id} interaction state:`, post.interaction_state);
  }, [post.post_id, post.interaction_state]);

  return {
    handleLike: useCallback(() => {
      console.log('Like handler called');
      return likeMutation.mutate({});
    }, [likeMutation]),
    handleDislike: useCallback(() => {
      console.log('Dislike handler called');
      return dislikeMutation.mutate({});
    }, [dislikeMutation]),
    handleSave: useCallback(() => {
      console.log('Save handler called');
      return saveMutation.mutate({});
    }, [saveMutation]),
    handleShare,
    handleReport: useCallback((reason: string) => {
      console.log('Report handler called with reason:', reason);
      return reportMutation.mutate({ reason });
    }, [reportMutation]),
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