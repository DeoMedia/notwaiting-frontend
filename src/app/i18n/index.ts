import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './en';
import { fr } from './fr';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    // React already escapes children when rendering interpolated values
    // as text. Keeping i18next's escaping on too gives us defence-in-depth
    // if a future change ever pipes a translation through dangerouslySetInnerHTML.
    interpolation: { escapeValue: true },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'nw_lang',
      caches: ['localStorage'],
    },
    returnObjects: true,
  });

export default i18n;
