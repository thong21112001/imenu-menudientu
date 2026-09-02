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
    brand: 'bg-[#edf6f1] text-[#176044] border-[#d9ece3]',
    amber: 'bg-[#fff2dc] text-[#a66d12] border-[#fae1b8]',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
  }[variant];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}>
      {children}
    </span>
  );
};
