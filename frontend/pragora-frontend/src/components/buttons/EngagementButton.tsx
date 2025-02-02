// src/components/buttons/EngagementButton.tsx
import React from 'react';
import Button from './button';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface EngagementButtonProps {
  icon: LucideIcon;
  count?: number;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  error?: boolean;
  className?: string;
}

const EngagementButton: React.FC<EngagementButtonProps> = ({
  icon: Icon,
  count,
  onClick,
  disabled = false,
  active = false,
  error = false,
  className
}) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200',
        'hover:bg-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-gray-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        active && 'bg-gray-100 font-semibold',
        error && 'text-red-500',
        className
      )}
    >
      <Icon className={cn(
        'w-4 h-4 transition-transform duration-200',
        active && 'scale-110',
        disabled && 'opacity-50'
      )} />
      {typeof count === 'number' && (
        <span className={cn(
          'text-sm',
          active && 'font-semibold',
        )}>
          {count.toLocaleString()}
        </span>
      )}
    </Button>
  );
};

export default EngagementButton;