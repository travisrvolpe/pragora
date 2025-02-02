// src/types/components.ts
import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Post } from './posts';

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

// Post card specific props
export interface PostCardProps extends CardProps {
  post: Post;
  variant?: 'feed' | 'full';
  onLike?: (id: number) => void;
  onComment?: (id: number) => void;
  onShare?: (id: number) => void;
}