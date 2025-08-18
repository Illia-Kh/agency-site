'use client';
import Logo from './Logo';
import ContactDropdown from './ContactDropdown';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({ locale }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg-secondary)] border-b border-[var(--border)] backdrop-blur transition-all duration-200 min-h-[4rem]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 h-16">
        <Logo />
        <div className="hidden md:flex md:items-center md:gap-3">
          <ContactDropdown />
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
