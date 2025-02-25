// components/buttons/ShareButton.tsx
'use client'

import * as React from 'react'
import { Share2 } from 'lucide-react'
import { EngagementButton, EngagementButtonProps } from './EngagementButton'
import { cn } from '@/lib/utils/utils'
import { useEffect } from 'react'

type ShareButtonProps = Omit<EngagementButtonProps, 'icon'> & {
  onClick: () => Promise<void>
}

export const ShareButton = React.forwardRef<HTMLButtonElement, ShareButtonProps>(({
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
    console.log(`ShareButton props - active: ${active}, count: ${count}, disabled: ${disabled}`);
  }, [active, count, disabled]);

  const handleClick = async () => {
    console.log("Share button clicked - active state:", active);
    try {
      await onClick()
      console.log("Share action completed");
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
      count={count}
      tooltip="Share"
      className={cn(
        active ? 'text-green-700 bg-green-50' : 'text-gray-500',
        'hover:text-green-700 hover:bg-green-50',
        className
      )}
      {...props}
    />
  )
})

ShareButton.displayName = 'ShareButton'

export default ShareButton