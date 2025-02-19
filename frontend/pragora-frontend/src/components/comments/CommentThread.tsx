// components/comments/CommentThread.tsx
import React, { useRef } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Alert } from '@/components/ui/alert';
import { toast } from '@/lib/hooks/use-toast/use-toast';
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
  initialComments?: CommentWithEngagement[];// any[]; // CommentWithEngagement[];
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  postId,
  initialComments = []
}) => {
  const commentListRef = useRef<HTMLDivElement>(null);
  //const { user } = useAuth(); -- does this need to be used anymore?

  // Query for fetching comments
  const { data, loading, error } = useQuery(GET_COMMENTS, {
    variables: {
      postId,
      parentCommentId: null, // Fetch root comments
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

  // Subscribe to comment events
  useSubscription(COMMENT_ADDED_SUBSCRIPTION, {
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
    variables: { postId },
    onError: (error) => {
      console.error('Update subscription error:', error);
    }
  });

  useSubscription(COMMENT_DELETED_SUBSCRIPTION, {
    variables: { postId },
    onError: (error) => {
      console.error('Delete subscription error:', error);
    }
  });

  useSubscription(COMMENT_ACTIVITY_SUBSCRIPTION, {
    variables: { postId },
    onError: (error) => {
      console.error('Activity subscription error:', error);
    }
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
  const rootComments = comments.filter((comment: CommentWithEngagement) => {
    return !comment.parent_comment_id && !comment.parent_comment_id;
  });

  const processedComments = rootComments.map((comment: CommentWithEngagement) => ({
    ...comment,
    replies: comment.replies?.map(reply => ({
      ...reply,
      depth: (comment.depth || 0) + 1,
      commentId: reply.comment_id || reply.comment_id,
      parentCommentId: reply.parent_comment_id || reply.parent_comment_id
    })) || []
  }));
  console.log('Root comments:', rootComments); // Debug log
  console.log('All comments:', comments); // Debug log

  return (
    <div className="space-y-4">
      <CommentForm postId={postId} />

      <div
        ref={commentListRef}
        className="space-y-4 max-h-[600px] overflow-y-auto scroll-smooth pr-4"
      >
        {processedComments.map((comment: CommentWithEngagement) => (
          <CommentCard
            key={comment.comment_id || comment.comment_id}
            comment={{
              ...comment,
              commentId: comment.comment_id || comment.comment_id,
              parentCommentId: comment.parent_comment_id || comment.parent_comment_id,
              // Additionally pass the postId to ensure it's available for replies
              postId: comment.post_id || comment.post_id,
              replies: comment.replies
            }}
            depth={comment.depth || 0}
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