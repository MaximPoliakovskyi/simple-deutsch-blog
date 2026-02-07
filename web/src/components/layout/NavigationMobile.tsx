"use client";

import Link from "next/link";
import type { RefObject } from "react";
import SearchButton from "@/components/features/search/SearchButton";
import LanguageDropdown from "@/components/layout/LanguageDropdown";
import NavLinks from "@/components/layout/NavLinks";
import type { NavLocale } from "@/components/layout/navConfig";

type Lang = NavLocale;

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
  onLogoClick: () => void;
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
        aria-label={open ? "Men\u00FC schlie\u00DFen" : "Men\u00FC \u00F6ffnen"}
        title={open ? "Men\u00FC schlie\u00DFen" : "Men\u00FC \u00F6ffnen"}
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
            aria-label="Men\u00FC schlie\u00DFen"
            title="Men\u00FC schlie\u00DFen"
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
            {/* language links removed from mobile drawer â€” language switch is available via the pill in the header */}
          </ul>
        </nav>
      </div>
    </div>
  );
}
