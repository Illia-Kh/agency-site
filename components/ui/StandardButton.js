'use client';

export default function StandardButton({
  children,
  href,
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    h-11 px-6 
    rounded-full 
    border border-[var(--primary)] 
    bg-transparent 
    text-sm font-semibold text-[var(--white)]
    transition-all duration-200
    hover:bg-[var(--primary)]/10
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
    ${className}
  `
    .trim()
    .replace(/\s+/g, ' ');

  if (href && !disabled) {
    return (
      <a href={href} className={baseStyles} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={baseStyles}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
