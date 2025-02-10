// types/create-content-types.ts
import { LucideIcon } from 'lucide-react';

export interface ContentOption {
  icon: LucideIcon;
  title: string;
  description: string;
  limit?: string;
  color: string;
  link: string;
}

export interface ContentSection {
  title: string;
  options: ContentOption[];
}

export type ContentOptionType = 'basic' | 'debate' | 'collaborative' | 'other';

export interface FormattedImage {
  file: File;
  preview: string;
}

export interface BasePostFormData {
  title?: string;
  subtitle?: string;
  content: string;
  category_id?: string;
  subcategory_id?: string;
  custom_subcategory?: string;
  tags: string[];
  post_type_id: number;
}

export interface Category {
  category_id: number;
  cat_name: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  subcategory_id: number;
  name: string;
  category_id: number;
}

export interface FormattedImage {
  file: File;
  preview: string;
}

// Base form data interface
export interface BasePostFormData {
  title?: string;
  content: string;
  category_id?: string;
  subcategory_id?: string;
  custom_subcategory?: string;
  tags: string[];
  post_type_id: number;
}

// Specific post type form data interfaces
export interface ThoughtPostFormData extends BasePostFormData {
  post_type_id: 1;
}

export interface ImagePostFormData extends BasePostFormData {
  post_type_id: 2;
  caption: string;
}

export interface ArticlePostFormData extends BasePostFormData {
  post_type_id: 3;
  subtitle?: string;
  isDraft?: boolean;
}

// Creation page interfaces
export interface PostTypeOption {
  icon: LucideIcon;
  title: string;
  description: string;
  limit?: string;
  color: string;
  path: string;
}

export interface PostSection {
  title: string;
  options: PostTypeOption[];
}

// Component prop interfaces
export interface MediaUploaderProps {
  images: FormattedImage[];
  onUpload: (files: FileList) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
  className?: string;
}

export interface CategorySelectorProps {
  selectedCategory?: string;
  selectedSubcategory?: string;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  className?: string;
}

export interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  className?: string;
}