// src/types/buttons.ts
import { ButtonHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: LucideIcon;
  tooltip?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
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

export interface NavigationButtonProps extends BaseButtonProps {
  to?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}