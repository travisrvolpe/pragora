// src/components/buttons/DislikeButton.tsx
import React from 'react';
import { ThumbsDown } from 'lucide-react';
import EngagementButton from './EngagementButton';

interface DislikeButtonProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  error?: boolean;
}

const DislikeButton: React.FC<DislikeButtonProps> = ({
  count,
  onClick,
  disabled,
  active,
  error
}) => {
  return (
    <EngagementButton
      icon={ThumbsDown}
      count={count}
      onClick={onClick}
      disabled={disabled}
      active={active}
      error={error}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    />
  );
};

export default DislikeButton;