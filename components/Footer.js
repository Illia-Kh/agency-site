export default function Footer() {
  return (
    <footer
      id="contact"
      className="mt-auto border-t border-[var(--border)] bg-[var(--bg-secondary)]"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="text-lg font-semibold text-[var(--text)]">
            IKH Agency
          </div>
          <p className="mt-2 max-w-xs text-sm text-[var(--text)] opacity-70">
            Создание и продвижение сайтов под ключ. Чехия · EU
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--text)]">
            Контакты
          </div>
          <ul className="mt-2 space-y-1 text-sm text-[var(--text)]">
            <li>
              <a
                href="mailto:hello@example.com"
                className="hover:underline text-[var(--primary)] hover:text-[var(--primary-hover)]"
              >
                hello@example.com
              </a>
            </li>
            <li>
              <a
                href="https://t.me/username"
                className="hover:underline text-[var(--primary)] hover:text-[var(--primary-hover)]"
                target="_blank"
                rel="noreferrer"
              >
                Telegram
              </a>
            </li>
          </ul>
        </div>
        <form className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
          <label className="text-sm font-medium text-[var(--text)]">
            Оставьте заявку
          </label>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-1 ring-[var(--border)] placeholder:text-[var(--text)]/60"
              placeholder="Имя"
            />
            <input
              className="rounded-xl bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-1 ring-[var(--border)] placeholder:text-[var(--text)]/60"
              placeholder="Телеграм или email"
            />
            <textarea
              className="sm:col-span-2 rounded-xl bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text)] outline-none ring-1 ring-[var(--border)] placeholder:text-[var(--text)]/60"
              rows={3}
              placeholder="Коротко о задаче"
            />
          </div>
          <button className="mt-3 w-full rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition">
            Отправить
          </button>
        </form>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--text)] opacity-60">
        © {new Date().getFullYear()} IKH Agency. Все права защищены.
      </div>
    </footer>
  );
}
