// PostAuthor.jsx
import React from "react";
import { MoreHorizontal, BadgeCheck } from "lucide-react";

const PostAuthor = ({ post }) => {
  const getTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return postDate.toLocaleDateString();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center space-x-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          {post.user?.avatar_url ? (
            <img
              src={post.user.avatar_url}
              alt={post.user?.name || 'User avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500" />
          )}
        </div>

        {/* Author Info */}
        <div>
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
              {post.user?.name || post.user_id || 'Anonymous'}
            </span>
            {post.user?.verified && (
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            )}
            {post.user?.credentials && (
              <span className="text-sm text-gray-500">
                ({post.user.credentials})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>{getTimeAgo(post.created_at)}</span>
            {post.updated_at && post.updated_at !== post.created_at && (
              <>
                <span>•</span>
                <span>Edited</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* More Options Button */}
      <button
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="More options"
      >
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
};

export default PostAuthor;