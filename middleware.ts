import createMiddleware from 'next-intl/middleware';
import { locales, DEFAULT_LOCALE } from './i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: DEFAULT_LOCALE,

  // Always use locale prefix
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
