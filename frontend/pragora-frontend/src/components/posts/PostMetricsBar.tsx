// components/posts/PostMetricsBar.tsx
'use client'

import React from 'react';
import { usePostEngagement } from '@/lib/hooks/usePostEngagement';
import { EngagementMetricsHandler } from '@/components/engagement/EngagementMetricsHandler';
import type { Post } from '../../types/posts/post-types';
import type {
  PostWithEngagement,
  MetricsData,
  MetricStates
} from '../../types/posts/engagement';

interface PostMetricsBarProps {
  post: Post;
  variant: 'feed' | 'detail';
  onComment?: () => void;
}

export const PostMetricsBar: React.FC<PostMetricsBarProps> = ({
  post,
  variant,
  onComment
}) => {
  // Convert metrics to required format
  const metrics: MetricsData = {
    like_count: post.metrics?.like_count ?? 0,
    dislike_count: post.metrics?.dislike_count ?? 0,
    //comment_count: post.metrics?.comment_count ?? 0, // Added required comment_count
    share_count: post.metrics?.share_count ?? 0,
    save_count: post.metrics?.save_count ?? 0,
    report_count: post.metrics?.report_count ?? 0,
  };

  // Create interaction states
  const states: MetricStates = {
    like: false,
    dislike: false,
    save: false,
    report: false
  };

  // Create a PostWithEngagement by ensuring required properties exist
  const engagementPost: PostWithEngagement = {
    ...post,
    metrics,
    interaction_state: states,
    post_type_id: post.post_type_id // Ensure post_type_id is included
  } as PostWithEngagement;

  const {
    handleLike,
    handleDislike,
    handleSave,
    handleShare,
    isLoading,
    isError
  } = usePostEngagement(engagementPost);

  // Convert handlers to async functions that return promises
  const handleLikeAsync = async () => await handleLike();
  const handleDislikeAsync = async () => await handleDislike();
  const handleShareAsync = async () => await handleShare();
  const handleSaveAsync = async () => await handleSave();

  return (
    <EngagementMetricsHandler
      type="post"
      metrics={metrics}
      states={states}
      loading={isLoading}
      error={isError}
      onLike={handleLikeAsync}
      onDislike={handleDislikeAsync}
      onShare={handleShareAsync}
      onSave={handleSaveAsync}
      onComment={onComment}
    />
  );
};

export default PostMetricsBar;