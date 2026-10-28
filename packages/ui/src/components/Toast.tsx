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
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, options?.duration ?? 3500);
    },
    [removeToast],
  );

  const success = useCallback(
    (msg: string, options?: ToastOptions) => showToast(msg, 'success', options),
    [showToast],
  );
  const error = useCallback(
    (msg: string, options?: ToastOptions) => showToast(msg, 'error', options),
    [showToast],
  );
  const info = useCallback(
    (msg: string, options?: ToastOptions) => showToast(msg, 'info', options),
    [showToast],
  );
  const warning = useCallback(
    (msg: string, options?: ToastOptions) => showToast(msg, 'warning', options),
    [showToast],
  );

  const toastObj = useMemo(
    () => ({
      success,
      error,
      info,
      warning,
    }),
    [success, error, info, warning],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast, toast: toastObj }}>
      {children}
      {/* Toast Container - Sonner Style Hairline */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg shadow-md border bg-white text-zinc-900 transition-colors ${
              t.type === 'success'
                ? 'border-emerald-200'
                : t.type === 'error'
                ? 'border-rose-200'
                : t.type === 'warning'
                ? 'border-amber-200'
                : 'border-blue-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[1.5]" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 stroke-[1.5]" />}
              {t.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 stroke-[1.5]" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-blue-600 stroke-[1.5]" />}
            </div>
            <div className="flex-1 text-xs font-medium leading-relaxed">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-zinc-400 hover:text-zinc-600 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
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
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg shadow-md border bg-white ${
        type === 'success'
          ? 'border-emerald-200 text-zinc-900'
          : type === 'error'
          ? 'border-rose-200 text-zinc-900'
          : 'border-blue-200 text-zinc-900'
      }`}
    >
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[1.5]" />}
      {type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 stroke-[1.5]" />}
      {type === 'info' && <Info className="w-4 h-4 text-blue-600 stroke-[1.5]" />}
      <span className="text-xs font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer">
          <X className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>
      )}
    </div>
  );
};
