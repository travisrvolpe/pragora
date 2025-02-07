import React, { createContext, useContext, useState } from 'react';
import { Category } from '../../types/layout';

interface LayoutContextType {
  selectedCategory: string | number | null;
  setSelectedCategory: (id: string | number | null) => void;
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  return (
    <LayoutContext.Provider value={{
      selectedCategory,
      setSelectedCategory,
      categories,
      setCategories
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}