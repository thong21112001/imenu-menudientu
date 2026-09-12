'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'amber' | 'neutral' | 'success' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  className = ''
}) => {
  const styles = {
    brand: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
  }[variant];

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wide border shadow-xs ${styles} ${className}`}>
      {children}
    </span>
  );
};
