import React from 'react';
import LikeButton from './buttons/LikeButton';
import DislikeButton from './buttons/DislikeButton';
import SaveButton from './buttons/SaveButton';
import ShareButton from './buttons/ShareButton';
import { MessageCircle } from 'lucide-react';
import EngagementButton from './buttons/EngagementButton';

// TODO MOVE TO A GLOBAL TYPES FILE
interface MetricsData {
  like_count: number;
  dislike_count: number;
  comment_count: number;
  share_count: number;
  save_count: number;
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
  onLike: () => Promise<void>;  // Update to handle async
  onDislike: () => Promise<void>;
  onComment?: () => void;
  onShare: () => Promise<void>;
  onSave: () => Promise<void>;
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
  onSave
}) => {
  const handleInteraction = async (handler: () => Promise<void>) => {
    try {
      await handler();
    } catch (error) {
      console.error('Error handling interaction:', error);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <LikeButton
        count={metrics.like_count}
        onClick={() => handleInteraction(onLike)}
        disabled={loading.like}
        active={states.like}
        error={error.like}
      />
      <DislikeButton
        count={metrics.dislike_count}
        onClick={() => handleInteraction(onDislike)}
        disabled={loading.dislike}
        active={states.dislike}
        error={error.dislike}
      />
      {type === 'post' && onComment && (
        <EngagementButton
          icon={MessageCircle}
          count={metrics.comment_count}
          onClick={onComment}
          className="text-gray-600"
        />
      )}
      <ShareButton
        count={metrics.share_count}
        onClick={onShare}
        disabled={loading.share}
        error={error.share}
      />
      <SaveButton
        count={metrics.save_count}
        onClick={onSave}
        disabled={loading.save}
        active={states.save}
        error={error.save}
      />
    </div>
  );
};

export default EngagementMetricsHandler;