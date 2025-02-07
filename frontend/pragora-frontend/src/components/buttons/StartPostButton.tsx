// src/components/buttons/StartPostButton.tsx
import React from 'react';
import { MessageSquare } from 'lucide-react';
import Button from './button';
import { NavigationButtonProps } from '../../types/buttons';

const StartPostButton: React.FC<NavigationButtonProps> = ({
  onClick,
  disabled,
  className
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <Button
      label="Start Post"
      icon={MessageSquare}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      tooltip="Start a new post"
    />
  );
};

export default StartPostButton;