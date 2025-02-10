// components/buttons/ShareButton.tsx
'use client'

import * as React from 'react'
import { Share2 } from 'lucide-react'
import { EngagementButton, EngagementButtonProps } from './EngagementButton'
import { cn } from '../../lib/utils/utils'
type ShareButtonProps = Omit<EngagementButtonProps, 'icon'> & {
  onClick: () => Promise<void>
}

export const ShareButton = React.forwardRef<HTMLButtonElement, ShareButtonProps>(({
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
      console.error('Error handling share:', err)
    }
  }

  return (
    <EngagementButton
      ref={ref}
      icon={Share2}
      onClick={handleClick}
      active={active}
      disabled={disabled}
      error={error}
      tooltip="Share"
      className={cn(
        'text-green-600 hover:text-green-700 hover:bg-green-50',
        className
      )}
      {...props}
    />
  )
})

ShareButton.displayName = 'ShareButton'

export default ShareButton