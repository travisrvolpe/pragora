// components/posts/TopicsList.tsx
'use client';

import React from 'react';
import { TopicCard } from './TopicCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useCategories } from '@/contexts/categories/CategoriesContext';
import { CATEGORIES } from '@/applib/constants/categories';

export function TopicsList() {
  const {
    selectedCategory,
    selectedSubcategory,
    setSelectedCategory,
    setSelectedSubcategory,
    isLoading
  } = useCategories();

  return (
    <aside className="w-full md:w-64 space-y-4">
      <h2 className="text-lg font-semibold">Topics</h2>
      {isLoading ? (
        <div className="flex justify-center p-4">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-3">
          {CATEGORIES.map((category) => (
            <TopicCard
              key={category.category_id}
              category={category}
              currentCategory={selectedCategory}
              currentSubcategory={selectedSubcategory}
              onSelect={setSelectedCategory}
              onSubcategoryChange={setSelectedSubcategory}
            />
          ))}
        </div>
      )}
    </aside>
  );
}