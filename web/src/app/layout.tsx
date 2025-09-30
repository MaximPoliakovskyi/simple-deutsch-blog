// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import Header from "@/components/Header";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "simple-deutsch.de",
  description: "Simple German, clearly explained.",
};

// Runs before first paint to set dark/light without flash.
const themeInit = `
(function () {
  try {
    const ls = localStorage.getItem('sd-theme'); // 'dark' | 'light' | null
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const shouldDark = ls ? (ls === 'dark') : mql.matches;
    const el = document.documentElement;
    if (shouldDark) el.classList.add('dark'); else el.classList.remove('dark');
  } catch {}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className={[geistSans.variable, geistMono.variable, "min-h-dvh antialiased"].join(" ")}>
        {/* Skip link — WCAG 2.4.1 Bypass Blocks */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-3 focus:py-2 focus:outline-none focus:ring-2 focus:ring-[var(--sd-accent)]"
        >
          Zum Inhalt springen
        </a>

        {/* Site header (implicit banner landmark via <header>) */}
        <Header />

        {/* Primary content area (explicit role helps some ATs) */}
        <main id="main" role="main" className="mx-auto max-w-5xl px-4 py-6">
          {children}
        </main>

        {/* Footer as contentinfo landmark (HTML footer already implies contentinfo) */}
        <footer role="contentinfo" className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-600 dark:text-neutral-400">
          © {new Date().getFullYear()} simple-deutsch.de
        </footer>
      </body>
    </html>
  );
}
