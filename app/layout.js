
import "./globals.css";
import Header from "@/components/header/Header";


export const metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "IKH — Full-cycle Digital Agency",
    template: "%s | IKH",
  },
  description: "Создаём сайты, настраиваем трекинг (Keitaro) и запускаем рекламу. Полный цикл под ключ.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "IKH — Рекламное агентство полного цикла",
    description: "Сайт + трекер + реклама под ключ",
    url: "https://example.com/",
    siteName: "IKH Agency",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "IKH Agency", description: "Сайт + трекер + реклама под ключ" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* No-FOUC theme script: sets data-theme on <html> before hydration */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{
          __html: `
            (function(){
              try {
                var saved = localStorage.getItem("theme");
                var sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                var initial = saved || sys;
                document.documentElement.setAttribute("data-theme", initial);
              } catch(e) {}
            })();
          `
        }} />
      </head>
      <body
        className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-white/10"
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
