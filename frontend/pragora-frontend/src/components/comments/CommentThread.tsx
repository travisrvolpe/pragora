// components/comments/CommentThread.tsx
import React, { useRef } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert } from '@/components/ui/alert';
import { toast } from '@/applib/hooks/use-toast/use-toast';
import {
  GET_COMMENTS,
  COMMENT_ADDED_SUBSCRIPTION,
  COMMENT_UPDATED_SUBSCRIPTION,
  COMMENT_DELETED_SUBSCRIPTION,
  COMMENT_ACTIVITY_SUBSCRIPTION
} from '@/applib/graphql/operations/comments';

import type {
  Comment,
  GetCommentsQuery,
  OnCommentAddedSubscription,
  OnCommentUpdatedSubscription,
  OnCommentDeletedSubscription,
  OnCommentActivitySubscription
} from '@/applib/graphql/generated/types';

interface CommentThreadProps {
  postId: number;
  initialComments?: Comment[];
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  postId,
  initialComments = []
}) => {
  const commentListRef = useRef<HTMLDivElement>(null);

  // Query for fetching comments
  const { data, loading, error } = useQuery<GetCommentsQuery>(GET_COMMENTS, {
    variables: {
      postId,
      parentCommentId: null,
      page: 1,
      pageSize: 50
    },
    fetchPolicy: 'cache-and-network',
    onError: (error) => {
      console.error('Query error:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    }
  });

  // Subscriptions
  useSubscription<OnCommentAddedSubscription>(COMMENT_ADDED_SUBSCRIPTION, {
    variables: { postId },
    onError: (error) => {
      console.error('Subscription error:', error);
      toast({
        title: "Connection Error",
        description: "Lost connection to comment stream",
        variant: "destructive"
      });
    },
    onData: ({ data }) => {
      if (data?.data?.commentAdded) {
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

  useSubscription<OnCommentUpdatedSubscription>(COMMENT_UPDATED_SUBSCRIPTION, {
    variables: { postId },
    onError: (error) => console.error('Update subscription error:', error)
  });

  useSubscription<OnCommentDeletedSubscription>(COMMENT_DELETED_SUBSCRIPTION, {
    variables: { postId },
    onError: (error) => console.error('Delete subscription error:', error)
  });

  useSubscription<OnCommentActivitySubscription>(COMMENT_ACTIVITY_SUBSCRIPTION, {
    variables: { postId },
    onError: (error) => console.error('Activity subscription error:', error)
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
  const rootComments = comments.filter(comment => !comment.parentCommentId);

  return (
    <div className="space-y-4">
      <CommentForm postId={postId} />

      <div
        ref={commentListRef}
        className="space-y-4 max-h-[600px] overflow-y-auto scroll-smooth pr-4"
      >
        {rootComments.map((comment) => (
          <CommentCard
            key={comment.commentId}
            comment={comment}
            depth={comment.depth}
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

export default CommentThread;