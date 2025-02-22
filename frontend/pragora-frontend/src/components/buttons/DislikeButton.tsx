// components/buttons/DislikeButton.tsx
'use client'

import * as React from 'react'
import { ThumbsDown } from 'lucide-react'
import { EngagementButton, EngagementButtonProps } from './EngagementButton'
import { cn } from '../../lib/utils/utils'
import { useRouter } from 'next/navigation'

type DislikeButtonProps = Omit<EngagementButtonProps, 'icon'> & {
  onClick: () => Promise<void>
}

export const DislikeButton = React.forwardRef<HTMLButtonElement, DislikeButtonProps>(({
  onClick,
  active,
  disabled,
  error,
  className,
  ...props
}, ref) => {
  const router = useRouter()

  const handleClick = async () => {
    try {
      await onClick()
    } catch (err) {
      console.error('Error handling dislike:', err)
      // Use router instead of window.location
      if (err instanceof Error && err.message === 'Authentication required') {
        router.push('/auth/login')
        return
      }
    }
  }

  return (
    <EngagementButton
      ref={ref}
      icon={ThumbsDown}
      onClick={handleClick}
      active={active}
      disabled={disabled}
      error={error}
      tooltip={active ? 'Remove Dislike' : 'Dislike'}
      className={cn(
        'text-red-600 hover:text-red-700 hover:bg-red-50',
        className
      )}
      {...props}
    />
  )
})

DislikeButton.displayName = 'DislikeButton'

export default DislikeButton