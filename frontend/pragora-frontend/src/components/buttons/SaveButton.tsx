// src/components/buttons/SaveButton.tsx
import React from 'react';
import { Bookmark } from 'lucide-react';
import EngagementButton from './EngagementButton';

interface SaveButtonProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  error?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  count,
  onClick,
  disabled,
  active,
  error
}) => {
  return (
    <EngagementButton
      icon={Bookmark}
      count={count}
      onClick={onClick}
      disabled={disabled}
      active={active}
      error={error}
      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
    />
  );
};

export default SaveButton;