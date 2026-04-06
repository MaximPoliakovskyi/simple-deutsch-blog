import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { ChunkErrorRecovery } from "@/components/chrome-extras";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import "@/styles/globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

// Inline theme init: runs before first paint to avoid FOUC.
// Seeds the two critical CSS vars so bg/fg are correct even before globals.css
// is parsed (important on slow connections).
const THEME_INIT_SCRIPT = `
(() => {
  try {
    const stored = localStorage.getItem("sd-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "dark" || stored === "light" ? stored : (prefersDark ? "dark" : "light");
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    if (theme === "dark") {
      root.style.setProperty("--bg", "222 47% 8%");
      root.style.setProperty("--fg", "210 15% 96%");
    } else {
      root.style.setProperty("--bg", "0 0% 100%");
      root.style.setProperty("--fg", "222 22% 12%");
    }
  } catch (_) {}
})();
`;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://simple-deutsch.de";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TRANSLATIONS[DEFAULT_LOCALE].siteTitle,
  description: TRANSLATIONS[DEFAULT_LOCALE].heroDescription,
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta charSet="UTF-8" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Simple Deutsch",
              url: SITE_URL,
              description: TRANSLATIONS[DEFAULT_LOCALE].heroDescription,
            }),
          }}
        />
        <link rel="preconnect" href="https://cms.simple-deutsch.de" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${nunito.variable} min-h-dvh antialiased bg-[hsl(var(--bg))] text-[hsl(var(--fg))]`}
      >
        <ChunkErrorRecovery />
        {/* biome-ignore lint/correctness/useUniqueElementIds: Stable singleton app shell wrapper. */}
        <div id="app-shell">{children}</div>
        {/* biome-ignore lint/correctness/useUniqueElementIds: Stable singleton overlay mount point. */}
        <div id="overlay-root" />
      </body>
    </html>
  );
}
