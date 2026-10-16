import React from 'react';
import { useUIStore } from '../store/useUIStore';

export const PrototypeBanner: React.FC = () => {
  const { t } = useUIStore();

  return (
    <div
      className="bg-disclaimer-banner-bg border-y border-disclaimer-banner-border text-disclaimer-banner-text font-body-sm text-body-sm py-2 px-gutter flex-shrink-0"
      role="alert"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-space-xs font-semibold">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-status-warning flex-shrink-0 text-[20px]">
            warning
          </span>
          <span>{t('prototypeDisclaimer')}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="bg-surface-card border border-disclaimer-banner-border px-2.5 py-0.5 rounded-full font-label-sm text-label-sm uppercase font-bold text-disclaimer-banner-text shadow-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-accent-green">
              verified_user
            </span>
            <span>{t('gigwCompliance')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
