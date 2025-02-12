// types/posts/page-types.ts

import { Post, PostTypeId } from './post-types';

export interface Category {
  category_id: number;
  cat_name: string;
  subcategories?: SubCategory[];
  description?: string;
  stats?: CategoryStats;
}

export interface SubCategory {
  subcategory_id: number;
  name: string;
  category_id: number;
}

export interface CategoryStats {
  posts: number;
  activeUsers: number;
}

export interface PostFeedProps {
  selectedTab?: 'trending' | 'best' | 'recent' | 'following' | 'random'; //TODO ???
  selectedCategory?: number;
  selectedSubcategory?: number;
  searchQuery?: string;
  limit?: number;
}

export interface TopicCardProps {
  category: Category;
  currentCategory?: number;  // Changed from selectedCategory for clarity
  currentSubcategory?: number;  // Changed from selectedSubcategory
  onSelect?: (categoryId: number) => void;
  onSubcategoryChange?: (subcategoryId: number) => void;
}

export interface CreateContentProps {
  initialType?: PostTypeId;
  draftId?: number;
  onSuccess?: (post: Post) => void;
  onCancel?: () => void;
}

export interface PostsResponse {
  status: string;
  data: {
    posts: Post[];
    total: number;
    hasMore: boolean;
  };
}