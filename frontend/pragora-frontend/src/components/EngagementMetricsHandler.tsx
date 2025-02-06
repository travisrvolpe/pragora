import React from 'react';
import LikeButton from './buttons/LikeButton';
import DislikeButton from './buttons/DislikeButton';
import SaveButton from './buttons/SaveButton';
import ShareButton from './buttons/ShareButton';
import { MessageCircle } from 'lucide-react';
import EngagementButton from './buttons/EngagementButton';

interface MetricsData {
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
}

interface MetricStates {
  like: boolean;
  dislike: boolean;
  save: boolean;
  report: boolean;
}

interface LoadingStates {
  like: boolean;
  dislike: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
}

interface ErrorStates {
  like: boolean;
  dislike: boolean;
  save: boolean;
  share: boolean;
  report: boolean;
}

interface EngagementMetricsHandlerProps {
  type: 'post' | 'comment';
  metrics: MetricsData;
  states: MetricStates;
  loading: LoadingStates;
  error: ErrorStates;
  onLike: () => void;
  onDislike: () => void;
  onComment?: () => void;
  onShare: () => void;
  onSave: () => void;
  className?: string;
}

const EngagementMetricsHandler: React.FC<EngagementMetricsHandlerProps> = ({
  type,
  metrics,
  states,
  loading,
  error,
  onLike,
  onDislike,
  onComment,
  onShare,
  onSave,
  className = ''
}) => {
  // Ensure metrics have default values
  const safeMetrics = {
    likes_count: metrics.likes_count || 0,
    dislikes_count: metrics.dislikes_count || 0,
    comments_count: metrics.comments_count || 0,
    shares_count: metrics.shares_count || 0,
    saves_count: metrics.saves_count || 0
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <LikeButton
        count={safeMetrics.likes_count}
        onClick={onLike}
        disabled={loading.like}
        active={states.like}
        error={error.like}
      />
      <DislikeButton
        count={safeMetrics.dislikes_count}
        onClick={onDislike}
        disabled={loading.dislike}
        active={states.dislike}
        error={error.dislike}
      />
      {type === 'post' && onComment && (
        <EngagementButton
          icon={MessageCircle}
          count={safeMetrics.comments_count}
          onClick={onComment}
          className="text-gray-600"
        />
      )}
      <ShareButton
        count={safeMetrics.shares_count}
        onClick={onShare}
        disabled={loading.share}
        error={error.share}
      />
      <SaveButton
        count={safeMetrics.saves_count}
        onClick={onSave}
        disabled={loading.save}
        active={states.save}
        error={error.save}
      />
    </div>
  );
};

export default EngagementMetricsHandler;