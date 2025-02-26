// components/posts/metrics/CommentButton.tsx
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { EngagementButton } from '@/components/buttons/EngagementButton';

interface CommentButtonProps {
  count: number;
  onClick: () => void;
  className?: string;
}

export function CommentButton({
  count,
  onClick,
  className
}: CommentButtonProps) {
  return (
    <EngagementButton
      icon={MessageCircle}
      count={count}
      active={false}
      onClick={onClick}
      className={className}
      variant="ghost"
      tooltip="Comment on this post"
    />
  );
}