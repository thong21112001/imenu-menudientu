'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-zinc-200/80 p-4 transition-colors duration-150 ${
        hoverable ? 'hover:border-zinc-300 hover:bg-zinc-50/50' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
