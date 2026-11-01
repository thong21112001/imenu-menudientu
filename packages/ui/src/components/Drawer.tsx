'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'bottom' | 'right';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'bottom',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs">
      <div className="fixed inset-0" onClick={onClose} />

      {position === 'bottom' ? (
        <div
          className="relative mt-auto w-full max-w-xl mx-auto bg-[#f0ece3] text-[#111815] rounded-t-2xl shadow-2xl border-t border-[#ded8cb] z-10 max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-9 h-1 bg-[#c5cec7] rounded-full mx-auto my-2.5" />
          {title && (
            <div className="flex items-center justify-between px-5 pb-3 border-b border-[#ded8cb]">
              <h3 className="text-sm font-bold text-[#111815]">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 text-[#718077] hover:text-[#111815] rounded-md transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          )}
          <div className="p-5 overflow-y-auto flex-1">{children}</div>
        </div>
      ) : (
        <div
          className="relative ml-auto w-full max-w-md h-full bg-[#f0ece3] text-[#111815] shadow-2xl border-l border-[#ded8cb] z-10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-[#ded8cb] bg-[#e5dfd3]/80">
              <h3 className="text-sm font-bold text-[#111815]">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 text-[#718077] hover:text-[#111815] rounded-md transition-colors cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>
          )}
          <div className="p-5 overflow-y-auto flex-1">{children}</div>
        </div>
      )}
    </div>
  );
};
