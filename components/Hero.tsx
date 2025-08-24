'use client';
import { useLayoutEffect, useState } from 'react';
import HeroMedia from './HeroMedia';
import StandardButton from './ui/StandardButton';
import heroMediaData from '@/content/heroMedia.json';

type HeroProps = {
  heroMediaItems?: any[];
};

export default function Hero({ heroMediaItems = [] }: HeroProps) {
  const [heroHeight, setHeroHeight] = useState<string | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const headerEl = document.querySelector('header');
      const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
      setHeroHeight(`calc(100svh - ${headerH}px)`);
    };
    measure();
    const headerEl = document.querySelector('header');
    let ro: ResizeObserver | null = null;
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
    <section className="hero relative isolate">
      {/* Overlay for contrast */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,color-mix(in_oklab,var(--bg)_6%,transparent),transparent)]" />
      <div
        className="container max-w-7xl px-4 sm:px-6 lg:px-8"
        style={heroHeight ? { height: heroHeight } : undefined}
      >
        <div className="grid lg:grid-cols-12 gap-8 h-full items-center">
          {/* Left column - Content */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl text-[var(--text)]">
              Website + Tracking + Ads
            </h1>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text)] opacity-80">
              Turnkey launch in 7–14 days
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] text-[var(--text)] opacity-60 leading-relaxed">
              We build fast Next.js websites, connect Keitaro & analytics, and
              run Meta/Google ads. Less paperwork — more results.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <StandardButton href="/en/contact">Get a quote</StandardButton>
              <StandardButton href="#process">How we work</StandardButton>
            </div>

            {/* Info badge block */}
            <div className="mt-8 p-4 rounded-xl bg-[color-mix(in_oklab,var(--surface-elevated),transparent_15%)] border border-[var(--border)]">
              <div className="text-sm font-semibold text-[var(--text)]">
                Quick start: 7–14 days
              </div>
              <div className="text-sm text-[var(--text)] opacity-60 mt-1">
                We don&apos;t stretch deadlines — we fix scope.
              </div>
            </div>

            {/* Static features list - keeping original for fallback */}
            <ul className="mt-8 grid grid-cols-2 gap-4 text-sm text-[var(--text)] opacity-70 sm:max-w-md">
              <li className="flex items-center gap-2">
                <Dot /> SSL + Speed
              </li>
              <li className="flex items-center gap-2">
                <Dot /> Keitaro Ready
              </li>
              <li className="flex items-center gap-2">
                <Dot /> Meta/Google Ads
              </li>
              <li className="flex items-center gap-2">
                <Dot /> 24/7 Support
              </li>
            </ul>
          </div>

          {/* Right column - Media Gallery */}
          <div className="lg:col-span-6 flex items-center justify-center self-center ios-safe">
            <div className="w-full lg:max-w-[680px]">
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
