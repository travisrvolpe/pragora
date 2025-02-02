import { ReactNode, ButtonHTMLAttributes } from 'react';

// Base component props
export interface BaseProps {
  className?: string;
  children?: ReactNode;
}

// Button props extending HTML button attributes
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, BaseProps {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Card props
export interface CardProps extends BaseProps {
  title?: string;
  subtitle?: string;
}

// Post interaction types matching your database
export type PostInteractionType = 'like' | 'dislike' | 'love' | 'hate' | 'save' | 'share' | 'report';

// Post card specific props
export interface PostCardProps extends CardProps {
  post: {
    post_id: number;
    user_id: number;
    title?: string;
    subtitle?: string;
    content: string;
    image_url?: string;
    caption?: string;
    video_url?: string;
    category_id?: number;
    subcategory_id?: number;
    status?: string;
    created_at?: string;
    updated_at?: string;
  };
  variant?: 'feed' | 'full';
  onInteraction?: (id: number, type: PostInteractionType) => void;
}