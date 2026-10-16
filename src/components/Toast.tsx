import React from 'react';
import { useUIStore } from '../store/useUIStore';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        let borderClass = 'border-secondary text-primary';
        let bgClass = 'bg-surface-card';
        let icon = 'info';
        let iconColor = 'text-secondary';

        if (toast.type === 'success') {
          borderClass = 'border-status-ready';
          icon = 'check_circle';
          iconColor = 'text-status-ready';
        } else if (toast.type === 'error') {
          borderClass = 'border-status-error';
          icon = 'error';
          iconColor = 'text-status-error';
        } else if (toast.type === 'warning') {
          borderClass = 'border-status-warning';
          icon = 'warning';
          iconColor = 'text-status-warning';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border-l-4 border shadow-lg flex items-start justify-between gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 ${bgClass} ${borderClass}`}
          >
            <div className="flex items-start gap-3">
              <span className={`material-symbols-outlined text-[24px] ${iconColor} flex-shrink-0 mt-0.5`}>
                {icon}
              </span>
              <div className="flex flex-col">
                <span className="font-title-md text-[14px] font-bold text-primary">
                  {toast.title}
                </span>
                {toast.message && (
                  <span className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 leading-snug">
                    {toast.message}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
