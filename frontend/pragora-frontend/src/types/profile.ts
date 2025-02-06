// src/types/profile.ts
import { LucideIcon } from 'lucide-react';

export interface Profile {
  user_id: number;
  username: string;
  email: string;
  avatar_img?: string;
  about?: string;
  post_cnt: number;
  comment_cnt: number;
  upvote_cnt: number;
  is_messaging: boolean;
  is_networking: boolean;
  reputation_score: number;
  reputation_cat: string;
  interests?: string;
  credentials?: string;
  expertise_area?: string;
  location?: string;
  gender?: string;
  date_joined: string;
  role: string;
  goals?: string;
  plan_comp_cnt?: number;
}

export interface ProfileUpdateDto {
  username?: string;
  about?: string;
  location?: string;
  gender?: string;
  interests?: string;
  credentials?: string;
  expertise_area?: string;
  is_networking?: boolean;
  goals?: string;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
}

export interface TabButtonProps {
  icon: LucideIcon;  // Using LucideIcon type
  label: string;
  active: boolean;
  onClick: () => void;
}

export interface InputFieldProps {
  label: string;
  name: string;
  value?: string | number | boolean | null | undefined;
  type?: string;
  disabled?: boolean;
  rows?: number;
  placeholder?: string;
}

export interface AlertProps {
  variant?: 'default' | 'destructive';
  className?: string;
  children?: React.ReactNode;
}

export interface AlertDescriptionProps {
  children?: React.ReactNode;
}
