'use client';
import { useLayoutEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import HeroMedia from './HeroMedia';
import HeroBenefitCard from './HeroBenefitCard';
import StandardButton from './ui/StandardButton';
import heroMediaData from '@/content/heroMedia.json';

export default function Hero({ heroMediaItems = [] }) {
  const t = useTranslations('hero');
  const [heroHeight, setHeroHeight] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      const headerEl = document.querySelector('header');
      const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
      setHeroHeight(`calc(100vh - ${headerH}px)`);
    };
    measure();
    const headerEl = document.querySelector('header');
    let ro;
    if (headerEl && 'ResizeObserver' in window) {
      ro = new ResizeObserver(measure);
      ro.observe(headerEl);
    }
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <section className="relative isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,color-mix(in_oklab,var(--bg)_6%,transparent),transparent)]" />
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 py-8 lg:py-0"
        style={heroHeight ? { minHeight: heroHeight } : { minHeight: '80vh' }}
      >
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-5 lg:gap-12 min-h-full">
          {/* Left column - Content */}
          <div className="lg:col-span-3 flex flex-col justify-center max-w-[580px] order-2 lg:order-1">
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-[var(--text)]">
              {t('title')}
              <br />
              <span className="text-[var(--text)] opacity-70">
                {t('subtitle')}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-[15px] text-[var(--text)] opacity-60 leading-relaxed">
              {t('description')}
            </p>

            {/* CTA Buttons - Mobile optimized */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              <StandardButton
                href="#contact"
                className="w-full sm:w-auto text-center"
              >
                {t('cta')}
              </StandardButton>
              <StandardButton
                href="#about"
                className="w-full sm:w-auto text-center"
              >
                {t('howWeWork')}
              </StandardButton>
            </div>

            {/* Benefits - Use HeroBenefitCard for interactive content, fallback to static features */}
            <div className="mt-6 sm:mt-8">
              <HeroBenefitCard />
            </div>
          </div>

          {/* Right column - Media Gallery */}
          <div className="lg:col-span-2 flex items-center justify-center order-1 lg:order-2">
            <div className="w-full max-w-xs sm:max-w-sm lg:max-w-[680px]">
              <HeroMedia
                items={
                  heroMediaItems && heroMediaItems.length
                    ? heroMediaItems
                    : heroMediaData
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
