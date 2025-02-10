// components/create/common/CategorySelector.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '../../../lib/utils/utils';
import { Category, Subcategory, CategorySelectorProps } from '../../../types/posts/create-content-types';

const INITIAL_CATEGORIES: Category[] = [
  {
    category_id: 1,
    cat_name: "Self-Development",
    subcategories: [
      { subcategory_id: 1, name: "Health & Wellness", category_id: 1 },
      { subcategory_id: 2, name: "Personal Growth", category_id: 1 },
      { subcategory_id: 3, name: "Skill Development", category_id: 1 }
    ]
  },
  // ... other categories from database_utils.py
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  className
}) => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    // In a real app, fetch categories from API
    // For now, using initial categories
    setCategories(INITIAL_CATEGORIES);
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c.category_id.toString() === selectedCategory);
      setSubcategories(category?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      <div>
        <select
          value={selectedCategory || ''}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option
              key={category.category_id}
              value={category.category_id.toString()}
            >
              {category.cat_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <select
          value={selectedSubcategory || ''}
          onChange={(e) => onSubcategoryChange(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!selectedCategory}
        >
          <option value="">Select Subcategory</option>
          {subcategories.map((subcategory) => (
            <option
              key={subcategory.subcategory_id}
              value={subcategory.subcategory_id.toString()}
            >
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CategorySelector;