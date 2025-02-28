// applib/services/category/categoryService.ts
import api from '@/applib/api/client';
import { API_ENDPOINTS } from '@/applib/api/endpoints';
import type { Category } from '@/types/posts/page-types';
import { CATEGORIES } from '@/applib/constants/categories';

class CategoryService {
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get(API_ENDPOINTS.CATEGORIES);
      return response.data.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to static categories if API fails
      return CATEGORIES;
    }
  }
}

export const categoryService = new CategoryService();