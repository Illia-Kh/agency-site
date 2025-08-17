import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'cs', 'de', 'ru'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    return {
      locale: 'en',
      messages: (await import('./messages/en.json')).default,
    };
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
