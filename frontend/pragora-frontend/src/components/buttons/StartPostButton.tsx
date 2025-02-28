// components/buttons/StartPostButton.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/applib/utils/utils';

interface StartPostButtonProps {
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'outline' | 'primary';
  size?: 'sm' | 'md' | 'lg';
}
export const StartPostButton = ({
  className, disabled, variant = 'primary', size = 'md'
}: StartPostButtonProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dialectica/create');
  };

  return (
    <Button
      icon={MessageSquare}
      label="Start Post"
      onClick={handleClick}
      disabled={disabled}
      className={className}
      tooltip="Start a new post"
    />
  );
};

StartPostButton.displayName = 'StartPostButton';

export default StartPostButton;