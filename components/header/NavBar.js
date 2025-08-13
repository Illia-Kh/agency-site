'use client';
import React from 'react';
import CtaButton from './CtaButton';

const links = [
  { href: '#about', label: 'О нас' },
  { href: '#cases', label: 'Кейсы' },
  { href: '#contact', label: 'Контакты' },
];

function NavBar({ open, onToggle, onClose, mobile }) {
  if (mobile) {
    return (
      <div className="space-y-1 px-4 py-3">
        {links.map((link) => (
          <a
            key={link.href}
            className="block rounded-lg px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--highlight)]"
            href={link.href}
            onClick={onClose}
          >
            {link.label}
          </a>
        ))}
        <div className="mt-2">
          <CtaButton onClick={onClose} mobile />
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <a
            key={link.href}
            className="text-sm text-[var(--text)] hover:text-[var(--primary)] transition"
            href={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <button
        aria-label="Open menu"
        onClick={onToggle}
        className="md:hidden rounded-xl border border-[var(--border)] p-2 hover:bg-[var(--highlight)]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>
    </>
  );
}

export default React.memo(NavBar);
