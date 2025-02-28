// applib/constants/categories.ts
import type { Category } from '@/types/posts/page-types';

export const CATEGORIES: Category[] = [
  {
    category_id: 1,
    cat_name: "Self-Development",
    subcategories: [
      { subcategory_id: 1, name: "Health & Wellness", category_id: 1 },
      { subcategory_id: 2, name: "Personal Growth", category_id: 1 },
      { subcategory_id: 3, name: "Skill Development", category_id: 1 }
    ]
  },
  {
    category_id: 2,
    cat_name: "Home & Habitat",
    subcategories: [
      { subcategory_id: 4, name: "Home Design", category_id: 2 },
      { subcategory_id: 5, name: "Gardening", category_id: 2 },
      { subcategory_id: 6, name: "DIY", category_id: 2 },
      { subcategory_id: 7, name: "Smart Homes", category_id: 2 }
    ]
  },
  {
    category_id: 3,
    cat_name: "Nature & Environment",
    subcategories: [
      { subcategory_id: 8, name: "Animals", category_id: 3 },
      { subcategory_id: 9, name: "Sustainability", category_id: 3 },
      { subcategory_id: 10, name: "Conservation", category_id: 3 }
    ]
  },
  {
    category_id: 4,
    cat_name: "Science & Technology",
    subcategories: [
      { subcategory_id: 11, name: "Engineering", category_id: 4 },
      { subcategory_id: 12, name: "AI", category_id: 4 }
    ]
  },
  {
    category_id: 5,
    cat_name: "Philosophy",
    subcategories: [
      { subcategory_id: 13, name: "Ethics", category_id: 5 },
      { subcategory_id: 14, name: "Metaphysics", category_id: 5 }
    ]
  },
  {
    category_id: 6,
    cat_name: "Economics & Business",
    subcategories: [
      { subcategory_id: 15, name: "Finance", category_id: 6 },
      { subcategory_id: 16, name: "Entrepreneurship", category_id: 6 }
    ]
  },
  {
    category_id: 7,
    cat_name: "Society & Culture",
    subcategories: [
      { subcategory_id: 17, name: "Politics", category_id: 7 },
      { subcategory_id: 18, name: "History", category_id: 7 }
    ]
  },
  {
    category_id: 8,
    cat_name: "Civic Engagement",
    subcategories: [
      { subcategory_id: 19, name: "Volunteerism", category_id: 8 },
      { subcategory_id: 20, name: "Governance", category_id: 8 }
    ]
  },
  {
    category_id: 9,
    cat_name: "Entertainment",
    subcategories: [
      { subcategory_id: 21, name: "Pop Culture", category_id: 9 },
      { subcategory_id: 22, name: "Media", category_id: 9 }
    ]
  },
  {
    category_id: 10,
    cat_name: "Miscellaneous",
    subcategories: []
  }
];