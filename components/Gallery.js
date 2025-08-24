'use client';
import { useTranslations } from 'next-intl';

export default function Gallery() {
  const t = useTranslations('gallery');

  return (
    <section
      id="gallery"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text)]">
          {t('title')}
        </h2>
        <p className="mt-3 text-[var(--text)] opacity-70">
          {/* Clean gallery implementation coming soon */}
        </p>
      </div>

      {/* Clean block - no implementation yet */}
      <div className="mt-12">
        {/* Gallery content will be implemented here */}
      </div>
    </section>
  );
}
