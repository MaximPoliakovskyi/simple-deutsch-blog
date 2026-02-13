// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NavigationDesktop from "@/components/layout/NavigationDesktop";
import {
  NavigationMobileControls,
  NavigationMobileDrawer,
} from "@/components/layout/NavigationMobile";
import type { NavLocale } from "@/components/layout/navConfig";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { useI18n } from "@/core/i18n/LocaleProvider";
import { buildLocalizedHref } from "@/core/i18n/localeLinks";
import { applyTheme, subscribeRootTheme, type Theme } from "@/core/theme/client";
import { DEFAULT_LOCALE, parseLocaleFromPath, SUPPORTED_LOCALES } from "@/i18n/locale";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

// Note: Navigation is mounted in the root layout (outside the per-locale layout),
// so it must derive the active locale from the URL prefix when present.

type Lang = NavLocale;

function normalizePathname(pathname: string | null): string {
  if (!pathname) return "/";
  let normalized = pathname;

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (basePath) {
    const cleanBasePath = basePath.startsWith("/") ? basePath : `/${basePath}`;
    if (normalized === cleanBasePath) {
      normalized = "/";
    } else if (normalized.startsWith(`${cleanBasePath}/`)) {
      normalized = normalized.slice(cleanBasePath.length);
    }
  }

  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/, "");
  }

  return normalized || "/";
}

// Routes where the global top progress bar should never be shown.
const PROGRESS_BAR_DISABLED_ROUTES = new Set([
  "/categories",
  "/categories/exercises-practice",
  "/categories/grammar",
  "/levels/a2",
]);

const PROGRESS_BAR_DISABLED_PREFIXES = ["/categories/"];

