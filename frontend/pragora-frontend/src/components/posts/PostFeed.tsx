'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import React from 'react';
import { PostCardFactory } from './PostCardFactory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import postService from '@/lib/services/post/postService';
import { PostWrapper } from './wrapper';
import {InfiniteScroll} from '@/components/InfiniteScroll';
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
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['posts', selectedTab, selectedCategory, selectedSubcategory, searchQuery] as const,
    queryFn: async (context) => {
      const { pageParam = 0 } = context;
      console.log('PostFeed Debug - Fetching page:', {
        pageParam,
        skip: pageParam * limit,
        limit
      });

      const response = await postService.fetchPosts({
        skip: pageParam * limit,
        limit,
        tab: selectedTab,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        search: searchQuery
      });

      console.log('PostFeed Debug - Response:', {
        hasMore: response.data?.hasMore,
        postsCount: response.data?.posts.length,
        totalPages: data?.pages.length,
        currentSkip: pageParam * limit
      });

      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: PostsResponse, pages) => {
      console.log('PostFeed Debug - getNextPageParam:', {
        hasMore: lastPage.data?.hasMore,
        nextPage: pages.length,
        currentPosts: lastPage.data?.posts.length,
        totalPages: pages.length
      });

      return lastPage.data?.hasMore ? pages.length : undefined;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  const allPosts = useMemo(() => {
    const posts = data?.pages.flatMap(page => page.data?.posts || []) ?? [];
    console.log('PostFeed Debug - All posts:', {
      count: posts.length,
      pageCount: data?.pages.length
    });
    return posts;
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
    const metrics: PostMetrics = {
      like_count: post.metrics?.like_count ?? 0,
      dislike_count: post.metrics?.dislike_count ?? 0,
      save_count: post.metrics?.save_count ?? 0,
      share_count: post.metrics?.share_count ?? 0,
      report_count: post.metrics?.report_count ?? 0,
      comment_count: post.metrics?.comment_count ?? 0
    };

    const interaction_state: PostInteractionState = {
      like: post.interaction_state?.like ?? false,
      dislike: post.interaction_state?.dislike ?? false,
      save: post.interaction_state?.save ?? false,
      report: post.interaction_state?.report ?? false
    };

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