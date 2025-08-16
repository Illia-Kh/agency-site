export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* No-FOUC theme script: sets data-theme on <html> before hydration */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
            (function(){
              try {
                var saved = localStorage.getItem("theme");
                var sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                var initial = saved || sys;
                document.documentElement.setAttribute("data-theme", initial);
              } catch(e) {}
            })();
          `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased selection:bg-white/10">
        {children}
      </body>
    </html>
  );
}
