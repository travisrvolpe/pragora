// applib/hooks/use-toast/types.ts
import { ReactNode } from 'react'

export type ToastActionElement = ReactNode

export interface ToasterToast {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: 'default' | 'destructive'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface State {
  toasts: ToasterToast[]
}