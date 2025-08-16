import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

const locales = ['en','cs','de'] as const;
type Locale = typeof locales[number];
const DEFAULT_LOCALE: Locale = 'en';

function negotiate(req: NextRequest): Locale {
  const al = req.headers.get('accept-language') ?? '';
  const prefs = al
    .split(',')
    .map(s => s.trim().split(';')[0].toLowerCase()); // e.g. ['ru-ru','en-us']
  const exact = prefs.find(l => locales.includes(l as Locale));
  if (exact) return exact as Locale;
  const base = prefs.map(l => l.split('-')[0]).find(l => locales.includes(l as Locale));
  return (base as Locale) ?? DEFAULT_LOCALE;
}

export function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl;
  // If already prefixed with a supported locale — pass through.
  const hasPrefix = locales.some(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasPrefix) return NextResponse.next();

  // Otherwise, detect or fallback to default
  const locale = negotiate(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)']
};
