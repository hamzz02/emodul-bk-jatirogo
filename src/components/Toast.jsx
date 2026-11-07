import { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastContext } from '../context/ToastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 md:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-top-2 ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                : toast.type === 'error'
                ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                : 'bg-blue-50/95 border-blue-200 text-blue-900'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="shrink-0 text-emerald-600 mt-0.5" size={20} />}
            {toast.type === 'error' && <AlertCircle className="shrink-0 text-rose-600 mt-0.5" size={20} />}
            {toast.type === 'info' && <Info className="shrink-0 text-blue-600 mt-0.5" size={20} />}
            
            <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md hover:bg-black/5 transition text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
