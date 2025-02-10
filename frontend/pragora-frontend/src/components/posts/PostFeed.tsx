// components/posts/PostFeed.tsx
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { PostCardFactory } from './PostCardFactory'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { InfiniteScroll } from '@/components/InfiniteScroll'
import { postService } from '../../lib/services/post/postService'
import type { PostWithEngagement } from '@/types/posts/engagement'
import type { PostFeedProps, PostsResponse } from '@/types/posts/page-types'

export const PostFeed = ({
  selectedTab = 'recent',
  selectedCategory,
  selectedSubcategory,
  searchQuery,
  limit = 20
}: PostFeedProps) => {
  const router = useRouter()

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<PostsResponse>({
    queryKey: ['posts', selectedTab, selectedCategory, selectedSubcategory, searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await postService.fetchPosts({
        skip: Number(pageParam) * limit,
        limit,
        tab: selectedTab,
        category: selectedCategory,
        subcategory: selectedSubcategory,
        search: searchQuery
      })
      return response
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.data.hasMore ? allPages.length : undefined
    }
  })

  if (isError) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-700">
          Error loading posts. Please try again later.
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-gray-100 rounded-lg h-48 w-full">
              <LoadingSpinner />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data?.pages?.[0]?.data.posts.length) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No posts found.</p>
        </div>
      </div>
    )
  }

  return (
    <InfiniteScroll
      loadMore={async () => {
        if (hasNextPage) {
          await fetchNextPage()
        }
      }}
      hasMore={!!hasNextPage}
      isLoading={isFetchingNextPage}
    >
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="space-y-6">
          {data.pages.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page.data.posts.map((rawPost) => {
                // Convert raw post to PostWithEngagement type
                const post: PostWithEngagement = {
                  ...rawPost,
                  metrics: {
                    like_count: rawPost.metrics?.like_count ?? 0,
                    dislike_count: rawPost.metrics?.dislike_count ?? 0,
                    save_count: rawPost.metrics?.save_count ?? 0,
                    share_count: rawPost.metrics?.share_count ?? 0,
                    report_count: rawPost.metrics?.report_count ?? 0
                  },
                  interaction_state: {
                    like: rawPost.interaction_state?.like ?? false,
                    dislike: rawPost.interaction_state?.dislike ?? false,
                    save: rawPost.interaction_state?.save ?? false,
                    report: rawPost.interaction_state?.report ?? false
                  }
                }

                return (
                  <div key={post.post_id} className="flex justify-center">
                    <PostCardFactory
                      post={post}
                      variant="feed"
                      onViewPost={() => router.push(`/post/${post.post_id}`)}
                    />
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </InfiniteScroll>
  )
}

export default PostFeed