function isProgressBarDisabledPath(pathname: string): boolean {
  if (PROGRESS_BAR_DISABLED_ROUTES.has(pathname)) return true;
  return PROGRESS_BAR_DISABLED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getCanonicalPathname(pathname: string): string {
  const normalized = normalizePathname(pathname);
  const segments = normalized.split("/").filter(Boolean);
  if (segments.length === 0) return "/";

  // Normalize `/en/foo` -> `/foo` so route checks work for localized and non-localized URLs.
  const maybeLocale = parseLocaleFromPath(`/${segments[0].toLowerCase()}`);
  if (maybeLocale) {
    const withoutLocale = segments.slice(1).join("/");
    return withoutLocale ? `/${withoutLocale}` : "/";
  }

  return normalized;
}

export default function Header() {
  const [hasMounted, setHasMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [mobileTheme, setMobileTheme] = useState<Theme>("light");
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const [_progressLeft, setProgressLeft] = useState<number | null>(null);
  const [_progressWidth, setProgressWidth] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const lastDebugPathRef = useRef<string | null>(null);

  // Navigation is outside the per-locale provider, so derive the active locale from the URL.
  const { locale: uiLocale, t: tFromProvider } = useI18n();
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);
  const segmentsKey = segments.join("/");
  const localeFromPath =
    segments.length > 0 ? parseLocaleFromPath(`/${segments[0].toLowerCase()}`) : null;
  const isLocaleRoot =
    segments.length === 1 && localeFromPath !== null && SUPPORTED_LOCALES.includes(localeFromPath);
  const canonicalPathname = getCanonicalPathname(normalizedPathname);
  const isProgressBarDisabledRoute = isProgressBarDisabledPath(canonicalPathname);
  const shouldEnableProgressBar = hasMounted && !isLocaleRoot && !isProgressBarDisabledRoute;
  const routeLocale = parseLocaleFromPath(normalizedPathname) ?? uiLocale ?? DEFAULT_LOCALE;
  const currentLocale: Lang = routeLocale;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (process.env.NEXT_PUBLIC_DEBUG_PROGRESSBAR !== "1") return;
    if (lastDebugPathRef.current === normalizedPathname) return;
    lastDebugPathRef.current = normalizedPathname;

    console.log("[progressbar-debug]", {
      pathname,
      normalizedPathname,
      segments,
      segmentsKey,
      locale: routeLocale,
      isLocaleRoot,
      canonicalPathname,
      isProgressBarDisabledRoute,
      hasMounted,
      shouldEnableProgressBar,
    });
  });

  const buildLocaleRootHref = (target: Lang) => buildLocalizedHref(target, "/");

  const buildLocalePath = (path: string, target: Lang = currentLocale) => {
    const p = path.startsWith("/") ? path : `/${path}`;
    return buildLocalizedHref(target, p);
  };

  // helper: prefer fast route-derived translations, then provider `t`, then fallback.
  const label = (key: string, fallback: string) => {
    try {
      const fast = TRANSLATIONS[currentLocale]?.[key];
      if (fast && fast !== key) return fast;
    } catch {}
    try {
      const v = tFromProvider(key);
      if (v && v !== key) return v;
    } catch {}
    return fallback;
  };
  // Use router only when needed; keep the logo interaction simple and
  // reliable by closing the mobile menu and letting Next's Link handle
  // the navigation (progressive enhancement + prefetching).
  // We keep router import available for later UX improvements.
  const _router = useRouter();

  const handleLogoClick = (_e?: React.MouseEvent<HTMLAnchorElement>) => {
    // Close the mobile menu so the UI doesn't remain open during navigation.
    setOpen(false);
    // Let the Link's native navigation run (keeps prefetching & SEO).
    // If we later want a client-only transition we can call `router.push(href)`.
  };

  // Keep mobile label in sync with the single root theme source.
  useEffect(() => {
    return subscribeRootTheme((theme) => {
      setMobileTheme(theme);
    });
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!open) return;
    try {
      lockScroll();
    } catch {}
    return () => {
      try {
        unlockScroll();
      } catch {}
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

  // Reading progress: measure how far through `main article` the user has scrolled
  useEffect(() => {
    if (!pathname || !shouldEnableProgressBar) {
      setProgress(0);
      setVisible(false);
      return;
    }
    let rafId = 0;
    let ticking = false;

    const calculate = () => {
      const article =
        (document.querySelector('[data-reading-target="post"]') as HTMLElement | null) ??
        (document.querySelector("article.prose") as HTMLElement | null) ??
        (document.querySelector("main article") as HTMLElement | null);
      if (!article) {
        setProgress(0);
        setVisible(false);
        return;
      }

      const rect = article.getBoundingClientRect();
      const articleLeft = rect.left;
      const articleWidth = rect.width;
      const navHeight = navRef.current?.offsetHeight ?? 0;
      const articleTop = rect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const start = Math.max(0, articleTop - navHeight);
      const end = Math.max(start + 1, articleTop + articleHeight - viewportHeight);
      let percent = 0;

      if (scrollY <= start) {
        percent = 0;
      } else if (scrollY >= end) {
        percent = 100;
      } else {
        percent = Math.min(100, Math.max(0, ((scrollY - start) / (end - start)) * 100));
      }

      setProgress(Number(percent.toFixed(2)));
      setProgressLeft(Math.round(articleLeft));
      setProgressWidth(Math.round(articleWidth));
      setVisible(true);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(() => {
        calculate();
        ticking = false;
      });
    };

    // Initialize and attach listeners
    calculate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [pathname, shouldEnableProgressBar]);

  return (
    <>
      {/* Semantic navigation landmark */}
      <nav
        ref={navRef}
        className="sticky top-0 z-40 bg-[hsl(var(--bg))] text-[hsl(var(--fg))]"
        aria-label="Main navigation"
      >
        <div>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:py-5">
            <Link
              href={buildLocaleRootHref(currentLocale)}
              onClick={handleLogoClick}
              className="text-xl font-semibold tracking-tight"
              aria-label={label("home", "Home")}
            >
              simple-deutsch.de
            </Link>
            <NavigationDesktop
              currentLocale={currentLocale}
              pathname={pathname}
              buildLocalePath={buildLocalePath}
              label={label}
              tFromProvider={tFromProvider}
            />

            <NavigationMobileControls
              open={open}
              currentLocale={currentLocale}
              pathname={pathname}
              toggleRef={toggleRef}
              buildLocalePath={buildLocalePath}
              label={label}
              tFromProvider={tFromProvider}
              onToggleMenu={() => setOpen((v) => !v)}
            />
          </div>
          {/* Reading progress bar (fills as user reads the article)
              Positioned over the article column and only visible while reading */}
          {shouldEnableProgressBar && (
            <div
              data-progress-bar="reading"
              aria-hidden
              className="fixed top-0 left-0 z-50 pointer-events-none w-screen inset-x-0 transition-opacity duration-300"
              style={{
                opacity: visible ? 1 : 0,
                top: navRef.current ? `${navRef.current.getBoundingClientRect().top}px` : "0px",
              }}
            >
              <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden rounded">
                <div
                  className="h-full bg-[var(--sd-accent)] transition-transform duration-300 ease-out"
                  style={{
                    transform: `scaleX(${progress / 100})`,
                    transformOrigin: "left",
                    willChange: "transform",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </nav>
      <NavigationMobileDrawer
        open={open}
        panelRef={panelRef}
        firstFocusRef={firstFocusRef}
        currentLocale={currentLocale}
        isDarkMobile={mobileTheme === "dark"}
        buildLocalePath={buildLocalePath}
        buildLocaleRootHref={buildLocaleRootHref}
        label={label}
        onCloseMenu={() => setOpen(false)}
        onLogoClick={() => {
          // close the menu; allow Link to perform the navigation
          handleLogoClick();
        }}
        onToggleTheme={() => {
          applyTheme(mobileTheme === "dark" ? "light" : "dark");
          // keep menu open so user sees the change, or close if preferred
        }}
      />
    </>
  );
}
