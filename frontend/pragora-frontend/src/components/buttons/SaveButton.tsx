// components/buttons/SaveButton.tsx
'use client'

import * as React from 'react'
import { Bookmark } from 'lucide-react'
import { EngagementButton, EngagementButtonProps } from './EngagementButton'
import { cn } from '../../lib/utils/utils'

type SaveButtonProps = Omit<EngagementButtonProps, 'icon'> & {
  onClick: () => Promise<void>
}

export const SaveButton = React.forwardRef<HTMLButtonElement, SaveButtonProps>(({
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
      console.error('Error handling save:', err)
    }
  }

  return (
    <EngagementButton
      ref={ref}
      icon={Bookmark}
      onClick={handleClick}
      active={active}
      disabled={disabled}
      error={error}
      tooltip={active ? 'Unsave' : 'Save'}
      className={cn(
        'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
        className
      )}
      {...props}
    />
  )
})

SaveButton.displayName = 'SaveButton'

export default SaveButton