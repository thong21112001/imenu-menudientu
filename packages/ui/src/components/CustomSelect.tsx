'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '-- Chọn --',
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const heightClass = size === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-xs sm:text-sm';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between rounded-md border transition-colors duration-150 text-left cursor-pointer outline-hidden ${heightClass} ${
          disabled
            ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-emerald-700 ring-2 ring-emerald-700/10 text-zinc-900 shadow-2xs'
            : 'bg-white border-zinc-200/90 hover:border-zinc-300 text-zinc-900'
        }`}
      >
        <div className="min-w-0 flex-1 pr-2 flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              <span className="truncate font-medium">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="shrink-0 px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 font-semibold rounded text-[10px]">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-zinc-400 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-emerald-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Options Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-md border border-zinc-200 py-1 z-50 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-zinc-400 text-center">Không có lựa chọn</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors duration-150 cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-zinc-100/70 text-zinc-700 font-normal'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="shrink-0 px-1.5 py-0.2 bg-amber-50 text-amber-900 border border-amber-200 font-semibold rounded text-[10px]">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.sublabel && (
                      <small className="text-[11px] text-zinc-400 block truncate mt-0.5">
                        {opt.sublabel}
                      </small>
                    )}
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
