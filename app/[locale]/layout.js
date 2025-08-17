import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import '../globals.css';
import Header from '@/components/header/Header';
import { loadAllMessages } from '@/src/i18n/message-loader';
import { SUPPORTED_LOCALES } from '@/src/i18n/i18n.config';

export const revalidate = 0;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map(locale => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!SUPPORTED_LOCALES.includes(locale)) {
    notFound();
  }

  // Read theme from cookie for SSR-safe theme persistence
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  const theme = themeCookie?.value || 'light';

  // Load messages using the new message loader
  const { locale: normalizedLocale, messages } = await loadAllMessages(locale);

  return (
    <html lang={normalizedLocale} data-theme={theme} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-white/10">
        <NextIntlClientProvider locale={normalizedLocale} messages={messages}>
          <Header locale={locale} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
