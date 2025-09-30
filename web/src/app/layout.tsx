// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "simple-deutsch.de",
  description: "Einfaches Deutsch, verständlich erklärt.",
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
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          "min-h-dvh antialiased",
        ].join(" ")}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-neutral-200/60 bg-[var(--sd-bg)]/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <a href="/" className="text-xl font-semibold tracking-tight">
              simple-deutsch.de
            </a>
            {/* Client component is safe here */}
            <ThemeToggle />
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

        {/* Footer */}
        <footer className="mx-auto max-w-5xl px-4 py-8 text-sm text-neutral-600 dark:text-neutral-400">
          © {new Date().getFullYear()} simple-deutsch.de
        </footer>
      </body>
    </html>
  );
}
