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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
