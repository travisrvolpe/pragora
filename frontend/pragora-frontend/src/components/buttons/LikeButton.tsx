// src/components/buttons/LikeButton.tsx
import React from 'react';
import { ThumbsUp } from 'lucide-react';
import EngagementButton from './EngagementButton';

interface LikeButtonProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  error?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  count,
  onClick,
  disabled,
  active,
  error
}) => {
  return (
    <EngagementButton
      icon={ThumbsUp}
      count={count}
      onClick={onClick}
      disabled={disabled}
      active={active}
      error={error}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
    />
  );
};

export default LikeButton;