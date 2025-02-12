// contexts/categories/CategoriesContext.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/lib/services/category/categoryService';
import type { Category } from '@/types/posts/page-types';

interface CategoriesContextType {
  categories: Category[];
  selectedCategory?: number;
  selectedSubcategory?: number;
  setSelectedCategory: (id?: number) => void;
  setSelectedSubcategory: (id?: number) => void;
  isLoading: boolean;
  error: Error | null;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [selectedSubcategory, setSelectedSubcategory] = useState<number>();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        selectedCategory,
        selectedSubcategory,
        setSelectedCategory,
        setSelectedSubcategory,
        isLoading,
        error: error as Error | null,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}