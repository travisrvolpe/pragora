// components/posts/wrapper/index.tsx
'use client';

import { FC, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { PostHeader } from './PostHeader';
import { PostFooter } from './PostFooter';
import { PostAnalytics } from './PostAnalytics';
import { PostWrapperProps } from './types';
import { usePostEngagement } from '@/lib/hooks/usePostEngagement';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';

export const PostWrapper: FC<PostWrapperProps> = ({
  post,
  children,
  variant = 'feed',
  onComment,
  onThreadedReply
}) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const {
    handleLike,
    handleDislike,
    handleSave,
    handleShare,
    handleReport,
    isLoading,
    isError
  } = usePostEngagement(post);

  const handleEngagementClick = useCallback(async (action: () => Promise<void>): Promise<void> => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      await action();
    } catch (error) {
      console.error('Engagement action failed:', error);
    }
  }, [isAuthenticated, router]);

  const handleLikeClick = useCallback(async () => {
    return handleEngagementClick(async () => await handleLike());
  }, [handleEngagementClick, handleLike]);

  const handleDislikeClick = useCallback(async () => {
    return handleEngagementClick(async () => await handleDislike());
  }, [handleEngagementClick, handleDislike]);

  const handleSaveClick = useCallback(async () => {
    return handleEngagementClick(async () => await handleSave());
  }, [handleEngagementClick, handleSave]);

  const handleShareClick = useCallback(async () => {
    return handleEngagementClick(async () => await handleShare());
  }, [handleEngagementClick, handleShare]);

  const handleReportClick = useCallback(async () => {
    return handleEngagementClick(async () => await handleReport('Report reason'));
  }, [handleEngagementClick, handleReport]);

  return (
    <Card className="w-full bg-white">
      <div className="flex flex-col">
        <PostHeader
          post={post}
          onReport={handleReportClick}
          isReportLoading={isLoading.report}
        />

        <div className="flex-1">
          {children}
        </div>

        <PostFooter
          post={post}
          variant={variant}
          metrics={post.metrics}
          interactionState={post.interaction_state}
          loading={isLoading}
          error={isError}
          onComment={onComment}
          onLike={handleLikeClick}
          onDislike={handleDislikeClick}
          onShare={handleShareClick}
          onSave={handleSaveClick}
        />

        {post.analysis && (
          <PostAnalytics analysis={post.analysis} />
        )}
      </div>
    </Card>
  );
};