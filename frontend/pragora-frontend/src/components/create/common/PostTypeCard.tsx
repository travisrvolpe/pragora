// components/create/components/PostTypeCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '../../../lib/utils/utils';
import { LucideIcon } from 'lucide-react';

interface PostTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  limit?: string;
  color: string;
  path: string;
  className?: string;
}

export const PostTypeCard: React.FC<PostTypeCardProps> = ({
  icon: Icon,
  title,
  description,
  limit,
  color,
  path,
  className
}) => {
  return (
    <Link href={path} className="no-underline">
      <div className={cn(
        "flex items-start space-x-4 p-4 rounded-lg border",
        "hover:shadow-lg transition-shadow cursor-pointer",
        className
      )}>
        <div className={cn(
          "p-3 rounded-full text-white",
          color
        )}>
          <Icon className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
          {limit && (
            <span className="text-xs text-gray-500 mt-1 block">
              {limit}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PostTypeCard;