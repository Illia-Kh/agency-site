import { useTranslations } from 'next-intl';

export default function About() {
  const t = useTranslations('home');

  const features = [
    {
      title: t('about.sites.title'),
      text: t('about.sites.text'),
    },
    {
      title: t('about.tracking.title'),
      text: t('about.tracking.text'),
    },
    {
      title: t('about.traffic.title'),
      text: t('about.traffic.text'),
    },
    {
      title: t('about.analytics.title'),
      text: t('about.analytics.text'),
    },
  ];

  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t('about.title')}
          </h2>
          <p className="mt-3 max-w-sm text-neutral-400">
            {t('about.description')}
          </p>
        </div>
        <div className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map(f => (
              <div
                key={f.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5"
              >
                <dt className="text-sm font-semibold text-[var(--text)]">
                  {f.title}
                </dt>
                <dd className="mt-2 text-sm text-[var(--text)] opacity-70">
                  {f.text}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
