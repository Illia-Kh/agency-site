import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'cs', 'de', 'ru'];
export const DEFAULT_LOCALE = 'en';

// Utility function to check if a locale is supported
export const isSupportedLocale = (locale: string): boolean => {
  return locales.includes(locale);
};

export default getRequestConfig(async ({ locale }) => {
  // Handle case where locale is undefined by falling back to default locale
  const validLocale = locale || DEFAULT_LOCALE;

  // Validate the locale (fallback to DEFAULT_LOCALE if invalid)
  const finalLocale = isSupportedLocale(validLocale) ? validLocale : DEFAULT_LOCALE;

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default,
  };
});
