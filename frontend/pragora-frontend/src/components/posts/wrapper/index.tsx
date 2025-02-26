// components/posts/wrapper/index.tsx
'use client';
import postService from '@/lib/services/post/postService';
import { ErrorBoundary } from 'react-error-boundary';
import { useDebounceInteraction } from '@/lib/hooks/useDebounceInteraction';
import {FC, useCallback, useEffect, useMemo, useRef} from 'react';
import { Card } from '@/components/ui/card';
import { PostHeader } from './PostHeader';
import { PostFooter } from './PostFooter';
import { PostAnalytics } from './PostAnalytics';
import { PostWrapperProps } from './types';
import { usePostEngagement } from '@/lib/hooks/usePostEngagement';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/hooks/use-toast/use-toast';
import {MetricsData, PostInteractionState} from '@/types/posts/engagement';
import { useQueryClient } from "@tanstack/react-query";
import { EngagementStateDebugger } from '@/components/debug/EngagementStateDebugger';

export const PostWrapper: FC<PostWrapperProps> = ({
  post,
  children,
  variant = 'feed',
  onComment,
  onThreadedReply,
  showAnalytics = true
}) => {
  const debounceInteraction = useDebounceInteraction();
  const queryClient = useQueryClient();

  const didInitialFetch = useRef(false);
  const prevInteractionState = useRef<PostInteractionState>({} as PostInteractionState); // Add this new ref

  const handleEngagementAction = useCallback(async (action: () => Promise<void>) => {
    await debounceInteraction(action);
  }, [debounceInteraction]);

  useEffect(() => {
    // When the post prop changes, log for debugging
    console.log("Post data changed:", {
      postId: post.post_id,
      metrics: post.metrics,
      interactionState: post.interaction_state
    });

    if (post.post_id) {
      // Set query defaults to prevent unwanted refetches
      queryClient.setQueryDefaults(['post', post.post_id], {
        staleTime: 30000, // Consider data fresh for 30 seconds
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        refetchOnMount: false, // Don't refetch when component mounts
      });

      // Force invalidation of the query to refresh data, but only once per mount
      const shouldFetchFresh = !didInitialFetch.current;
      if (shouldFetchFresh) {
        didInitialFetch.current = true;

        // Fetch fresh data
        queryClient.fetchQuery({
          queryKey: ['post', post.post_id],
          queryFn: () => postService.getPostById(post.post_id),
          staleTime: 0
        }).catch(error => {
          console.error(`Error fetching fresh data for post ${post.post_id}:`, error);
        });
      }
    }
  }, [post.post_id, queryClient]);

  useEffect(() => {
    if (post?.post_id && prevInteractionState.current) {
      // Type-safe approach to check if interaction state has changed
      const currentState = post.interaction_state;
      const prevState = prevInteractionState.current;

      // Manual check of each property
      const hasChanged =
        currentState.like !== prevState.like ||
        currentState.dislike !== prevState.dislike ||
        currentState.save !== prevState.save ||
        currentState.share !== prevState.share ||
        currentState.report !== prevState.report;

      if (hasChanged) {
        console.log('Interaction state changed, refetching post data');
        // Fix the fetchQuery call
        queryClient.fetchQuery({
          queryKey: ['post', post.post_id],
          queryFn: () => postService.getPostById(post.post_id)
        });
      }
    }

    // Update previous state
    prevInteractionState.current = { ...post.interaction_state };
  }, [post?.interaction_state, post?.post_id, queryClient]);

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
      console.log("Like button clicked");
      await handleLike();
    });
  }, [handleEngagementClick, handleLike]);

  const handleDislikeClick = useCallback(async () => {
    return handleEngagementClick(async () => {
      console.log("Dislike button clicked");
      await handleDislike();
    });
  }, [handleEngagementClick, handleDislike]);

  const handleSaveClick = useCallback(async () => {
    return handleEngagementClick(async () => {
      console.log("Save button clicked");
      await handleSave();
    });
  }, [handleEngagementClick, handleSave]);

  const handleShareClick = useCallback(async () => {
    return handleEngagementClick(async () => {
      console.log("Share button clicked");
      await handleShare();
      toast({
        title: "Success",
        description: "Post shared successfully"
      });
    });
  }, [handleEngagementClick, handleShare]);

  const handleReportClick = useCallback(async () => {
    return handleEngagementClick(async () => {
      console.log("Report button clicked");
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

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("PostWrapper - Post metrics:", {
        postId: post.post_id,
        fromProps: post.metrics,
        memorized: metrics,
        interactionState: post.interaction_state
      });
    }
  }, [post.metrics, metrics, post.post_id, post.interaction_state]);

  return (
    <ErrorBoundary
      fallback={<div>Error loading post</div>}
      onError={(error) => {
        console.error('Post error:', error);
      }}
    >
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
          />

          {showAnalytics && post.analysis && (
            <PostAnalytics analysis={post.analysis} />
          )}

          {/* Add the engagement debugger in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <EngagementStateDebugger postId={post.post_id} />
          )}
        </div>
      </Card>
    </ErrorBoundary>
  );
};