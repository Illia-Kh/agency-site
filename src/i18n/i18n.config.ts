export const SUPPORTED_LOCALES = ['en', 'cs', 'de', 'ru'] as const;
export const FALLBACK_LOCALE = 'en';
export type Locale = (typeof SUPPORTED_LOCALES)[number];
