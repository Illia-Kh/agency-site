import { useTranslations } from 'next-intl';

export default function Gallery() {
  const t = useTranslations('home');

  const items = [
    { id: 1, caption: t('gallery.cases.clinic'), alt: 'Case 1' },
    { id: 2, caption: t('gallery.cases.ecom'), alt: 'Case 2' },
    { id: 3, caption: t('gallery.cases.google'), alt: 'Case 3' },
    { id: 4, caption: t('gallery.cases.meta'), alt: 'Case 4' },
    { id: 5, caption: t('gallery.cases.keitaro'), alt: 'Case 5' },
    { id: 6, caption: t('gallery.cases.whitepage'), alt: 'Case 6' },
  ];
  return (
    <section
      id="cases"
      className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:pb-20"
    >
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-[var(--text)]">
          {t('gallery.title')}
        </h2>
        <a
          href="#contact"
          className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
        >
          {t('gallery.ctaText')}
        </a>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(it => (
          <figure
            key={it.id}
            className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]"
          >
            <div
              className="aspect-video bg-[var(--surface-elevated)]"
              aria-label={it.alt}
            ></div>
            <figcaption className="flex items-center justify-between px-4 py-3 text-sm text-[var(--text)]">
              <span>{it.caption}</span>
              <span className="opacity-60 group-hover:opacity-100">
                {t('gallery.details')}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
