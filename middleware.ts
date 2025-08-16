import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'cs', 'de', 'ru'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use locale prefix
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames  
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
