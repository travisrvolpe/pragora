// components/posts/wrapper/index.tsx
'use client';

import {FC, useCallback, useEffect, useMemo} from 'react';
import { Card } from '@/components/ui/card';
import { PostHeader } from './PostHeader';
import { PostFooter } from './PostFooter';
import { PostAnalytics } from './PostAnalytics';
import { PostWrapperProps } from './types';
import { usePostEngagement } from '@/lib/hooks/usePostEngagement';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast';
import { MetricsData } from '@/types/posts/engagement';
import {useQueryClient} from "@tanstack/react-query";

export const PostWrapper: FC<PostWrapperProps> = ({
  post,
  children,
  variant = 'feed',
  onComment,
  onThreadedReply,
  showAnalytics = true
}) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Refetch post data on mount
    if (post.post_id) {
      queryClient.invalidateQueries({
        queryKey: ['post', post.post_id],
        refetchType: 'active'
      });
    }
  }, [post.post_id, queryClient]);

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

  // Memoize metrics to prevent unnecessary re-renders
  const metrics: MetricsData = useMemo(() => ({
    like_count: post.metrics?.like_count ?? 0,
    dislike_count: post.metrics?.dislike_count ?? 0,
    comment_count: post.metrics?.comment_count ?? 0,
    share_count: post.metrics?.share_count ?? 0,
    save_count: post.metrics?.save_count ?? 0,
    report_count: post.metrics?.report_count ?? 0,
  }), [post.metrics]);

  const handleEngagementClick = useCallback(async (action: () => Promise<void>): Promise<void> => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      await action();
    } catch (error) {
      console.error('Engagement action failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process interaction",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, router]);

  const handleLikeClick = useCallback(async () => {
    return handleEngagementClick(async () => {
      const result = await handleLike();
      if (post.interaction_state?.dislike) {
        // Update dislike state if needed
        post.metrics.dislike_count = Math.max(0, (post.metrics.dislike_count ?? 0) - 1);
      }
      return result;
    });
  }, [handleEngagementClick, handleLike, post]);

  const handleDislikeClick = useCallback(async () => {
    return handleEngagementClick(async () => {
      const result = await handleDislike();
      if (post.interaction_state?.like) {
        // Update like state if needed
        post.metrics.like_count = Math.max(0, (post.metrics.like_count ?? 0) - 1);
      }
      return result;
    });
  }, [handleEngagementClick, handleDislike, post]);

  const handleSaveClick = useCallback(async () => {
    return handleEngagementClick(async () => await handleSave());
  }, [handleEngagementClick, handleSave]);

  const handleShareClick = useCallback(async () => {
    return handleEngagementClick(async () => {
      await handleShare();
      toast({
        title: "Success",
        description: "Post shared successfully"
      });
    });
  }, [handleEngagementClick, handleShare]);

  const handleReportClick = useCallback(async () => {
    return handleEngagementClick(async () => {
      await handleReport('Report reason');
      toast({
        title: "Success",
        description: "Post reported successfully"
      });
    });
  }, [handleEngagementClick, handleReport]);

  const handleCommentClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    onComment?.();
  }, [isAuthenticated, router, onComment]);

  const handleThreadedReplyClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    onThreadedReply?.();
  }, [isAuthenticated, router, onThreadedReply]);

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
          metrics={metrics}
          interactionState={post.interaction_state}
          loading={isLoading}
          error={isError}
          onComment={handleCommentClick}
          onLike={handleLikeClick}
          onDislike={handleDislikeClick}
          onShare={handleShareClick}
          onSave={handleSaveClick}
          onThreadedReply={handleThreadedReplyClick}
        />

        {showAnalytics && post.analysis && (
          <PostAnalytics analysis={post.analysis} />
        )}
      </div>
    </Card>
  );
};