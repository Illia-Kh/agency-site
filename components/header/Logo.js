'use client';
// logo.js
import { useState, useEffect } from 'react';

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

  // Don't render until theme is known (client-only)
  if (theme === undefined) return null;

  return (
    <div className="inline-flex items-center gap-3">
      {/* Блок-эмблема: графитовый квадрат со скруглением и оранжевым 'ИКХ' */}
      <a href="#" className="group inline-flex items-center gap-2 select-none">
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
