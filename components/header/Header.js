'use client';
import Logo from './Logo';
import CtaButton from './CtaButton';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg-secondary)] border-b border-[var(--border)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Logo />
        <div className="hidden md:block">
          <CtaButton />
        </div>
      </div>
    </header>
  );
}
