// src/services/buttonService.ts
import { toast } from '../../hooks/use-toast';
//import { toast } from 'react-hot-toast';

interface EngagementResponse {
  success: boolean;
  count: number;
  error?: string;
}

export const buttonService = {
  async like(postId: string): Promise<EngagementResponse> {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive'
      });
      return { success: false, count: 0, error: 'Failed to like post' };
    }
  },

  async dislike(postId: string): Promise<EngagementResponse> {
    try {
      const response = await fetch(`/api/posts/${postId}/dislike`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dislike post',
        variant: 'destructive'
      });
      return { success: false, count: 0, error: 'Failed to dislike post' };
    }
  },

  async save(postId: string): Promise<EngagementResponse> {
    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive'
      });
      return { success: false, count: 0, error: 'Failed to save post' };
    }
  },

  async share(postId: string): Promise<EngagementResponse> {
    try {
      const response = await fetch(`/api/posts/${postId}/share`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to share post',
        variant: 'destructive'
      });
      return { success: false, count: 0, error: 'Failed to share post' };
    }
  }
};

export * from './buttonService';