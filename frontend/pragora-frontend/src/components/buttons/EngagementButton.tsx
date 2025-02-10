// components/buttons/EngagementButton.tsx
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '../../lib/utils/utils'
import { LucideIcon } from 'lucide-react'

export interface EngagementButtonProps {
  icon: LucideIcon
  count?: number
  onClick: () => void
  disabled?: boolean
  active?: boolean
  error?: boolean
  className?: string
  tooltip?: string
  variant?: 'default' | 'ghost' | 'outline' | 'primary'
  size?: 'sm' | 'md' | 'lg'
}

export const EngagementButton = React.forwardRef<HTMLButtonElement, EngagementButtonProps>(({
  icon: Icon,
  count,
  onClick,
  disabled = false,
  active = false,
  error = false,
  className,
  tooltip,
  variant = 'ghost',
  size = 'sm'
}, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // Prevent event bubbling
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg transition-all duration-200',
        'hover:bg-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-gray-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        active && 'bg-gray-100 font-semibold',
        error && 'text-red-500',
        className
      )}
    >
      <div className="flex items-center space-x-1">
        <Icon
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            active && 'scale-110',
            disabled && 'opacity-50'
          )}
        />
        {typeof count === 'number' && (
          <span className={cn(
            'text-sm',
            active && 'font-semibold',
          )}>
            {count.toLocaleString()}
          </span>
        )}
      </div>
    </Button>
  )
})

EngagementButton.displayName = 'EngagementButton'

export default EngagementButton