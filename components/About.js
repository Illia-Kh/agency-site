'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('about');

  const features = [
    {
      title: t('sites.title'),
      text: t('sites.text'),
      link: t('sites.link'),
    },
    {
      title: t('tracking.title'),
      text: t('tracking.text'),
      link: t('tracking.link'),
    },
    {
      title: t('traffic.title'),
      text: t('traffic.text'),
      link: t('traffic.link'),
    },
    {
      title: t('analytics.title'),
      text: t('analytics.text'),
      link: t('analytics.link'),
    },
  ];

  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text)]">
            {t('title')}
          </h2>
          <p className="mt-3 max-w-sm text-[var(--text)] opacity-70">
            {t('description')}
          </p>
        </div>
        <div className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map(f => (
              <Link
                key={f.title}
                href={f.link}
                aria-label={`${f.title}: ${f.text}`}
                className="group block rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-[color-mix(in_oklab,var(--border)_25%,transparent)] cursor-pointer no-underline focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                role="link"
              >
                <dt className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors duration-200">
                  {f.title}
                </dt>
                <dd className="mt-2 text-sm text-[var(--text)] opacity-70">
                  {f.text}
                </dd>
              </Link>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
