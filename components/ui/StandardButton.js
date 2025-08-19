'use client';
import { forwardRef } from 'react';

const StandardButton = forwardRef(function StandardButton(
  { children, href, onClick, disabled = false, className = '', ...props },
  ref
) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    h-11 px-5 py-2.5
    rounded-full 
    border-2 border-[var(--primary)] 
    bg-transparent 
    text-sm font-medium text-[var(--white)]
    transition-all duration-200
    hover:bg-[var(--primary)]/10
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/60
    active:bg-[var(--primary)]/15
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  if (href && !disabled) {
    return (
      <a
        ref={ref}
        href={href}
        className={baseStyles}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      className={baseStyles}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

export default StandardButton;
