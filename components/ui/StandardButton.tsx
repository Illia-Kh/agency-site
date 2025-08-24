'use client';
import { forwardRef } from 'react';

type StandardButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
} & React.ComponentProps<'button'> &
  React.ComponentProps<'a'>;

const StandardButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  StandardButtonProps
>(function StandardButton(
  { children, href, onClick, disabled = false, className = '', ...props },
  ref
) {
  const baseStyles = `
    btn inline-flex items-center justify-center gap-2 select-none no-underline hover:no-underline
    h-12 px-6 rounded-full
    bg-transparent text-[var(--accent-blue)] font-semibold text-[15px]
    border-2 border-[var(--accent-blue)]
    transition-[background-color,transform,color,border-color] duration-200 ease-out
    hover:bg-[color-mix(in_oklab,var(--accent-blue)_10%,transparent)] hover:scale-x-[1.02]
    active:bg-[color-mix(in_oklab,var(--accent-blue)_16%,transparent)] active:scale-x-[1.00]
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)]/40
    disabled:opacity-60 disabled:cursor-not-allowed
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  if (href && !disabled) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={baseStyles}
        onClick={onClick}
        {...(props as React.ComponentProps<'a'>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      className={baseStyles}
      onClick={onClick}
      disabled={disabled}
      {...(props as React.ComponentProps<'button'>)}
    >
      {children}
    </button>
  );
});

export default StandardButton;
