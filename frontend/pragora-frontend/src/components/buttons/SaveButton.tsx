// components/buttons/SaveButton.tsx
'use client'

import * as React from 'react'
import { Bookmark } from 'lucide-react'
import { EngagementButton, EngagementButtonProps } from './EngagementButton'
import { cn } from '@/applib/utils/utils'
import { useEffect } from 'react'

type SaveButtonProps = Omit<EngagementButtonProps, 'icon'> & {
  onClick: () => Promise<void>
}
export const SaveButton = React.forwardRef<HTMLButtonElement, SaveButtonProps>(({
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
    console.log(`SaveButton props - active: ${active}, count: ${count}, disabled: ${disabled}`);
  }, [active, count, disabled]);

  const handleClick = async () => {
    console.log("Save button clicked - active state:", active);
    try {
      await onClick()
      console.log("Save action completed");
    } catch (err) {
      console.error('Error handling save:', err)
    }
  }

  // Use style props directly based on active state
  const buttonStyle = active
    ? 'text-purple-700 bg-purple-50'
    : 'text-gray-500';

  return (
    <EngagementButton
      ref={ref}
      icon={Bookmark}
      onClick={handleClick}
      active={active}
      disabled={disabled}
      error={error}
      count={count}
      tooltip={active ? 'Unsave' : 'Save'}
      className={cn(
        buttonStyle,
        'hover:text-purple-700 hover:bg-purple-50',
        className
      )}
      {...props}
    />
  )
})
SaveButton.displayName = 'SaveButton'

export default SaveButton