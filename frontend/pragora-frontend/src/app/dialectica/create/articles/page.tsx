// app/dialectica/create/articles/page.tsx
'use client';

import React from 'react';
import { BookOpen } from 'lucide-react';
import { ArticleForm } from '@/components/create/forms/ArticleForm';
import postService from '@/applib/services/post/postService';
import { useRouter } from 'next/navigation';

export default function CreateArticlePage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <button
          onClick={handleGoBack}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
        >
          ← Back to create options
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-purple-500 p-2 rounded-full">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Write Article</h1>
        </div>

        <p className="text-gray-600 mt-2 ml-11">
          Write an in-depth article with rich formatting, images, and more.
        </p>
      </div>

      <ArticleForm
        onSubmit={async (formData) => {
          try {
            const response = await postService.createPost(formData);
            return { post_id: response.post_id };
          } catch (error) {
            console.error('Error creating article:', error);
            throw error;
          }
        }}
        maxTitleLength={100}
        maxSubtitleLength={150}
      />
    </div>
  );
}

// Loading state component
export function Loading() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-6 w-96 bg-gray-200 rounded" />
        <div className="h-[600px] bg-gray-100 rounded-lg border" />
      </div>
    </div>
  );
}

// Error state component
export function Error({ error }: { error: Error }) {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-red-800 font-semibold">Error Creating Article</h2>
        <p className="text-red-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}