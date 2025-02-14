// CommentCard.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {useToast, toast } from '../../lib/hooks/use-toast/use-toast';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { CommentWithEngagement } from '@/types/comments';
import { User } from '@/types/user';
import { useCommentInteraction } from '../../lib/hooks/useCommentInteraction';
import { formatRelativeTime } from '@/lib/utils/date-utils';
import { CommentForm } from './CommentForm';

interface CommentCardProps {
  comment: CommentWithEngagement;
  wsConnection: WebSocket | null;
}

export const CommentCard: React.FC<CommentCardProps> = ({ comment, wsConnection }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { handleLike, handleDislike, handleReport, isLoading } = useCommentInteraction(comment);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/comments/${comment.comment_id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      return response.json();
    },
    onSuccess: () => {
      // Update comment list query
      queryClient.invalidateQueries({
        queryKey: ['comments', comment.post_id]
      });
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
    }
  });

  const isOwnComment = user?.user_id === comment.user_id;
  const isAdmin = user?.is_admin ?? false;  // Access is_admin directly
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
              wsConnection={wsConnection}
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
              disabled={isLoading.like}
              className={`flex items-center space-x-1 text-sm ${
                comment.interaction_state.like ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{comment.metrics.like_count}</span>
            </button>

            <button
              onClick={handleDislike}
              disabled={isLoading.dislike}
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
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this comment?')) {
                        deleteMutation.mutate();
                      }
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {isReplying && (
            <div className="mt-4">
              <CommentForm
                postId={comment.post_id}
                parentId={comment.comment_id}
                wsConnection={wsConnection}
              />
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.comment_id}
                  comment={reply}
                  wsConnection={wsConnection}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};