// app/dialectica/[postId]/page.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PostWrapper } from '@/components/posts/wrapper';
import { PostCardFactory } from '@/components/posts/PostCardFactory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import postService from '@/lib/services/post/postService';
import type { PostWithEngagement } from '@/types/posts/engagement';

interface PostViewPageProps {
  params: {
    postId: string;
  };
}

export default function PostViewPage({ params }: PostViewPageProps) {
  const { postId } = params;

  const { data: post, isLoading, isError, error } = useQuery<PostWithEngagement>({
  queryKey: ['post', postId],
  queryFn: async () => {
    const response = await postService.getPostById(Number(postId));
    // Safely convert to PostWithEngagement
    return {
      ...response,
      metrics: {
        like_count: response.metrics?.like_count ?? 0,
        dislike_count: response.metrics?.dislike_count ?? 0,
        save_count: response.metrics?.save_count ?? 0,
        share_count: response.metrics?.share_count ?? 0,
        report_count: response.metrics?.report_count ?? 0,
      },
      interaction_state: {
        like: false,
        dislike: false,
        save: false,
        report: false,
      },
      post_type_id: response.post_type_id
    } as unknown as PostWithEngagement;
  }
});

  const handleComment = () => {
    // Implement comment functionality
    console.log('Comment clicked');
  };

  const handleThreadedReply = () => {
    // Implement threaded reply functionality
    console.log('Threaded reply clicked');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-red-800 font-semibold">Error Loading Post</h2>
        <p className="text-red-600">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h2 className="text-yellow-800 font-semibold">Post Not Found</h2>
        <p className="text-yellow-600">The post you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }


return (
  <div className="space-y-8">
    <PostWrapper
      post={post}
      variant="detail"
      onComment={handleComment}
      onThreadedReply={handleThreadedReply}
    >
      <PostCardFactory
        post={post}
        variant="detail"
      />
    </PostWrapper>

      {/* Comments Section - To be implemented */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        <div className="p-4">
          {/* Comments will be rendered here */}
          <p className="text-gray-500">Comments coming soon...</p>
        </div>
      </div>
    </div>
  );
}

// Loading state component
export function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-lg p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// Error state component
export function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <h2 className="text-red-800 text-lg font-semibold mb-2">
        Something went wrong!
      </h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}


/*

// app/dialectica/[postId]/page.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PostWrapper } from '@/components/posts/wrapper';
import { PostCardFactory } from '@/components/posts/PostCardFactory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import postService from '@/lib/services/post/postService';
import type { PostWithEngagement } from '@/types/posts/engagement';
import type { Post } from '@/types/posts';

interface PostViewPageProps {
  params: {
    postId: string;
  };
}

export default function PostViewPage({ params }: PostViewPageProps) {
  const { postId } = params;

  const { data: post, isLoading, isError, error } = useQuery<PostWithEngagement>({
    queryKey: ['post', postId],
    queryFn: async () => {
      const response = await postService.getPostById(Number(postId));
      // Convert Post to PostWithEngagement by adding required fields
      return {
        ...response,
        metrics: {
          like_count: response.metrics?.like_count ?? 0,
          dislike_count: response.metrics?.dislike_count ?? 0,
          save_count: response.metrics?.save_count ?? 0,
          share_count: response.metrics?.share_count ?? 0,
          report_count: response.metrics?.report_count ?? 0
        },
        interaction_state: {
          like: false,
          dislike: false,
          save: false,
          report: false
        }
      } as PostWithEngagement;
    }
  });

  // ... rest of the component remains the same
}
 */