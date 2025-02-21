import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Calendar, Edit3, Trash } from 'lucide-react';
import { commentService  } from '@/lib/services/comment/commentService';
import { formatRelativeTime } from '@/lib/utils/date-utils';
import { UserAvatar } from '@/components/user/UserAvatar';
import type { CommentWithEngagement } from '@/types/comments';

const CommentsTab: React.FC = () => {
  const [comments, setComments] = useState<CommentWithEngagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserComments = async () => {
      setIsLoading(true);
      try {
        // We'll need to implement this method in the commentService
        const userComments = await commentService.getUserComments();
        setComments(userComments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserComments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Failed to load comments: {error}
      </div>
    );
  }

  if (!comments.length) {
    return (
      <div className="text-center py-8 space-y-4">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
        <p className="text-gray-500">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.comment_id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          {/* Author Section */}
          <div className="flex items-center space-x-3 mb-4">
            <UserAvatar
              username={comment.username || ''}
              avatarUrl={comment.avatar_img}
              size="sm"
            />
            <span className="text-sm font-medium text-gray-700">
              {comment.username}
            </span>
          </div>

          {/* Comment Content */}
          <div className="mb-4">
            <div className="mb-2 text-sm text-gray-500">
              <span>Commented on post ID: </span>
              <a
                href={`/posts/${comment.post_id}`}
                className="text-blue-600 hover:underline"
              >
                #{comment.post_id}
              </a>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Comment Metadata */}
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <ThumbsUp className={`w-4 h-4 mr-1 ${
                  comment.interaction_state.like ? 'text-blue-500' : ''
                }`} />
                <span>{comment.metrics.like_count}</span>
              </div>
              <div className="flex items-center">
                <ThumbsDown className={`w-4 h-4 mr-1 ${
                  comment.interaction_state.dislike ? 'text-red-500' : ''
                }`} />
                <span>{comment.metrics.dislike_count}</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                <span>{comment.metrics.reply_count}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatRelativeTime(comment.created_at)}
              </span>
              {comment.is_edited && (
                <span className="text-xs italic">
                  (edited)
                </span>
              )}
              {!comment.is_deleted && (
                <div className="flex space-x-2">
                  <button
                    className="p-1 hover:text-blue-600 transition-colors"
                    onClick={() => {/* TODO: Add edit handler */}}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:text-red-600 transition-colors"
                    onClick={() => {/* TODO: Add delete handler */}}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Replies Section */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
              </p>
              {/* You could add a "Show Replies" button here */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentsTab;