import createMiddleware from 'next-intl/middleware';

const locales = ['en', 'cs', 'de', 'ru'];
const defaultLocale = 'en';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
