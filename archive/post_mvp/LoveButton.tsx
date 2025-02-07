// src/components/buttons/LoveButton.tsx
import React from 'react';
import { Heart } from 'lucide-react';
import EngagementButton from './EngagementButton';
import { EngagementButtonProps } from '../../types/buttons';

const LoveButton: React.FC<EngagementButtonProps> = ({
  count,
  onClick,
  disabled,
  active,
  error
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <EngagementButton
      icon={Heart}
      count={count}
      onClick={handleClick}
      disabled={disabled}
      active={active}
      error={error}
      className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
    />
  );
};

export default LoveButton;
