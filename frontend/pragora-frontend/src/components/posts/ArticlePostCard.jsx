import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import PostWrapper from '../PostWrapper';

const ArticlePostCard = ({
  post,
    variant,
  onLike,
  onDislike,
  onSave,
  onShare,
  onComment,
  onThreadedReply,
  onView,
  onFollow,
  onConnect,
  onReport,
  onLove,
  onHate
}) => {
  return (
    <PostWrapper
      post={post}
      variant={variant}
      onLike={onLike}
      onDislike={onDislike}
      onSave={onSave}
      onShare={onShare}
      onComment={onComment}
      onThreadedReply={onThreadedReply}
      onView={onView}
      onFollow={onFollow}
      onConnect={onConnect}
      onReport={onReport}
      onLove={onLove}
      onHate={onHate}
    >
      <div className="px-4">
        {/* Featured Image */}
        {post.image_url && (
          <div className="relative w-full h-[400px] bg-gray-100 mb-6">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {post.title}
          </h2>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-lg text-gray-600">
              {post.subtitle}
            </p>
          )}

          {/* Reading Time & Topics */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>8 min read</span>
            </div>
            {post.category && (
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>{post.category}</span>
              </div>
            )}
          </div>

          {/* Preview Content */}
          <div
            className="prose prose-gray max-w-none text-gray-600 line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: post.content.substring(0, 300) + (post.content.length > 300 ? '...' : '')
            }}
          />
        </div>
      </div>
    </PostWrapper>
  );
};

export default ArticlePostCard;