'use client';

import React from 'react';

interface LogoProps {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ light = false, size = 'md', className = '' }) => {
  const markSize =
    size === 'sm'
      ? 'w-7 h-7 rounded-lg'
      : size === 'lg'
      ? 'w-10 h-10 rounded-xl'
      : 'w-9 h-9 rounded-xl';

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  const textSize =
    size === 'sm'
      ? 'text-base font-bold'
      : size === 'lg'
      ? 'text-2xl font-black'
      : 'text-xl font-extrabold';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* Brand Icon Badge */}
      <div
        className={`relative grid place-items-center shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${markSize} ${
          light
            ? 'bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300 text-slate-950 shadow-emerald-900/40 ring-1 ring-white/25'
            : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-emerald-700/25 ring-1 ring-emerald-600/20'
        }`}
      >
        {/* Modern Dining & QR Wave SVG Icon */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:rotate-6"
        >
          {/* Stylized Cloche Dome & Digital Waves */}
          <path
            d="M4 18H20M5 15C5 10.5817 8.58172 7 13 7C17.4183 7 21 10.5817 21 15"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Smart Dot / Steam Sparkle */}
          <circle cx="13" cy="3.5" r="1.75" fill={light ? '#0f172a' : '#ffffff'} />
          {/* Center Smart Dining Accent Indicator */}
          <circle cx="13" cy="11.5" r="1.5" fill={light ? '#065f46' : '#fde047'} />
          {/* Digital QR Scan Corner hint */}
          <path
            d="M7 11.5H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Subtle glass reflection highlight */}
        <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
      </div>

      {/* Brand Text */}
      <div className={`tracking-tight flex items-baseline ${textSize}`}>
        <span className={light ? 'text-white' : 'text-slate-900'}>
          <span className="text-emerald-500 font-extrabold">i</span>Menu
        </span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 ml-1 mb-0.5 shadow-sm shadow-amber-400/50" />
      </div>
    </div>
  );
};
