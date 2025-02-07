src/components/buttons/HateButton.tsx
import React from 'react';
import { Slash } from 'lucide-react';
import EngagementButton from './EngagementButton';
import { EngagementButtonProps } from '../../types/buttons';

const HateButton: React.FC<EngagementButtonProps> = ({
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
      icon={Slash}
      count={count}
      onClick={handleClick}
      disabled={disabled}
      active={active}
      error={error}
      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
    />
  );
};

export default HateButton;