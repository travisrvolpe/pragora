// types.ts
export type Author = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isVerified?: boolean;
};

export type Engagement = {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
};

export type PostMetadata = {
  createdAt: string;
  updatedAt?: string;
  visibility: 'public' | 'private' | 'unlisted';
  tags?: string[];
};

export type BasePostProps = {
  id: string;
  author: Author;
  engagement: Engagement;
  metadata: PostMetadata;
  children?: React.ReactNode;
  className?: string;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onAuthorClick?: () => void;
};