'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer
      id="contact"
      className="mt-auto border-t border-[var(--border)] bg-[var(--bg-secondary)]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:px-8">
        <div>
          <div className="text-lg font-semibold text-[var(--text)]">
            {t('companyName')}
          </div>
          <p className="mt-2 max-w-xs text-sm text-[var(--text)] opacity-70">
            {t('description')}
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--text)]">
            {t('contacts')}
          </div>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text)]">
            <li>
              <a
                href={`mailto:${t('email')}`}
                className="hover:underline text-[var(--primary)] hover:text-[var(--primary-hover)]"
              >
                {t('email')}
              </a>
            </li>
            <li>
              <a
                href="https://t.me/username"
                className="hover:underline text-[var(--primary)] hover:text-[var(--primary-hover)]"
                target="_blank"
                rel="noreferrer"
              >
                {t('telegram')}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-xs text-[var(--text)] opacity-60">
            © {new Date().getFullYear()} IKH Agency. {t('copyright')}
          </div>
          <div className="flex gap-4 text-xs">
            <Link
              href="/en/privacy"
              className="text-[var(--text)] opacity-60 hover:opacity-100 hover:underline"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/en/cookies"
              className="text-[var(--text)] opacity-60 hover:opacity-100 hover:underline"
            >
              {t('cookies')}
            </Link>
            <Link
              href="/en/terms"
              className="text-[var(--text)] opacity-60 hover:opacity-100 hover:underline"
            >
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
