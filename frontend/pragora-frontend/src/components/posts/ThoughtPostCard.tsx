// components/posts/ThoughtPostCard.tsx
import React from 'react';
import { BasePostCard } from './BasePostCard';
import type { PostCardProps } from '../../types/posts/component-types';
import type { Post, ThoughtPost } from '../../types/posts/post-types';
import { cn } from '../../lib/utils/utils';

export const ThoughtPostCard: React.FC<PostCardProps> = ({
  post,
  variant = 'feed',
  className,
  ...props
}) => {
  return (
    <BasePostCard
      post={post}
      variant={variant}
      className={cn('p-4', className)}
      {...props}
    >
      <div className="text-gray-900 whitespace-pre-wrap">
        {variant === 'feed' && post.content.length > 500 ? (
          <>
            {post.content.substring(0, 500)}
            <span className="text-gray-500">...</span>
          </>
        ) : (
          post.content
        )}
      </div>
    </BasePostCard>
  );
};

export default ThoughtPostCard;