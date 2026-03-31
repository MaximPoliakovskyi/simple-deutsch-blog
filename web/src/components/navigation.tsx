"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, RefObject } from "react";
import type { Locale } from "@/lib/i18n";
import LanguageDropdown from "./language-dropdown";
import SearchButton from "./search-button";
import ThemeToggle from "./theme-toggle";

// ---------------------------------------------------------------------------
// nav-config types and constants (formerly nav-config.ts)
// ---------------------------------------------------------------------------

export type NavLocale = Locale;

export type NavLinkItem = {
  key: string;
  fallback: string;
  path: string;
};

export const DESKTOP_NAV_LINKS: readonly NavLinkItem[] = [
  { key: "posts", fallback: "Posts", path: "/posts" },
  { key: "categories", fallback: "Categories", path: "/categories" },
  { key: "levels", fallback: "Levels", path: "/levels" },
];

export const MOBILE_NAV_LINKS: readonly NavLinkItem[] = [
  { key: "posts", fallback: "Posts", path: "/posts" },
  { key: "categories", fallback: "Categories", path: "/categories" },
  { key: "levels", fallback: "Levels", path: "/levels" },
  { key: "search", fallback: "Search", path: "/search" },
];

// ---------------------------------------------------------------------------
// NavLinks — shared nav link renderer (formerly nav-links.tsx)
// ---------------------------------------------------------------------------

type NavLinksProps = {
  mode: "desktop" | "mobile";
  buildLocalePath: (path: string) => string;
  label: (key: string, fallback: string) => string;
  onNavigate?: () => void;
};

export function NavLinks({ mode, buildLocalePath, label, onNavigate }: NavLinksProps) {
  const router = useRouter();
  const prefetchIntent = (href: string) => {
    router.prefetch(href);
  };

  if (mode === "desktop") {
    return (
      <>
        {DESKTOP_NAV_LINKS.map((item) => {
          const href = buildLocalePath(item.path);
          return (
            <Link
              key={item.path}
              href={href}
              prefetch
              onMouseEnter={() => prefetchIntent(href)}
              onFocus={() => prefetchIntent(href)}
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              {label(item.key, item.fallback)}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {MOBILE_NAV_LINKS.map((item) => {
        const href = buildLocalePath(item.path);
        return (
          <li key={item.path}>
            <Link
              href={href}
              prefetch
              scroll={item.path === "/search" ? false : undefined}
              onMouseEnter={() => prefetchIntent(href)}
              onFocus={() => prefetchIntent(href)}
              onClick={onNavigate}
              className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
            >
              {label(item.key, item.fallback)}
            </Link>
          </li>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// NavigationDesktop (formerly navigation-desktop.tsx)
// ---------------------------------------------------------------------------

type Lang = NavLocale;

type DesktopProps = {
  currentLocale: Lang;
  pathname: string | null;
  buildLocalePath: (path: string, target?: Lang) => string;
  label: (key: string, fallback: string) => string;
  tFromProvider: (key: string) => string;
};

export function NavigationDesktop({
  currentLocale,
  pathname,
  buildLocalePath,
  label,
  tFromProvider,
}: DesktopProps) {
  return (
    <div className="hidden items-center gap-6 md:flex">
      <NavLinks mode="desktop" buildLocalePath={buildLocalePath} label={label} />

      <div className="flex items-center gap-4">
        <SearchButton variant="default" ariaLabel={label("searchPlaceholder", "Find an article")} />
        <div className="relative">
          <LanguageDropdown
            currentLocale={currentLocale}
            routeLocale={currentLocale}
            buildHref={(target: Lang) => buildLocalePath(pathname || "/", target)}
            t={tFromProvider}
          />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NavigationMobileControls + NavigationMobileDrawer (formerly navigation-mobile.tsx)
// ---------------------------------------------------------------------------

type MobileControlsProps = {
  open: boolean;
  currentLocale: Lang;
  pathname: string | null;
  toggleRef: RefObject<HTMLButtonElement | null>;
  buildLocalePath: (path: string, target?: Lang) => string;
  label: (key: string, fallback: string) => string;
  tFromProvider: (key: string) => string;
  onToggleMenu: () => void;
};

type MobileDrawerProps = {
  open: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  firstFocusRef: RefObject<HTMLAnchorElement | null>;
  currentLocale: Lang;
  isDarkMobile: boolean;
  buildLocalePath: (path: string, target?: Lang) => string;
  buildLocaleRootHref: (target: Lang) => string;
  label: (key: string, fallback: string) => string;
  onCloseMenu: () => void;
  onLogoClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onToggleTheme: () => void;
};

export function NavigationMobileControls({
  open,
  currentLocale,
  pathname,
  toggleRef,
  buildLocalePath,
  label,
  tFromProvider,
  onToggleMenu,
}: MobileControlsProps) {
  return (
    <div className="flex items-center gap-2 md:hidden">
      <SearchButton ariaLabel={label("searchPlaceholder", "Find an article")} variant="icon" />
      <div className="relative">
        <LanguageDropdown
          currentLocale={currentLocale}
          routeLocale={currentLocale}
          buildHref={(target: Lang) => buildLocalePath(pathname || "/", target)}
          t={tFromProvider}
        />
      </div>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        onClick={onToggleMenu}
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
  );
}

export function NavigationMobileDrawer({
  open,
  panelRef,
  firstFocusRef,
  currentLocale,
  isDarkMobile,
  buildLocalePath,
  buildLocaleRootHref,
  label,
  onCloseMenu,
  onLogoClick,
  onToggleTheme,
}: MobileDrawerProps) {
  return (
    <div
      className={["md:hidden", "fixed inset-0 z-90", open ? "" : "pointer-events-none"].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onCloseMenu}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label("mobileMenu", "Mobile menu")}
        className={[
          "absolute inset-0",
          "bg-[hsl(var(--bg))]",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href={buildLocaleRootHref(currentLocale)}
            onClick={onLogoClick}
            className="text-xl font-semibold tracking-tight"
            ref={firstFocusRef}
          >
            simple-deutsch.de
          </Link>
          <button
            type="button"
            onClick={onCloseMenu}
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
            <NavLinks
              mode="mobile"
              buildLocalePath={buildLocalePath}
              label={label}
              onNavigate={onCloseMenu}
            />
            <li>
              <button
                type="button"
                onClick={onToggleTheme}
                className="block w-full text-left rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
              >
                {isDarkMobile ? label("lightMode", "Light theme") : label("darkMode", "Dark theme")}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
