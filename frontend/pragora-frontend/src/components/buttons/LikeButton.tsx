// components/buttons/LikeButton.tsx
'use client'

import * as React from 'react'
import { ThumbsUp } from 'lucide-react'
import { EngagementButton, EngagementButtonProps } from './EngagementButton'
import { cn } from '@/applib/utils/utils'
import { useEffect } from 'react'

type LikeButtonProps = Omit<EngagementButtonProps, 'icon'> & {
  onClick: () => Promise<void>
}
export const LikeButton = React.forwardRef<HTMLButtonElement, LikeButtonProps>(({
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
    console.log(`LikeButton props - active: ${active}, count: ${count}, disabled: ${disabled}`);
  }, [active, count, disabled]);

  const handleClick = async () => {
    console.log("Like button clicked - active state:", active);
    try {
      await onClick()
      console.log("Like action completed");
    } catch (err) {
      console.error('Error handling like:', err)
    }
  }

  // Use style props directly based on active state
  const buttonStyle = active
    ? 'text-blue-600 bg-blue-50'
    : 'text-gray-500';

  return (
    <EngagementButton
      ref={ref}
      icon={ThumbsUp}
      onClick={handleClick}
      active={active}
      disabled={disabled}
      error={error}
      count={count}
      tooltip={active ? 'Unlike' : 'Like'}
      className={cn(
        buttonStyle,
        'hover:text-blue-600 hover:bg-blue-50',
        className
      )}
      {...props}
    />
  )
})

LikeButton.displayName = 'LikeButton'

export default LikeButton