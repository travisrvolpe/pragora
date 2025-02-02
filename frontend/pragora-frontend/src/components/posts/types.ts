// types.ts
export type PostType = 1 | 2 | 3; // 1: Thought, 2: Image, 3: Article

export type Post = {
  post_id: string;
  post_type_id: PostType;
  title?: string;
  content: string;
  preview?: string;
  image_url?: string;
  caption?: string;
  author?: {
    name: string;
    credentials?: string;
    reputation?: number;
  };
  user_id?: string;
  created_at: string;
  updated_at?: string;
  metrics?: {
    likes: number;
    dislikes: number;
    saves: number;
    comments: number;
  };
  tags?: string[];
};