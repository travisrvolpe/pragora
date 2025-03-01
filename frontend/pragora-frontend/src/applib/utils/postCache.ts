// applib/utils/postCache.ts
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
        const defaultMetrics = {
          like_count: 0,
          dislike_count: 0,
          save_count: 0,
          share_count: 0,
          comment_count: 0,
          report_count: 0
        };

        const safeCurrentMetrics = current || defaultMetrics;

        // If no updates, return current
        if (!updates) return safeCurrentMetrics;

        // Create a copy to avoid mutating the original
        const result = { ...safeCurrentMetrics };

        // Update metrics with the new values only if they are defined
        if (typeof updates.like_count === 'number') result.like_count = Math.max(0, updates.like_count);
        if (typeof updates.dislike_count === 'number') result.dislike_count = Math.max(0, updates.dislike_count);
        if (typeof updates.save_count === 'number') result.save_count = Math.max(0, updates.save_count);
        if (typeof updates.share_count === 'number') result.share_count = Math.max(0, updates.share_count);
        if (typeof updates.comment_count === 'number') result.comment_count = Math.max(0, updates.comment_count);
        if (typeof updates.report_count === 'number') result.report_count = Math.max(0, updates.report_count);

        console.log('Updated metrics:', {
          before: safeCurrentMetrics,
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
        const defaultState = {
          like: false,
          dislike: false,
          save: false,
          share: false,
          report: false
        };

        const safeCurrentState = current || defaultState;

        // If no updates, return current
        if (!updates) return safeCurrentState;

        // Create a copy to avoid mutating the original
        const result = { ...safeCurrentState };

        // Update state with the new values only if they are defined
        if (typeof updates.like === 'boolean') result.like = updates.like;
        if (typeof updates.dislike === 'boolean') result.dislike = updates.dislike;
        if (typeof updates.save === 'boolean') result.save = updates.save;
        if (typeof updates.share === 'boolean') result.share = updates.share;
        if (typeof updates.report === 'boolean') result.report = updates.report;

        console.log('Updated interaction state:', {
          before: safeCurrentState,
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
            if (!page.data || !page.data.posts) continue;

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

      // Ensure the post has metrics and interaction_state properties
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
      const updatedPost: PostWithEngagement = {
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

      // Special handling for save: ensure save_count is at least 1 if save is true
      if (updates.interaction_state?.save === true && updatedPost.metrics.save_count === 0) {
        updatedPost.metrics.save_count = 1;
        console.log(`Setting save_count to 1 because save is active`);
      }

      // Update single post in cache
      queryClient.setQueryData(['post', postId], updatedPost);

      // Update post lists (like feed pages)
      setTimeout(() => {
        // First update any lists containing this post
        queryClient.setQueriesData<PostCacheData>(
          { queryKey: ['posts'] },
          (oldData): PostCacheData | undefined => {
            if (!oldData?.pages) return oldData;

            const newData = {
              ...oldData,
              pages: oldData.pages.map((page) => {
                if (!page.data || !page.data.posts) return page;

                return {
                  ...page,
                  data: {
                    ...page.data,
                    posts: page.data.posts.map((post) => {
                      if (post.post_id === postId) {
                        console.log(`Syncing post ${postId} data in lists`);
                        return {
                          ...post,
                          metrics: updatedPost.metrics,
                          interaction_state: updatedPost.interaction_state
                        };
                      }
                      return post;
                    }),
                  },
                };
              }),
            };

            return newData;
          }
        );

        // Also invalidate queries to ensure fresh data on next fetch
        queryClient.invalidateQueries({
          queryKey: ['post', postId],
          exact: true,
          refetchActive: false // Don't refetch immediately to avoid overwriting our update
        });
      }, 100);

      // Force a refresh of lists after a longer delay
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['posts'],
          refetchActive: true
        });
      }, 500);

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