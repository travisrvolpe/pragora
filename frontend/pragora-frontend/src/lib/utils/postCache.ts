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
      console.log(`Updating post cache for post ${postId}:`, updates);

      // Helper functions
      const safeNumber = (value: number | undefined, fallback: number) =>
        typeof value === 'number' ? Math.max(0, value) : fallback;

      const updateMetrics = (current: PostMetrics | undefined, updates?: Partial<PostMetrics>): PostMetrics => {
        // If current metrics are undefined, create a default object
        if (!current) {
          current = {
            like_count: 0,
            dislike_count: 0,
            save_count: 0,
            share_count: 0,
            comment_count: 0,
            report_count: 0
          };
        }

        // If no updates, return current
        if (!updates) return current;

        const result = {
          ...current,
          like_count: safeNumber(updates.like_count, current.like_count),
          dislike_count: safeNumber(updates.dislike_count, current.dislike_count),
          save_count: safeNumber(updates.save_count, current.save_count),
          share_count: safeNumber(updates.share_count, current.share_count),
          report_count: safeNumber(updates.report_count, current.report_count),
          comment_count: safeNumber(updates.comment_count, current.comment_count),
        };

        console.log('Updated metrics:', {
          before: current,
          updates,
          after: result
        });

        return result;
      };

      const updateInteractionState = (
        current: PostInteractionState | undefined,
        updates?: Partial<PostInteractionState>
      ): PostInteractionState => {
        // Default state if current is undefined
        if (!current) {
          current = {
            like: false,
            dislike: false,
            save: false,
            share: false,
            report: false
          };
        }

        if (!updates) return current;

        const result = {
          ...current,
          like: updates.like !== undefined ? updates.like : current.like,
          dislike: updates.dislike !== undefined ? updates.dislike : current.dislike,
          save: updates.save !== undefined ? updates.save : current.save,
          share: updates.share !== undefined ? updates.share : current.share,
          report: updates.report !== undefined ? updates.report : current.report,
        };

        console.log('Updated interaction state:', {
          before: current,
          updates,
          after: result
        });

        return result;
      };

      // Cancel any in-flight queries that might overwrite our update
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      // First, try to get the post from direct query
      let foundPost: PostWithEngagement | undefined = queryClient.getQueryData(['post', postId]);

      // If not found directly, check in the posts list queries
      if (!foundPost) {
        console.log(`Post ${postId} not found in direct cache, checking posts lists...`);

        // Iterate through all post list queries
        const postQueries = queryClient.getQueriesData<PostCacheData>({ queryKey: ['posts'] });

        for (const [key, postData] of postQueries) {
          if (!postData?.pages) continue;

          // Search for the post in each page
          for (const page of postData.pages) {
            const matchingPost = page.data.posts.find(p => p.post_id === postId);
            if (matchingPost) {
              console.log(`Found post ${postId} in posts list cache`);
              foundPost = matchingPost;
              break;
            }
          }
          if (foundPost) break;
        }
      }

      // Create a minimal post structure if not found anywhere
      if (!foundPost) {
        console.log(`Post ${postId} not found in any cache, creating minimal entry`);

        // Default metrics
        const defaultMetrics: PostMetrics = {
          like_count: 0,
          dislike_count: 0,
          save_count: 0,
          share_count: 0,
          comment_count: 0,
          report_count: 0
        };

        // Default interaction state
        const defaultInteractionState: PostInteractionState = {
          like: false,
          dislike: false,
          save: false,
          share: false,
          report: false
        };

        // Apply the updates to our defaults
        const metrics = updateMetrics(defaultMetrics, updates.metrics);
        const interaction_state = updateInteractionState(defaultInteractionState, updates.interaction_state);

        // Create minimal post structure
        foundPost = {
          post_id: postId,
          user_id: 0, // Placeholder
          content: '', // Placeholder
          status: 'active',
          created_at: new Date().toISOString(),
          post_type_id: 1, // Default to thought post
          metrics,
          interaction_state
        } as PostWithEngagement;

        // Add to cache
        queryClient.setQueryData(['post', postId], foundPost);
      }

      if (!foundPost.metrics) {
        foundPost.metrics = {
          like_count: 0,
          dislike_count: 0,
          save_count: 0,
          share_count: 0,
          comment_count: 0,
          report_count: 0
        };
      }

      if (!foundPost.interaction_state) {
        foundPost.interaction_state = {
          like: false,
          dislike: false,
          save: false,
          share: false,
          report: false
        };
      }

      // Now we have a post to update
      let updatedPost: PostWithEngagement = {
        ...foundPost,
        metrics: updateMetrics(foundPost.metrics, updates.metrics),
        interaction_state: updateInteractionState(foundPost.interaction_state, updates.interaction_state)
      };

      // Handle mutual exclusivity
      if (updates.interaction_state?.like && updatedPost.interaction_state.dislike) {
        updatedPost.interaction_state.dislike = false;
        updatedPost.metrics.dislike_count = Math.max(0, updatedPost.metrics.dislike_count - 1);
      } else if (updates.interaction_state?.dislike && updatedPost.interaction_state.like) {
        updatedPost.interaction_state.like = false;
        updatedPost.metrics.like_count = Math.max(0, updatedPost.metrics.like_count - 1);
      }

      // Update single post in cache
      queryClient.setQueryData(['post', postId], updatedPost);

      // Update post lists (like feed pages)
      queryClient.setQueriesData<PostCacheData>(
        { queryKey: ['posts'] },
        (oldData): PostCacheData | undefined => {
          if (!oldData?.pages) {
            console.log('No post lists found in cache');
            return oldData;
          }

          console.log(`Updating post ${postId} in all post lists`);

          const newData = {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                posts: page.data.posts.map((post) => {
                  if (post.post_id === postId) {
                    console.log(`Updating post ${postId} in post list`);
                    return updatedPost;
                  }
                  return post;
                }),
              },
            })),
          };

          return newData;
        }
      );

      // Force refresh to ensure UI updates
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['post', postId],
          exact: true,
          refetchActive: true
        });
      }, 50);

      console.log(`Successfully updated cache for post ${postId}`, updatedPost);

      return {
        success: true,
        post: updatedPost
      };

    } catch (error) {
      console.error('Error updating post cache:', error);

      if (retryCount < MAX_RETRY_ATTEMPTS) {
        console.log(`Retrying cache update (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})...`);
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retryCount));
        return updateCache();
      }

      // On max retries, invalidate queries to force refresh
      console.log('Max retries exceeded, invalidating queries to force refresh');
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

