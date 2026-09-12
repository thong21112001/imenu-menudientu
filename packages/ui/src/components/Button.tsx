'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
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
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }[size];

  const variantStyles = {
    primary: 'bg-[#124a36] hover:bg-[#09271d] text-white font-bold border border-[#124a36] hover:border-[#09271d] shadow-md shadow-[#124a36]/25 focus:ring-[#176044] active:bg-[#071f17]',
    secondary: 'bg-[#e8f5ee] text-[#124a36] hover:bg-[#124a36] hover:text-white border-2 border-[#176044]/35 hover:border-[#124a36] font-bold shadow-sm focus:ring-[#176044]',
    outline: 'border-2 border-slate-300 text-slate-800 bg-white hover:bg-[#f0f7f4] hover:text-[#124a36] hover:border-[#124a36] font-bold shadow-sm focus:ring-[#176044]',
    ghost: 'text-slate-700 hover:bg-slate-100 hover:text-[#124a36] font-semibold',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-bold border border-rose-700 shadow-sm shadow-rose-600/20 focus:ring-rose-500',
    amber: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#09271d] font-extrabold border border-amber-600 shadow-md shadow-amber-500/25 focus:ring-amber-500',
  }[variant];

  // Inline fallback style ensures button NEVER renders with invisible white background or white text on white
  const fallbackStyles: React.CSSProperties = {
    ...(variant === 'primary' && { backgroundColor: '#124a36', color: '#ffffff' }),
    ...(variant === 'secondary' && { backgroundColor: '#e8f5ee', color: '#124a36' }),
    ...(variant === 'outline' && { backgroundColor: '#ffffff', color: '#1e2924' }),
    ...(variant === 'amber' && { backgroundColor: '#f59e0b', color: '#09271d' }),
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
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
