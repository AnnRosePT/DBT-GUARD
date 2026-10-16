import { en } from './en';
import { ml } from './ml';

export type Language = 'en' | 'ml';
export type I18nKeys = keyof typeof en;

export const translations = {
  en,
  ml,
};

export function getTranslation(lang: Language, key: I18nKeys): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
