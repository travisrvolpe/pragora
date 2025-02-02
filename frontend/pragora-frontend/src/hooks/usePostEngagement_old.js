// hooks/usePostEngagement.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './use-toast';

export const usePostEngagement_old = (post) => {
  const queryClient = useQueryClient();

  // Helper function to update post metrics
  const updatePostCache = (postId, updates) => {
    queryClient.setQueryData(['posts', postId], (oldPost) => {
      if (!oldPost) return oldPost;
      return { ...oldPost, ...updates };
    });

    // Also update in post lists/feeds
    queryClient.setQueriesData(['posts'], (oldData) => {
      if (!oldData?.pages) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map(page => ({
          ...page,
          posts: page.posts.map(p =>
            p.post_id === postId ? { ...p, ...updates } : p
          )
        }))
      };
    });
  };

  // Base mutation configuration
  const createMutation = (action, successMessage) => {
    return useMutation({
      mutationFn: async () => {
        const response = await fetch(`/posts/${post.post_id}/interactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interaction_type: action,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to process interaction');
        }

        return response.json();
      },
      onMutate: async () => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries(['posts', post.post_id]);

        // Get current post state
        const previousPost = queryClient.getQueryData(['posts', post.post_id]);

        // Optimistically update the post
        const updates = {};
        switch (action) {
          case 'like':
            updates.likes_count = (post.likes_count || 0) + 1;
            break;
          case 'dislike':
            updates.dislikes_count = (post.dislikes_count || 0) + 1;
            break;
          case 'save':
            updates.saves_count = (post.saves_count || 0) + 1;
            break;
          case 'share':
            updates.shares_count = (post.shares_count || 0) + 1;
            break;
          case 'comment':
            updates.comments_count = (post.comments_count || 0) + 1;
            break;
          // Add other interaction types here
        }

        updatePostCache(post.post_id, updates);

        return { previousPost };
      },
      onError: (err, variables, context) => {
        // Revert the optimistic update on error
        if (context?.previousPost) {
          updatePostCache(post.post_id, context.previousPost);
        }
        toast({
          title: "Error",
          description: err.message || "Failed to process action",
          variant: "destructive",
        });
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: successMessage,
        });
      },
      onSettled: () => {
        // Always refetch to ensure consistency
        queryClient.invalidateQueries(['posts', post.post_id]);
        queryClient.invalidateQueries(['posts']);
      },
    });
  };

  // Create mutations for each interaction type
  const likeMutation = createMutation('like', 'Post liked successfully');
  const dislikeMutation = createMutation('dislike', 'Post disliked successfully');
  const saveMutation = createMutation('save', 'Post saved successfully');
  const shareMutation = createMutation('share', 'Post shared successfully');
  const commentMutation = createMutation('comment', 'Comment added successfully');
  const loveMutation = createMutation('love', 'Post marked as loved');
  const hateMutation = createMutation('hate', 'Post marked as hated');

  // Special mutation for reporting
  const reportMutation = useMutation({
    mutationFn: async (reason) => {
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
        description: err.message || "Failed to submit report",
        variant: "destructive",
      });
    },
  });

  // User connection mutations
  const followMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${post.user_id}/follow`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to follow user');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You are now following this user",
      });
      // Invalidate user queries to update UI
      queryClient.invalidateQueries(['users', post.user_id]);
      queryClient.invalidateQueries(['following']);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message || "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const connectMutation = useMutation}
