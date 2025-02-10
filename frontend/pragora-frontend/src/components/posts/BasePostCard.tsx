// components/posts/BasePostCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MoreHorizontal, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils/utils';
import type { PostCardProps } from '../../types/posts/component-types';
import type { PostVariant } from '../../types/posts/post-types';
import type { Post } from '../../types/posts/post-types';
import { UserAvatar } from '../user/UserAvatar';
import { PostMetricsBar } from './PostMetricsBar';

// Type guard to check if post has title
const hasTitle = (post: Post): post is Post & { title: string } => {
  return 'title' in post;
};

export const BasePostCard: React.FC<PostCardProps> = ({
  post,
  variant = 'feed',
  onBack,
  children,
  className,
  ...props
}) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 86400000) { // Less than 24 hours
      const hours = Math.floor(diff / 3600000);
      return hours === 0 ? 'Just now' : `${hours}h ago`;
    }

    if (diff < 604800000) { // Less than 7 days
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    return d.toLocaleDateString();
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto bg-white", className)}>
      {variant === 'detail' && onBack && (
        <div className="p-4 border-b">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Posts</span>
          </button>
        </div>
      )}

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <UserAvatar
              username={post.username || `User ${post.user_id}`}
              avatarUrl={post.avatar_img}
              size="md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">
                  {post.username || `User ${post.user_id}`}
                </span>
                {post.reputation_score && (
                  <span className="text-sm text-blue-600">
                    Rep: {post.reputation_score}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(post.created_at)}
                {post.updated_at && ` • Edited ${formatDate(post.updated_at)}`}
              </div>
            </div>
          </div>

          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Post options"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {hasTitle(post) && post.title && (
          <CardTitle className="text-xl md:text-2xl">
            {post.title}
          </CardTitle>
        )}
      </CardHeader>

      <CardContent>
        {children}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 border-t bg-gray-50/50 p-4">
        <PostMetricsBar
          post={post}
          variant={variant}
          {...props}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BasePostCard;