import { forwardRef } from 'react';

const StandardButton = forwardRef(function StandardButton(
  {
    children,
    className = '',
    href,
    onClick,
    disabled = false,
    type = 'button',
    ...props
  },
  ref
) {
  const baseClasses = [
    // Height 44-48px (py-3 gives ~48px with text-sm)
    'h-11', // 44px height
    'rounded-full', // fully rounded
    'px-6', // horizontal padding
    'text-sm',
    'font-semibold',
    'text-[var(--white)]', // white text
    'border',
    'border-[var(--primary)]', // accent color border
    'bg-transparent', // transparent background
    'transition-all',
    'duration-150',
    // Hover state with light accent fill
    'hover:bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]',
    // Focus ring with accent color
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-[var(--primary)]',
    'focus-visible:ring-offset-2',
    // Active state
    'active:bg-[color-mix(in_oklab,var(--primary)_20%,transparent)]',
    // Disabled state
    'disabled:opacity-55',
    'disabled:cursor-not-allowed',
    'disabled:filter',
    'disabled:saturate-75',
    // Layout
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'whitespace-nowrap',
  ].filter(Boolean);

  const allClasses = [...baseClasses, className].join(' ');

  if (href) {
    return (
      <a
        ref={ref}
        href={href}
        className={allClasses}
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
      type={type}
      className={allClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

export default StandardButton;
