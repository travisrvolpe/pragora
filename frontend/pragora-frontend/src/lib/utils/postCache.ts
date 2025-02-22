// lib/utils/postCache.ts
import { QueryClient } from '@tanstack/react-query';
import {
  PostWithEngagement,
  PostMetrics,
  PostInteractionState,
  EngagementResponse
} from '@/types/posts/engagement';
import { Post } from '@/types/posts/post-types';

interface PostCacheData {
  pages: Array<{
    data: {
      posts: PostWithEngagement[];
      hasMore: boolean;
    };
  }>;
}

interface UpdatePostCacheOptions {
  queryClient: QueryClient;
  postId: number;
  updates: {
    metrics?: Partial<PostMetrics>;
    interaction_state?: Partial<PostInteractionState>;
  };
}

interface PostUpdateContext {
  previousPost?: PostWithEngagement;
  optimisticUpdate?: boolean;
}

interface CacheUpdateResult {
  success: boolean;
  error?: Error;
  post?: PostWithEngagement;
}

const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1000;

export const updatePostCache = async ({
  queryClient,
  postId,
  updates
}: UpdatePostCacheOptions): Promise<CacheUpdateResult> => {
  let retryCount = 0;

  const updateCache = async (): Promise<CacheUpdateResult> => {
    try {
      // Helper functions
      const safeNumber = (value: number | undefined, fallback: number) =>
        typeof value === 'number' ? Math.max(0, value) : fallback;

      const updateMetrics = (current: PostMetrics, updates?: Partial<PostMetrics>): PostMetrics => ({
        ...current,
        like_count: safeNumber(updates?.like_count, current.like_count),
        dislike_count: safeNumber(updates?.dislike_count, current.dislike_count),
        save_count: safeNumber(updates?.save_count, current.save_count),
        share_count: safeNumber(updates?.share_count, current.share_count),
        report_count: safeNumber(updates?.report_count, current.report_count),
      });

      const updateInteractionState = (
        current: PostInteractionState,
        updates?: Partial<PostInteractionState>
      ): PostInteractionState => ({
        ...current,
        like: updates?.like ?? current.like,
        dislike: updates?.dislike ?? current.dislike,
        save: updates?.save ?? current.save,
        share: updates?.share ?? current.share,
        report: updates?.report ?? current.report,
      });

      // Update single post
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      let updatedPost: PostWithEngagement | undefined;

      queryClient.setQueryData<PostWithEngagement>(
        ['post', postId],
        (oldPost): PostWithEngagement | undefined => {
          if (!oldPost) return undefined;

          updatedPost = {
            ...oldPost,
            metrics: updateMetrics(oldPost.metrics, updates.metrics),
            interaction_state: updateInteractionState(
              oldPost.interaction_state,
              updates.interaction_state
            ),
          };

          // Handle mutual exclusivity
          if (updates.interaction_state?.like && updatedPost.interaction_state.dislike) {
            updatedPost.interaction_state.dislike = false;
            updatedPost.metrics.dislike_count = Math.max(0, updatedPost.metrics.dislike_count - 1);
          } else if (updates.interaction_state?.dislike && updatedPost.interaction_state.like) {
            updatedPost.interaction_state.like = false;
            updatedPost.metrics.like_count = Math.max(0, updatedPost.metrics.like_count - 1);
          }

          return updatedPost;
        }
      );

      // Update posts list
      queryClient.setQueriesData<PostCacheData>(
        { queryKey: ['posts'] },
        (oldData): PostCacheData | undefined => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                posts: page.data.posts.map((post) =>
                  post.post_id === postId ? (updatedPost || post) : post
                ),
              },
            })),
          };
        }
      );

      return {
        success: true,
        post: updatedPost
      };

    } catch (error) {
      console.error('Error updating post cache:', error);

      if (retryCount < MAX_RETRY_ATTEMPTS) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
        return updateCache();
      }

      // On max retries, invalidate queries to force refresh
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error updating cache')
      };
    }
  };

  return updateCache();
};

// Helper to get post from cache
export const getPostFromCache = (
  queryClient: QueryClient,
  postId: number
): PostWithEngagement | undefined => {
  return queryClient.getQueryData(['post', postId]);
};

// Helper to prefetch post
export const prefetchPost = async (
  queryClient: QueryClient,
  postId: number
): Promise<void> => {
  await queryClient.prefetchQuery({
    queryKey: ['post', postId],
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};