/**
 * Get a post from the cache by ID
 */
export const getPostFromCache = (
  queryClient: QueryClient,
  postId: number
): PostWithEngagement | undefined => {
  // First try direct query
  const post = queryClient.getQueryData<PostWithEngagement>(['post', postId]);
  if (post) return post;

  // If not found, check in post lists
  const postQueries = queryClient.getQueriesData<PostCacheData>({ queryKey: ['posts'] });

  for (const [key, postData] of postQueries) {
    if (!postData?.pages) continue;

    for (const page of postData.pages) {
      const foundPost = page.data.posts.find(p => p.post_id === postId);
      if (foundPost) return foundPost;
    }
  }

  return undefined;
};

/**
 * Prefetch a post and add it to the cache
 */
export const prefetchPost = async (
  queryClient: QueryClient,
  postId: number,
  fetchFn: () => Promise<PostWithEngagement>
): Promise<void> => {
  await queryClient.prefetchQuery({
    queryKey: ['post', postId],
    queryFn: fetchFn,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

/**
 * Invalidate a post in the cache to force a refresh
 */
export const invalidatePostCache = async (
  queryClient: QueryClient,
  postId: number
): Promise<void> => {
  console.log(`Invalidating cache for post ${postId}`);

  // Invalidate the specific post
  await queryClient.invalidateQueries({
    queryKey: ['post', postId],
    exact: true,
    refetchActive: true
  });

  // Also invalidate any lists containing this post
  await queryClient.invalidateQueries({
    queryKey: ['posts'],
    refetchActive: true
  });
};