import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { ChunkErrorRecovery } from "@/components/chrome-extras";
import InitialPreloader from "@/components/preloader";
import RouteScrollReset from "@/components/route-scroll-reset";
import { AppFadeWrapper, RouteTransitionProvider } from "@/components/route-wrapper";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import "@/styles/globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "optional",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const THEME_INIT_SCRIPT = `
(() => {
  try {
    const key = "sd-theme";
    const stored = localStorage.getItem(key);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "dark" || stored === "light" ? stored : (prefersDark ? "dark" : "light");
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    // Seed the two most critical CSS variables inline so the preloader
    // background is opaque from the very first paint — before globals.css
    // has been fetched and parsed (especially important on slow connections).
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

const SCROLL_RESTORATION_SCRIPT = `
(() => {
  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  } catch (_) {}
})();
`;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://simple-deutsch.de";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TRANSLATIONS[DEFAULT_LOCALE].siteTitle,
  description: TRANSLATIONS[DEFAULT_LOCALE].heroDescription,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/* biome-disable */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
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

        <link rel="dns-prefetch" href="https://cms.simple-deutsch.de" />

        <script dangerouslySetInnerHTML={{ __html: SCROLL_RESTORATION_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={[
          nunito.variable,
          "min-h-dvh antialiased bg-[hsl(var(--bg))] text-[hsl(var(--fg))]",
        ].join(" ")}
      >
        <RouteScrollReset />
        <ChunkErrorRecovery />
        <InitialPreloader />
        <RouteTransitionProvider>
          <AppFadeWrapper>
            {/* biome-ignore lint/correctness/useUniqueElementIds: Stable singleton app shell wrapper. */}
            <div id="app-shell">{children}</div>
          </AppFadeWrapper>
        </RouteTransitionProvider>
        {/* biome-ignore lint/correctness/useUniqueElementIds: Stable singleton overlay mount point. */}
        <div id="overlay-root" />
      </body>
    </html>
  );
}
