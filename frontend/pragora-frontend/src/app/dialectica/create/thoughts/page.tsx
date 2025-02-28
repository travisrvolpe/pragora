// app/dialectica/create/thoughts/page.tsx
'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { ThoughtForm } from '@/components/create/forms/ThoughtForm';
import postService from '@/applib/services/post/postService';
import { useRouter } from 'next/navigation';
import { ThoughtPost } from '@/types/posts/post-types';

export default function CreateThoughtPage() {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await postService.createPost(formData);
      // Since response type is ThoughtPost, we need to access it directly
      const postId = response.post_id;
      if (!postId) {
        throw new Error('No post ID in response');
      }
      return { post_id: postId };
    } catch (error) {
      console.error('Error creating thought:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
        >
          ← Back to create options
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Share Thoughts</h1>
        </div>
      </div>

      <ThoughtForm
        onSubmit={handleSubmit}
        maxContentLength={2000} // Changed from maxLength to maxContentLength
      />
    </div>
  );
}