'use client';
// logo.js
import { useState, useEffect, useRef, useCallback } from 'react';

const BRAND_ORANGE = '#FF7A00'; // постоянный бренд-оранжевый (не зависит от темы)

const LINKS = [
  { href: '#about', label: 'О нас' },
  { href: '#cases', label: 'Кейсы' },
  { href: '#contact', label: 'Контакты' }
];

export default function Logo() {
  // Theme state is only set on client to avoid hydration mismatch
  const [theme, setTheme] = useState(undefined);

  useEffect(() => {
    const getTheme = () =>
      document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(getTheme());
    const handler = () => setTheme(getTheme());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setTheme(next);
  };

  const isDark = theme === 'dark';

  // Delayed hover dropdown state for nav
  const [menuOpen, setMenuOpen] = useState(false);
  const hoverTimer = useRef(null);      // delay to open (1s)
  const closeTimer = useRef(null);      // small delay to close when leaving area
  const containerRef = useRef(null);    // wrapper (logo + dropdown)
  const panelRef = useRef(null);        // dropdown panel

  const clearTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const HOVER_DELAY = 1000; // ms
  const handleEnter = () => {
    clearTimer();
    clearClose();
    hoverTimer.current = setTimeout(() => setMenuOpen(true), HOVER_DELAY);
  };
  const scheduleClose = () => {
    clearClose();
    // Delay so пользователь успевает переместить курсор на панель
    closeTimer.current = setTimeout(() => setMenuOpen(false), 350);
  };
  const handleLeaveContainer = (e) => {
    // Если ушли и не попадаем в панель – планируем закрытие
    if (!panelRef.current) return scheduleClose();
    const rel = e.relatedTarget;
    if (rel && panelRef.current.contains(rel)) return; // курсор уходит в панель
    scheduleClose();
  };
  const handleEnterPanel = () => { clearClose(); };
  const handleLeavePanel = (e) => {
    const rel = e.relatedTarget;
    if (rel && containerRef.current && containerRef.current.contains(rel)) return; // возвращаемся к триггеру
    scheduleClose();
  };
  const instantOpen = useCallback(() => {
    clearTimer();
    clearClose();
    setMenuOpen(true);
  }, []);

  const toggleImmediate = () => {
    clearTimer();
    clearClose();
    setMenuOpen(o => !o);
  };

  const clearClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Outside click + ESC to close
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Don't render until theme is known (client-only)
  if (theme === undefined) return null;

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center gap-3"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeaveContainer}
      onFocus={instantOpen}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) scheduleClose();
      }}
    >
      {/* Блок-эмблема: графитовый квадрат со скруглением и оранжевым 'ИКХ' */}
      <a
        href="#"
        className="group inline-flex items-center gap-2 select-none"
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={e => { e.preventDefault(); toggleImmediate(); }}
      >
        <div
          className="grid h-8 w-8 place-items-center rounded-xl transition border"
          style={{
            background: 'var(--highlight)', // графит
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
          aria-hidden
        >
          {/* всегда оранжевый */}
          <span
            className="text-sm font-black tracking-wide"
            style={{ color: 'var(--brand-orange)' }}
          >
            IKH
          </span>
        </div>

        {/* Надпись Agency — нашим Azure */}
        <span className="text-sm font-semibold tracking-wide text-[var(--primary)]">
          Agency
        </span>
      </a>

      {/* Кнопка-лампочка, интегрированная в лого */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={isDark}
        aria-label="Toggle theme"
        className="relative inline-grid h-8 w-8 place-items-center rounded-full border transition"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <LightBulbIcon lit={isDark} />
        {/* Мягкое свечение, когда 'включено' */}
        {isDark && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 0 3px var(--brand-orange)33, 0 0 18px var(--brand-orange)55`,
            }}
            aria-hidden
          />
        )}
      </button>

      {/* Dropdown nav (appears after 1s hover) */}
      <div
        ref={panelRef}
        className={`absolute left-0 top-full mt-3 w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg transition duration-300 origin-top-left transform ${menuOpen ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'}`}
        role="menu"
        aria-hidden={!menuOpen}
        onMouseEnter={handleEnterPanel}
        onMouseLeave={handleLeavePanel}
      >
        <ul className="py-2">
          {LINKS.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block px-4 py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-elevated)] rounded-lg"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// SVG-иконка лампочки: нейтральная в обычном состоянии, оранжевая когда 'lit'
function LightBulbIcon({ lit = false }) {
  const stroke = lit ? 'var(--brand-orange)' : 'var(--text)';
  const fill = lit ? 'var(--brand-orange)' : 'transparent';
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      role="img"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M9 18h6v1a3 3 0 0 1-3 3h0a3 3 0 0 1-3-3v-1Z"
        fill={
          lit
            ? 'color-mix(in oklab, var(--brand-orange) 40%, transparent)'
            : 'transparent'
        }
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M12 3a7 7 0 0 0-4.5 12.3c.5.44.8 1.05.8 1.7V18h7.4v-.99c0-.65.3-1.26.8-1.7A7 7 0 0 0 12 3Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M9 21h6"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
