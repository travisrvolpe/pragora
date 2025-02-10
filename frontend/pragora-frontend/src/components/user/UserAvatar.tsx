// components/user/UserAvatar.tsx
'use client'

import React from 'react';
import { cn } from '../../lib/utils/utils';

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatarUrl,
  size = 'md',
  className
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const baseClasses = 'relative rounded-full overflow-hidden flex items-center justify-center';
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn(baseClasses, sizeClass, className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = '/api/placeholder/120/120';
          }}
        />
      ) : (
        <div className="w-full h-full bg-primary/10 text-primary font-medium flex items-center justify-center">
          {getInitials(username)}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;