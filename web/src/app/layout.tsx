import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import { INITIAL_PRELOADER_BOOTSTRAP_SCRIPT } from "@/lib/initial-load-gate";
import { AnalyticsClient, ChunkErrorRecovery } from "@/components/chrome-extras";
import { AppFadeWrapper, RouteTransitionProvider } from "@/components/route-wrapper";
import InitialPreloader from "@/components/preloader";
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

        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://cms.simple-deutsch.de" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cms.simple-deutsch.de" />

        {/* Set loading flags before paint so the app shell does not flash before the preloader. */}
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
