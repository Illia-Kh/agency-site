import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css';
import Header from '@/components/header/Header';

const locales = ['en', 'ru', 'uk'];

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export const metadata = {
  metadataBase: new URL('https://example.com'),
  title: {
    default: 'IKH — Full-cycle Digital Agency',
    template: '%s | IKH',
  },
  description:
    'Создаём сайты, настраиваем трекинг (Keitaro) и запускаем рекламу. Полный цикл под ключ.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'IKH — Рекламное агентство полного цикла',
    description: 'Сайт + трекер + реклама под ключ',
    url: 'https://example.com/',
    siteName: 'IKH Agency',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IKH Agency',
    description: 'Сайт + трекер + реклама под ключ',
  },
  robots: { index: true, follow: true },
};

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* No-FOUC theme script: sets data-theme on <html> before hydration */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              try {
                var saved = localStorage.getItem("theme");
                var sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                var initial = saved || sys;
                document.documentElement.setAttribute("data-theme", initial);
              } catch(e) {}
            })();
          `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-white/10">
        <NextIntlClientProvider messages={messages}>
          <Header locale={locale} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
