import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'cs', 'de', 'ru'];

// Export constants for use in other modules
export const DEFAULT_LOCALE = 'en';
export const isSupportedLocale = (locale: string): boolean => locales.includes(locale);
export { locales };

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
