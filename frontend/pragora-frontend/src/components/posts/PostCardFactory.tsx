// components/posts/PostCardFactory.tsx
'use client'

import React from 'react'
import { ThoughtPostCard } from './ThoughtPostCard'
import { ImagePostCard } from './ImagePostCard'
import { ArticlePostCard } from './ArticlePostCard'
import type { PostFactoryProps } from '../../types/posts/component-types'
import type { PostTypeId, PostUser, Post } from '../../types/posts/post-types' // Added Post import

const POST_TYPES: Record<string, PostTypeId> = {
  Thought: 1,
  Image: 2,
  Article: 3
} as const

const PostCardFactory: React.FC<PostFactoryProps> = ({
  post,
  variant = 'feed',
  ...props
}) => {
  const getPostComponent = () => {
    switch (post.post_type_id) {
      case POST_TYPES.Thought:
        return ThoughtPostCard
      case POST_TYPES.Image:
        return ImagePostCard
      case POST_TYPES.Article:
        return ArticlePostCard
      default:
        console.warn(
          `Unknown post type: ${post.post_type_id}, defaulting to ThoughtPostCard`
        )
        return ThoughtPostCard
    }
  }

  const PostComponent = getPostComponent()

  const userData = {
    username: post.username || post.user?.username || 'Anonymous',
    avatar_img: post.avatar_img || post.user?.avatar_url || undefined,
    reputation_score: post.reputation_score || post.user?.reputation_score || 0,
    reputation_cat: post.reputation_cat || '',
    expertise_area: post.expertise_area || '',
  }

  const postWithUserData = {
    ...post,
    ...userData
  }

  return (
    <PostComponent
      post={postWithUserData as Post}
      variant={variant}
      {...props}
    />
  )
}

export { PostCardFactory }
export default PostCardFactory