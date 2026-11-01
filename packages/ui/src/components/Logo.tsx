'use client';

import React from 'react';

export interface LogoProps {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ light = false, size = 'md', className = '' }) => {
  const markSize =
    size === 'sm'
      ? 'w-7 h-7 rounded-md'
      : size === 'lg'
      ? 'w-9 h-9 rounded-lg'
      : 'h-8 w-8 rounded-md';

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  const textSize =
    size === 'sm'
      ? 'text-sm font-bold'
      : size === 'lg'
      ? 'text-xl font-bold'
      : 'text-base font-bold';

  return (
    <div className={`inline-flex items-center gap-2 select-none cursor-pointer ${className}`}>
      {/* Brand Icon Badge - Clean Engineered */}
      <div
        className={`grid place-items-center shrink-0 transition-colors ${markSize} ${
          light
            ? 'bg-emerald-600 text-white'
            : 'bg-emerald-700 text-white shadow-2xs'
        }`}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized Cloche Dome & Digital Waves */}
          <path
            d="M4 18H20M5 15C5 10.5817 8.58172 7 13 7C17.4183 7 21 10.5817 21 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Smart Dot */}
          <circle cx="13" cy="3.5" r="1.5" fill="currentColor" />
          {/* Digital QR Scan Corner hint */}
          <path
            d="M7 11.5H9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div className={`tracking-tight flex items-baseline ${textSize}`}>
        <span className={light ? 'text-white' : 'text-zinc-900'}>
          <span className="text-emerald-600">i</span>Menu
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 ml-1 mb-0.5" />
      </div>
    </div>
  );
};
