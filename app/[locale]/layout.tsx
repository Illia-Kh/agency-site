import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import { isSupportedLocale, locales, messagesMap } from '../../i18n';
import Header from '../../components/header/Header';
import '../globals.css';
import type { ReactNode } from 'react';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!isSupportedLocale(locale)) {
    throw new Error(`Unsupported locale: ${locale}`);
  }

  // Read theme from cookie for SSR-safe theme persistence
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  const theme = themeCookie?.value || 'light';

  // Get messages for the current locale
  const messages = await messagesMap[locale]();

  return (
    <html lang={locale} data-theme={theme} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-white/10">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header locale={locale} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
