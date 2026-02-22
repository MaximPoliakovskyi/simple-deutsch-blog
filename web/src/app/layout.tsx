// app/layout.tsx

import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import AnalyticsClient from "@/components/layout/AnalyticsClient";
import ChunkErrorRecovery from "@/components/layout/ChunkErrorRecovery";
import { RouteTransitionProvider } from "@/components/transition/RouteTransitionProvider";
import AppFadeWrapper from "@/components/ui/AppFadeWrapper";
import InitialPreloader from "@/components/ui/InitialPreloader";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { INITIAL_PRELOADER_BOOTSTRAP_SCRIPT } from "@/hooks/initialLoadGate";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import "@/styles/globals.css";
import "@/styles/route-transition.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
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
  } catch (_) {}
})();
`;

/* biome-disable */
export default function RootLayout({ children }: { children: ReactNode }) {
  const isProd = process.env.NODE_ENV === "production";
  const isVercel = process.env.VERCEL === "1";
  const enableAnalytics = isProd && isVercel;

  return (
    <html
      lang={DEFAULT_LOCALE}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      data-preloader="1"
      data-app-visible="0"
    >
      <head>
        <meta charSet="UTF-8" />
        {/* Document title and favicon */}
        <title>{TRANSLATIONS[DEFAULT_LOCALE].siteTitle}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://cms.simple-deutsch.de" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cms.simple-deutsch.de" />

        {/* Decide preloader visibility before first paint to prevent content flash */}
        <script dangerouslySetInnerHTML={{ __html: INITIAL_PRELOADER_BOOTSTRAP_SCRIPT }} />

        {/* Apply theme before paint to avoid flash and hydration drift. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-dvh antialiased bg-[hsl(var(--bg))] text-[hsl(var(--fg))]",
        ].join(" ")}
      >
        <ChunkErrorRecovery />
        <InitialPreloader />
        <RouteTransitionProvider>
          <AppFadeWrapper>
            {/* biome-ignore lint/correctness/useUniqueElementIds: Stable singleton app shell wrapper. */}
            <div id="app-shell">{children}</div>
          </AppFadeWrapper>
        </RouteTransitionProvider>
        {/* Load analytics only in production and defer to avoid blocking */}
        <AnalyticsClient enabled={enableAnalytics} />
      </body>
    </html>
  );
}
