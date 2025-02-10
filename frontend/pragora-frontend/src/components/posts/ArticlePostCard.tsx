// components/posts/ArticlePostCard.tsx
import React from 'react';
import { Clock, BookOpen } from 'lucide-react';
import { BasePostCard } from './BasePostCard';
import type { PostCardProps } from '../../types/posts/component-types';
import type { Post, ArticlePost } from '../../types/posts/post-types';
import { cn } from '../../lib/utils/utils';


const isArticlePost = (post: Post): post is ArticlePost => {
  return post.post_type_id === 3;
};

export const ArticlePostCard: React.FC<PostCardProps> = ({
  post,
  variant = 'feed',
  className,
  ...props
}) => {
  if (!isArticlePost(post)) {
    return null; // Or some fallback UI
  }

  return (
    <BasePostCard
      post={post}
      variant={variant}
      className={cn('article-post', className)}
      {...props}
    >
      <div className="space-y-6">
        {/* Featured Image */}
        {post.image_url && (
          <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title || 'Article featured image'}
              className="w-full h-full object-cover"
            />
          </div>
        )}


        <div className="space-y-4">
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
              <span>
                {Math.ceil(post.content.length / 1000)} min read
              </span>
            </div>
            {post.category_id && (
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                <span>{post.custom_subcategory || 'Article'}</span>
              </div>
            )}
          </div>

          {/* Preview Content */}
          {variant === 'feed' ? (
            <div
              className="prose prose-gray max-w-none text-gray-600 line-clamp-3"
              dangerouslySetInnerHTML={{
                __html: post.content.substring(0, 300) + (post.content.length > 300 ? '...' : '')
              }}
            />
          ) : (
            <div
              className="prose prose-gray max-w-none text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}
        </div>
      </div>
    </BasePostCard>
  );
};

export default ArticlePostCard;