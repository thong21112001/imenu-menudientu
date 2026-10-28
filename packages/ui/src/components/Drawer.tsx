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
    <div className="fixed inset-0 z-50 flex bg-black/40">
      <div className="fixed inset-0" onClick={onClose} />

      {position === 'bottom' ? (
        <div
          className="relative mt-auto w-full max-w-xl mx-auto bg-white rounded-t-xl shadow-lg border-t border-zinc-200/90 z-10 max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-8 h-1 bg-zinc-300 rounded-full mx-auto my-2.5" />
          {title && (
            <div className="flex items-center justify-between px-5 pb-3 border-b border-zinc-200/80">
              <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md transition-colors cursor-pointer"
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
          className="relative ml-auto w-full max-w-md h-full bg-white shadow-lg border-l border-zinc-200/90 z-10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-zinc-200/80 bg-zinc-50/60">
              <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-md transition-colors cursor-pointer"
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
