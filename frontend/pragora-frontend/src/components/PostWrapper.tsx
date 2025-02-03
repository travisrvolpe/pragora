// Add above the PostWrapper component
/**
 * PostWrapper handles both flattened and nested user data structures:
 * Flattened: { post_id, username, avatar_img, ... }
 * Nested: { post_id, user: { username, avatar_img, ... } }
 * Currently using flattened structure from backend
 * TODO: Consider standardizing on nested structure in future
 */

import React from 'react';
import { Card } from './ui/card';
import usePostEngagement from '../hooks/usePostEngagement';
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Share2,
  MessageCircle,
  CornerDownRight,
  MoreHorizontal,
  Flag,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
} from "./ui/dropdown-menu";

import ViewPostButton from './buttons/ViewPostButton';
import EngagementButton from './buttons/EngagementButton';
import BackButton from './buttons/BackButton';
import LikeButton from './buttons/LikeButton';
import DislikeButton from './buttons/DislikeButton';
import SaveButton from './buttons/SaveButton';
import ShareButton from './buttons/ShareButton';

// Types for post structure
interface PostAnalysis {
  fallacy_types?: string[];
  evidence_score: number;
  bias_score: number;
  action_score: number;
}

interface PostUser {
  username?: string;
  avatar_url?: string;
  reputation_score?: number;
}

// Define valid post types
type PostType = 1 | 2 | 3;

interface Post {
  post_id: number;
  user_id: number;
  user?: PostUser;
  username?: string;
  post_type_id: PostType;
  created_at: string;
  updated_at?: string;
  content: string;
  tags?: string[];
  analysis?: PostAnalysis;

  // Engagement metrics
  likes_count: number;
  dislikes_count: number;
  saves_count: number;
  shares_count: number;
  comments_count: number;
  reports_count: number;

  // User interaction states
  liked: boolean;
  disliked: boolean;
  saved: boolean;
  reported: boolean;
}

interface PostWrapperProps {
  post: Post;
  children: React.ReactNode;
  variant?: 'feed' | 'detail';
  onComment?: () => void;
  onThreadedReply?: () => void;
}

// Define gradient styles with proper typing
const POST_TYPE_GRADIENTS: Record<PostType, string> = {
  1: 'from-purple-300 to-purple-800',
  2: 'from-red-300 to-red-800',
  3: 'from-emerald-300 to-emerald-800'
} as const;

const PostWrapper: React.FC<PostWrapperProps> = ({
  post,
  children,
  variant = 'feed',
  onComment,
  onThreadedReply
}) => {
  const normalizedPost = {
    ...post,
    likes_count: post.likes_count || 0,
    dislikes_count: post.dislikes_count || 0,
    saves_count: post.saves_count || 0,
    shares_count: post.shares_count || 0,
    comments_count: post.comments_count || 0,
    reports_count: post.reports_count || 0,
    liked: Boolean(post.liked),
    disliked: Boolean(post.disliked),
    saved: Boolean(post.saved),
    reported: Boolean(post.reported),
  };

  const {
    handleLike,
    handleDislike,
    handleSave,
    handleShare,
    handleReport,
    isLoading,
    isError
  } = usePostEngagement(normalizedPost);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayUsername = post.username || post.user?.username || 'Anonymous';

  const handleReportClick = () => {
    const reason = window.prompt('Please provide a reason for reporting this post:');
    if (reason) {
      handleReport(reason);
    }
  };

  // Handle optional callbacks safely
  const handleCommentClick = () => {
    if (onComment) onComment();
  };

  const handleThreadedReplyClick = () => {
    if (onThreadedReply) onThreadedReply();
  };

  return (
    <Card className="w-full max-w-2xl bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          {/* Avatar with post-type based gradient ring */}
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${POST_TYPE_GRADIENTS[post.post_type_id]} p-0.5`}>
            <div className="w-full h-full rounded-full bg-white p-0.5">
              {post.user?.avatar_url ? (
                <img
                  src={post.user.avatar_url}
                  alt={displayUsername}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    console.log("Avatar load error for user:", displayUsername);
                    e.currentTarget.src = '../assets/images/avatars/default-avatar.png';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200" />
              )}
            </div>
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{displayUsername}</span>
              <span className="text-sm text-gray-500">
                ({post.user?.reputation_score || 0})
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(post.created_at)}
              {post.updated_at && post.updated_at !== post.created_at && (
                <span> • Updated {formatDate(post.updated_at)}</span>
              )}
            </div>
          </div>
        </div>

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={handleReportClick}
              disabled={isLoading.report}
              className="text-red-600 cursor-pointer flex items-center"
            >
              <Flag className="w-4 h-4 mr-2" />
              <span>Report Post</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Content */}
      {children}

      {/* Footer */}
      <div className="p-4 border-t">
        {/* Action Buttons with Integrated Metrics */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <LikeButton
              count={normalizedPost.likes_count}
              onClick={handleLike}
              disabled={isLoading.like}
              active={normalizedPost.liked}
              error={isError.like}
            />
            <DislikeButton
              count={normalizedPost.dislikes_count}
              onClick={handleDislike}
              disabled={isLoading.dislike}
              active={normalizedPost.disliked}
              error={isError.dislike}
            />
            <EngagementButton
              icon={MessageCircle}
              count={normalizedPost.comments_count}
              onClick={handleCommentClick}
              className="text-gray-600"
            />
            {variant === 'feed' && (
              <EngagementButton
                icon={CornerDownRight}
                onClick={handleThreadedReplyClick}
                className="text-gray-600"
              />
            )}
            <ShareButton
              count={normalizedPost.shares_count}
              onClick={handleShare}
              disabled={isLoading.share}
              error={isError.share}
            />
            <SaveButton
              count={normalizedPost.saves_count}
              onClick={handleSave}
              disabled={isLoading.save}
              active={normalizedPost.saved}
              error={isError.save}
            />
          </div>

          {/* Conditional rendering of View/Back button based on variant */}
          {variant === 'feed' && <ViewPostButton post_id={post.post_id} />}
          {variant === 'detail' && <BackButton />}
        </div>

        {/* Analysis Results */}
        {post.analysis && post.analysis.fallacy_types && post.analysis.fallacy_types.length > 0 && (
          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
            <h4 className="font-medium text-gray-700 mb-2">Analysis:</h4>
            <div className="space-y-1">
              <p>Logical Fallacies: {post.analysis.fallacy_types.join(', ')}</p>
              <p>Factual Accuracy: {Math.round(post.analysis.evidence_score * 100)}%</p>
              <p>Bias Score: {Math.round(post.analysis.bias_score * 100)}%</p>
              <p>Actionability: {Math.round(post.analysis.action_score * 100)}%</p>
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PostWrapper;