import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { useAuthStore } from '../store/useAuthStore';

interface UtilityStripProps {
  onResetDemo?: () => void;
}

export const UtilityStrip: React.FC<UtilityStripProps> = ({ onResetDemo }) => {
  const { lang, textSize, highContrast, setLanguage, setTextSize, toggleContrast, t } = useUIStore();
  const { currentUser } = useAuthStore();

  return (
    <div className="bg-primary-container text-on-primary w-full border-b border-primary/20 flex-shrink-0 z-50">
      <div className="max-w-7xl mx-auto px-gutter flex flex-wrap items-center justify-between h-10 font-label-sm text-label-sm">
        {/* Left Accessibility Tools */}
        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs text-on-primary/80">
            <a
              href="#main-content"
              className="hover:text-on-primary hover:underline transition-colors font-medium"
            >
              {t('skipToContent')}
            </a>
            <span className="text-on-primary/40">|</span>
            <span className="hidden sm:inline text-on-primary/90 font-medium">
              {t('govtTitle')}
            </span>
          </div>

          <span className="text-on-primary/40 hidden md:inline">|</span>

          {/* Text Resize Controls */}
          <div className="flex items-center gap-1 text-on-primary/90">
            <span className="text-on-primary/60 mr-1 hidden sm:inline">{t('textSize')}</span>
            <button
              type="button"
              onClick={() => setTextSize('sm')}
              className={`px-1.5 py-0.5 rounded transition-colors text-on-primary font-bold ${
                textSize === 'sm' ? 'bg-secondary' : 'bg-primary/60 hover:bg-surface-tint'
              }`}
              title="Small text"
            >
              A-
            </button>
            <button
              type="button"
              onClick={() => setTextSize('base')}
              className={`px-1.5 py-0.5 rounded transition-colors text-on-primary font-bold ${
                textSize === 'base' ? 'bg-secondary' : 'bg-primary/60 hover:bg-surface-tint'
              }`}
              title="Normal text"
            >
              A
            </button>
            <button
              type="button"
              onClick={() => setTextSize('lg')}
              className={`px-1.5 py-0.5 rounded transition-colors text-on-primary font-bold ${
                textSize === 'lg' ? 'bg-secondary' : 'bg-primary/60 hover:bg-surface-tint'
              }`}
              title="Large text"
            >
              A+
            </button>
          </div>

          <span className="text-on-primary/40">|</span>

          {/* Contrast Toggle */}
          <button
            type="button"
            onClick={toggleContrast}
            className={`px-2 py-0.5 rounded hover:bg-primary transition-colors flex items-center gap-1 text-on-primary font-medium ${
              highContrast ? 'bg-accent-saffron text-primary font-bold' : ''
            }`}
            title="Toggle High Contrast"
          >
            <span className="material-symbols-outlined text-[14px]">contrast</span>
            <span>{t('contrast')}</span>
          </button>

          <span className="text-on-primary/40">|</span>

          {/* English / Malayalam Toggle */}
          <div className="flex items-center rounded overflow-hidden border border-on-primary/30">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 font-bold text-xs transition-colors ${
                lang === 'en'
                  ? 'bg-accent-saffron text-primary'
                  : 'bg-primary-container text-on-primary hover:bg-primary'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ml')}
              className={`px-2 py-0.5 font-bold text-xs transition-colors ${
                lang === 'ml'
                  ? 'bg-accent-saffron text-primary'
                  : 'bg-primary-container text-on-primary hover:bg-primary'
              }`}
            >
              മലയാളം
            </button>
          </div>
        </div>

        {/* Right Info & Reset Demo */}
        <div className="flex items-center gap-space-sm">
          {onResetDemo && (
            <button
              type="button"
              onClick={onResetDemo}
              className="text-accent-saffron hover:text-white border border-accent-saffron/40 hover:bg-accent-saffron/20 px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1"
              title="Reset all simulation data to clean initial state"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>{t('resetDemo')}</span>
            </button>
          )}

          <span className="hidden xl:inline text-on-primary/80 font-body-sm text-body-sm">
            {currentUser.office}
          </span>
          <span className="bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {currentUser.badge}
          </span>

          <button
            type="button"
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            className="text-on-primary/90 hover:text-white hover:bg-white/10 px-2 py-0.5 rounded transition-colors flex items-center gap-1 font-bold text-[11px] uppercase tracking-wider border border-white/20"
            title="Secure Logout from Officer Portal"
          >
            <span className="material-symbols-outlined text-[13px]">logout</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
