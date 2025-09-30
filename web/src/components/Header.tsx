// src/components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close the menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const links = [
    { href: "/posts", label: "Posts" },
    { href: "/categories", label: "Categories" },
    { href: "/tags", label: "Tags" },
  ];

  const menuId = "mobile-menu";

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200/60 bg-[var(--sd-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          simple-deutsch.de
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-neutral-700 hover:underline dark:text-neutral-300"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
            className="rounded p-2 outline-none ring-0 transition hover:bg-neutral-200/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
            aria-label={open ? "Close menu" : "Open menu"}
            title={open ? "Close menu" : "Open menu"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id={menuId}
        ref={menuRef}
        className={[
          "md:hidden",
          "border-t border-neutral-200/60 bg-[var(--sd-bg)]",
          "transition-[max-height] duration-300 overflow-hidden",
          open ? "max-h-48" : "max-h-0",
        ].join(" ")}
        aria-hidden={!open}
      >
        <nav className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3" aria-label="Mobile Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded px-2 py-2 text-sm hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
