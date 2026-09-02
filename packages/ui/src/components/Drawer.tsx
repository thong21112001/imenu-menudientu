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
    <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      
      {position === 'bottom' ? (
        <div
          className="relative mt-auto w-full max-w-xl mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-[#e4e8e5] z-10 max-h-[85vh] flex flex-col animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3" />
          {title && (
            <div className="flex items-center justify-between px-6 pb-4 border-b border-[#e4e8e5]">
              <h3 className="text-base font-bold text-[#0d3628]">{title}</h3>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      ) : (
        <div
          className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl border-l border-[#e4e8e5] z-10 flex flex-col animate-slideLeft"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between p-5 border-b border-[#e4e8e5] bg-[#faf9f5]">
              <h3 className="text-base font-bold text-[#0d3628]">{title}</h3>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6 overflow-y-auto flex-1">{children}</div>
        </div>
      )}
    </div>
  );
};
