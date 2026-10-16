import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTranslation, type Language, type I18nKeys } from '../i18n';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  timestamp: number;
}

interface UIState {
  lang: Language;
  language: Language;
  textSize: 'sm' | 'base' | 'lg';
  highContrast: boolean;
  searchCategory: string;
  searchQuery: string;
  toasts: ToastMessage[];

  setLanguage: (lang: Language) => void;
  setTextSize: (size: 'sm' | 'base' | 'lg') => void;
  toggleContrast: () => void;
  setSearchCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  addToast: (toast: any, optionalType?: any) => void;
  removeToast: (id: string) => void;
  t: (key: I18nKeys) => string;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      lang: 'en',
      language: 'en',
      textSize: 'base',
      highContrast: false,
      searchCategory: 'All Categories',
      searchQuery: '',
      toasts: [],

      setLanguage: (lang) => {
        set({ lang, language: lang });
      },

      setTextSize: (textSize) => {
        set({ textSize });
        document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
        document.documentElement.classList.add(`text-${textSize}`);
      },

      toggleContrast: () => {
        set((state) => {
          const next = !state.highContrast;
          if (next) {
            document.documentElement.classList.add('high-contrast');
          } else {
            document.documentElement.classList.remove('high-contrast');
          }
          return { highContrast: next };
        });
      },

      setSearchCategory: (searchCategory) => set({ searchCategory }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      addToast: (toast: any, optionalType?: any) => {
        const id = Math.random().toString(36).substring(2, 9);
        let newToast: ToastMessage;
        if (typeof toast === 'string') {
          newToast = {
            id,
            title: toast,
            type: (typeof optionalType === 'string' ? optionalType : 'info') as any,
            timestamp: Date.now(),
          };
        } else {
          newToast = { ...toast, id, timestamp: Date.now() };
        }
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto remove after 5 seconds
        setTimeout(() => {
          get().removeToast(id);
        }, 5000);
      },

      removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      },

      t: (key) => {
        return getTranslation(get().lang, key);
      },
    }),
    {
      name: 'dbt_guard_ui_pref',
      partialize: (state) => ({
        lang: state.lang,
        textSize: state.textSize,
        highContrast: state.highContrast,
      }),
    }
  )
);
