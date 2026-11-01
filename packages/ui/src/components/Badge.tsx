'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'amber' | 'neutral' | 'success' | 'danger' | 'outline';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    brand: 'bg-[#245846]/15 text-[#245846] border-[#245846]/30',
    amber: 'bg-[#dfa035]/15 text-[#b87c1c] border-[#dfa035]/35',
    neutral: 'bg-[#ded8cb] text-[#2c3b34] border-[#c8c0b0]',
    success: 'bg-[#34a87a]/15 text-[#1f7050] border-[#34a87a]/30',
    danger: 'bg-[#c85a32]/15 text-[#a64522] border-[#c85a32]/30',
    outline: 'bg-transparent text-[#4a5b52] border-[#ded8cb]',
  }[variant];

  const dotColors = {
    brand: 'bg-[#245846]',
    amber: 'bg-[#dfa035]',
    neutral: 'bg-[#738379]',
    success: 'bg-[#34a87a]',
    danger: 'bg-[#c85a32]',
    outline: 'bg-[#9aa89f]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-tight border ${variantStyles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors}`} />}
      {children}
    </span>
  );
};
