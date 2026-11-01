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
        className={`w-full flex items-center justify-between rounded-lg border transition-colors duration-150 text-left cursor-pointer outline-hidden ${heightClass} ${
          disabled
            ? 'bg-[#ded8cb] border-[#c5cec7] text-[#9aa89f] cursor-not-allowed'
            : isOpen
            ? 'bg-[#f0ece3] border-[#245846] ring-2 ring-[#245846]/15 text-[#111815] shadow-2xs'
            : 'bg-[#f0ece3] border-[#ded8cb] hover:border-[#c5cec7] text-[#111815]'
        }`}
      >
        <div className="min-w-0 flex-1 pr-2 flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              <span className="truncate font-medium">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="shrink-0 px-1.5 py-0.5 bg-[#dfa035]/15 text-[#b87c1c] border border-[#dfa035]/30 font-semibold rounded text-[10px]">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-[#738379] truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#738379] shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#245846]' : ''
          }`}
        />
      </button>

      {/* Dropdown Options Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-[#f0ece3] text-[#111815] rounded-xl shadow-xl border border-[#ded8cb] py-1 z-50 max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[#738379] text-center">Không có lựa chọn</div>
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
                      ? 'bg-[#ded8cb] text-[#111815] font-semibold'
                      : 'hover:bg-[#e5dfd3] text-[#2c3b34]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="truncate">{opt.label}</div>
                    {opt.sublabel && <div className="text-[10px] text-[#738379] truncate mt-0.5">{opt.sublabel}</div>}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {opt.badge && (
                      <span className="px-1.5 py-0.2 bg-[#dfa035]/15 text-[#b87c1c] border border-[#dfa035]/30 rounded text-[9px] font-semibold">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#245846] shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
