import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'cs', 'de', 'ru'];

export default getRequestConfig(async ({ locale }) => {
  // Handle case where locale is undefined by falling back to default locale
  const validLocale = locale || 'en';

  // Validate the locale (fallback to 'en' if invalid)
  const finalLocale = locales.includes(validLocale) ? validLocale : 'en';

  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default,
  };
});
