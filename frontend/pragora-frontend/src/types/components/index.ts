// types/components/index.ts

import type { ReactNode, HTMLAttributes } from 'react';


export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface BaseButtonProps {
  // ... any button specific props
}