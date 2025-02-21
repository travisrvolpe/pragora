// components/user/UserAvatar.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '../../lib/utils/utils';
import { DEFAULT_AVATAR_URL } from '@/lib/constants';

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
} as const;

export const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  avatarUrl,
  size = 'md',
  className,
}) => {
  const imageSizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  const imageSize = imageSizes[size];

  // Function to get the proper image source
  const getImageSource = (url: string | null | undefined): string => {
    if (!url || url === 'default_url') {
      return '/images/avatars/default_avatar.png';
    }

    // If it's an absolute URL
    if (url.startsWith('http')) {
      return url;
    }

    // If it's an avatar from the backend
    if (url.startsWith('/avatars/')) {
      // Use media path from backend
      return `${process.env.NEXT_PUBLIC_API_URL}/media${url}`;
    }

    // Fallback for local images
    return `/images/avatars/${url}`;
  };
  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-gray-200',
        sizeMap[size],
        className
      )}
    >
      <Image
        src={getImageSource(avatarUrl)}
        alt={`${username}'s avatar`}
        width={imageSize}
        height={imageSize}
        className="object-cover w-full h-full"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = DEFAULT_AVATAR_URL;
        }}
      />
    </div>
  );
};