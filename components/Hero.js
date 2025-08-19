import { useTranslations } from 'next-intl';
import StandardButton from './ui/StandardButton';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,color-mix(in_oklab,var(--bg)_6%,transparent),transparent)]" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-5 max-w-[580px]">
          <h1 className="text-3xl font-bold leading-tight tracking-[-0.01em] sm:text-4xl md:text-5xl text-[var(--text)]">
            {t('title')}
            <br />
            <span className="text-[var(--text)] opacity-70">
              {t('subtitle')}
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-[var(--text)] opacity-70">
            {t('description')}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <StandardButton href="#contact">{t('cta')}</StandardButton>
            <StandardButton href="#about">{t('howWeWork')}</StandardButton>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-4 text-base text-[var(--text)] opacity-70 sm:max-w-md h-20 content-center">
            <li className="flex items-center gap-2">
              <Dot /> {t('features.ssl')}
            </li>
            <li className="flex items-center gap-2">
              <Dot /> {t('features.keitaro')}
            </li>
            <li className="flex items-center gap-2">
              <Dot /> {t('features.advertising')}
            </li>
            <li className="flex items-center gap-2">
              <Dot /> {t('features.support')}
            </li>
          </ul>
        </div>
        <div className="lg:col-span-7 lg:mt-4 self-center">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4 shadow-xl ring-1 ring-[var(--border)]">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-[var(--surface-elevated)]">
              {/* Placeholder for future gallery/shot */}
              <div className="flex h-full items-center justify-center text-[var(--text)] opacity-60">
                {t('preview.title')}
              </div>
            </div>
            <div className="mt-3 text-xs text-[var(--text)] opacity-70">
              {t('preview.subtitle')}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ color: 'color-mix(in oklab, var(--text) 70%, transparent)' }}
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}
