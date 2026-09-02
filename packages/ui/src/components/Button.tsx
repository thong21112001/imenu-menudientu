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
    primary: 'bg-[#124a36] hover:bg-[#176044] text-white shadow-md hover:shadow-lg focus:ring-[#176044]',
    secondary: 'bg-[#edf6f1] text-[#176044] hover:bg-[#ddf4e8] border border-[#d9ece3] focus:ring-[#176044]',
    outline: 'border border-[#b8cbc2] text-[#124a36] bg-white hover:bg-[#f0f7f3] focus:ring-[#124a36]',
    ghost: 'text-[#4a5852] hover:bg-[#eef5f1] hover:text-[#124a36]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    amber: 'bg-[#eab867] hover:bg-[#f0c574] text-[#17211d] font-bold shadow-md focus:ring-[#eab867]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
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
