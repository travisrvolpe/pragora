// components/buttons/StartPostButton.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '../../lib/utils/utils';

interface StartPostButtonProps {
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}

export const StartPostButton = React.forwardRef<HTMLButtonElement, StartPostButtonProps>(({
  className,
  disabled = false,
  variant = 'primary',
  size = 'md'
}, ref) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push('/dialectica/create');
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      icon={MessageSquare}
      label="Start Post"
      tooltip="Create a new post"
      className={cn(
        'font-semibold',
        className
      )}
    />
  );
});

StartPostButton.displayName = 'StartPostButton';

export default StartPostButton;