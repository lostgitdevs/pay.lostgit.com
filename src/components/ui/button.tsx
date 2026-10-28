'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'pill';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, isLoading = false, disabled, icon, children, ...props }, ref) => {
    const isSpinning = loading || isLoading;
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-ring cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-[#6D5EF5] hover:bg-[#5B4CE0] text-white shadow-sm shadow-[#6D5EF5]/25 border border-transparent active:scale-[0.98]',
      secondary:
        'bg-[var(--bg-surface-2)] hover:bg-[var(--bg-surface-3)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)]',
      outline:
        'bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)]',
      danger:
        'bg-[#D64545] hover:bg-[#B93838] text-white shadow-sm shadow-[#D64545]/20 border border-transparent',
      ghost:
        'bg-transparent hover:bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
      pill:
        'rounded-full bg-[#6D5EF5] hover:bg-[#5B4CE0] text-white shadow-md shadow-[#6D5EF5]/30 px-6 py-2.5 text-sm font-semibold active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-9 px-4 text-sm rounded-lg gap-2',
      lg: 'h-11 px-6 text-base rounded-xl gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-lg justify-center',
    };

    const appliedVariant = variant === 'pill' ? variants.pill : `${variants[variant]} ${sizes[size]}`;

    return (
      <button
        ref={ref}
        disabled={disabled || isSpinning}
        className={`${baseStyles} ${appliedVariant} ${className}`}
        {...props}
      >
        {isSpinning ? <Loader2 className="h-4 w-4 animate-spin text-current" /> : icon ? icon : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
