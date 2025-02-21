import { 
  BaseUser, 
  UserMetrics, 
  UserPreferences, 
  UserRole, 
  UserTimestamps,
  UserEngagement,
  UserPost,
  UserComment,
  UserDraft,
  UserSavedPost
} from './user';
import { LucideIcon } from 'lucide-react';

export interface Profile extends BaseUser, UserMetrics, UserPreferences, UserRole, UserTimestamps {
  user_id: number;  // Explicit inclusion for clarity
  username: string;
  avatar_img?: string;
  about?: string;
  goals?: string;
  reputation_score: number;
  reputation_cat: string;
  interests?: string;
  credentials?: string;
  expertise_area?: string;
  location?: string;
  gender?: string;
  sex?: string;
}

export interface ProfileWithContent extends Profile {
  engagement: UserEngagement;
}

export interface ProfileResponse {
  status: string;
  message?: string;
  data: {
    profile: Profile;
  };
}

export interface ProfileContentResponse {
  posts: UserPost[];
  comments: UserComment[];
  drafts: UserDraft[];
  saved_posts: UserSavedPost[];
}

export interface ProfileUpdateDto {
  username?: string;
  about?: string;
  location?: string;
  interests?: string;
  credentials?: string;
  expertise_area?: string;
  is_networking?: boolean;
  goals?: string;
  gender?: string;
  sex?: string;
  worldview_u?: string;
}

// UI Component Types
export interface ProfileTabData {
  posts: {
    data: UserPost[];
    isLoading: boolean;
    error: string | null;
  };
  comments: {
    data: UserComment[];
    isLoading: boolean;
    error: string | null;
  };
  drafts: {
    data: UserDraft[];
    isLoading: boolean;
    error: string | null;
  };
  saved: {
    data: UserSavedPost[];
    isLoading: boolean;
    error: string | null;
  };
}

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
}

export interface TabButtonProps {
  icon: LucideIcon;
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

export type { UserPost, UserComment, UserDraft, UserSavedPost } from './user';