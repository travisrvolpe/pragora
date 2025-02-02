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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

import ViewPostButton from './buttons/ViewPostButton';
import EngagementButton from './buttons/EngagementButton';
import BackButton from './buttons/BackButton';
import LikeButton from './buttons/LikeButton';
import DislikeButton from './buttons/DislikeButton';
import SaveButton from './buttons/SaveButton';
import ShareButton from './buttons/ShareButton';


// Add above the PostWrapper component
/**
 * PostWrapper handles both flattened and nested user data structures:
 * Flattened: { post_id, username, avatar_img, ... }
 * Nested: { post_id, user: { username, avatar_img, ... } }
 * Currently using flattened structure from backend
 * TODO: Consider standardizing on nested structure in future
 */


const POST_TYPE_GRADIENTS = {
  1: 'from-purple-300 to-purple-800', // Thought posts - Amethyst
  2: 'from-red-300 to-red-800',      // Image posts - Ruby
  3: 'from-emerald-300 to-emerald-800' // Article posts - Emerald
};

const PostWrapper = ({
  post,
  children,
  variant = 'feed',
  onComment,
  onThreadedReply
}) => {
  // Debug logging for post data
  console.log("PostWrapper received:", {
    post_id: post.post_id,
    username: post.username || post.user?.username,
    user: post.user,
    raw_post: post
  });

  const {
    handleLike,
    handleDislike,
    handleSave,
    handleShare,
    handleReport,
    isLoading,
    isError
  } = usePostEngagement(post);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get username with fallback handling
  const displayUsername = post.username || post.user?.username || 'Anonymous';
  console.log("Display username:", displayUsername, {
    post_username: post.username,
    user_username: post.user?.username
  });

  const handleReportClick = () => {
    const reason = window.prompt('Please provide a reason for reporting this post:');
    if (reason) {
      handleReport(reason);
    }
  };
console.log("PostWrapper received variant:", variant);

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
                  alt={displayUsername} // alt={post.user.username}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    console.log("Avatar load error for user:", displayUsername);
                    e.target.src = '../assets/images/avatars/default-avatar.png';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200" />
              )}
            </div>
          </div>

          {/* User Info */}
          {/* className="font-semibold">{post.user?.username || 'Anonymous'} */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{displayUsername}</span>
              <span className="text-sm text-gray-500">({post.user?.reputation_score || 0})</span>
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
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleReportClick}
              disabled={isLoading.report}
              className="text-red-600 cursor-pointer"
            >
              <Flag className="w-4 h-4 mr-2" />
              Report Post
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
              count={post.likes_count}
              onClick={handleLike}
              disabled={isLoading.like}
              active={post.liked}
              error={isError.like}
            />
            <DislikeButton
              count={post.dislikes_count}
              onClick={handleDislike}
              disabled={isLoading.dislike}
              active={post.disliked}
              error={isError.dislike}
            />
            <EngagementButton
              icon={MessageCircle}
              count={post.comments_count}
              onClick={onComment}
              className="text-gray-600"
            />
            {variant === 'feed' && (
              <EngagementButton
                icon={CornerDownRight}
                onClick={onThreadedReply}
                className="text-gray-600"
              />
            )}
            <ShareButton
              count={post.shares_count}
              onClick={handleShare}
              disabled={isLoading.share}
              error={isError.share}
            />
            <SaveButton
              count={post.saves_count}
              onClick={handleSave}
              disabled={isLoading.save}
              active={post.saved}
              error={isError.save}
            />
          </div>

          {/* Conditional rendering of View/Back button based on variant */}
          {variant === 'feed' && <ViewPostButton post_id={post.post_id} />}
          {variant === 'detail' && <BackButton />}
        </div>

        {/* Analysis Results */}
        {post.analysis && (
          <div className="mt-4 pt-4 border-t text-sm text-gray-500">
            <h4 className="font-medium text-gray-700 mb-2">Analysis:</h4>
            <div className="space-y-1">
              {post.analysis.fallacy_types?.length > 0 && (
                <p>Logical Fallacies: {post.analysis.fallacy_types.join(', ')}</p>
              )}
              <p>Factual Accuracy: {Math.round(post.analysis.evidence_score * 100)}%</p>
              <p>Bias Score: {Math.round(post.analysis.bias_score * 100)}%</p>
              <p>Actionability: {Math.round(post.analysis.action_score * 100)}%</p>
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
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