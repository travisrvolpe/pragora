// contexts/comment/CommentContext.tsx
'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { toast } from '@/applib/hooks/use-toast/use-toast';
import { commentService } from '@/applib/services/comment/commentService';
import { useAuth } from '@/contexts/auth/AuthContext';

interface CommentContextData {
  createComment: (postId: number, content: string, parentId?: number) => Promise<void>;
  updateComment: (commentId: number, content: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  likeComment: (commentId: number) => Promise<void>;
  dislikeComment: (commentId: number) => Promise<void>;
  reportComment: (commentId: number, reason: string) => Promise<void>;
}

const CommentContext = createContext<CommentContextData | undefined>(undefined);

export function CommentProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const createComment = useCallback(async (postId: number, content: string, parentId?: number) => {
    try {
      await commentService.createComment({
        content,
        postId,
        parentCommentId: parentId || null
      });
      toast({
        title: 'Success',
        description: 'Comment posted successfully'
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create comment',
        variant: 'destructive'
      });
      throw error;
    }
  }, []);

  const updateComment = useCallback(async (commentId: number, content: string) => {
    try {
      await commentService.updateComment(commentId, content);
      toast({
        title: 'Success',
        description: 'Comment updated successfully'
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update comment',
        variant: 'destructive'
      });
      throw error;
    }
  }, []);

  const deleteComment = useCallback(async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      toast({
        title: 'Success',
        description: 'Comment deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete comment',
        variant: 'destructive'
      });
      throw error;
    }
  }, []);

  const likeComment = useCallback(async (commentId: number) => {
    try {
      await commentService.likeComment(commentId);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to like comment',
        variant: 'destructive'
      });
      throw error;
    }
  }, []);

  const dislikeComment = useCallback(async (commentId: number) => {
    try {
      await commentService.dislikeComment(commentId);
    } catch (error) {
      console.error('Error disliking comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to dislike comment',
        variant: 'destructive'
      });
      throw error;
    }
  }, []);

  const reportComment = useCallback(async (commentId: number, reason: string) => {
    try {
      await commentService.reportComment(commentId, reason);
      toast({
        title: 'Success',
        description: 'Comment reported successfully'
      });
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to report comment',
        variant: 'destructive'
      });
      throw error;
    }
  }, []);

  const value = {
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    dislikeComment,
    reportComment
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComment() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  return context;
}

export type { CommentContextData };