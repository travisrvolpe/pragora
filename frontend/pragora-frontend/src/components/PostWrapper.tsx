// Add above the PostWrapper component
/**
 * PostWrapper handles both flattened and nested user data structures:
 * Flattened: { post_id, username, avatar_img, ... }
 * Nested: { post_id, user: { username, avatar_img, ... } }
 * Currently using flattened structure from backend
 * TODO: Consider standardizing on nested structure in future
 */
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { MoreHorizontal, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import ViewPostButton from './buttons/ViewPostButton';
import BackButton from './buttons/BackButton';
import EngagementMetricsHandler from './EngagementMetricsHandler';
import engageService from '../services/engagement/engageService';

// Types
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
  like_count: number;
  dislike_count: number;
  save_count: number;
  share_count: number;
  comment_count: number;
  report_count: number;

  // User interaction states
  like: boolean;
  dislike: boolean;
  save: boolean;
  report: boolean;
}

interface PostWrapperProps {
  post: Post;
  children: React.ReactNode;
  variant?: 'feed' | 'detail';
  onComment?: () => void;
  onThreadedReply?: () => void;
}

interface InteractionState {
  like: boolean;
  dislike: boolean;
  save: boolean;
  report: boolean;
}

interface MetricsState {
  like_count: number;
  dislike_count: number;
  save_count: number;
  share_count: number;
  comment_count: number;
  report_count: number;
}

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
  // State
  const [isLoading, setIsLoading] = useState({
    like: false,
    dislike: false,
    save: false,
    share: false,
    report: false
  });

  const [isError, setIsError] = useState({
    like: false,
    dislike: false,
    save: false,
    share: false,
    report: false
  });

  const [interactionState, setInteractionState] = useState<InteractionState>({
    like: post.like || false,
    dislike: post.dislike || false,
    save: post.save || false,
    report: post.report || false
  });

  const [metrics, setMetrics] = useState<MetricsState>({
    like_count: post.like_count || 0,
    dislike_count: post.dislike_count || 0,
    save_count: post.save_count || 0,
    share_count: post.share_count || 0,
    comment_count: post.comment_count || 0,
    report_count: post.report_count || 0
  });

  useEffect(() => {
    setInteractionState({
      like: post.like || false,
      dislike: post.dislike || false,
      save: post.save || false,
      report: post.report || false
    });
    setMetrics({
      like_count: post.like_count || 0,
      dislike_count: post.dislike_count || 0,
      save_count: post.save_count || 0,
      share_count: post.share_count || 0,
      comment_count: post.comment_count || 0,
      report_count: post.report_count || 0
    });
  }, [post]);

  // Handlers
  const handleLike = async () => {
    try {
      setIsLoading(prev => ({ ...prev, like: true }));
      setIsError(prev => ({ ...prev, like: false }));

      const response = await engageService.likePost(post.post_id);

      setInteractionState(prev => ({
        ...prev,
        like: response.like,
        dislike: false // Reset dislike if like is successful
      }));

      setMetrics(prev => ({
        ...prev,
        likes_count: response.like_count,
        dislikes_count: interactionState.dislike ? prev.dislike_count - 1 : prev.dislike_count
      }));
    } catch (error) {
      setIsError(prev => ({ ...prev, like: true }));
      console.error('Error liking post:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, like: false }));
    }
  };

  const handleDislike = async () => {
    try {
      setIsLoading(prev => ({ ...prev, dislike: true }));
      setIsError(prev => ({ ...prev, dislike: false }));

      const response = await engageService.dislikePost(post.post_id);

      setInteractionState(prev => ({
        ...prev,
        dislike: response.dislike,
        like: false // Reset like if dislike is successful
      }));

      setMetrics(prev => ({
        ...prev,
        dislikes_count: response.dislike_count,
        likes_count: interactionState.like ? prev.like_count - 1 : prev.like_count
      }));
    } catch (error) {
      setIsError(prev => ({ ...prev, dislike: true }));
      console.error('Error disliking post:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, dislike: false }));
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(prev => ({ ...prev, save: true }));
      setIsError(prev => ({ ...prev, save: false }));

      const response = await engageService.savePost(post.post_id);

      setInteractionState(prev => ({
        ...prev,
        save: response.save
      }));

      setMetrics(prev => ({
        ...prev,
        saves_count: response.save_count
      }));
    } catch (error) {
      setIsError(prev => ({ ...prev, save: true }));
      console.error('Error saving post:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(prev => ({ ...prev, share: true }));
      setIsError(prev => ({ ...prev, share: false }));

      const response = await engageService.sharePost(post.post_id);

      setMetrics(prev => ({
        ...prev,
        shares_count: response.share_count
      }));
    } catch (error) {
      setIsError(prev => ({ ...prev, share: true }));
      console.error('Error sharing post:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, share: false }));
    }
  };

  const handleReport = async (reason: string) => {
    try {
      setIsLoading(prev => ({ ...prev, report: true }));
      setIsError(prev => ({ ...prev, report: false }));

      const response = await engageService.reportPost(post.post_id, reason);

      setInteractionState(prev => ({
        ...prev,
        report: response.report
      }));

      setMetrics(prev => ({
        ...prev,
        reports_count: response.report_count
      }));
    } catch (error) {
      setIsError(prev => ({ ...prev, report: true }));
      console.error('Error reporting post:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, report: false }));
    }
  };

  const handleReportClick = () => {
    const reason = window.prompt('Please provide a reason for reporting this post:');
    if (reason) {
      handleReport(reason);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayUsername = post.username || post.user?.username || 'Anonymous';

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
        <div className="flex items-center justify-between">
          <EngagementMetricsHandler
            type="post"
            metrics={metrics}
            states={interactionState}
            loading={isLoading}
            error={isError}
            onLike={handleLike}
            onDislike={handleDislike}
            onComment={onComment}
            onShare={handleShare}
            onSave={handleSave}
          />

          {/* Conditional rendering of View/Back button based on variant */}
          {variant === 'feed' && <ViewPostButton postId={post.post_id} />}
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