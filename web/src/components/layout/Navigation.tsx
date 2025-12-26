// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { SearchButton } from "@/components/features/search/SearchOverlay";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useI18n } from "@/core/i18n/LocaleProvider";

// LanguageDropdown uses the hooks imported above

type Lang = "en" | "ru" | "ua";

type LanguageDropdownProps = {
  currentLocale: Lang;
  buildHref: (target: Lang) => string;
  t: (k: string) => string;
};

const HOVER_DELAY_MS = 150; // delay before closing menu on mouseleave

/**
 * Compact language switcher button.
 * Shows short labels (Eng / Укр / Рус) and cycles to the next language on click.
 * Uses client-side navigation (router.push) to preserve SPA behavior and update the URL.
 */
function LanguageDropdown({ currentLocale, buildHref, t }: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // All languages ordered; when rendering we place the selected locale at the top
  const _order: Lang[] = ["en", "ua", "ru"];
  // Short labels for the pill / stacked items
  const labelsShort: Record<Lang, string> = { en: "En", ua: "Ук", ru: "Ру" };
  const labelsFull: Record<Lang, string> = { en: "English", ua: "Українська", ru: "Русский" };

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node | null;
      if (!open) return;
      if (btnRef.current && t && btnRef.current.contains(t)) return;
      if (menuRef.current && t && menuRef.current.contains(t)) return;
      setOpen(false);
    }
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
          "sd-pill"
        }
        style={{ padding: 0, outlineColor: "oklch(0.371 0 0)" }}
        aria-label={t("language") || `Language (${labelsFull[currentLocale]})`}
        title={labelsFull[currentLocale]}
      >
        <span className="sr-only">{t("language")}</span>
        <span className="leading-none">{labelsShort[currentLocale]}</span>
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
          <NavLanguageDropdown closeMenu={() => setOpen(false)} />
        </ul>
      )}
    </div>
  );
}

// Small helper hook used by the NavLanguageDropdown.
// Returns current locale (derived from pathname) and a setter that persists
// the preference. Navigation decisions (for posts) are performed by the
// component that calls `setLocale` and `router.push` as needed.
function useLanguage() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  // Determine locale from either a leading locale prefix (/ru or /ua)
  // or from post slugs (/posts/{lang}-{rest}). Default to 'en'.
  const locale: Lang = (() => {
    if (!pathname) return "en";
    if (pathname.startsWith("/posts/")) {
      const slug = pathname.replace("/posts/", "");
      const maybe = slug.split("-")[0];
      return (["en", "ru", "ua"] as const).includes(maybe as Lang) ? (maybe as Lang) : "en";
    }
    if (pathname.startsWith("/ru")) return "ru";
    if (pathname.startsWith("/ua")) return "ua";
    return "en";
  })();

  function setLocale(next: Lang) {
    try {
      localStorage.setItem("sd-locale", next);
    } catch {}

    // If we're on a posts page, don't attempt to compute a generic path here.
    // Post-specific navigation will be handled by callers (NavLanguageDropdown).
    if (pathname.startsWith("/posts/")) return;

    // For non-post pages preserve the current path but swap locale prefix
    // strip existing locale prefix (/ru or /ua)
    const stripped = pathname.replace(/^\/(ru|ua)(?=\/|$)/, "") || "/";

    const newPath =
      next === "en" ? stripped : stripped === "/" ? `/${next}` : `/${next}${stripped}`;

    if (newPath !== pathname) {
      try {
        router.push(newPath);
      } catch {}
    }
  }

  return { locale, setLocale } as { locale: Lang; setLocale: (l: Lang) => void };
}
// Hook: usePostLanguageSwitch
// Parses current pathname to determine siteLang, isPost and slug, and
// exposes changeLang(targetLang) which updates UI language and navigates
// to the corresponding post path when applicable.
function usePostLanguageSwitch() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { locale: currentLocale, setLocale } = useLanguage();

  const SITE_LANGS = ["en", "ru", "ua"] as const;
  type SiteLang = (typeof SITE_LANGS)[number];

  // parse pathname parts
  const parts = pathname.split("/").filter(Boolean);

  let siteLang: SiteLang = "en";
  let isPost = false;
  let slug: string | null = null;

  if (parts[0] === "ru" || parts[0] === "ua") {
    siteLang = parts[0] as SiteLang;
    if (parts[1] === "posts") {
      isPost = true;
      slug = parts[2] ?? null;
    }
  } else {
    siteLang = "en";
    if (parts[0] === "posts") {
      isPost = true;
      slug = parts[1] ?? null;
    }
  }

  function buildPostPath(targetLang: SiteLang, articleId: string) {
    const slug = `${targetLang}-${articleId}`;
    if (targetLang === "en") return `/posts/${slug}`;
    return `/${targetLang}/posts/${slug}`;
  }

  const changeLang = async (targetLang: SiteLang) => {
    // If nothing to do, and siteLang equals currentLocale (both match), skip
    if (targetLang === siteLang && targetLang === currentLocale) return;

    // Always update UI language preference
    try {
      setLocale(targetLang as Lang);
    } catch {}

    // If not on a post page, nothing more to do here
    if (!isPost || !slug) return;

    const parts = slug.split("-");
    if (parts.length < 2) return; // invalid slug
    const articleId = parts.slice(1).join("-");
    const newPath = buildPostPath(targetLang, articleId);

    try {
      await router.push(newPath);
    } catch {}
  };

  return { currentSiteLang: siteLang as SiteLang, changeLang };
}

