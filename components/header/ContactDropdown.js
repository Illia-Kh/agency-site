'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import ContactForm from '../contact/ContactForm';

export default function ContactDropdown() {
  const t = useTranslations('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Client-side mounting check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update dropdown position when opened
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 12, // 12px gap
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
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
        buttonRef.current?.focus(); // Return focus to button
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Focus trap for accessibility
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = dropdownRef.current?.querySelectorAll(
      'input, textarea, button, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleTabKey = e => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus(); // Focus first input when opened

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  const handleFormSubmit = () => {
    // Form submission logic would go here
    setIsOpen(false); // Close dropdown after submit
    buttonRef.current?.focus(); // Return focus to button
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="rounded-xl border border-transparent bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--white)] hover:bg-[var(--primary-hover)] transition"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Open contact form"
      >
        {t('header.contact')}
      </button>

      {/* Dropdown overlay - portalized */}
      {isOpen &&
        isClient &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed w-80 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-150 origin-top-right opacity-100 scale-100 z-50"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              boxShadow: 'var(--shadow-md)',
            }}
            role="dialog"
            aria-labelledby="contact-form-title"
            aria-hidden={false}
          >
            <div className="p-4">
              <ContactForm
                onSubmit={handleFormSubmit}
                className="border-0 bg-transparent p-0"
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
