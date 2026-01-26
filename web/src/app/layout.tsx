// app/layout.tsx

import { Suspense } from "react";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import BackButton from "@/components/ui/BackButton";
import Footer from "@/components/layout/Footer";
import HydratedNavigation from "@/components/layout/HydratedNavigation";
import PreloaderClient from "@/components/ui/PreloaderClient";
import AnalyticsClient from "@/components/layout/AnalyticsClient";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { LocaleProvider } from "@/core/i18n/LocaleProvider";
import "@/styles/globals.css";

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

/**
 * Runs before paint to set the theme without a flash.
 * Reads localStorage 'sd-theme' or falls back to system preference.
 * Applies `.dark` class to <html> for Tailwind v4 @custom-variant dark.
 */
/* theme init moved to /public/theme-init.js to avoid inline injection */

/* biome-disable */
export default function RootLayout({ children }: { children: ReactNode }) {
  const isProd = process.env.NODE_ENV === "production";

  return (
    <html lang="de" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
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
        
        {/* Prefetch common navigation pages */}
        <link rel="prefetch" href="/api/posts?first=12" as="fetch" crossOrigin="anonymous" />
        
        {/* Small, static script that reads localStorage and sets a CSS class to avoid flash-of-unstyled-content (FOUC). */}
        <script src="/theme-init.js" />
      </head>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-dvh antialiased bg-[hsl(var(--bg))] text-[hsl(var(--fg))]",
        ].join(" ")}
      >
        {/* Preloader with 1.5s minimum display time */}
        <PreloaderClient />

        {/* Global navigation with SSR skeleton for fast FCP */}
        <LocaleProvider>
          <HydratedNavigation />

          {/* Main page content - add top spacing so content sits further below the nav */}
          <div className="mt-8 md:mt-12" aria-hidden />
          {children}

          {/* Global back button that appears after scrolling */}
          <BackButton />

          {/* Homepage-only components are rendered by their pages now. */}
          <Footer />
        </LocaleProvider>

        {/* Load analytics only in production and defer to avoid blocking */}
        <AnalyticsClient isProd={isProd} />
      </body>
    </html>
  );
}
