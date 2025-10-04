// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import Header from "@/components/Navigation";
import "@/styles/globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "simple-deutsch.de",
  description: "Simple German, clearly explained.",
};

/**
 * Runs before paint to set the theme without a flash.
 * Reads localStorage 'sd-theme' or falls back to system preference.
 * Applies `.dark` class to <html> for Tailwind v4 @custom-variant dark.
 */
const themeInit = `
(function () {
  try {
    var ls = localStorage.getItem('sd-theme'); // 'dark' | 'light' | null
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var initial = ls ? ls : (systemDark ? 'dark' : 'light');
    var root = document.documentElement;
    if (initial === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  } catch (_) {}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      data-scroll-behavior="smooth" // ✅ fixes Next.js warning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-dvh antialiased bg-[hsl(var(--bg))] text-[hsl(var(--fg))]",
        ].join(" ")}
      >
        {/* Accessible skip link (optional)
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-3 focus:py-2 focus:outline-none focus:ring-2 focus:ring-[var(--sd-accent)]"
        >
          Zum Inhalt springen
        </a> */}

        <Header />

        <main id="main" role="main" className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </main>

        <footer
          role="contentinfo"
          className="mx-auto max-w-7xl px-4 py-8 text-sm text-neutral-600 dark:text-neutral-400"
        >
          © {new Date().getFullYear()} simple-deutsch.de
        </footer>
      </body>
    </html>
  );
}