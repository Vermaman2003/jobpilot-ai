import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full whitespace-nowrap';

  const variants = {
    primary: 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-700/50',
    danger: 'bg-rose-950/80 text-rose-300 border border-rose-700/50',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    outline: 'border border-slate-700 text-slate-400',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} {...props}>
      {children}
    </span>
  );
};
