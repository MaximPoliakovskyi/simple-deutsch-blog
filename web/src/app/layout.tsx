import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ChunkErrorRecovery } from "@/components/chrome-extras";
import InitialPreloader from "@/components/preloader";
import { AppFadeWrapper, RouteTransitionProvider } from "@/components/route-wrapper";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import { getSiteOrigin } from "@/lib/site-url";
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
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let theme = prefersDark ? "dark" : "light";
    // Only read persisted theme when preferences consent has been given.
    try {
      const raw = localStorage.getItem("sd-consent");
      if (raw) {
        const c = JSON.parse(raw);
        if (c && c.v === 1 && c.categories && c.categories.preferences === true) {
          const stored = localStorage.getItem("sd-theme");
          if (stored === "dark" || stored === "light") theme = stored;
        }
      }
    } catch (_) {}
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

// Measures the native scrollbar width once, before the first paint, and stores
// it as --sb-w on <html>. The preloader CSS reads this to compensate for the
// gutter space that scrollbar-gutter:stable will claim once the preloader ends,
// so content width is identical before and after the preloader transition.
// Uses a self-sized helper element so the measurement is independent of the
// page's own overflow state (which is already overflow:hidden during preload).
const SCROLLBAR_WIDTH_SCRIPT = `(function(){
  try{
    var d=document.createElement("div");
    d.style.cssText="position:fixed;top:0;left:-9999px;width:100px;height:100px;overflow:scroll;visibility:hidden;pointer-events:none";
    document.documentElement.appendChild(d);
    var w=Math.max(0,d.offsetWidth-d.clientWidth);
    d.parentNode.removeChild(d);
    if(w>0)document.documentElement.style.setProperty("--sb-w",w+"px");
  }catch(e){}
})();`;

const SCROLL_RESTORATION_SCRIPT = `
(() => {
  try {
    const set = () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    };
    set();
    window.addEventListener("pageshow", set);
  } catch (_) {}
})();
`;

const SITE_URL = getSiteOrigin();

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
    <html lang={DEFAULT_LOCALE} suppressHydrationWarning data-preloader="1">
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

        <script dangerouslySetInnerHTML={{ __html: SCROLLBAR_WIDTH_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: SCROLL_RESTORATION_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={[
          nunito.variable,
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
        {/* biome-ignore lint/correctness/useUniqueElementIds: Stable singleton overlay mount point. */}
        <div id="overlay-root" />
        <SpeedInsights />
      </body>
    </html>
  );
}
