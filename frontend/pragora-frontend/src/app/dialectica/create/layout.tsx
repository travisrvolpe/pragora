// app/dialectica/create/layout.tsx
import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface CreateLayoutProps {
  children: React.ReactNode;
}

export default function CreateLayout({ children }: CreateLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dialectica"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Dialectica</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Content
            </h1>
            <p className="mt-2 text-gray-600">
              Choose the type of content you want to create and share with the community.
            </p>
          </div>

          {/* Content */}
          <div className={cn(
            "bg-white rounded-lg shadow-sm",
            "border border-gray-200",
          )}>
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-white mt-auto">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-500">
            <p>Create meaningful content that adds value to the community.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}