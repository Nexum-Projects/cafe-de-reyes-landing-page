import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cafe de Reyes | Origen, tecnica y memoria",
  description:
    "Landing premium para Cafe de Reyes conectada al contenido publico de Nexum Content Hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
