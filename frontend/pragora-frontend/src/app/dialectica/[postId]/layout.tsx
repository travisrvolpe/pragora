// app/dialectica/[postId]/layout.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PostViewLayoutProps {
  children: React.ReactNode;
}

export default function PostViewLayout({ children }: PostViewLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link
              href="/dialectica"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back to Feed</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Optional: Related Posts Section */}
      <section className="border-t bg-white py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
            <div id="related-posts-container" />
          </div>
        </div>
      </section>
    </div>
  );
}