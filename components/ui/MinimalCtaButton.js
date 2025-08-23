'use client';
import { forwardRef } from 'react';

// Minimal CTA: white background, accent-blue text, rounded, flat (no shadow), consistent sizing
const MinimalCtaButton = forwardRef(function MinimalCtaButton(
  {
    children = 'Get Started',
    href,
    onClick,
    disabled = false,
    className = '',
    ...props
  },
  ref
) {
  const base = `
    inline-flex items-center justify-center whitespace-nowrap
    h-11 px-5 rounded-full select-none
    bg-white text-[var(--accent-blue)] font-semibold text-sm tracking-tight
    border border-[color-mix(in_oklab,var(--accent-blue)_18%,transparent)]
    transition-colors duration-200
    hover:bg-[color-mix(in_oklab,white_92%,var(--accent-blue))]
    active:bg-[color-mix(in_oklab,white_88%,var(--accent-blue))]
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]/40
    disabled:opacity-60 disabled:cursor-not-allowed
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  if (href && !disabled) {
    return (
      <a ref={ref} href={href} className={base} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref}
      type="button"
      className={base}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

export default MinimalCtaButton;
