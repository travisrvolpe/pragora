// contexts/PostContext.tsx
import React, { createContext, useContext, useState } from 'react';
import postService from '@/applib/services/post/postService';
import { Post } from '@/types/posts/post-types';

interface PostContextType {
  createPost: (data: FormData) => Promise<Post>;
  isLoading: boolean;
  error: string | null;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await postService.createPost(data);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PostContext.Provider value={{ createPost, isLoading, error }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
}