// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchButton } from "@/components/features/search/SearchOverlay";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { useI18n } from "@/core/i18n/LocaleProvider";
import { buildLocalizedHref } from "@/core/i18n/localeLinks";
import { parseLocaleFromPath } from "@/i18n/locale";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

// Note: Navigation is mounted in the root layout (outside the per-locale layout),
// so it must derive the active locale from the URL prefix when present.

// LanguageDropdown uses the hooks imported above

type Lang = "en" | "ru" | "uk";

// Helper: replace only the leading locale segment in a path
function replaceLeadingLocale(path: string, target: Lang) {
  const p = path || "/";
  const segs = p.split("/").filter(Boolean);
  if (segs.length === 0) return `/${target}`;
  if (["en", "ru", "uk"].includes(segs[0])) segs[0] = target;
  else segs.unshift(target);
  return `/${segs.join("/")}`;
}

type LanguageDropdownProps = {
  currentLocale: Lang;
  buildHref: (target: Lang) => string;
  t: (k: string) => string;
  routeLocale?: Lang;
};

const HOVER_DELAY_MS = 150; // delay before closing menu on mouseleave

/**
 * Compact language switcher button.
 * Shows short labels (Eng / Укр / Рус) and cycles to the next language on click.
 * Uses client-side navigation (router.push) to preserve SPA behavior and update the URL.
 */
