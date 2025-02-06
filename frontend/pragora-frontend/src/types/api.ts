// src/types/api.ts
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  data?: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
  message?: string;
}

export interface ApiError {
  status: string;
  message: string;
  errors?: string[];
}

//export interface ApiError {
//  status: 'error';
//  message: string;
//  errors?: Record<string, string[]>;
//}