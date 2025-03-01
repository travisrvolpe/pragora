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
import { engagementService } from '@/applib/services/engagement/engageService';
import { updatePostCache } from '@/applib/utils/postCache';

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

  // ADD THE NEW MEMOIZED VALUE HERE - after initialMetrics but before loading states
  // Memoize interaction state to prevent unnecessary re-renders
  const currentInteractionState = useMemo(() => {
    return {
      like: post.interaction_state?.like ?? false,
      dislike: post.interaction_state?.dislike ?? false,
      save: post.interaction_state?.save ?? false,
      share: post.interaction_state?.share ?? false,
      report: post.interaction_state?.report ?? false
    };
  }, [post.interaction_state]);

  // Log interaction state on changes
  useEffect(() => {
    console.log('usePostEngagement: post interaction state update:', {
      postId: post.post_id,
      state: currentInteractionState
    });
  }, [post.post_id, currentInteractionState]);


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
      // Disabled onMutate function in usePostEngagement.ts
      onMutate: async (variables) => {
        // Log that optimistic updates are disabled
        console.log(`Optimistic update for ${actionType} DISABLED - using server-only state`);

        // Cancel any outgoing refetches that might overwrite our update
        await queryClient.cancelQueries({ queryKey: ['post', post.post_id] });

        // Return empty context to disable optimistic updates
        return { previousPost: undefined };
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
      onSuccess: (data: EngagementResponse) => {
        console.log(`${actionType} mutation succeeded:`, data);

        // When the server returns true, we need to forcefully keep that state
        const isActive = Boolean(data[actionType]);
        console.log(`Server response for ${actionType}: ${isActive}`);

        const countField = `${actionType}_count`;
        let newCount = 0;

        // Ensure we have a proper count value from the server response
        if (typeof data[countField] === 'number') {
          newCount = data[countField];
        } else if (data.metrics && typeof data.metrics[countField] === 'number') {
          newCount = data.metrics[countField];
        } else if (isActive) {
          // If server says action is active but count is missing or zero,
          // ensure we have a non-zero count for UI consistency
          newCount = Math.max(1, post.metrics?.[countField as keyof PostMetrics] || 1);
          console.log(`No ${countField} provided but ${actionType} is active, using count: ${newCount}`);
        }

        // First update the post directly in cache
        queryClient.setQueryData<PostWithEngagement | undefined>(['post', post.post_id], (oldData) => {
          if (!oldData) return oldData;

          // Safely create updated metrics
          const updatedMetrics: PostMetrics = {
            like_count: oldData.metrics?.like_count || 0,
            dislike_count: oldData.metrics?.dislike_count || 0,
            save_count: oldData.metrics?.save_count || 0,
            share_count: oldData.metrics?.share_count || 0,
            report_count: oldData.metrics?.report_count || 0,
            comment_count: oldData.metrics?.comment_count || 0
          };

          // Create updated interaction state
          const updatedInteractionState: PostInteractionState = {
            like: oldData.interaction_state?.like || false,
            dislike: oldData.interaction_state?.dislike || false,
            save: oldData.interaction_state?.save || false,
            share: oldData.interaction_state?.share || false,
            report: oldData.interaction_state?.report || false
          };

          // Set the updated count and state directly from server response
          updatedMetrics[countField as keyof PostMetrics] = newCount;
          updatedInteractionState[actionType as keyof PostInteractionState] = isActive;

          // If server provided complete metrics, use those values as they're more accurate
          if (data.metrics) {
            Object.entries(data.metrics).forEach(([key, value]) => {
              if (key in updatedMetrics && typeof value === 'number') {
                (updatedMetrics as any)[key] = value;
              }
            });
          }

          // Handle mutual exclusivity between like and dislike
          if (actionType === 'like' && isActive) {
            updatedInteractionState.dislike = false;
            // If we're turning off dislike, reduce the dislike count if needed
            if (oldData.interaction_state?.dislike) {
              updatedMetrics.dislike_count = Math.max(0, updatedMetrics.dislike_count - 1);
            }
          } else if (actionType === 'dislike' && isActive) {
            updatedInteractionState.like = false;
            // If we're turning off like, reduce the like count if needed
            if (oldData.interaction_state?.like) {
              updatedMetrics.like_count = Math.max(0, updatedMetrics.like_count - 1);
            }
          }

          console.log(`Updated ${actionType} state in cache:`, {
            before: oldData.interaction_state,
            after: updatedInteractionState
          });

          console.log(`Updated metrics in cache:`, {
            before: oldData.metrics,
            after: updatedMetrics
          });

          return {
            ...oldData,
            metrics: updatedMetrics,
            interaction_state: updatedInteractionState
          };
        });

        // Cancel any refetches that might overwrite our update
        queryClient.cancelQueries({ queryKey: ['post', post.post_id] });

        // Create a metrics update object based on available data
        const metricsUpdate: Partial<PostMetrics> = {};

        // If the backend returns full metrics object, use it
        if (data.metrics) {
          console.log('Server provided complete metrics:', data.metrics);

          // Make a clone to avoid modifying the original
          const adjustedMetrics = {...data.metrics};

          // Special handling for save action: ensure save_count is at least 1 if save is true
          if (isActive && actionType === 'save' && (!adjustedMetrics.save_count || adjustedMetrics.save_count === 0)) {
            adjustedMetrics.save_count = 1;
            console.log('Adjusting save_count to 1 for UI consistency');
          }

          // Update the cache with the adjusted metrics
          updateMetricsCache(actionType, adjustedMetrics, {
            ...post.interaction_state,
            [actionType]: isActive
          });
        } else {
          // Create updated metrics manually
          metricsUpdate[`${actionType}_count` as keyof Partial<PostMetrics>] = newCount;

          // Update the cache with our best understanding of the current state
          updateMetricsCache(actionType, metricsUpdate, {
            ...post.interaction_state,
            [actionType]: isActive
          });
        }

        // Force a refresh to ensure consistency
        setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['posts'],
            exact: false
          });
          queryClient.invalidateQueries({
            queryKey: ['post', post.post_id],
            exact: true
          });
        }, 300);

        // If it's still not correct after 1.5 seconds, try one more time
        setTimeout(() => {
          // Check if the state is still correct
          const currentPost = queryClient.getQueryData<PostWithEngagement>(['post', post.post_id]);
          if (currentPost && currentPost.interaction_state[actionType] !== isActive) {
            console.log(`Forcing ${actionType} state to ${isActive} after server didn't update correctly`);

            // Force update the state again
            queryClient.setQueryData<PostWithEngagement>(['post', post.post_id], {
              ...currentPost,
              interaction_state: {
                ...currentPost.interaction_state,
                [actionType]: isActive
              }
            });

            // Force a final refresh
            queryClient.invalidateQueries({
              queryKey: ['post', post.post_id],
              exact: true,
              refetchActive: true
            });
          }
        }, 1500);
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

    handleSave: useCallback(async () => {
      console.log('Save handler called');

      // Check if already saving
      if (isLoading.save) {
        console.log('Save already in progress, skipping');
        return;
      }

      // Use a simple ID for the operation
      const operationId = `save-${post.post_id}`;

      // Check if this operation is already pending
      if (pendingMutations.current.has(operationId)) {
        console.log('Save operation already pending, skipping');
        return;
      }

      try {
        // Mark as loading
        pendingMutations.current.add(operationId);
        setIsLoading(prev => ({ ...prev, save: true }));

        console.log(`Starting save operation for post ${post.post_id}`);

        // Make the API call directly without retries - let the backend handle it
        const response = await engagementService.save(post.post_id);

        console.log('Save operation successful:', response);

        // Get the actual values from the response
        const isSaved = Boolean(response.save);
        const saveCount = typeof response.save_count === 'number'
          ? response.save_count
          : (response.metrics?.save_count || 0);

        // Create safe defaults for updating cache
        const currentMetrics = post.metrics || {
          like_count: 0,
          dislike_count: 0,
          save_count: 0,
          share_count: 0,
          comment_count: 0,
          report_count: 0
        };

        const currentInteractionState = post.interaction_state || {
          like: false,
          dislike: false,
          save: false,
          share: false,
          report: false
        };

        // Immediately update the local cache with server response
        queryClient.setQueryData<PostWithEngagement | undefined>(
          ['post', post.post_id],
          oldData => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              metrics: {
                ...currentMetrics,
                ...(response.metrics || {}),  // Use server metrics if available
                save_count: saveCount  // Always use the explicit save count
              },
              interaction_state: {
                ...currentInteractionState,
                save: isSaved
              }
            };
          }
        );

        // Invalidate queries to ensure consistency
        window.setTimeout(() => {
          queryClient.invalidateQueries({
            queryKey: ['post', post.post_id],
            refetchActive: true
          });
          queryClient.invalidateQueries({
            queryKey: ['user', 'savedPosts'],
            refetchActive: true
          });
        }, 300);

      } catch (error) {
        console.error('Save operation failed:', error);

        // Show error toast
        toast({
          title: "Error",
          description: error instanceof Error
            ? error.message
            : "Failed to save post",
          variant: "destructive"
        });

        // Force refresh to get current state
        queryClient.invalidateQueries({
          queryKey: ['post', post.post_id],
          refetchActive: true
        });

      } finally {
        // Clean up no matter what
        pendingMutations.current.delete(operationId);
        setIsLoading(prev => ({ ...prev, save: false }));
        console.log('Save operation completed');
      }
    }, [post.post_id, post.metrics, post.interaction_state, isLoading.save, queryClient, toast, engagementService, pendingMutations, setIsLoading]),


    handleShare, //TODO DID YOU ACCIDENTLY DELETE THIS?
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