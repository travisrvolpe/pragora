// components/comments/CommentThread.tsx
import React, { useRef } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Alert } from '@/components/ui/alert';
import {
  GET_COMMENTS,
  COMMENT_ADDED_SUBSCRIPTION,
  COMMENT_UPDATED_SUBSCRIPTION,
  COMMENT_DELETED_SUBSCRIPTION,
  COMMENT_ACTIVITY_SUBSCRIPTION
} from '@/lib/graphql/operations/comments';
import type { CommentWithEngagement } from '@/types/comments';

interface CommentThreadProps {
  postId: number;
  initialComments?: CommentWithEngagement[];
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  postId,
  initialComments = []
}) => {
  const commentListRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Query for fetching comments
  const { data, loading, error } = useQuery(GET_COMMENTS, {
    variables: { postId }, // Changed from post_id to postId
    fetchPolicy: 'cache-and-network'
  });

  // Subscribe to comment events
  useSubscription(COMMENT_ADDED_SUBSCRIPTION, {
    variables: { postId }, // Changed from post_id to postId
    onData: ({ data }) => {
      if (data?.data?.commentAdded) {
        // Auto-scroll to new comment if at bottom
        if (commentListRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = commentListRef.current;
          if (scrollHeight - scrollTop === clientHeight) {
            setTimeout(() => {
              commentListRef.current?.scrollTo({
                top: scrollHeight,
                behavior: 'smooth'
              });
            }, 100);
          }
        }
      }
    }
  });

  useSubscription(COMMENT_UPDATED_SUBSCRIPTION, {
    variables: { postId }
  });

  useSubscription(COMMENT_DELETED_SUBSCRIPTION, {
    variables: { postId }
  });

  useSubscription(COMMENT_ACTIVITY_SUBSCRIPTION, {
    variables: { postId }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <p>Error loading comments: {error.message}</p>
      </Alert>
    );
  }

  const comments = data?.comments || initialComments;

  return (
    <div className="space-y-4">
      <CommentForm postId={postId} />
      <div
        ref={commentListRef}
        className="space-y-4 max-h-[600px] overflow-y-auto scroll-smooth"
      >
        {comments.map((comment: CommentWithEngagement) => (
          <CommentCard
            key={comment.comment_id} // Changed from commentId
            comment={comment}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
};