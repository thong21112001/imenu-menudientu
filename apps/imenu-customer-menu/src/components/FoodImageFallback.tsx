'use client';

import React, { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface FoodImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatioClass?: string;
}

export const FoodImageFallback: React.FC<FoodImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatioClass = 'aspect-4/3',
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full ${aspectRatioClass} bg-[#F4F1EA] text-[#8C8D82] flex flex-col items-center justify-center p-3 select-none ${className}`}
        aria-label={alt}
      >
        <div className="w-10 h-10 rounded-full bg-[#EAE5DA] flex items-center justify-center mb-1 text-[#647B62]">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-medium tracking-tight text-[#7A7B70] text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`w-full h-full object-cover transition-opacity duration-300 ${className}`}
    />
  );
};

