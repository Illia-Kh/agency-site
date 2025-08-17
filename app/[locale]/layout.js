import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import '../globals.css';
import Header from '@/components/header/Header';
import { locales, isSupportedLocale } from '../../i18n';

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  // Read theme from cookie for SSR-safe theme persistence
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  const theme = themeCookie?.value || 'light';

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme={theme} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-white/10">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header locale={locale} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
