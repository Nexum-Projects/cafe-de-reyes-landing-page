import "./globals.css";

import Script from "next/script";

import { buildRootMetadata } from "@/lib/seo";

export const metadata = buildRootMetadata();

const GOOGLE_TAG_MANAGER_ID = "GTM-5GHGLJXG";
const GOOGLE_ANALYTICS_ID = "G-183MCFEWFQ";

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
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GOOGLE_TAG_MANAGER_ID}');
          `}
        </Script>
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-full">
        <noscript>
          <iframe
            height="0"
            src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_MANAGER_ID}`}
            style={{ display: "none", visibility: "hidden" }}
            width="0"
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
