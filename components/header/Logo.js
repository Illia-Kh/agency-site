'use client';
// logo.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';

export default function Logo() {
  const t = useTranslations('nav');

  // Translated navigation links
  const LINKS = [
    { href: '#about', label: t('nav.about') },
    { href: '#cases', label: t('nav.cases') },
    { href: '#contact', label: t('nav.contacts') },
  ];
  // State for portal mounting
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Theme state is only set on client to avoid hydration mismatch
  const [theme, setTheme] = useState(undefined);

  useEffect(() => {
    const getTheme = () =>
      document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(getTheme());

    // Listen for theme changes from other components
    const handler = () => setTheme(getTheme());
    window.addEventListener('storage', handler);

    // Also listen for manual attribute changes
    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      window.removeEventListener('storage', handler);
      observer.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);

    // Set cookie with 1 year expiration
    document.cookie = `theme=${next}; path=/; max-age=31536000; SameSite=Lax`;

    setTheme(next);
  };

  const isDark = theme === 'dark';

  // Delayed hover dropdown state for nav
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const hoverTimer = useRef(null); // delay to open (120ms)
  const closeTimer = useRef(null); // delay to close (200ms)
  const containerRef = useRef(null); // wrapper (logo + dropdown)
  const hoverIntentRef = useRef({ x: 0, y: 0, timestamp: 0 }); // hover intent tracking

  const clearTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const HOVER_DELAY = 120; // ms (reduced from 1000ms)
  const CLOSE_DELAY = 200; // ms
  const HOVER_INTENT_THRESHOLD = 24; // px
  const HOVER_INTENT_TIME = 80; // ms

  const updateDropdownPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 12, // 12px gap
        left: rect.left + window.scrollX,
      });
    }
  }, []);

  const checkHoverIntent = e => {
    const now = Date.now();
    const deltaTime = now - hoverIntentRef.current.timestamp;

    if (deltaTime < HOVER_INTENT_TIME) {
      const deltaX = Math.abs(e.clientX - hoverIntentRef.current.x);
      const deltaY = Math.abs(e.clientY - hoverIntentRef.current.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If pointer moved more than threshold in short time, it's not intentional hover
      if (distance > HOVER_INTENT_THRESHOLD) {
        return false;
      }
    }

    hoverIntentRef.current = {
      x: e.clientX,
      y: e.clientY,
      timestamp: now,
    };
    return true;
  };

  const handleEnter = e => {
    if (!checkHoverIntent(e)) return;

    clearTimer();
    clearClose();
    updateDropdownPosition();
    hoverTimer.current = setTimeout(() => setMenuOpen(true), HOVER_DELAY);
  };

  const scheduleClose = () => {
    clearClose();
    closeTimer.current = setTimeout(() => setMenuOpen(false), CLOSE_DELAY);
  };

  const handleLeaveContainer = e => {
    // Check if we're moving to the dropdown (which will be portaled to body)
    const relatedTarget = e.relatedTarget;
    if (relatedTarget?.closest?.('[data-logo-dropdown]')) {
      return; // Don't close if moving to dropdown
    }
    scheduleClose();
  };

  const handleEnterPanel = () => {
    clearClose();
  };

  const handleLeavePanel = e => {
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && containerRef.current?.contains(relatedTarget)) {
      return; // Moving back to trigger
    }
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

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!menuOpen) return;

    const updatePosition = () => updateDropdownPosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [menuOpen, updateDropdownPosition]);

  // Outside click + ESC to close
  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = e => {
      // Check if click is outside container and not on the portaled dropdown
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !e.target.closest('[data-logo-dropdown]')
      ) {
        setMenuOpen(false);
      }
    };
    const onKey = e => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
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
      onBlur={e => {
        if (!containerRef.current?.contains(e.relatedTarget)) scheduleClose();
      }}
    >
      {/* Блок-эмблема: графитовый квадрат со скруглением и оранжевым 'ИКХ' */}
      <a
        href="#"
        className="group inline-flex items-center gap-2 select-none"
        aria-haspopup="true"
        aria-expanded={menuOpen}
        onClick={e => {
          e.preventDefault();
          toggleImmediate();
        }}
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

      {/* Dropdown nav - now portalized and conditionally rendered */}
      {menuOpen &&
        isClient &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            data-logo-dropdown
            className="fixed w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg transition duration-300 origin-top-left transform z-50"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              boxShadow: 'var(--shadow-md)',
            }}
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
          </div>,
          document.body
        )}
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
