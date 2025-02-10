// components/buttons/ReportButton.tsx
'use client'

import * as React from 'react'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '../../lib/utils/utils'

interface ReportButtonProps {
  onReport: (reason: string) => Promise<void>
  disabled?: boolean
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const ReportButton = React.forwardRef<HTMLButtonElement, ReportButtonProps>(({
  onReport,
  disabled = false,
  className,
  variant = 'ghost',
  size = 'sm'
}, ref) => {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    try {
      const reason = window.prompt('Please provide a reason for reporting this content:')
      if (reason) {
        await onReport(reason)
      }
    } catch (err) {
      console.error('Error handling report:', err)
    }
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      icon={Flag}
      label="Report"
      tooltip="Report this content"
      className={cn(
        'text-red-600 hover:text-red-700',
        className
      )}
    />
  )
})

ReportButton.displayName = 'ReportButton'

export default ReportButton