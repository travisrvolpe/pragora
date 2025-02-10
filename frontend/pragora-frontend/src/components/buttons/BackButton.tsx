// components/buttons/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationButtonProps } from '@/types/buttons';

export const BackButton: React.FC<NavigationButtonProps> = ({ className }) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.back();
  };

  return (
    <Button
      icon={ArrowLeft}
      label="Back"
      onClick={handleClick}
      variant="ghost"
      className={className}
    />
  );
};