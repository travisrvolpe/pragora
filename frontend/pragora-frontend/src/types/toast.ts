// types/toast.ts
import { ReactNode } from 'react';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}