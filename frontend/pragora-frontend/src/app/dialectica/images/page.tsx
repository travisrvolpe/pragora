// app/dialectica/create/images/page.tsx

'use client';

import React from 'react';
import { Image } from 'lucide-react';
import { ImageForm } from '@/components/create/forms/ImageForm';
import { postService } from '@/lib/services/post/postService';

export default function CreateImagePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-500 p-2 rounded-full">
          <Image className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Share Images</h1>
      </div>

      <ImageForm onSubmit={postService.createPost} />
    </div>
  );
}