import "./globals.css";

import { buildRootMetadata } from "@/lib/seo";

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-GT" className="h-full antialiased">
      <head>
        <link
          as="image"
          href="/brand/reyes-logo-full-white-transparent.png"
          rel="preload"
          type="image/png"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
