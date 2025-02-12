'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PostCardFactory } from './PostCardFactory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import postService from '@/lib/services/post/postService';
import { PostWrapper } from './wrapper';
import type { Post } from '@/types/posts/post-types';
import type { PostMetrics, PostInteractionState, PostWithEngagement } from '@/types/posts/engagement';
import type { PostFeedProps, PostsResponse } from '@/types/posts/page-types';
type PostQueryKey = ['posts', string, number | undefined, number | undefined, string | undefined];

export const PostFeed: React.FC<PostFeedProps> = ({
  selectedTab = 'recent',
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  limit = 20
}) => {
  const router = useRouter();

  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['posts', selectedTab, selectedCategory, selectedSubcategory, searchQuery] as const,
    queryFn: async () => {
      const response = await postService.fetchPosts({
        skip: 0,
        limit,
        tab: selectedTab,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        search: searchQuery
      });
      return response as PostsResponse;
    }
  });

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

  const posts = data?.data?.posts ?? [];

  if (posts.length === 0) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">No posts found.</p>
          </div>
        </div>
    );
  }

  const transformToEngagementPost = (post: Post): PostWithEngagement => {
    const metrics: PostMetrics = {
      like_count: post.metrics?.like_count ?? 0,
      dislike_count: post.metrics?.dislike_count ?? 0,
      save_count: post.metrics?.save_count ?? 0,
      share_count: post.metrics?.share_count ?? 0,
      report_count: post.metrics?.report_count ?? 0
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

  return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {posts.map((rawPost) => {
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
  );
};