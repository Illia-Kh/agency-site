'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const locales = ['en', 'cs', 'de'];

function setLocaleInPath(path, to) {
  const parts = path.split('/');
  // ['', 'en', '...'] or ['', 'some', '...'] or ['/']
  if (locales.includes(parts[1])) {
    parts[1] = to; // replace existing locale
  } else {
    parts.splice(1, 0, to); // insert if none
  }
  const next = parts.join('/') || `/${to}`;
  return next.startsWith('//') ? next.slice(1) : next;
}

export default function LanguageSwitcher() {
  const path = usePathname() || '/';
  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'cs', label: 'CS' },
    { code: 'de', label: 'DE' },
  ];
  return (
    <nav
      aria-label="Language switcher"
      style={{ display: 'flex', gap: 8, alignItems: 'center' }}
    >
      <span aria-hidden="true" title="Language">
        🌐
      </span>
      {langs.map(l => (
        <Link
          key={l.code}
          href={setLocaleInPath(path, l.code)}
          aria-label={l.label}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
