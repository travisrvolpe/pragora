// components/ui/button.tsx
'use client'

import * as React from "react"
import { cn } from '@/applib/utils/utils'
import { LucideIcon } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  icon?: LucideIcon
  variant?: 'default' | 'ghost' | 'outline' | 'primary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  tooltip?: string
  isLoading?: boolean
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  label,
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
  variant = 'default',
  size = 'md',
  tooltip,
  isLoading = false,
  children,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variantStyles = {
    default: 'bg-slate-900 text-white hover:bg-slate-800',
    ghost: 'hover:bg-slate-100 hover:text-slate-900',
    outline: 'border border-slate-200 hover:bg-slate-100',
    primary: 'bg-primary text-white hover:bg-primary-dark',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-400'
  }

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-11 px-8 text-lg'
  }

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        isLoading && 'opacity-70 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled || isLoading}
      title={tooltip}
      type="button"
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{label || children}</span>
        </div>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {label}
          {children}
        </>
      )}
    </button>
  )
})

Button.displayName = "Button"

export default Button