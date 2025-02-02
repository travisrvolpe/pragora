// src/components/buttons/button.tsx
import React, { ButtonHTMLAttributes } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  label,
  icon: Icon,
  onClick,
  className = "",
  disabled = false,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        "button",
        "inline-flex items-center justify-center",
        "rounded-md font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        {
          'bg-slate-900 text-white hover:bg-slate-800': variant === 'default',
          'hover:bg-slate-100 hover:text-slate-900': variant === 'ghost',
          'border border-slate-200 hover:bg-slate-100': variant === 'outline',
        },
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-base': size === 'md',
          'h-11 px-8 text-lg': size === 'lg',
        },
        className
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {label}
      {children}
    </button>
  );
};

export default Button;