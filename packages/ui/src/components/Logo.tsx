'use client';

import React from 'react';

interface LogoProps {
  light?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ light = false, size = 'md', className = '' }) => {
  const markSize = size === 'sm' ? 'w-6 h-6 text-sm rounded-md' : size === 'lg' ? 'w-10 h-10 text-xl rounded-xl' : 'w-8 h-8 text-base rounded-lg';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className={`inline-flex items-center gap-2.5 font-extrabold select-none ${className}`}>
      <span
        className={`grid place-items-center font-serif font-bold shadow-sm transition-transform hover:scale-105 ${markSize} ${
          light
            ? 'bg-amber-400 text-slate-900 ring-2 ring-white/20'
            : 'bg-[#124a36] text-white ring-1 ring-black/10'
        }`}
      >
        i
      </span>
      <span className={`font-sans tracking-tight ${textSize} ${light ? 'text-white' : 'text-[#0d3628]'}`}>
        iMenu<span className="text-[#eab867] ml-0.5">.</span>
      </span>
    </div>
  );
};
