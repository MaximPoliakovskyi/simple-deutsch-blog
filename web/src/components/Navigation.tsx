// src/components/Navigation.tsx
"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchButton } from "@/components/SearchOverlay";
import ThemeToggle from "@/components/ThemeToggle";
import { useI18n } from "@/components/LocaleProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();
  const [progressLeft, setProgressLeft] = useState<number | null>(null);
  const [progressWidth, setProgressWidth] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstFocusRef = useRef<HTMLAnchorElement>(null);
  const id = useId();
  const titleId = `mobile-menu-title-${id}`;
  // determine current locale from pathname
  const currentLocale = pathname?.startsWith("/ru")
    ? "ru"
    : pathname?.startsWith("/ua")
    ? "ua"
    : "en";

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
  const router = useRouter();

  const handleLogoClick = (_e?: React.MouseEvent<HTMLAnchorElement>) => {
    // Close the mobile menu so the UI doesn't remain open during navigation.
    setOpen(false);
    // Let the Link's native navigation run (keeps prefetching & SEO).
    // If we later want a client-only transition we can call `router.push(href)`.
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
      // Only run on article pages
      if (!pathname || !pathname.startsWith("/posts/")) {
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
          <Link href={buildLocaleRootHref(currentLocale)} onClick={handleLogoClick} className="text-xl font-semibold tracking-tight" aria-label={t("home") ?? "Home"}>
            simple-deutsch.de
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href={buildLocalePath("/posts")}
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              {t("posts")}
            </Link>
            <Link
              href={buildLocalePath("/categories")}
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              {t("categories")}
            </Link>
            <Link
              href={buildLocalePath("/tags")}
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              {t("tags")}
            </Link>

            {/* Language switcher */}
            <div className="flex items-center gap-2">
              <Link
                href={buildLocaleHref("en")}
                className={
                  "text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
                }
                aria-current={currentLocale === "en" ? "page" : undefined}
                aria-label="Switch language to English"
              >
                English
              </Link>
              <Link
                href={buildLocaleHref("ua")}
                className={
                  "text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
                }
                aria-current={currentLocale === "ua" ? "page" : undefined}
                aria-label="Switch language to Ukrainian"
              >
                Українська
              </Link>
              <Link
                href={buildLocaleHref("ru")}
                className={
                  "text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
                }
                aria-current={currentLocale === "ru" ? "page" : undefined}
                aria-label="Switch language to Russian"
              >
                Русский
              </Link>
            </div>
            <SearchButton className="ml-2" variant="default" ariaLabel={t("searchPlaceholder")} />
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-2 md:hidden">
            <SearchButton ariaLabel={t("searchPlaceholder")} variant="icon" />
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
                className="h-full bg-[var(--sd-accent)] transition-transform duration-300 ease-out"
                style={{ transform: `scaleX(${progress / 100})`, transformOrigin: "left", willChange: "transform" }}
              />
            </div>
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
          <div className="flex items-center justify-between px-4 py-3">
            <Link
              href={buildLocaleRootHref(currentLocale)}
              onClick={() => {
                // close the menu; allow Link to perform the navigation
                handleLogoClick();
              }}
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
                  {t("posts")}
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  {t("categories")}
                </Link>
              </li>
              <li>
                <Link
                  href="/tags"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  {t("tags")}
                </Link>
              </li>
              <li>
                <Link
                  href={buildLocalePath("/search")}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
                >
                  {t("search")}
                </Link>
              </li>
              <li>
                <div className="mt-2 flex gap-3">
                  <Link
                    href={buildLocaleHref("en")}
                    onClick={() => setOpen(false)}
                    className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
                    aria-current={currentLocale === "en" ? "page" : undefined}
                    aria-label="Switch language to English"
                  >
                    English
                  </Link>
                  <Link
                    href={buildLocaleHref("ua")}
                    onClick={() => setOpen(false)}
                    className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
                    aria-current={currentLocale === "ua" ? "page" : undefined}
                    aria-label="Switch language to Ukrainian"
                  >
                    Українська
                  </Link>
                  <Link
                    href={buildLocaleHref("ru")}
                    onClick={() => setOpen(false)}
                    className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
                    aria-current={currentLocale === "ru" ? "page" : undefined}
                    aria-label="Switch language to Russian"
                  >
                    Русский
                  </Link>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
