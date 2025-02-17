// components/comments/CommentCard.tsx
'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MoreVertical,
  Reply,
  Edit,
  Trash
} from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useComment } from '@/contexts/comment/CommentContext';
import { Button } from '@/components/ui/button';
import { CommentForm } from './CommentForm';
import type { CommentWithEngagement } from '@/types/comments';
import { formatRelativeTime } from '@/lib/utils/date-utils';

interface CommentCardProps {
  comment: CommentWithEngagement;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const {
    likeComment,
    dislikeComment,
    deleteComment,
    reportComment
  } = useComment();

  const handleLike = async () => {
    try {
      await likeComment(comment.comment_id);
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDislike = async () => {
    try {
      await dislikeComment(comment.comment_id);
    } catch (error) {
      console.error('Error disliking comment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(comment.comment_id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleReport = async () => {
    const reason = window.prompt('Please provide a reason for reporting this comment:');
    if (reason) {
      try {
        await reportComment(comment.comment_id, reason);
      } catch (error) {
        console.error('Error reporting comment:', error);
      }
    }
  };

  const isOwnComment = user?.user_id === comment.user_id;
  const isAdmin = user?.is_admin ?? false;
  const showActionButtons = !comment.is_deleted && (isOwnComment || isAdmin);

  return (
    <div className={`p-4 rounded-lg ${comment.depth ? 'ml-8 bg-gray-50' : 'bg-white'}`}>
      <div className="flex space-x-3">
        <img
          src={comment.avatar_img || '/api/placeholder/40/40'}
          alt={comment.username}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{comment.username}</span>
            <span className="text-sm text-gray-500">
              {formatRelativeTime(comment.created_at)}
            </span>
            {comment.is_edited && (
              <span className="text-xs text-gray-500">(edited)</span>
            )}
          </div>

          {comment.is_deleted ? (
            <p className="text-gray-500 italic">[deleted]</p>
          ) : isEditing ? (
            <CommentForm
              postId={comment.post_id}
              parentId={comment.comment_id}
              defaultContent={comment.content}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          ) : (
            <p className="mt-1">{comment.content}</p>
          )}

          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 text-sm ${
                comment.interaction_state.like ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{comment.metrics.like_count}</span>
            </button>

            <button
              onClick={handleDislike}
              className={`flex items-center space-x-1 text-sm ${
                comment.interaction_state.dislike ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{comment.metrics.dislike_count}</span>
            </button>

            {!comment.is_deleted && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center space-x-1 text-sm text-gray-500"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
            )}

            {showActionButtons && (
              <div className="relative ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                  {!isOwnComment && (
                    <button
                      onClick={handleReport}
                      className="flex items-center w-full px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Report
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {isReplying && (
            <div className="mt-4">
              <CommentForm
                postId={comment.post_id}
                parentId={comment.comment_id}
                onSuccess={() => setIsReplying(false)}
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.comment_id}
                  comment={reply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;