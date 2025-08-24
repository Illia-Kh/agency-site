'use client';
import { useState, useLayoutEffect } from 'react';
import Logo from './Logo';
import ContactDropdown from './ContactDropdown';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useLayoutEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        const height = headerEl.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-h', `${height}px`);
      }
    };

    updateHeaderHeight();

    const headerEl = document.querySelector('header');
    let ro;
    if (headerEl && 'ResizeObserver' in window) {
      ro = new ResizeObserver(updateHeaderHeight);
      ro.observe(headerEl);
    }

    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--bg),transparent_65%)] border-b border-[color-mix(in_oklab,var(--azure),var(--bg)_90%)] transition-all duration-200 min-h-[4rem]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 h-16">
        <Logo />

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-3">
          <ContactDropdown />
          <LanguageSwitcher currentLocale={locale} />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg text-[var(--text)] hover:bg-[var(--border)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--azure)] focus-visible:ring-offset-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[color-mix(in_oklab,var(--azure),var(--bg)_90%)] bg-[color-mix(in_oklab,var(--bg),transparent_65%)] backdrop-blur">
          <div className="px-4 py-3 space-y-3">
            <ContactDropdown />
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      )}
    </header>
  );
}
