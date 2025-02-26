// components/buttons/ReportButton.tsx
// TODO FOR PRODUCTION CREATE CUSTOM COMPONENTS USING shadcn UI components OR Radix UI Primitives
//import {
//  Dialog,
//  DialogContent,
//  DialogDescription,
 // DialogFooter,
 // DialogHeader,
 // DialogTitle,
 // DialogTrigger,
//} from '@/components/ui/dialog'
//import { Textarea } from '@/components/ui/textarea'

'use client'

import * as React from 'react'
import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '../../lib/utils/utils'

interface ReportButtonProps {
  onReport: (reason: string) => Promise<void>
  disabled?: boolean
  className?: string
  variant?: 'default' | 'ghost' | 'outline' | 'primary'
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
      // Enhanced prompt that guides the user better
      const reason = window.prompt(
        'Report Content\n\nPlease provide a detailed reason for reporting this content. Your report will be reviewed by moderators.'
      )

      if (reason && reason.trim()) {
        // Show loading state or feedback if needed
        await onReport(reason.trim())
        // Show success message if needed
        alert('Thank you for your report. Our team will review it shortly.')
      }
    } catch (err) {
      console.error('Error handling report:', err)
      // Show error message
      alert('Sorry, there was an error submitting your report. Please try again.')
    }
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'text-red-600 hover:text-red-700',
        className
      )}
    >
      <Flag className="h-4 w-4 mr-1" />
      <span>Report</span>
    </Button>
  )
})

ReportButton.displayName = 'ReportButton'

export default ReportButton