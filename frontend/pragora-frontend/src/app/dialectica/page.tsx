// app/dialectica/page.tsx
'use client';

import React, { useState } from 'react';
import { CategoriesProvider } from '@/contexts/categories/CategoriesContext';
import { PostFeed } from '@/components/posts/PostFeed';
import { TopicsList } from '@/components/posts/TopicsList';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FEED_TABS = [
  { id: 'recent', label: 'Recent' },
  { id: 'trending', label: 'Trending' },
  { id: 'following', label: 'Following' },
] as const;

type FeedTab = typeof FEED_TABS[number]['id'];

export default function DialecticaPage() {
  const [selectedTab, setSelectedTab] = useState<FeedTab>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <CategoriesProvider>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Topics Sidebar - Now using TopicsList component */}
          <TopicsList />

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
            </div>

            {/* Post Feed */}
            <PostFeed
              selectedTab={selectedTab}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </CategoriesProvider>
  );
}