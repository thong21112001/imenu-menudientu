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
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245846]/30 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  // Strict 4px Grid Sizing: sm (32px), md (36px), lg (40px), xl (44px)
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-3.5 text-xs sm:text-sm gap-2',
    lg: 'h-10 px-4 text-sm gap-2',
    xl: 'h-11 px-5 text-sm gap-2 min-h-[44px]',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#245846] hover:bg-[#1c4537] text-[#efeae0] border border-[#1b3a2e] shadow-2xs active:bg-[#153428]',
    'fnb-primary':
      'bg-[#245846] hover:bg-[#1a4133] text-[#ede7da] border border-[#1b3a2e] focus-visible:ring-[#245846]/20 shadow-2xs active:bg-[#133026]',
    secondary:
      'bg-[#ded8cb] hover:bg-[#d0c9ba] text-[#121815] border border-[#c8c0b0] active:bg-[#c2b9a7]',
    outline:
      'bg-[#f0ece3] hover:bg-[#e4dfd4] text-[#121815] border border-[#ded8cb] active:bg-[#d9d2c4] shadow-2xs',
    ghost:
      'bg-transparent text-[#2c3b34] hover:bg-[#ded8cb]/50 hover:text-[#111815] active:bg-[#ded8cb]/80 border border-transparent',
    danger:
      'bg-[#c85a32] hover:bg-[#b04d29] text-[#efeae0] border border-[#a64522] active:bg-[#963d1e] shadow-2xs',
    amber:
      'bg-[#dfa035] hover:bg-[#c98a22] text-[#080c0a] font-semibold border border-[#b87c1c] active:bg-[#a97017] shadow-2xs',
  }[variant];

  // Inline fallback style ensures button NEVER renders with harsh white background or white text on white
  const fallbackStyles: React.CSSProperties = {
    ...(variant === 'primary' && { backgroundColor: '#245846', color: '#efeae0' }),
    ...(variant === 'fnb-primary' && { backgroundColor: '#245846', color: '#ede7da' }),
    ...(variant === 'secondary' && { backgroundColor: '#ded8cb', color: '#121815' }),
    ...(variant === 'outline' && { backgroundColor: '#f0ece3', color: '#121815' }),
    ...(variant === 'amber' && { backgroundColor: '#dfa035', color: '#080c0a' }),
    ...(variant === 'danger' && { backgroundColor: '#c85a32', color: '#efeae0' }),
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
