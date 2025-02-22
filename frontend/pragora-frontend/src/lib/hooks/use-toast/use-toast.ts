// use-toast.ts
import { useState, useEffect } from 'react';
import { Toast, ToastProps, ActionType } from './types';
import { genId, dispatch, memoryState, listeners } from './store';

export function toast({ ...props }: Toast) {
  const id = genId();

  const ENGAGEMENT_TOAST_DELAY = 3000;

  const update = (props: ToastProps) =>
    dispatch({
      type: ActionType.UPDATE_TOAST,
      toast: { ...props, id },
    });

  const dismiss = () => dispatch({
    type: ActionType.DISMISS_TOAST,
    toastId: id
  });

  dispatch({
    type: ActionType.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      duration: ENGAGEMENT_TOAST_DELAY,
      onOpenChange: (open: boolean) => {
        if (!open) {
          setTimeout(() => {
            dispatch({
              type: ActionType.REMOVE_TOAST,
              toastId: id,
            });
          }, 300);
        }
      },
    },
  });

  return {
    id,
    dismiss: () => dispatch({ type: ActionType.DISMISS_TOAST, toastId: id }),
  };
}

export function useToast() {
  const [state, setState] = useState(memoryState);

  useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({
      type: ActionType.DISMISS_TOAST,
      toastId
    }),
  };
}