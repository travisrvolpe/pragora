// app/dialectica/[postId]/page.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PostWrapper } from '@/components/posts/wrapper';
import { PostCardFactory } from '@/components/posts/PostCardFactory';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CommentThread } from '@/components/comments/CommentThread';
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
    // Scroll to comment section
    const commentSection = document.getElementById('comments-section');
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleThreadedReply = () => {
    handleComment(); // For now, just scroll to comments
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

      {/* Comments Section */}
      <div id="comments-section" className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Comments</h2>
        </div>
        <div className="p-4">
          <CommentThread
            postId={Number(postId)}
            initialComments={[]}
          />
        </div>
      </div>
    </div>
  );
}