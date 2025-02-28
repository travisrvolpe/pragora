'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import React from 'react';
import { PostCardFactory } from './PostCardFactory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import postService from '@/applib/services/post/postService';
import { PostWrapper } from './wrapper';
import { InfiniteScroll } from '@/components/InfiniteScroll';
import type { Post } from '@/types/posts/post-types';
import type { PostMetrics, PostInteractionState, PostWithEngagement } from '@/types/posts/engagement';
import type { PostFeedProps, PostsResponse } from '@/types/posts/page-types';

export const PostFeed: React.FC<PostFeedProps> = ({
  selectedTab = 'recent',
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  limit = 20
}) => {
  // Define the query key
  const queryKey = ['posts', selectedTab, selectedCategory, selectedSubcategory, searchQuery] as const;
  type QueryKey = typeof queryKey;

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: async ({ pageParam }) => {
      const skipValue = typeof pageParam === 'number' ? pageParam * limit : 0;

      console.log('PostFeed Debug - Fetching page:', {
        pageParam,
        skip: skipValue,
        limit
      });

      return await postService.fetchPosts({
        skip: skipValue,
        limit,
        tab: selectedTab,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        search: searchQuery
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PostsResponse, allPages: PostsResponse[]) => {
      console.log('PostFeed Debug - getNextPageParam:', {
        hasMore: lastPage.data?.hasMore,
        nextPage: allPages.length,
        currentPosts: lastPage.data?.posts.length,
        totalPages: allPages.length
      });

      return lastPage.data?.hasMore ? allPages.length : undefined;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000,
    gcTime: 60000,
  });

  const allPosts = useMemo(() => {
    if (!data) return [];

    return data.pages.flatMap((page: PostsResponse) => {
      return page.data?.posts || [];
    });
  }, [data]);

  const loadMore = useCallback(() => {
    console.log('PostFeed Debug - loadMore called:', {
      hasNextPage,
      isFetchingNextPage,
      currentPosts: allPosts.length
    });

    if (hasNextPage && !isFetchingNextPage) {
      console.log('PostFeed Debug - Triggering fetchNextPage');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, allPosts.length]);

  const transformToEngagementPost = (post: Post): PostWithEngagement => {
    // Get the existing metrics from post or create defaults
    const metrics: PostMetrics = {
      like_count: post.metrics?.like_count ?? 0,
      dislike_count: post.metrics?.dislike_count ?? 0,
      save_count: post.metrics?.save_count ?? 0,
      share_count: post.metrics?.share_count ?? 0,
      report_count: post.metrics?.report_count ?? 0,
      comment_count: post.metrics?.comment_count ?? 0
    };

    // Get existing interaction state or create defaults
    const interaction_state: PostInteractionState = {
      like: post.interaction_state?.like ?? false,
      dislike: post.interaction_state?.dislike ?? false,
      share: post.interaction_state?.share ?? false,
      save: post.interaction_state?.save ?? false,
      report: post.interaction_state?.report ?? false
    };

    // Debug output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`PostFeed: Transforming post ${post.post_id}`, {
        originalMetrics: post.metrics,
        transformedMetrics: metrics,
        originalInteraction: post.interaction_state,
        transformedInteraction: interaction_state
      });
    }

    // Return the post with structured metrics and interaction state
    return {
      ...post,
      metrics,
      interaction_state
    };
  };

  if (isError) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
          Error loading posts. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-48 w-full flex items-center justify-center">
              <LoadingSpinner/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!allPosts.length) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No posts found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <InfiniteScroll
        loadMore={loadMore}
        hasMore={!!hasNextPage}
        isLoading={isFetchingNextPage}
      >
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {allPosts.map((rawPost) => {
            const post = transformToEngagementPost(rawPost);
            return (
              <PostWrapper
                key={post.post_id}
                post={post}
                variant="feed"
              >
                <PostCardFactory post={post} variant="feed"/>
              </PostWrapper>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
};