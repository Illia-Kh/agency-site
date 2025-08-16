export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <head />
      <body>{children}</body>
    </html>
  );
}
