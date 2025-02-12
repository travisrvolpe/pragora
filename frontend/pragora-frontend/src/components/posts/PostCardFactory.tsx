// components/posts/PostCardFactory.tsx
'use client';

import React from 'react';
import { ThoughtPostCard } from './ThoughtPostCard';
import { ImagePostCard } from './ImagePostCard';
import { ArticlePostCard } from './ArticlePostCard';
import type { PostFactoryProps } from '@/types/posts/component-types';

export const PostCardFactory: React.FC<PostFactoryProps> = ({
  post,
  variant = 'feed',
  ...props
}) => {
  switch (post.post_type_id) {
    case 1:
      return <ThoughtPostCard post={post} variant={variant} {...props} />;
    case 2:
      return <ImagePostCard post={post} variant={variant} {...props} />;
    case 3:
      return <ArticlePostCard post={post} variant={variant} {...props} />;
    default:
      return <ThoughtPostCard post={post} variant={variant} {...props} />;
  }
};

export default PostCardFactory;