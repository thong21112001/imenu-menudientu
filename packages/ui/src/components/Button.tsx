'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber' | 'fnb-primary';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/20 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  // Strict 4px Grid Sizing: sm (32px), md (36px), lg (40px), xl (44px)
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-xs sm:text-sm gap-2',
    lg: 'h-10 px-4 text-sm gap-2',
    xl: 'h-11 px-5 text-sm gap-2 min-h-[44px]',
  }[size];

  const variantStyles = {
    primary:
      'bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-800/80 shadow-2xs active:bg-emerald-900',
    'fnb-primary':
      'bg-[#244B3C] hover:bg-[#17382D] text-white border border-[#17382D] focus-visible:ring-[#244B3C]/20 shadow-2xs active:bg-[#122c23]',
    secondary:
      'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border border-zinc-200 active:bg-zinc-200',
    outline:
      'bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200/90 active:bg-zinc-100 shadow-2xs',
    ghost:
      'bg-transparent text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200/70 border border-transparent',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border border-rose-700 active:bg-rose-800 shadow-2xs',
    amber:
      'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-semibold border border-amber-600 active:bg-amber-700 shadow-2xs',
  }[variant];

  // Inline fallback style ensures button NEVER renders with invisible white background or white text on white
  const fallbackStyles: React.CSSProperties = {
    ...(variant === 'primary' && { backgroundColor: '#047857', color: '#ffffff' }),
    ...(variant === 'fnb-primary' && { backgroundColor: '#244B3C', color: '#ffffff' }),
    ...(variant === 'secondary' && { backgroundColor: '#f4f4f5', color: '#18181b' }),
    ...(variant === 'outline' && { backgroundColor: '#ffffff', color: '#18181b' }),
    ...(variant === 'amber' && { backgroundColor: '#f59e0b', color: '#09090b' }),
    ...(variant === 'danger' && { backgroundColor: '#e11d48', color: '#ffffff' }),
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      style={fallbackStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0 flex items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
