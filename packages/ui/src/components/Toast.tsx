'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
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
      removeToast: () => {},
      toast: {
        success: (msg: string) => console.log('[SUCCESS]', msg),
        error: (msg: string) => console.error('[ERROR]', msg),
        info: (msg: string) => console.info('[INFO]', msg),
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
    (message: string, type: ToastType = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast],
  );

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  const toastObj = useMemo(
    () => ({
      success,
      error,
      info,
    }),
    [success, error, info]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, removeToast, toast: toastObj }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-top-3 fade-in duration-200 ${
              t.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-slate-800'
                : t.type === 'error'
                ? 'bg-white/95 border-rose-200 text-slate-800'
                : 'bg-white/95 border-blue-200 text-slate-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-4.5 h-4.5 text-rose-600" />}
              {t.type === 'info' && <Info className="w-4.5 h-4.5 text-blue-600" />}
            </div>
            <div className="flex-1 text-xs font-semibold leading-relaxed">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
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
      className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border bg-white ${
        type === 'success'
          ? 'border-emerald-200 text-slate-800'
          : type === 'error'
          ? 'border-rose-200 text-slate-800'
          : 'border-blue-200 text-slate-800'
      }`}
    >
      {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
      {type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
      <span className="text-xs font-semibold">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
