// contexts/comment/CommentContext.tsx
'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/hooks/use-toast/use-toast';
import type { CommentWithEngagement } from '@/types/comments';

interface CommentContextData {
  createComment: (postId: number, content: string, parentId?: number) => Promise<void>;
  updateComment: (commentId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  likeComment: (commentId: number) => Promise<void>;
  dislikeComment: (commentId: number) => Promise<void>;
  reportComment: (commentId: number, reason: string) => Promise<void>;
}

interface CommentProviderProps {
  children: ReactNode;
}

const CommentContext = createContext<CommentContextData | undefined>(undefined);

export function CommentProvider({ children }: CommentProviderProps) {
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content, parentId }: { postId: number; content: string; parentId?: number }) => {
      const response = await fetch(`/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content, post_id: postId, parent_comment_id: parentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast({
        title: 'Success',
        description: 'Comment created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number; content: string }) => {
      const response = await fetch(`/posts/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast({
        title: 'Success',
        description: 'Comment updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await fetch(`/posts/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete comment');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateComment = useCallback(async (postId: number, content: string, parentId?: number) => {
    await createCommentMutation.mutateAsync({ postId, content, parentId });
  }, [createCommentMutation]);

  const handleUpdateComment = useCallback(async (commentId: number, content: string) => {
    await updateCommentMutation.mutateAsync({ commentId, content });
  }, [updateCommentMutation]);

  const handleDeleteComment = useCallback(async (commentId: number) => {
    await deleteCommentMutation.mutateAsync(commentId);
  }, [deleteCommentMutation]);

  const handleLikeComment = useCallback(async (commentId: number) => {
    const response = await fetch(`/posts/comments/${commentId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to like comment');
  }, []);

  const handleDislikeComment = useCallback(async (commentId: number) => {
    const response = await fetch(`/posts/comments/${commentId}/dislike`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to dislike comment');
  }, []);

  const handleReportComment = useCallback(async (commentId: number, reason: string) => {
    const response = await fetch(`/posts/comments/${commentId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Failed to report comment');
  }, []);

  const contextValue = {
    createComment: handleCreateComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    likeComment: handleLikeComment,
    dislikeComment: handleDislikeComment,
    reportComment: handleReportComment
  };

  return (
    <CommentContext.Provider value={contextValue}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComment(): CommentContextData {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  return context;
}

export type { CommentContextData };