function LanguageDropdown({ currentLocale, buildHref, t, routeLocale }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // All languages ordered; when rendering we place the selected locale at the top
  const _order: Lang[] = ["en", "uk", "ru"];
  // Short labels for the pill / stacked items
  const labelsShort: Record<Lang, string> = { en: "EN", uk: "УК", ru: "РУ" };
  const labelsFull: Record<Lang, string> = { en: "English", uk: "Українська", ru: "Русский" };

  useEffect(() => {
    function onDoc(e: Event) {
      const t = e.target as Node | null;
      if (!open) return;
      if (btnRef.current && t && btnRef.current.contains(t)) return;
      if (menuRef.current && t && menuRef.current.contains(t)) return;
      setOpen(false);
    }
    // Use pointerdown to catch both mouse and touch interactions.
    window.addEventListener("pointerdown", onDoc);
    return () => window.removeEventListener("pointerdown", onDoc);
  }, [open]);

  // Hover helpers: add a small delay when closing so the user can move
  // the pointer from the button to the menu without it disappearing.
  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    // small delay to prevent flicker when moving the pointer
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Detect whether the current input modality supports hover (desktop).
  // On touch devices we disable hover-based open behavior and rely on click/tap.
  const [useHover, setUseHover] = useState<boolean>(() => {
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
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // keyboard handling: open with ArrowDown/Enter/Space, close with Escape
  const onButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      // focus first menu item after a tick
      setTimeout(() => {
        const first = menuRef.current?.querySelector<HTMLAnchorElement>("a");
        first?.focus();
      }, 0);
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
        // match SearchButton styling and set exact 38x38 size
        className={
          "flex items-center justify-center w-9.5 h-9.5 rounded-full text-sm " +
          "transition transform-gpu duration-200 ease-out hover:scale-[1.03] shadow-sm hover:shadow-md focus:outline-none focus-visible:outline-none " +
          "cursor-pointer " +
          "sd-pill"
        }
        style={{ padding: 0, outlineColor: "oklch(0.371 0 0)" }}
        aria-label={t("language") || `Language (${labelsFull[currentLocale]})`}
        title={labelsFull[currentLocale]}
      >
        <span className="sr-only">{t("language")}</span>
        <span className="leading-none text-neutral-900 dark:text-neutral-100">
          {labelsShort[routeLocale ?? currentLocale]}
        </span>
      </button>

      {open && (
        <ul
          ref={menuRef}
          aria-label={t("language")}
          className={
            "absolute left-1/2 -translate-x-1/2 mt-2 w-9.5 origin-top rounded-[9999px] px-0 " +
            // Keep the original light-theme look but use the provided grey only
            // when the site is in dark mode so light theme remains unchanged.
            "bg-[#FFFFFF] dark:bg-[#1f1f1f] border border-[#E6E7EB] dark:border-[#2b2b2b] " +
            "overflow-hidden z-50 shadow-sm transition-colors duration-200 ease-out"
          }
        >
          {/* Vertical-pill language switcher: stacked labels displayed as centered rows */}
          <NavLanguageDropdown
            closeMenu={() => setOpen(false)}
            currentSiteLangOverride={routeLocale ?? currentLocale}
          />
        </ul>
      )}
    </div>
  );
}

// Small helper hook used by the NavLanguageDropdown.
// Returns current locale from `useI18n()` and a setter. All navigation uses
// `buildLocalizedHref()` to generate
// canonical prefixed links; we do NOT infer UI locale from the pathname.
function useLanguage() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { locale: currentLocale } = useI18n();

  function persistLocale(_next: Lang) {}

  function setLocale(next: Lang) {
    persistLocale(next);

    try {
      const base = replaceLeadingLocale(pathname, next);
      const qs = searchParams?.toString();
      const newPath = qs ? `${base}?${qs}` : base;
      if (newPath !== pathname) router.push(newPath);
    } catch {
      // Fallback to root of target locale if anything fails
      const root = `/${next}`;
      if (root !== pathname) router.push(root);
    }
  }

  // Navigation lives in the root layout, outside the per-locale layout provider.
  // Derive the *route* locale from the URL prefix when present, otherwise fall back
  // to the i18n context locale (default "en").
  const routeLocale = (parseLocaleFromPath(pathname) ?? currentLocale) as Lang;

  return {
    locale: routeLocale,
    setLocale,
    persistLocale,
  } as { locale: Lang; setLocale: (l: Lang) => void; persistLocale: (l: Lang) => void };
}
// Hook: usePostLanguageSwitch
// Parses current pathname to determine siteLang, isPost and slug, and
// exposes changeLang(targetLang) which updates UI language and navigates
// to the corresponding post path when applicable.
function usePostLanguageSwitch() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { locale: currentLocale, setLocale, persistLocale } = useLanguage();
  const { postLangLinks } = useI18n();

  const SITE_LANGS = ["en", "ru", "uk"] as const;
  type SiteLang = (typeof SITE_LANGS)[number];

  // Determine site language from i18n context (UI must not infer from pathname)
  let siteLang: SiteLang = currentLocale as SiteLang;
  const languageLinks = postLangLinks?.links ?? null;
  const currentFromLinks = (postLangLinks?.currentLang as SiteLang | undefined) ?? null;
  if (currentFromLinks) siteLang = currentFromLinks;

  // Determine whether current path is a post page without inferring a locale.
  // We look for the '/posts/' segment and extract the slug if present.
  const postsIdx = pathname.indexOf("/posts/");
  let isPost = false;
  let slug: string | null = null;
  if (postsIdx !== -1) {
    isPost = true;
    const after = pathname.substring(postsIdx + "/posts/".length);
    if (after) {
      const nextSlash = after.indexOf("/");
      slug = nextSlash === -1 ? after : after.substring(0, nextSlash);
    }
  }

  const changeLang = async (targetLang: SiteLang) => {
    // If nothing to do, and siteLang equals currentLocale (both match), skip
    if (targetLang === siteLang && targetLang === currentLocale) return;

    // Article detail pages: only navigate if we have an explicit translation URL.
    // (Do not guess slugs; it leads to 404s when slugs naturally contain '-'.)
    if (isPost && slug && postLangLinks) {
      const href = postLangLinks.links[targetLang] ?? null;
      if (!href) return;
      try {
        persistLocale(targetLang as Lang);
      } catch {}
      try {
        await router.push(href);
      } catch {}
      return;
    }

    // Non-article pages (and anything else): switch by replacing the locale prefix.
    try {
      setLocale(targetLang as Lang);
    } catch {}
  };

  return {
    currentSiteLang: siteLang as SiteLang,
    changeLang,
    languageLinks,
    isPost,
    hasSlug: Boolean(slug),
  };
}

