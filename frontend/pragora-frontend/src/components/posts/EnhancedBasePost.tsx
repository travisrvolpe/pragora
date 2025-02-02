// src/components/posts/EnhancedBasePost.tsx
import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import {
  Heart,
  ThumbsDown,
  Bookmark,
  Share2,
  Flag,
  MessageCircle,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react';
import type { Post, PostVariant } from '@/types/posts';

interface BasePostProps {
  post: Post;
  variant?: PostVariant;
  onBack?: () => void;
  onViewPost?: (id: number) => void;
  onLike?: (id: number) => void;
  onDislike?: (id: number) => void;
  onSave?: (id: number) => void;
  onShare?: (id: number) => void;
  onReport?: (id: number) => void;
  children?: React.ReactNode;
}

const EnhancedBasePost: React.FC<BasePostProps> = ({
  post,
  variant = 'feed',
  onBack,
  onViewPost,
  onLike,
  onDislike,
  onSave,
  onShare,
  onReport,
  children
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setIsDisliked(false);
    onLike?.(post.post_id);
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    setIsLiked(false);
    onDislike?.(post.post_id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(post.post_id);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return hours === 0 ? 'Just now' : `${hours}h ago`;
    }

    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }

    return d.toLocaleDateString();
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto bg-white")}>
      {variant === 'full' && onBack && (
        <div className="p-4 border-b">
          <button
            onClick={onBack}
            className={cn(
              "flex items-center gap-2 text-gray-600 hover:text-gray-900",
              "px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            )}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Posts</span>
          </button>
        </div>
      )}

      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
              {post.author?.avatar_img && (
                <img
                  src={post.author.avatar_img}
                  alt={post.author.username || 'User avatar'}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">
                  {post.author?.username || `User ${post.user_id}`}
                </span>
                {post.author?.credentials && (
                  <span className="text-sm text-gray-500">
                    ({post.author.credentials})
                  </span>
                )}
                {post.author?.reputation_score && (
                  <span className="text-sm text-blue-600">
                    Rep: {post.author.reputation_score}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(post.created_at)}
                {post.updated_at && ` • Edited ${formatDate(post.updated_at)}`}
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreHorizontal className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {post.title && (
          <CardTitle className="text-xl md:text-2xl">
            {post.title}
          </CardTitle>
        )}
      </CardHeader>

      <CardContent>
        {children}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 border-t bg-gray-50/50 p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-md transition-colors",
                isLiked ? "text-green-600" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
              <span>{post.metrics?.likes_count || 0}</span>
            </button>

            <button
              onClick={handleDislike}
              className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-md transition-colors",
                isDisliked ? "text-red-600" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <ThumbsDown className={cn("w-4 h-4", isDisliked && "fill-current")} />
              <span>{post.metrics?.dislikes_count || 0}</span>
            </button>

            <button
              onClick={() => onViewPost?.(post.post_id)}
              className="flex items-center space-x-2 px-3 py-1 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.metrics?.comments_count || 0}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className={cn(
                "p-2 rounded-md transition-colors",
                isSaved ? "text-blue-600" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
            </button>

            <button
              onClick={() => onShare?.(post.post_id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => onReport?.(post.post_id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EnhancedBasePost;