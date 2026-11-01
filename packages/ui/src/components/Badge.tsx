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
    brand: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/80',
    neutral: 'bg-zinc-100 text-zinc-800 border-zinc-200/80',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    outline: 'bg-transparent text-zinc-700 border-zinc-200',
  }[variant];

  const dotColors = {
    brand: 'bg-emerald-600',
    amber: 'bg-amber-600',
    neutral: 'bg-zinc-500',
    success: 'bg-emerald-600',
    danger: 'bg-rose-600',
    outline: 'bg-zinc-400',
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
