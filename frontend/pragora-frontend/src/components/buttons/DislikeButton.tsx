// components/buttons/DislikeButton.tsx
'use client'

import * as React from 'react'
import { ThumbsDown } from 'lucide-react'
import { EngagementButton, EngagementButtonProps } from './EngagementButton'
import { cn } from '@/applib/utils/utils'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type DislikeButtonProps = Omit<EngagementButtonProps, 'icon'> & {
  onClick: () => Promise<void>
}

export const DislikeButton = React.forwardRef<HTMLButtonElement, DislikeButtonProps>(({
  onClick,
  active,
  disabled,
  error,
  className,
  count,
  ...props
}, ref) => {
  // Debug props
  useEffect(() => {
    console.log(`DislikeButton props - active: ${active}, count: ${count}, disabled: ${disabled}`);
  }, [active, count, disabled]);

  const handleClick = async () => {
    console.log("Dislike button clicked - active state:", active);
    try {
      await onClick()
      console.log("Dislike action completed");
    } catch (err) {
      console.error('Error handling dislike:', err)
    }
  }

  // Use style props directly based on active state
  const buttonStyle = active
    ? 'text-red-700 bg-red-50'
    : 'text-gray-500';

  return (
    <EngagementButton
      ref={ref}
      icon={ThumbsDown}
      onClick={handleClick}
      active={active}
      disabled={disabled}
      error={error}
      count={count}
      tooltip={active ? 'Remove Dislike' : 'Dislike'}
      className={cn(
        buttonStyle,
        'hover:text-red-700 hover:bg-red-50',
        className
      )}
      {...props}
    />
  )
})

DislikeButton.displayName = 'DislikeButton'

export default DislikeButton