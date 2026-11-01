'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

export interface ToastOptions {
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
    info: (message: string, options?: ToastOptions) => void;
    warning: (message: string, options?: ToastOptions) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback nếu gọi bên ngoài provider để không crash
    return {
      showToast: (msg: string) => console.log(msg),
      success: (msg: string) => console.log('[SUCCESS]', msg),
      error: (msg: string) => console.error('[ERROR]', msg),
      info: (msg: string) => console.info('[INFO]', msg),
      warning: (msg: string) => console.warn('[WARNING]', msg),
      removeToast: () => {},
      toast: {
        success: (msg: string) => console.log('[SUCCESS]', msg),
        error: (msg: string) => console.error('[ERROR]', msg),
        info: (msg: string) => console.info('[INFO]', msg),
        warning: (msg: string) => console.warn('[WARNING]', msg),
      },
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', options?: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      const duration = options?.duration ?? 3500;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (msg: string, opt?: ToastOptions) => showToast(msg, 'success', opt),
    [showToast]
  );
  const error = useCallback(
    (msg: string, opt?: ToastOptions) => showToast(msg, 'error', opt),
    [showToast]
  );
  const info = useCallback(
    (msg: string, opt?: ToastOptions) => showToast(msg, 'info', opt),
    [showToast]
  );
  const warning = useCallback(
    (msg: string, opt?: ToastOptions) => showToast(msg, 'warning', opt),
    [showToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success,
      error,
      info,
      warning,
      removeToast,
      toast: { success, error, info, warning },
    }),
    [showToast, success, error, info, warning, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container floating bottom-right */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-xl border bg-[#f0ece3] text-[#111815] transition-all animate-slideUp ${
              t.type === 'success'
                ? 'border-[#34a87a]/40 bg-[#f0ece3]'
                : t.type === 'error'
                ? 'border-[#c85a32]/40 bg-[#f0ece3]'
                : t.type === 'warning'
                ? 'border-[#dfa035]/40 bg-[#f0ece3]'
                : 'border-[#4a7bb0]/40 bg-[#f0ece3]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#34a87a] stroke-[1.5]" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-[#c85a32] stroke-[1.5]" />}
              {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-[#dfa035] stroke-[1.5]" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-[#4a7bb0] stroke-[1.5]" />}
            </div>
            <div className="flex-1 text-xs font-medium leading-relaxed">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-[#718077] hover:text-[#111815] rounded-md hover:bg-[#ded8cb] transition-colors cursor-pointer"
              aria-label="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const Toast: React.FC<{ message: string; type?: ToastType; onClose?: () => void }> = ({
  message,
  type = 'success',
  onClose,
}) => {
  return (
    <div
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl shadow-xl border bg-[#f0ece3] text-[#111815] ${
        type === 'success'
          ? 'border-[#34a87a]/40'
          : type === 'error'
          ? 'border-[#c85a32]/40'
          : 'border-[#4a7bb0]/40'
      }`}
    >
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#34a87a] stroke-[1.5]" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 text-[#c85a32] stroke-[1.5]" />}
      {type === 'info' && <Info className="w-4 h-4 text-[#4a7bb0] stroke-[1.5]" />}
      <span className="text-xs font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 text-[#718077] hover:text-[#111815] cursor-pointer">
          <X className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      )}
    </div>
  );
};
