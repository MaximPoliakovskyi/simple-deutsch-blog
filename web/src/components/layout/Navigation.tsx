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
import { DEFAULT_LOCALE, parseLocaleFromPath } from "@/i18n/locale";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

// Note: Navigation is mounted in the root layout (outside the per-locale layout),
// so it must derive the active locale from the URL prefix when present.

type Lang = NavLocale;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [isDarkMobile, setIsDarkMobile] = useState<boolean>(false);
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const [_progressLeft, setProgressLeft] = useState<number | null>(null);
  const [_progressWidth, setProgressWidth] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);

  // Navigation is outside the per-locale provider, so derive the active locale from the URL.
  const { locale: uiLocale } = useI18n();
  const routeLocale = parseLocaleFromPath(pathname || "/") ?? uiLocale ?? DEFAULT_LOCALE;
  const currentLocale: Lang = routeLocale;

  const buildLocaleRootHref = (target: Lang) => buildLocalizedHref(target, "/");

  const buildLocalePath = (path: string, target: Lang = currentLocale) => {
    const p = path.startsWith("/") ? path : `/${path}`;
    return buildLocalizedHref(target, p);
  };

  const { t: tFromProvider } = useI18n();

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

  // Mobile theme state/toggle for the burger menu textual item
  useEffect(() => {
    const root = document.documentElement;
    setIsDarkMobile(root.classList.contains("dark"));
  }, []);

  const toggleMobileTheme = () => {
    const root = document.documentElement;
    const nextIsDark = !root.classList.contains("dark");
    if (nextIsDark) root.classList.add("dark");
    else root.classList.remove("dark");
    try {
      localStorage.setItem("sd-theme", nextIsDark ? "dark" : "light");
    } catch {}
    setIsDarkMobile(nextIsDark);
  };

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
    if (!pathname) return;
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
  }, [pathname]);

  return (
    <>
      {/* Semantic navigation landmark */}
      <nav
        ref={navRef}
        className="sticky top-0 z-40 bg-[hsl(var(--bg))]/90 backdrop-blur"
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
          <div
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
        </div>
      </nav>
      <NavigationMobileDrawer
        open={open}
        panelRef={panelRef}
        firstFocusRef={firstFocusRef}
        currentLocale={currentLocale}
        isDarkMobile={isDarkMobile}
        buildLocalePath={buildLocalePath}
        buildLocaleRootHref={buildLocaleRootHref}
        label={label}
        onCloseMenu={() => setOpen(false)}
        onLogoClick={() => {
          // close the menu; allow Link to perform the navigation
          handleLogoClick();
        }}
        onToggleTheme={() => {
          toggleMobileTheme();
          // keep menu open so user sees the change, or close if preferred
        }}
      />
    </>
  );
}
