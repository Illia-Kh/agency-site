'use client';
import { useState, useRef, useEffect, startTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'cs', label: 'CS', name: 'Čeština' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'ru', label: 'RU', name: 'Русский' },
];

export default function LanguageSwitcher({ currentLocale = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Client-side mounting check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update dropdown position when opened
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  };

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = e => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = e => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (isChanging) return;
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = langCode => {
    if (isChanging || langCode === currentLocale) return;

    setIsChanging(true);
    setIsOpen(false);

    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    const newPath = `/${langCode}${pathWithoutLocale || ''}`;

    // Use startTransition for smoother transitions and router.replace to avoid flicker
    startTransition(() => {
      router.replace(newPath);
    });

    // Reset changing state after transition, but don't lose focus
    setTimeout(() => {
      setIsChanging(false);
      // Don't focus if user clicked away during transition
      if (
        document.activeElement === document.body ||
        document.activeElement === buttonRef.current
      ) {
        buttonRef.current?.focus();
      }
    }, 150);
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === currentLocale);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={isChanging}
        className={`inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-elevated)] transition-all duration-200 ${
          isChanging ? 'opacity-75 cursor-wait' : ''
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
        aria-live="polite"
      >
        <GlobeIcon />
        <span className="min-w-[1.5rem] text-center">
          {isChanging ? '...' : currentLanguage?.label}
        </span>
        <ChevronIcon isOpen={isOpen} />
      </button>

      {/* Dropdown - portalized */}
      {isOpen &&
        !isChanging &&
        isClient &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-200 origin-top-right opacity-100 scale-100 z-50"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              boxShadow: 'var(--shadow-md)',
            }}
            role="listbox"
            aria-label="Language options"
            aria-hidden={false}
          >
            <ul className="py-2">
              {LANGUAGES.map(lang => (
                <li key={lang.code}>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    disabled={isChanging}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--surface-elevated)] transition-colors duration-150 ${
                      lang.code === currentLocale
                        ? 'bg-[var(--surface-elevated)] text-[var(--primary)]'
                        : 'text-[var(--text)]'
                    } ${isChanging ? 'opacity-50 cursor-wait' : ''}`}
                    role="option"
                    aria-selected={lang.code === currentLocale}
                  >
                    <span className="font-medium">{lang.label}</span>
                    <span className="ml-2 opacity-70">{lang.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function ChevronIcon({ isOpen }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
