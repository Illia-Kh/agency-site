export default function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            О нас
          </h2>
          <p className="mt-3 max-w-sm text-neutral-400">
            Мы строим воронку целиком: от прототипа сайта до закупки трафика.
            Параллельно настраиваем аналитику и отчётность.
          </p>
        </div>
        <div className="lg:col-span-2">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              {
                title: 'Сайты',
                text: 'Next.js, быстрые загрузки, адаптив, SEO‑база.',
              },
              {
                title: 'Трекинг',
                text: 'Keitaro, домены, SSL, интеграции, антибот‑фильтры.',
              },
              {
                title: 'Трафик',
                text: 'Meta/Google, медиаплан, креативы, тесты и масштабирование.',
              },
              {
                title: 'Поддержка',
                text: 'Поддержка и развитие проекта после запуска.',
              },
            ].map(f => (
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
