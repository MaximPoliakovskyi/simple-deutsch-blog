// app/layout.tsx

import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import LocaleProviderFromPath from "@/components/LocaleProviderFromPath";
import AnalyticsClient from "@/components/layout/AnalyticsClient";
import Footer from "@/components/layout/Footer";
import HydratedNavigation from "@/components/layout/HydratedNavigation";
import { RouteReady } from "@/components/transition/RouteReady";
import { RouteTransitionProvider } from "@/components/transition/RouteTransitionProvider";
import BackButton from "@/components/ui/BackButton";
import PreloaderClient from "@/components/ui/PreloaderClient";
import { TRANSLATIONS } from "@/core/i18n/i18n";
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

  return (
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta charSet="UTF-8" />
        {/* Document title and favicon */}
        <title>{TRANSLATIONS[DEFAULT_LOCALE].siteTitle}</title>
        <link rel="icon" href="/logo.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://cms.simple-deutsch.de" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cms.simple-deutsch.de" />

        {/* Preload critical fonts for faster first paint */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"
          as="style"
        />

        {/* Prefetch common navigation pages (scope to default locale) */}
        <link
          rel="prefetch"
          href={`/api/posts?first=12&lang=${DEFAULT_LOCALE}`}
          as="fetch"
          crossOrigin="anonymous"
        />

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
        <LocaleProviderFromPath>
          {/* Preloader with 1.5s minimum display time */}
          <PreloaderClient />
          <RouteTransitionProvider>
            {/* Global navigation with SSR skeleton for fast FCP */}
            <HydratedNavigation />
            <RouteReady />

            {/* Main page content - add top spacing so content sits further below the nav */}
            <div className="mt-8 md:mt-12" aria-hidden />
            {children}

            {/* Global back button that appears after scrolling */}
            <BackButton />

            {/* Homepage-only components are rendered by their pages now. */}
            <Footer />
          </RouteTransitionProvider>

          {/* Load analytics only in production and defer to avoid blocking */}
          <AnalyticsClient isProd={isProd} />
        </LocaleProviderFromPath>
      </body>
    </html>
  );
}
