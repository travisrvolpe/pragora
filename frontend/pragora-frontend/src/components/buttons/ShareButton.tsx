// src/components/buttons/ShareButton.tsx
import React from 'react';
import { Bookmark } from 'lucide-react';
import EngagementButton from './EngagementButton';

interface ShareButtonProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  error?: boolean;
}
const ShareButton: React.FC<ShareButtonProps> = ({
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
      className="text-green-600 hover:text-green-700 hover:bg-purple-50"
    />
  );
};

export default ShareButton;
