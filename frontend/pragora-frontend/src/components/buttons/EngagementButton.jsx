import React from 'react';
import { cn } from '../../lib/utils';

const EngagementButton = ({
  icon: Icon,
  count = 0,
  onClick,
  active = false,
  className = '',
  children
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 p-2 rounded-full transition-colors",
        "hover:bg-gray-100",
        active && "text-blue-600",
        className
      )}
    >
      <Icon className="w-5 h-5" />
      {(count > 0 || children) && (
        <span className="text-sm">
          {children || count}
        </span>
      )}
    </button>
  );
};

export default EngagementButton;