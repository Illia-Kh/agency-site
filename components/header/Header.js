"use client";
import { useState, useCallback } from 'react';
import Logo from './Logo';
import NavBar from './NavBar';
import CtaButton from './CtaButton';

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((prev) => !prev), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg-secondary)] border-b border-[var(--border)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <NavBar open={open} onToggle={toggle} onClose={close} />
        <div className="hidden md:block">
          <CtaButton />
        </div>
      </div>
      {open && (
        <div className="border-t border-[var(--border)] md:hidden">
          <NavBar open={open} onToggle={toggle} onClose={close} mobile />
        </div>
      )}
    </header>
  );
}
