// components/create/common/CategorySelector.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/applib/utils/utils';
import { Category, Subcategory, CategorySelectorProps } from '@/types/posts/create-content-types';

const INITIAL_CATEGORIES: Category[] = [
  {
    category_id: 1,
    cat_name: "Self-Development",
    subcategories: [
      { subcategory_id: 1, name: "Health & Wellness", category_id: 1 },
      { subcategory_id: 2, name: "Mental Health", category_id: 1 },
      { subcategory_id: 3, name: "Fitness & Physical Health", category_id: 1 },
      { subcategory_id: 4, name: "Personal Growth", category_id: 1 },
      { subcategory_id: 5, name: "Skill Development", category_id: 1 },
      { subcategory_id: 6, name: "Mindfulness & Meditation", category_id: 1 },
      { subcategory_id: 7, name: "Productivity & Time Management", category_id: 1 },
      { subcategory_id: 8, name: "Relationships & Social Skills", category_id: 1 },
      { subcategory_id: 9, name: "Financial Well-being", category_id: 1 },
      { subcategory_id: 10, name: "Parenting & Family", category_id: 1 },
      { subcategory_id: 11, name: "Education & Learning", category_id: 1 },
      { subcategory_id: 12, name: "Life Hacks", category_id: 1 },
      { subcategory_id: 13, name: "Meal Planning", category_id: 1 }
    ]
  },
  {
    category_id: 2,
    cat_name: "Home & Habitat",
    subcategories: [
      { subcategory_id: 14, name: "Home Design", category_id: 2 },
      { subcategory_id: 15, name: "Gardening & Landscaping", category_id: 2 },
      { subcategory_id: 16, name: "DIY", category_id: 2 },
      { subcategory_id: 17, name: "Smart Homes", category_id: 2 },
      { subcategory_id: 18, name: "Organization & Decluttering", category_id: 2 },
      { subcategory_id: 19, name: "Eco-Friendly Practices", category_id: 2 },
      { subcategory_id: 20, name: "Home Cooking", category_id: 2 },
      { subcategory_id: 21, name: "Fashion & Style", category_id: 2 },
      { subcategory_id: 22, name: "Real Estate & Housing Markets", category_id: 2 }
    ]
  },
  {
    category_id: 3,
    cat_name: "Nature & Environment",
    subcategories: [
      { subcategory_id: 23, name: "Pets & Wildlife", category_id: 3 },
      { subcategory_id: 24, name: "Resource Conservation", category_id: 3 },
      { subcategory_id: 25, name: "Environmental Stewardship", category_id: 3 },
      { subcategory_id: 26, name: "Outdoor Activities", category_id: 3 },
      { subcategory_id: 27, name: "Disaster Resilience", category_id: 3 },
      { subcategory_id: 28, name: "Natural Phenomena", category_id: 3 },
      { subcategory_id: 29, name: "Urban Nature", category_id: 3 },
      { subcategory_id: 30, name: "Agriculture", category_id: 3 },
      { subcategory_id: 31, name: "Forestry", category_id: 3 }
    ]
  },
  {
    category_id: 4,
    cat_name: "Science & Technology",
    subcategories: [
      { subcategory_id: 32, name: "Physics", category_id: 4 },
      { subcategory_id: 33, name: "Chemistry", category_id: 4 },
      { subcategory_id: 34, name: "Biology", category_id: 4 },
      { subcategory_id: 35, name: "Computer Science", category_id: 4 },
      { subcategory_id: 36, name: "Engineering", category_id: 4 },
      { subcategory_id: 37, name: "Space Exploration", category_id: 4 },
      { subcategory_id: 38, name: "Healthcare & Medical Advancements", category_id: 4 },
      { subcategory_id: 39, name: "Emerging Technologies & Future Trends", category_id: 4 },
      { subcategory_id: 40, name: "Systems Theory", category_id: 4 },
      { subcategory_id: 41, name: "Digital Technology", category_id: 4 },
      { subcategory_id: 42, name: "Social Sciences", category_id: 4 },
      { subcategory_id: 43, name: "Citizen Science", category_id: 4 },
      { subcategory_id: 44, name: "Data Science & Machine Learning", category_id: 4 },
      { subcategory_id: 45, name: "Energy Technologies", category_id: 4 },
      { subcategory_id: 46, name: "Autonomous Technologies & Artificial Intelligence", category_id: 4 }
    ]
  },
  {
    category_id: 5,
    cat_name: "Philosophy",
    subcategories: [
      { subcategory_id: 47, name: "Ethics", category_id: 5 },
      { subcategory_id: 48, name: "Metaphysics", category_id: 5 },
      { subcategory_id: 49, name: "Logic & Critical Thinking", category_id: 5 },
      { subcategory_id: 50, name: "Epistemology", category_id: 5 },
      { subcategory_id: 51, name: "Philosophy of Mind", category_id: 5 },
      { subcategory_id: 52, name: "Political Philosophy", category_id: 5 },
      { subcategory_id: 53, name: "Aesthetics", category_id: 5 },
      { subcategory_id: 54, name: "Philosophical Systems & Schools", category_id: 5 }
    ]
  },
  {
    category_id: 6,
    cat_name: "Economics & Business",
    subcategories: [
      { subcategory_id: 55, name: "Finance", category_id: 6 },
      { subcategory_id: 56, name: "Entrepreneurship", category_id: 6 },
      { subcategory_id: 57, name: "Career Development", category_id: 6 },
      { subcategory_id: 58, name: "Market Trends", category_id: 6 },
      { subcategory_id: 59, name: "Economic Theory", category_id: 6 },
      { subcategory_id: 60, name: "Budgeting & Retirement Planning", category_id: 6 },
      { subcategory_id: 61, name: "Business Ethics & Responsibility", category_id: 6 },
      { subcategory_id: 62, name: "Small Business Management", category_id: 6 },
      { subcategory_id: 63, name: "Global Trade & Supply Chains", category_id: 6 },
      { subcategory_id: 64, name: "Investing", category_id: 6 },
      { subcategory_id: 65, name: "Cooperatives", category_id: 6 }
    ]
  },
  {
    category_id: 7,
    cat_name: "Society & Culture",
    subcategories: [
      { subcategory_id: 66, name: "Politics", category_id: 7 },
      { subcategory_id: 67, name: "History", category_id: 7 },
      { subcategory_id: 68, name: "Anthropology", category_id: 7 },
      { subcategory_id: 69, name: "Arts & Literature", category_id: 7 },
      { subcategory_id: 70, name: "Languages & Linguistics", category_id: 7 },
      { subcategory_id: 71, name: "Religion & Spirituality", category_id: 7 },
      { subcategory_id: 72, name: "Cultural Traditions", category_id: 7 },
      { subcategory_id: 73, name: "Food & Cuisine", category_id: 7 },
      { subcategory_id: 74, name: "Migration & Demographics", category_id: 7 },
      { subcategory_id: 75, name: "Civilization Growth & Decline", category_id: 7 }
    ]
  },
  {
    category_id: 8,
    cat_name: "Civic Engagement",
    subcategories: [
      { subcategory_id: 76, name: "Volunteerism", category_id: 8 },
      { subcategory_id: 77, name: "Governance", category_id: 8 },
      { subcategory_id: 78, name: "Community Development", category_id: 8 },
      { subcategory_id: 79, name: "Civic Advocacy", category_id: 8 },
      { subcategory_id: 80, name: "Economic Opportunity Initiatives", category_id: 8 },
      { subcategory_id: 81, name: "Public Policy", category_id: 8 },
      { subcategory_id: 82, name: "Global Citizenship", category_id: 8 }
    ]
  },
  {
    category_id: 9,
    cat_name: "Entertainment & Leisure",
    subcategories: [
      { subcategory_id: 83, name: "Pop Culture", category_id: 9 },
      { subcategory_id: 84, name: "Media", category_id: 9 },
      { subcategory_id: 85, name: "Gaming", category_id: 9 },
      { subcategory_id: 86, name: "Music", category_id: 9 },
      { subcategory_id: 87, name: "Film & Television", category_id: 9 },
      { subcategory_id: 88, name: "Sports & Recreation", category_id: 9 },
      { subcategory_id: 89, name: "Creative Arts", category_id: 9 },
      { subcategory_id: 90, name: "Travel & Exploration", category_id: 9 },
      { subcategory_id: 91, name: "Hobbies & Collecting", category_id: 9 },
      { subcategory_id: 92, name: "Live Events & Performances", category_id: 9 }
    ]
  },
  {
    category_id: 10,
    cat_name: "Miscellaneous",
    subcategories: []
  }
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