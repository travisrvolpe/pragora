// components/posts/wrapper/PostAnalytics.tsx
import { FC } from 'react';
import { PostAnalytics as PostAnalyticsType } from '@/types/posts/post-types';

interface PostAnalyticsProps {
  analysis: PostAnalyticsType;
}

export const PostAnalytics: FC<PostAnalyticsProps> = ({ analysis }) => {
  if (!analysis.fallacy_types?.length) return null;

  return (
    <div className="mt-4 pt-4 border-t text-sm text-gray-500">
      <h4 className="font-medium text-gray-700 mb-2">Analysis:</h4>
      <div className="space-y-1">
        <p>Logical Fallacies: {analysis.fallacy_types.join(', ')}</p>
        <p>Factual Accuracy: {Math.round(analysis.evidence_score * 100)}%</p>
        <p>Bias Score: {Math.round(analysis.bias_score * 100)}%</p>
        <p>Actionability: {Math.round(analysis.action_score * 100)}%</p>
      </div>
    </div>
  );
};