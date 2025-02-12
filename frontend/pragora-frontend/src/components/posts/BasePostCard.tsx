import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MoreHorizontal, Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { GradientAvatar } from '../common/GradientAvatar';
import { PostMetricsBar } from './PostMetricsBar';
import { ViewPostButton } from '../buttons/ViewPostButton';
import type { PostCardProps } from '@/types/posts/component-types';

const formatRelativeTime = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 86400000) { // Less than 24 hours
    const hours = Math.floor(diff / 3600000);
    return hours === 0 ? 'Just now' : `${hours}h ago`;
  }

  if (diff < 604800000) { // Less than 7 days
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  }

  return d.toLocaleDateString();
};
// components/posts/BasePostCard.tsx
export const BasePostCard: React.FC<PostCardProps> = ({
  post,
  variant = 'feed',
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Just render the content itself */}
      <div className="prose max-w-none">
        {children}
      </div>
    </div>
  );
};