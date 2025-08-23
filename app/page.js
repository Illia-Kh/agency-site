export const dynamic = 'force-dynamic';

export default function Page() {
  // Redirect to default locale on the client (fallback). On server, Next handles i18n routing.
  if (typeof window !== 'undefined') {
    const lang =
      typeof navigator !== 'undefined' && navigator.language
        ? navigator.language
        : 'en';
    const locale = lang.split('-')[0] || 'en';
    window.location.replace(`/${locale}`);
  }
  return null;
}
