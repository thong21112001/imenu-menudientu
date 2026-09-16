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

  const paddingClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2.5 text-xs sm:text-sm';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between rounded-xl border transition-all text-left cursor-pointer outline-hidden ${paddingClass} ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-[#176044] ring-2 ring-[#176044]/20 text-slate-900 shadow-xs'
            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900'
        }`}
      >
        <div className="min-w-0 flex-1 pr-2 flex items-center gap-2 truncate">
          {selectedOption ? (
            <>
              <span className="truncate font-semibold">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="shrink-0 px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 truncate">{placeholder}</span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#176044]' : ''
          }`}
        />
      </button>

      {/* Dropdown Options Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 py-1 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {options.length === 0 ? (
            <div className="px-3 py-2.5 text-xs text-slate-400 text-center">Không có lựa chọn</div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-emerald-50 text-[#176044] font-bold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{opt.label}</span>
                      {opt.badge && (
                        <span className="shrink-0 px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded text-[10px]">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.sublabel && (
                      <small className="text-[11px] text-slate-400 block truncate mt-0.5">
                        {opt.sublabel}
                      </small>
                    )}
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#176044] shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
