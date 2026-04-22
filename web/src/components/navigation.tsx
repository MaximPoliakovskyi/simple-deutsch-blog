"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type MouseEvent, type RefObject, useEffect, useRef, useState } from "react";
import { useI18n, usePostLangLinks } from "@/components/providers";
import { type Locale, parseLocaleFromPath } from "@/lib/i18n";
import { mapPathToLocale } from "@/lib/seo";
import {
  applyTheme,
  runThemeTransition,
  subscribeRootTheme,
  type Theme,
  type ThemeTransitionCoords,
} from "@/lib/theme";
import { useTransitionNav } from "./route-wrapper";

const MOBILE_MENU_ITEM_CLASS =
  "block w-full rounded-lg px-2 py-3 text-left !text-base !font-normal !leading-6 !tracking-[var(--tracking-copy)] hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60";

const DESKTOP_NAV_LINK_CLASS =
  "type-ui-label inline-flex min-h-10 items-center rounded-md px-2 text-neutral-700 transition-colors hover:text-neutral-900 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300 dark:hover:text-neutral-100";

// ---------------------------------------------------------------------------
// ThemeToggle (formerly theme-toggle.tsx)
// ---------------------------------------------------------------------------

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeRootTheme((theme) => {
      setIsDark(theme === "dark");
      setMounted(true);
    });
    return unsubscribe;
  }, []);

  function setTheme(next: Theme, coords?: ThemeTransitionCoords): void {
    if (!mounted) return;
    runThemeTransition(() => applyTheme(next), coords);
  }

  return (
    <button
      type="button"
      disabled={!mounted}
      onClick={(e) => setTheme(isDark ? "light" : "dark", { x: e.clientX, y: e.clientY })}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={
        "flex items-center justify-center w-9.5 h-9.5 rounded-full text-sm " +
        "transition-transform transform-gpu duration-200 ease-out hover:scale-[1.03] shadow-sm focus:outline-none focus-visible:outline-none " +
        "cursor-pointer sd-pill"
      }
      style={{ padding: 0, outlineColor: "oklch(0.371 0 0)" }}
    >
      {mounted ? (
        isDark ? (
          <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path
              d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M12 2v2M12 20v2M2 12h2M20 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )
      ) : (
        <span className="block h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// LanguageDropdown (formerly language-dropdown.tsx)
// ---------------------------------------------------------------------------

const HOVER_DELAY_MS = 150;

type LanguageDropdownProps = {
  currentLocale: NavLocale;
  buildHref: (target: NavLocale) => string;
  t: (k: string) => string;
  routeLocale?: NavLocale;
};

function usePostLanguageSwitch() {
  const transition = useTransitionNav();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { locale: currentLocale } = useI18n();
  const { postLangLinks } = usePostLangLinks();

  const routeLocale = parseLocaleFromPath(pathname) ?? currentLocale;
  const siteLang: Locale = postLangLinks?.currentLang ?? routeLocale;
  const query = searchParams?.toString();
  const pathWithQuery = query ? `${pathname}?${query}` : pathname;

  const persistLocaleCookie = (targetLang: Locale) => {
    const maxAge = 60 * 60 * 24 * 365;
    // biome-ignore lint/suspicious/noDocumentCookie: intentional locale persistence via document.cookie
    document.cookie = `NEXT_LOCALE=${targetLang}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    // biome-ignore lint/suspicious/noDocumentCookie: intentional locale persistence via document.cookie
    document.cookie = `locale=${targetLang}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  };

  const changeLang = async (targetLang: Locale) => {
    if (targetLang === siteLang && targetLang === routeLocale) return;
    try {
      persistLocaleCookie(targetLang);
      const href = mapPathToLocale(pathWithQuery, targetLang, {
        translationMap: postLangLinks?.links,
      });
      if (href !== pathWithQuery) {
        transition.navigateFromLanguageSwitch(href);
      }
    } catch {}
  };

  return { currentSiteLang: siteLang, changeLang };
}

function NavLanguageDropdown({
  closeMenu,
  currentSiteLangOverride,
}: {
  closeMenu?: () => void;
  currentSiteLangOverride?: NavLocale;
}) {
  const { currentSiteLang, changeLang } = usePostLanguageSwitch();

  const LANGS = [
    { code: "en", label: "En" },
    { code: "uk", label: "Ук" },
    { code: "ru", label: "Ру" },
  ] as const;

  const effectiveCurrent = currentSiteLangOverride ?? currentSiteLang;
  const visibleLangs = LANGS.filter((l) => l.code !== effectiveCurrent);

  return (
    <>
      {visibleLangs.map((item, idx) => (
        <li
          key={item.code}
          role="none"
          className={
            idx < visibleLangs.length - 1 ? "border-b border-neutral-100 dark:border-white/6" : ""
          }
        >
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              await changeLang(item.code);
              closeMenu?.();
            }}
            className={
              "w-full text-center py-3 text-sm leading-none transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] " +
              "hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
            }
          >
            {item.label}
          </button>
        </li>
      ))}
    </>
  );
}

function LanguageDropdown({ currentLocale, buildHref, t, routeLocale }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  void buildHref;

  const labelsShort: Record<NavLocale, string> = { en: "EN", uk: "УК", ru: "РУ" };
  const labelsFull: Record<NavLocale, string> = {
    en: "English",
    uk: "Українська",
    ru: "Русский",
  };

  useEffect(() => {
    function onDoc(e: Event) {
      const target = e.target as Node | null;
      if (!open) return;
      if (btnRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    window.addEventListener("pointerdown", onDoc);
    return () => window.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_DELAY_MS);
  };

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const [useHover, setUseHover] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = (e: MediaQueryListEvent) => setUseHover(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setTimeout(() => menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus(), 0);
    } else if (e.key === "Escape") {
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  return (
    <div
      className="relative inline-block text-left"
      {...(useHover ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {})}
    >
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        className={
          "flex items-center justify-center w-9.5 h-9.5 rounded-full text-sm " +
          "transition transform-gpu duration-200 ease-out hover:scale-[1.03] shadow-sm hover:shadow-md focus:outline-none focus-visible:outline-none " +
          "cursor-pointer sd-pill"
        }
        style={{ padding: 0, outlineColor: "oklch(0.371 0 0)" }}
        title={labelsFull[currentLocale]}
      >
        <span className="leading-none text-neutral-900 dark:text-neutral-100">
          {labelsShort[routeLocale ?? currentLocale]}
        </span>
        <span className="sr-only"> {t("language")}</span>
      </button>
      {open && (
        <ul
          ref={menuRef}
          aria-label={t("language")}
          className={
            "absolute left-1/2 -translate-x-1/2 mt-2 w-9.5 origin-top rounded-[9999px] px-0 " +
            "bg-[#FFFFFF] dark:bg-[#1f1f1f] border border-[#E6E7EB] dark:border-[#2b2b2b] " +
            "overflow-hidden z-50 shadow-sm transition-colors duration-200 ease-out"
          }
        >
          <NavLanguageDropdown
            closeMenu={() => setOpen(false)}
            currentSiteLangOverride={routeLocale ?? currentLocale}
          />
        </ul>
      )}
    </div>
  );
}



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
  { key: "posts", fallback: "Articles", path: "/articles" },
  { key: "categories", fallback: "Categories", path: "/categories" },
  { key: "levels", fallback: "Levels", path: "/levels" },
];

export const MOBILE_NAV_LINKS: readonly NavLinkItem[] = [
  { key: "posts", fallback: "Articles", path: "/articles" },
  { key: "categories", fallback: "Categories", path: "/categories" },
  { key: "levels", fallback: "Levels", path: "/levels" },
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
              className={DESKTOP_NAV_LINK_CLASS}
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
              onMouseEnter={() => prefetchIntent(href)}
              onFocus={() => prefetchIntent(href)}
              onClick={onNavigate}
              className={MOBILE_MENU_ITEM_CLASS}
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
    <div className="hidden items-center gap-4 md:flex">
      <NavLinks mode="desktop" buildLocalePath={buildLocalePath} label={label} />

      <div className="flex items-center gap-4">
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
  onToggleTheme: (event: MouseEvent<HTMLButtonElement>) => void;
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
      className={["md:hidden", "fixed inset-0 z-[110]", open ? "" : "pointer-events-none"].join(
        " ",
      )}
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
            className="type-brand"
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
              <button type="button" onClick={onToggleTheme} className={MOBILE_MENU_ITEM_CLASS}>
                {isDarkMobile ? label("lightMode", "Light theme") : label("darkMode", "Dark theme")}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
