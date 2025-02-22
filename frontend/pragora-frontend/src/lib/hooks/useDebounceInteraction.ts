// hooks/useDebounceInteraction.ts
import { useCallback, useRef } from 'react';

export function useDebounceInteraction(delay = 500) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isProcessingRef = useRef(false);

  const debounce = useCallback(async (fn: () => Promise<void>) => {
    if (isProcessingRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      isProcessingRef.current = true;
      await fn();
    } finally {
      isProcessingRef.current = false;
      timeoutRef.current = setTimeout(() => {
        isProcessingRef.current = false;
      }, delay);
    }
  }, [delay]);

  return debounce;
}