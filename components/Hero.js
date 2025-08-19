'use client';
import { useTranslations } from 'next-intl';
import HeroMedia from './HeroMedia';
import HeroBenefitCard from './HeroBenefitCard';
import StandardButton from './ui/StandardButton';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,color-mix(in_oklab,var(--bg)_6%,transparent),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5 lg:gap-12 min-h-[80vh] lg:min-h-[85vh]">
          {/* Left column - Content */}
          <div className="lg:col-span-3 flex flex-col justify-center max-w-[580px]">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl text-[var(--text)]">
              {t('title')}
              <br />
              <span className="text-[var(--text)] opacity-70">
                {t('subtitle')}
              </span>
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] text-[var(--text)] opacity-60 leading-relaxed">
              {t('description')}
            </p>

            {/* Auto-rotating benefit cards */}
            <HeroBenefitCard />

            {/* CTA Buttons - Unified style */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StandardButton href="#contact">{t('cta')}</StandardButton>
              <StandardButton href="#about">{t('howWeWork')}</StandardButton>
            </div>

            {/* Static features list - keeping original for fallback */}
            <ul className="mt-8 grid grid-cols-2 gap-4 text-sm text-[var(--text)] opacity-70 sm:max-w-md">
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

          {/* Right column - Media Gallery */}
          <div className="lg:col-span-2 flex items-center justify-center self-center mt-4 lg:mt-6">
            <div className="w-full lg:max-w-[680px]">
              <HeroMedia />
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
