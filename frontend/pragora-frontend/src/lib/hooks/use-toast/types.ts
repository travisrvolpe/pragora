// types.ts
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

export interface ToastState {
  toasts: ToastProps[];
}

export type Toast = Omit<ToastProps, "id">;

export const enum ActionType {
  ADD_TOAST = "ADD_TOAST",
  UPDATE_TOAST = "UPDATE_TOAST",
  DISMISS_TOAST = "DISMISS_TOAST",
  REMOVE_TOAST = "REMOVE_TOAST",
}

export type ToastAction =
  | {
      type: ActionType.ADD_TOAST;
      toast: ToastProps;
    }
  | {
      type: ActionType.UPDATE_TOAST;
      toast: Partial<ToastProps>;
    }
  | {
      type: ActionType.DISMISS_TOAST;
      toastId?: string;
    }
  | {
      type: ActionType.REMOVE_TOAST;
      toastId?: string;
    };