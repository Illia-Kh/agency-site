'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ContactForm from '../contact/ContactForm';
import StandardButton from '../ui/StandardButton';

export default function ContactDropdown() {
  const t = useTranslations('header');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleFormSubmit = () => {
    // Form submission logic would go here
    setIsOpen(false); // Close dropdown after submit
    buttonRef.current?.focus(); // Return focus to button
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <StandardButton
        ref={buttonRef}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Open contact form"
      >
        {t('contact')}
      </StandardButton>

      {/* Dropdown overlay */}
      <div
        className={`absolute right-0 top-full mt-3 w-80 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] transition-all duration-150 origin-top-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-1 pointer-events-none'
        }`}
        style={{
          boxShadow: 'var(--shadow-md)',
        }}
        role="dialog"
        aria-labelledby="contact-form-title"
        aria-hidden={!isOpen}
      >
        <div className="p-4">
          <ContactForm
            onSubmit={handleFormSubmit}
            className="border-0 bg-transparent p-0"
          />
        </div>
      </div>
    </div>
  );
}
