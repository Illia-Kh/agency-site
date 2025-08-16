export default function CtaButton({ onClick, mobile }) {
  const className = mobile
    ? 'block w-full rounded-lg bg-[var(--highlight)] px-3 py-2 text-sm font-semibold text-[var(--white)] hover:bg-[var(--highlight-hover)]'
    : 'rounded-xl border border-transparent bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--white)] hover:bg-[var(--primary-hover)] transition';
  return (
    <a href="#contact" className={className} onClick={onClick}>
      Заказать запуск
    </a>
  );
}
