import createMiddleware from 'next-intl/middleware';
import { SUPPORTED_LOCALES, FALLBACK_LOCALE } from './src/i18n/i18n.config';

export default createMiddleware({
  locales: SUPPORTED_LOCALES as unknown as string[],
  defaultLocale: FALLBACK_LOCALE,
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
