// types/buttons.ts
import { LucideIcon } from 'lucide-react'
import { PostVariant } from './posts/component-types'
export type ButtonVariant = 'default' | 'ghost' | 'outline' | 'primary' | PostVariant


export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  icon?: LucideIcon
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg' //size?: ButtonSize;
  tooltip?: string
  isLoading?: boolean
}
export interface EngagementButtonProps {
  count: number;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  active?: boolean;
  error?: boolean;
  className?: string;
}

export interface NetworkButtonProps extends Omit<BaseButtonProps, 'type'> {
  userId: string;
  networkAction: 'accept' | 'ignore' | 'request' | 'message';
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface NavigationButtonProps extends Omit<BaseButtonProps, 'onClick'> {
  href?: string;
  navigate?: () => void;
}

export interface ActionButtonProps extends BaseButtonProps {
  isLoading?: boolean;
  isActive?: boolean;
  isError?: boolean;
}