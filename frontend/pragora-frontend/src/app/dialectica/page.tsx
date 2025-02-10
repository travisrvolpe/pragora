// app/dialectica/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PostFeed } from '@/components/posts/PostFeed';
import { TopicCard } from '@/components/posts/TopicCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Category } from '@/types/posts/page-types';

const FEED_TABS = [
  { id: 'recent', label: 'Recent' },
  { id: 'trending', label: 'Trending' },
  { id: 'following', label: 'Following' },
] as const;

type FeedTab = typeof FEED_TABS[number]['id'];

export default function DialecticaPage() {
  // State
  const [selectedTab, setSelectedTab] = useState<FeedTab>('recent');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      // Replace with actual API call
      return [] as Category[];
    }
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Topics Sidebar */}
        <aside className="w-full md:w-64 space-y-4">
          <h2 className="text-lg font-semibold">Topics</h2>
          {isLoadingCategories ? (
            <div className="flex justify-center p-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {categories?.map((category) => (
                <TopicCard
                  key={category.category_id}
                  category={category}
                  isSelected={selectedCategory === category.category_id}
                  selectedSubcategory={selectedSubcategory}
                />
              ))}
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Feed Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <Tabs
                value={selectedTab}
                onValueChange={(value) => setSelectedTab(value as FeedTab)}
              >
                <TabsList>
                  {FEED_TABS.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Search */}
              <input
                type="search"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
            </div>

            {/* Active Filters */}
            {(selectedCategory || searchQuery) && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Filters:</span>
                {selectedCategory && (
                  <button
                    onClick={() => {
                      setSelectedCategory(undefined);
                      setSelectedSubcategory(undefined);
                    }}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full
                             hover:bg-blue-200 flex items-center gap-1"
                  >
                    Category
                    <span className="text-xs">×</span>
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full
                             hover:bg-blue-200 flex items-center gap-1"
                  >
                    Search: {searchQuery}
                    <span className="text-xs">×</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Post Feed */}
          <PostFeed
            selectedTab={selectedTab}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    </div>
  );
}

// Loading state component
export function Loading() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-4">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <div className="h-10 bg-gray-200 rounded w-full" />
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 bg-gray-200 rounded w-full" />
          ))}
        </div>
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
    <div className="max-w-7xl mx-auto">
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
    </div>
  );
}