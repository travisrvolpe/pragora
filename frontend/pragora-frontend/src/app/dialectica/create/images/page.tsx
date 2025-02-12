'use client';

import React from 'react';
import { Image } from 'lucide-react';
import { ImageForm } from '@/components/create/forms/ImageForm';
import postService from '@/lib/services/post/postService';
import { useRouter } from 'next/navigation';

export default function CreateImagePage() {
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
          <div className="bg-green-500 p-2 rounded-full">
            <Image className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Share Images</h1>
        </div>

        <p className="text-gray-600 mt-2 ml-11">
          Share visual content with captions and descriptions.
        </p>
      </div>

      <ImageForm
        onSubmit={async (formData) => {
          try {
            const response = await postService.createPost(formData);
            return { post_id: response.post_id };
          } catch (error) {
            console.error('Error creating image post:', error);
            throw error;
          }
        }}
        maxImages={4}
      />
    </div>
  );
}