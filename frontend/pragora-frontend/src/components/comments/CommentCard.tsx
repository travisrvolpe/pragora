// components/comments/CommentCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Flag, MoreVertical, Reply, Edit, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { CommentForm } from './CommentForm';
import { formatRelativeTime } from '@/applib/utils/date-utils';
import type { Comment, CommentInteractionState, CommentMetrics, User } from '@/applib/graphql/generated/types';
import {
  useLikeCommentMutation,
  useDislikeCommentMutation,
  useDeleteCommentMutation,
  useReportCommentMutation
} from '@/applib/graphql/generated/types';
import { toast } from '@/applib/hooks/use-toast/use-toast';
import {UserAvatar} from "@/components/user/UserAvatar";

interface CommentCardProps {
  comment: Comment;
  depth?: number;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, depth = 0 }) => {
  useEffect(() => {
    console.log('Comment data:', comment);
    console.log('User data:', comment.user);
    console.log('Avatar path:', comment.user?.avatarImg);
  }, [comment]);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { user } = useAuth();

  const [likeComment] = useLikeCommentMutation({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const [dislikeComment] = useDislikeCommentMutation({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const [deleteComment] = useDeleteCommentMutation({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const [reportComment] = useReportCommentMutation({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleLike = async () => {
    try {
      await likeComment({
        variables: { commentId: comment.commentId }
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDislike = async () => {
    try {
      await dislikeComment({
        variables: { commentId: comment.commentId }
      });
    } catch (error) {
      console.error('Error disliking comment:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment({
          variables: { commentId: comment.commentId }
        });
        setShowActions(false);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleReport = async () => {
    const reason = window.prompt('Please provide a reason for reporting this comment:');
    if (reason) {
      try {
        await reportComment({
          variables: {
            commentId: comment.commentId,
            reason
          }
        });
        setShowActions(false);
      } catch (error) {
        console.error('Error reporting comment:', error);
      }
    }
  };

  useEffect(() => {
    if (depth > 2) {
      console.log(`Level ${depth} comment data:`, {
        id: comment.commentId,
        username: comment.username,
        user: comment.user,
        hasUser: !!comment.user
      });
    }
  }, [comment, depth]);

  const isOwnComment = user?.user_id === comment.userId;
  const isAdmin = user?.is_admin ?? false;
  const showActionButtons = !comment.isDeleted && (isOwnComment || isAdmin);

  return (
      <div
        className={`p-4 rounded-lg mb-3 ${
          depth > 0 
            ? 'bg-gray-50 border-l-2 border-blue-100 shadow-sm' 
            : 'bg-white shadow-sm border border-gray-100'
        }`}
        style={{
          marginLeft: depth > 0 ? `${Math.min(depth * 1.5, 6)}rem` : '0',
          transition: 'all 0.2s ease'
        }}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <UserAvatar
              username={comment.user?.username || comment.username || 'Anonymous'}
              avatarImg={comment.avatarImg || comment.user?.avatarImg}
              size="sm"
              className="ring-2 ring-white shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-800">
                {comment.user?.username || comment.username || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-500 italic">(edited)</span>
              )}
            </div>

          {comment.isDeleted ? (
              <p className="text-gray-500 italic text-sm">[deleted]</p>
          ) : isEditing ? (
              <CommentForm
                  postId={comment.postId}
                  parentId={comment.commentId}
                  defaultContent={comment.content}
                  onCancel={() => setIsEditing(false)}
                  onSuccess={() => setIsEditing(false)}
              />
          ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                {comment.content}
              </p>
          )}

          <div className="flex items-center gap-4 mt-2">
            <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-xs ${
                    comment.interactionState.like ? 'text-blue-600' : 'text-gray-500'
                } hover:text-blue-600 transition-colors`}
            >
              <ThumbsUp className="w-3 h-3"/>
              <span>{comment.metrics.likeCount}</span>
            </button>

            <button
                onClick={handleDislike}
                className={`flex items-center gap-1 text-xs ${
                    comment.interactionState.dislike ? 'text-red-600' : 'text-gray-500'
                } hover:text-red-600 transition-colors`}
            >
              <ThumbsDown className="w-3 h-3"/>
              <span>{comment.metrics.dislikeCount}</span>
            </button>

            {!comment.isDeleted && (
                <button
                    onClick={() => setIsReplying(!isReplying)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Reply className="w-3 h-3"/>
                  <span>Reply</span>
                </button>
            )}

            {showActionButtons && (
                <div className="relative ml-auto">
                  <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6"
                      onClick={() => setShowActions(!showActions)}
                  >
                    <MoreVertical className="w-3 h-3"/>
                  </Button>
                  {showActions && (
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg py-1 z-10 text-sm">
                        <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowActions(false);
                            }}
                            className="flex items-center w-full px-3 py-1 text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="w-3 h-3 mr-2"/>
                          Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center w-full px-3 py-1 text-red-600 hover:bg-gray-100"
                        >
                          <Trash className="w-3 h-3 mr-2"/>
                          Delete
                        </button>
                        {!isOwnComment && (
                            <button
                                onClick={handleReport}
                                className="flex items-center w-full px-3 py-1 text-yellow-600 hover:bg-gray-100"
                            >
                              <Flag className="w-3 h-3 mr-2"/>
                              Report
                            </button>
                        )}
                      </div>
                  )}
                </div>
            )}
          </div>

          {isReplying && (
              <div className="mt-3">
                <CommentForm
                    postId={comment.postId}
                    parentId={comment.commentId}
                    onSuccess={() => {
                      console.log('Reply submitted with postId:', comment.postId);
                      setIsReplying(false);
                    }}
                    onCancel={() => setIsReplying(false)}
                />
              </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-2">
                {comment.replies.map((reply) => (
                    <CommentCard
                        key={reply.commentId}
                        comment={reply}
                        depth={depth + 1}
                    />
                ))}
              </div>
          )}
          </div>
        </div>
      </div>

)
  ;
};

export default CommentCard;