// Component: NavLanguageDropdown
function NavLanguageDropdown({ closeMenu }: { closeMenu?: () => void }) {
  const { currentSiteLang, changeLang } = usePostLanguageSwitch();

  const LANGS = [
    { code: "en", label: "En" },
    { code: "ua", label: "Ук" },
    { code: "ru", label: "Ру" },
  ] as const;

  type LangCode = (typeof LANGS)[number]["code"];

  // Exclude the currently selected language (it's shown in the closed pill)
  const visibleLangs = LANGS.filter((l) => l.code !== currentSiteLang);

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
            onClick={() => {
              changeLang(item.code as LangCode);
              closeMenu?.();
            }}
            className={
              "w-full text-center py-3 text-sm leading-none transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-(--sd-accent) " +
              // Light-theme: slightly bright hover (original behaviour).
              // Dark-theme: subtle translucent white to gently lighten the grey.
              "hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.03)]"
            }
          >
            {item.label}
          </button>
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
  const id = useId();
  const titleId = `mobile-menu-title-${id}`;
  // determine current locale from pathname. For post pages the language
  // is encoded in the post slug (/posts/{lang}-{rest}), otherwise check
  // for a leading locale prefix (/ru or /ua). Default to 'en'.
  const currentLocale: Lang = (() => {
    if (!pathname) return "en";
    if (pathname.startsWith("/posts/")) {
      const slug = pathname.replace("/posts/", "");
      const maybe = slug.split("-")[0];
      return (["en", "ru", "ua"] as const).includes(maybe as Lang) ? (maybe as Lang) : "en";
    }
    if (pathname.startsWith("/ru")) return "ru";
    if (pathname.startsWith("/ua")) return "ua";
    return "en";
  })();

  const stripLocale = (p: string | null | undefined) => {
    if (!p) return "/";
    const stripped = p.replace(/^\/(ru|ua)(?=\/|$)/, "");
    return stripped === "" ? "/" : stripped;
  };

  const buildLocaleHref = (target: "en" | "ru" | "ua") => {
    // For most navigation links we want to preserve the current path,
    // but the site logo should always go to the locale root (home page).
    const base = stripLocale(pathname);
    if (target === "en") return base;
    return base === "/" ? `/${target}` : `/${target}${base}`;
  };

  const buildLocaleRootHref = (target: "en" | "ru" | "ua") => {
    return target === "en" ? "/" : `/${target}`;
  };

  const buildLocalePath = (path: string, target: "en" | "ru" | "ua" = currentLocale) => {
    // Ensure leading slash
    const p = path.startsWith("/") ? path : `/${path}`;
    return target === "en" ? p : `/${target}${p}`;
  };

  const { t } = useI18n();
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

  // Reading progress: measure how far through `main article` the user has scrolled
  useEffect(() => {
    let rafId = 0;
    let ticking = false;

    const calculate = () => {
      // Only run on article pages. Normalize locale prefixes like /ru, /ua, /uk.
      const normalizedPath = pathname?.replace(/^\/(ru|ua|uk)(?=\/)/, "") ?? pathname;
      if (!normalizedPath || !normalizedPath.startsWith("/posts/")) {
        setProgress(0);
        setVisible(false);
        return;
      }

      const article = document.querySelector("main article") as HTMLElement | null;
      if (!article) {
        setProgress(0);
        setVisible(false);
        return;
      }

      const rect = article.getBoundingClientRect();
      const articleLeft = rect.left;
      const articleWidth = rect.width;
      const articleTop = rect.top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      const maxScroll = Math.max(0, articleHeight - viewportHeight);
      let percent = 0;

      if (scrollY < articleTop) {
        percent = 0;
      } else if (maxScroll === 0) {
        percent = 100;
      } else {
        percent = Math.min(100, Math.max(0, ((scrollY - articleTop) / maxScroll) * 100));
      }

      const intersects = rect.bottom > 0 && rect.top < viewportHeight;
      const isReading = scrollY >= articleTop;

      setProgress(Number(percent.toFixed(2)));
      setProgressLeft(Math.round(articleLeft));
      setProgressWidth(Math.round(articleWidth));
      setVisible(intersects || isReading);
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
              aria-label={t("home") ?? "Home"}
            >
              simple-deutsch.de
            </Link>

            {/* Desktop links */}
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href={buildLocalePath("/posts")}
                className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:text-neutral-300"
              >
                {t("posts")}
              </Link>
              <Link
                href={buildLocalePath("/categories")}
                className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:text-neutral-300"
              >
                {t("categories")}
              </Link>
              <Link
                href={buildLocalePath("/levels")}
                className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:text-neutral-300"
              >
                {t("levels")}
              </Link>

              {/* Search then language selector (matches screenshot: search first, small language pill to the right) */}
              <div className="flex items-center gap-4">
                <SearchButton variant="default" ariaLabel={t("searchPlaceholder")} />
                <div className="relative">
                  <LanguageDropdown
                    currentLocale={currentLocale}
                    buildHref={(target: Lang) => buildLocalePath(stripLocale(pathname), target)}
                    t={t}
                  />
                </div>
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile controls */}
            <div className="flex items-center gap-2 md:hidden">
              <SearchButton ariaLabel={t("searchPlaceholder")} variant="icon" />
              {/* Add language pill to mobile header (client-side nav) */}
              <div className="relative">
                <LanguageDropdown
                  currentLocale={currentLocale}
                  buildHref={(target: Lang) => buildLocaleHref(target)}
                  t={t}
                />
              </div>
              <button
                ref={toggleRef}
                type="button"
                aria-expanded={open}
                aria-controls="mobile-fullscreen-menu"
                onClick={() => setOpen((v) => !v)}
                className="rounded p-2 outline-none ring-0 transition hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:hover:bg-neutral-800/60"
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
            className="fixed top-0 left-0 z-50 pointer-events-none w-screen transition-opacity duration-300"
            style={{
              opacity: visible ? 1 : 0,
              top: navRef.current ? `${navRef.current.getBoundingClientRect().top}px` : "0px",
            }}
          >
            <div className="h-1 w-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden rounded">
              <div
                className="h-full bg-(--sd-accent) transition-transform duration-300 ease-out"
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
        className={["md:hidden", "fixed inset-0 z-90", open ? "" : "pointer-events-none"].join(
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
          <div className="flex items-center justify-between px-4 py-4">
            <Link
              href={buildLocaleRootHref(currentLocale)}
              onClick={() => {
                // close the menu; allow Link to perform the navigation
                handleLogoClick();
              }}
              className="text-xl font-semibold tracking-tight"
              id={titleId}
              ref={firstFocusRef}
            >
              simple-deutsch.de
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-2 hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:hover:bg-neutral-800/60"
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
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:hover:bg-neutral-800/60"
                >
                  {t("posts")}
                </Link>
              </li>
              <li>
                <Link
                  href={buildLocalePath("/categories")}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:hover:bg-neutral-800/60"
                >
                  {t("categories")}
                </Link>
              </li>
              <li>
                <Link
                  href={buildLocalePath("/levels")}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:hover:bg-neutral-800/60"
                >
                  {t("levels")}
                </Link>
              </li>
              <li>
                <Link
                  href={buildLocalePath("/search")}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:hover:bg-neutral-800/60"
                >
                  {t("search")}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    toggleMobileTheme();
                    // keep menu open so user sees the change, or close if preferred
                  }}
                  className="block w-full text-left rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-(--sd-accent) dark:hover:bg-neutral-800/60"
                >
                  {isDarkMobile
                    ? (t("lightMode") ?? "Light theme")
                    : (t("darkMode") ?? "Dark theme")}
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
