import type { Locale } from './i18n.config';
import { SUPPORTED_LOCALES, FALLBACK_LOCALE } from './i18n.config';

const cache = new Map<string, any>();

function isSupported(l: string): l is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(l);
}

export function normalizeLocale(raw?: string): Locale {
  if (!raw) return FALLBACK_LOCALE;
  const base = raw.split('-')[0];
  return isSupported(base) ? (base as Locale) : FALLBACK_LOCALE;
}

async function importNamespace(
  locale: Locale,
  namespace: string
): Promise<any> {
  const key = `${locale}:${namespace}`;
  if (cache.has(key)) return cache.get(key);
  const mod = await import(`../messages/${locale}/${namespace}.json`).catch(
    async err => {
      if (locale !== FALLBACK_LOCALE) {
        return importNamespace(FALLBACK_LOCALE, namespace);
      }
      throw err;
    }
  );
  const data = mod.default;
  cache.set(key, data);
  return data;
}

// TODO: перечисли актуальные namespaces проекта
const NAMESPACES = ['common', 'nav', 'home'] as const;

export async function loadAllMessages(localeRaw?: string) {
  const locale = normalizeLocale(localeRaw);
  const entries = await Promise.all(
    NAMESPACES.map(async ns => [ns, await importNamespace(locale, ns)] as const)
  );
  const messages = Object.fromEntries(entries);
  return { locale, messages };
}

export async function loadNamespace(localeRaw: string, namespace: string) {
  const locale = normalizeLocale(localeRaw);
  const messages = await importNamespace(locale, namespace);
  return { locale, messages };
}
