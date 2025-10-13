// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { SearchButton } from "@/components/SearchOverlay";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const id = useId();
  const titleId = `mobile-menu-title-${id}`;

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const root = document.documentElement;
    if (!open) return;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  // Focus trap + Escape to close
  useEffect(() => {
    if (!open) return;
    const toFocus =
      firstFocusRef.current ||
      panelRef.current?.querySelector<HTMLElement>(
        'a, button, [href], [tabindex]:not([tabindex="-1"])',
      );
    toFocus?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Click outside to close
  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node | null;
      const onToggle = !!(toggleRef.current && t && toggleRef.current.contains(t));
      const inside = !!(panelRef.current && t && panelRef.current.contains(t));
      if (onToggle || inside) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  return (
    <>
      {/* Semantic navigation landmark */}
      <nav
        className="sticky top-0 z-40 border-b border-neutral-200/60 bg-[hsl(var(--bg))]/90 backdrop-blur dark:border-white/10"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-semibold tracking-tight" aria-label="Home">
            simple-deutsch.de
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/posts"
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              Posts
            </Link>
            <Link
              href="/categories"
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              Categories
            </Link>
            <Link
              href="/tags"
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              Tags
            </Link>

            <SearchButton className="ml-2" variant="default" />
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <SearchButton ariaLabel="Artikel finden" variant="icon" />
            <ThemeToggle />
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="mobile-fullscreen-menu"
              onClick={() => setOpen((v) => !v)}
              className="rounded p-2 outline-none ring-0 transition hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
              aria-label={open ? "Menü schließen" : "Menü öffnen"}
              title={open ? "Menü schließen" : "Menü öffnen"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true">
                {open ? (
                  <path
                    d="M6 6l12 12M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 6h18M3 12h18M3 18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={["md:hidden", "fixed inset-0 z-[90]", open ? "" : "pointer-events-none"].join(
          " ",
        )}
      >
        <div
          className={[
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          id={`mobile-fullscreen-menu-${id}`}
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={[
            "absolute inset-0",
            "bg-[hsl(var(--bg))]",
            "transition-transform duration-300 will-change-transform",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-neutral-200/60 px-4 py-3 dark:border-white/10">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-lg font-semibold tracking-tight"
              id={titleId}
              ref={firstFocusRef}
            >
              simple-deutsch.de
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-2 hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
              aria-label="Menü schließen"
              title="Menü schließen"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="mx-auto w-full max-w-5xl px-4 py-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/posts"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  Posts
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/tags"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  Tags
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  Search
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
