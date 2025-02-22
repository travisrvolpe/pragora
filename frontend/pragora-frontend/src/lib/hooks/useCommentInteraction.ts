// hooks/useCommentInteraction.ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '../hooks/use-toast/use-toast';
import type { CommentWithEngagement, CommentResponse } from '@/types/comments';

type InteractionType = 'like' | 'dislike' | 'report';

export function useCommentInteraction(comment: CommentWithEngagement) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState({
    like: false,
    dislike: false,
    report: false,
  });

  const updateCommentCache = (
    action_type: InteractionType,
    data: Partial<CommentResponse>
  ) => {
    // Update single comment
    queryClient.setQueryData(
      ['comment', comment.comment_id],
      (oldComment: CommentWithEngagement | undefined) => {
        if (!oldComment) return oldComment;
        return {
          ...oldComment,
          metrics: {
            ...oldComment.metrics,
            [`${action_type}_count`]: data[`${action_type}_count`] ?? oldComment.metrics[`${action_type}_count`]
          },
          interaction_state: {
            ...oldComment.interaction_state,
            [action_type]: data[action_type] ?? !oldComment.interaction_state[action_type]
          }
        };
      }
    );

    // Update comment in post comments list
    queryClient.setQueryData(
      ['comments', comment.post_id],
      (oldData: any) => {
        if (!oldData?.comments) return oldData;
        return {
          ...oldData,
          comments: oldData.comments.map((c: CommentWithEngagement) =>
            c.comment_id === comment.comment_id
              ? {
                  ...c,
                  metrics: {
                    ...c.metrics,
                    [`${action_type}_count`]: data[`${action_type}_count`] ?? c.metrics[`${action_type}_count`]
                  },
                  interaction_state: {
                    ...c.interaction_state,
                    [action_type]: data[action_type] ?? !c.interaction_state[action_type]
                  }
                }
              : c
          )
        };
      }
    );
  };

  const createMutation = (type: InteractionType) =>
    useMutation({
      mutationFn: async () => {
        setIsLoading(prev => ({ ...prev, [type]: true }));
        const response = await fetch(
          `/api/comments/${comment.comment_id}/${type}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to ${type} comment`);
        }

        return response.json();
      },
      onMutate: async () => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: ['comments', comment.post_id]
        });
        await queryClient.cancelQueries({
          queryKey: ['comment', comment.comment_id]
        });

        // Optimistically update the cache
        const optimisticUpdate = {
          [`${type}_count`]: comment.metrics[`${type}_count`] + (comment.interaction_state[type] ? -1 : 1),
          [type]: !comment.interaction_state[type]
        };
        updateCommentCache(type, optimisticUpdate);

        return { optimisticUpdate };
      },
      onSuccess: (data) => {
        updateCommentCache(type, data);
        toast({
          title: "Success",
          description: data.message || `Comment ${type}d successfully`
        });
      },
      onError: (error: Error, _, context) => {
        // Revert optimistic update
        if (context?.optimisticUpdate) {
          updateCommentCache(type, {
            [`${type}_count`]: comment.metrics[`${type}_count`],
            [type]: comment.interaction_state[type]
          });
        }

        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      },
      onSettled: () => {
        setIsLoading(prev => ({ ...prev, [type]: false }));
        // Refetch to ensure consistency
        queryClient.invalidateQueries({
          queryKey: ['comments', comment.post_id]
        });
        queryClient.invalidateQueries({
          queryKey: ['comment', comment.comment_id]
        });
      }
    });

  const likeMutation = createMutation('like');
  const dislikeMutation = createMutation('dislike');
  const reportMutation = createMutation('report');

  return {
    handleLike: () => likeMutation.mutate(),
    handleDislike: () => dislikeMutation.mutate(),
    handleReport: () => reportMutation.mutate(),
    isLoading,
    isError: {
      like: likeMutation.isError,
      dislike: dislikeMutation.isError,
      report: reportMutation.isError
    }
  };
}