// Component: NavLanguageDropdown
function NavLanguageDropdown({
  closeMenu,
  currentSiteLangOverride,
}: {
  closeMenu?: () => void;
  currentSiteLangOverride?: Lang;
}) {
  const { currentSiteLang, changeLang, languageLinks, isPost, hasSlug } = usePostLanguageSwitch();

  const LANGS = [
    { code: "en", label: "En" },
    { code: "uk", label: "Ук" },
    { code: "ru", label: "Ру" },
  ] as const;

  type LangCode = (typeof LANGS)[number]["code"];

  // Exclude the currently selected language (it's shown in the closed pill)
  const effectiveCurrent = currentSiteLangOverride ?? currentSiteLang;
  const visibleLangs = LANGS.filter((l) => l.code !== effectiveCurrent);

  return (
    <>
      {visibleLangs.map((item, idx) => (
        // Disable only when on a specific article page and the translation is missing.
        // Allow switching on posts listing page (no slug).
        <li
          key={item.code}
          role="none"
          className={
            idx < visibleLangs.length - 1 ? "border-b border-neutral-100 dark:border-white/6" : ""
          }
        >
          {(() => {
            // Enable if not on posts, or if on posts listing (no slug), or if article translation exists
            const linkAvailable =
              !isPost || !hasSlug || Boolean(languageLinks?.[item.code as LangCode]);
            return (
              <button
                role="menuitem"
                type="button"
                onClick={async () => {
                  if (!linkAvailable) return;
                  await changeLang(item.code as LangCode);
                  closeMenu?.();
                }}
                aria-disabled={!linkAvailable}
                disabled={!linkAvailable}
                className={
                  "w-full text-center py-3 text-sm leading-none transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] " +
                  // Light-theme: slightly bright hover (original behaviour).
                  // Dark-theme: subtle translucent white to gently lighten the grey.
                  "hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.03)] " +
                  (!linkAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer")
                }
              >
                {item.label}
              </button>
            );
          })()}
        </li>
      ))}
    </>
  );
}

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
  const routeLocale = (parseLocaleFromPath(pathname || "/") ?? uiLocale ?? "en") as Lang;
  const currentLocale: Lang = routeLocale;

  const buildLocaleRootHref = (target: "en" | "ru" | "uk") => buildLocalizedHref(target, "/");

  const buildLocalePath = (path: string, target: "en" | "ru" | "uk" = currentLocale) => {
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

            {/* Desktop links */}
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href={buildLocalePath("/posts")}
                className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
              >
                {label("posts", "Posts")}
              </Link>
              <Link
                href={buildLocalePath("/categories")}
                className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
              >
                {label("categories", "Categories")}
              </Link>
              <Link
                href={buildLocalePath("/levels")}
                className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
              >
                {label("levels", "Levels")}
              </Link>

              {/* Search then language selector (matches screenshot: search first, small language pill to the right) */}
              <div className="flex items-center gap-4">
                <SearchButton
                  variant="default"
                  ariaLabel={label("searchPlaceholder", "Find an article")}
                />
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

            {/* Mobile controls */}
            <div className="flex items-center gap-2 md:hidden">
              <SearchButton
                ariaLabel={label("searchPlaceholder", "Find an article")}
                variant="icon"
              />
              {/* Add language pill to mobile header (client-side nav) */}
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

      {/* Mobile drawer */}
      <div
        className={["md:hidden", "fixed inset-0 z-90", open ? "" : "pointer-events-none"].join(" ")}
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
              onClick={() => {
                // close the menu; allow Link to perform the navigation
                handleLogoClick();
              }}
              className="text-xl font-semibold tracking-tight"
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
                  href={buildLocalePath("/posts")}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  {label("posts", "Posts")}
                </Link>
              </li>
              <li>
                <Link
                  href={buildLocalePath("/categories")}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  {label("categories", "Categories")}
                </Link>
              </li>
              <li>
                <Link
                  href={buildLocalePath("/levels")}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  {label("levels", "Levels")}
                </Link>
              </li>
              <li>
                <Link
                  href={buildLocalePath("/search")}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  {label("search", "Search")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    toggleMobileTheme();
                    // keep menu open so user sees the change, or close if preferred
                  }}
                  className="block w-full text-left rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  {isDarkMobile
                    ? label("lightMode", "Light theme")
                    : label("darkMode", "Dark theme")}
                </button>
              </li>
              {/* language links removed from mobile drawer — language switch is available via the pill in the header */}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
