// components/buttons/LikeButton.tsx
'use client'

import * as React from 'react'
import { ThumbsUp } from 'lucide-react'
import { EngagementButton, EngagementButtonProps } from './EngagementButton'
import { cn } from '../../lib/utils/utils'

type LikeButtonProps = Omit<EngagementButtonProps, 'icon'> & {
  onClick: () => Promise<void>
}

export const LikeButton = React.forwardRef<HTMLButtonElement, LikeButtonProps>(({
  onClick,
  active,
  disabled,
  error,
  className,
  ...props
}, ref) => {
  const handleClick = async () => {
    try {
      await onClick()
    } catch (err) {
      console.error('Error handling like:', err)
    }
  }

  return (
    <EngagementButton
      ref={ref}
      icon={ThumbsUp}
      onClick={handleClick}
      active={active}
      disabled={disabled}
      error={error}
      tooltip={active ? 'Unlike' : 'Like'}
      className={cn(
        'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
        className
      )}
      {...props}
    />
  )
})

LikeButton.displayName = 'LikeButton'

export default LikeButton