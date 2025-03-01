// components/buttons/EngagementButton.tsx
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/applib/utils/utils'
import { LucideIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

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

  const [isProcessing, setIsProcessing] = useState(false);

  // Log when props change
  useEffect(() => {
    console.log(`EngagementButton state - active: ${active}, disabled: ${disabled}, count: ${count}`);
  }, [active, disabled, count]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled || isProcessing) return;

    console.log(`EngagementButton clicked - active before: ${active}`);

    try {
      setIsProcessing(true);
      await onClick();
      console.log(`EngagementButton action completed`);
    } catch (err) {
      console.error('Button action failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      title={tooltip}
      className={cn(
        'flex items-center gap-1 rounded-lg transition-all duration-200',
        'hover:bg-opacity-10',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isProcessing && 'opacity-50 cursor-not-allowed',
        className  // Move className up to take priority over default styles
      )}
    >
      <div className="flex items-center space-x-1">
        <Icon
          className={cn(
            'w-4 h-4 transition-colors duration-200',
            active && 'fill-current'
          )}
        />
        {typeof count === 'number' && (
          <span className={cn(
            'text-sm transition-colors duration-200',
            active && 'font-semibold'
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