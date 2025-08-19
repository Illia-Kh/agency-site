import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'cs', 'de', 'ru'] as const;

// Exported constants and utilities
export const DEFAULT_LOCALE = 'en';
export { locales };

export type Locale = (typeof locales)[number];

export function isSupportedLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// Message map for static message loading
export const messagesMap = {
  en: () => import('./messages/en.json').then(m => m.default),
  cs: () => import('./messages/cs.json').then(m => m.default),
  de: () => import('./messages/de.json').then(m => m.default),
  ru: () => import('./messages/ru.json').then(m => m.default),
} as const;

export default getRequestConfig(async ({ locale }) => {
  // Handle case where locale is undefined by falling back to default locale
  const validLocale = locale || 'en';

  // Validate the locale (fallback to 'en' if invalid)
  const finalLocale = isSupportedLocale(validLocale) ? validLocale : 'en';

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default,
  };
});
