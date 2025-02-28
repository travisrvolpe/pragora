// app/dialectica/[postId]/page.tsx

'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const DynamicSinglePostView = dynamic(
  () => import('@/components/posts/SinglePostView').then(mod => mod.SinglePostView),
  { ssr: false }
);

export default function PostViewPage() {
  const params = useParams();
  const { postId } = useParams(); // can be string | string[] | undefined
  const postIdParam = Array.isArray(postId) ? postId[0] : postId;
  const numericPostId = parseInt(postIdParam || '0', 10);

  console.log("useParams() ran, postId =", params.postId);

  if (typeof window === 'undefined') {
    console.log("[SSR/RSC] useParams was called in a server environment!");
  } else {
    console.log("[Client] useParams is being used in the browser");
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <DynamicSinglePostView postId={numericPostId} />
    </div>
  );
}
