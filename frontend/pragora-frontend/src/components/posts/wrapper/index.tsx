// components/posts/wrapper/index.tsx
'use client';

import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { PostHeader } from './PostHeader';
import { PostFooter } from './PostFooter';
import { PostAnalytics } from './PostAnalytics';
import { PostWrapperProps } from './types';
import { usePostEngagement } from '@/lib/hooks/usePostEngagement';
import { PostWithEngagement, BasePostWithEngagement } from '@/types/posts/engagement';

export const PostWrapper: FC<PostWrapperProps> = ({
  post,
  children,
  variant = 'feed',
  onComment,
  onThreadedReply
}) => {
  // Type assertion to ensure post matches expected type
  const typedPost = post as unknown as PostWithEngagement;

  const {
    handleLike,
    handleDislike,
    handleSave,
    handleShare,
    handleReport,
    isLoading,
    isError
  } = usePostEngagement(typedPost);

  const handleReportClick = async () => {
    const reason = window.prompt('Please provide a reason for reporting this post:');
    if (reason) {
      await handleReport(reason);
    }
  };

  // Wrap handlers to ensure they return Promises
  const handleLikeWrapped = async () => {
    return handleLike();
  };

  const handleDislikeWrapped = async () => {
    return handleDislike();
  };

  const handleShareWrapped = async () => {
    return handleShare();
  };

  const handleSaveWrapped = async () => {
    return handleSave();
  };

  return (
    <Card className="w-full max-w-2xl bg-white">
      <PostHeader
        post={typedPost}
        onReport={handleReportClick}
        isReportLoading={isLoading.report}
      />

      {children}

      <PostFooter
        post={typedPost}
        variant={variant}
        metrics={typedPost.metrics}
        interactionState={typedPost.interaction_state}
        loading={isLoading}
        error={isError}
        onComment={onComment}
        onLike={handleLikeWrapped}
        onDislike={handleDislikeWrapped}
        onShare={handleShareWrapped}
        onSave={handleSaveWrapped}
      />

      {post.analysis && (
        <PostAnalytics analysis={post.analysis} />
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 p-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
};