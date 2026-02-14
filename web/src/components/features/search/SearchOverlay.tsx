// src/components/SearchOverlay.tsx
"use client";
/* biome-disable */

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/core/i18n/LocaleProvider";
import { DEFAULT_LOCALE, type Locale, parseLocaleFromPath } from "@/i18n/locale";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

type SlimPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
};

type OpenMethod = "click" | "keyboard" | undefined;
type PageInfo = { endCursor: string | null; hasNextPage: boolean };
type SearchResponse = { posts: SlimPost[]; pageInfo: PageInfo };

function cn(...a: Array<string | false | null | undefined>): string {
  return a.filter(Boolean).join(" ");
}

// Shared radius token for dropdown and last item to ensure pixel-perfect match
const DROPDOWN_RADIUS = "rounded-2xl";
const LAST_ITEM_RADIUS = "rounded-b-2xl";

/** The overlay itself — rendered in a portal to <body> so it covers the entire page */
type SearchOverlayProps = {
  onClose: () => void;
  openMethod?: OpenMethod;
};

export default function SearchOverlay({ onClose, openMethod: _openMethod }: SearchOverlayProps) {
  const { t } = useI18n();
  const pathname = usePathname() || "/";
  const pathLocale: Locale = parseLocaleFromPath(pathname) ?? DEFAULT_LOCALE;

  const label = (key: string, fallback: string) => {
    try {
      const v = t(key);
      if (v && v !== key) return v;
    } catch {}
    return fallback;
  };

  const tPlaceholder = label("searchPlaceholder", "Find an article");
  const tSearchLabel = label("searchAria", "Search");
  const CLEAR_LABEL = label("search.clear", "Clear");
  const tNoResults = label("noResults", "No results. Try a different term.");
  const tLoadMore = label("loadMore", "Load more");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const focusSearchInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;
    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  }, []);

  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q); // keep input responsive while results update
  const [items, setItems] = useState<SlimPost[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [, setHasNext] = useState(false);
  const [, setAfter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [_isPending, startTransition] = useTransition();

  // Animated results wrapper state
  const resultsWrapRef = useRef<HTMLDivElement | null>(null);
  const prevMeasuredRef = useRef<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [wrapHeight, setWrapHeight] = useState<string | number>(0);
  const [contentMax, setContentMax] = useState<number | null>(null);
  const CLOSE_MS = 180;
  const RESIZE_MS = 260;

  useEffect(() => {
    const should = !loading && (items.length > 0 || (hasSearched && items.length === 0));
    setShowResults(should);
  }, [loading, items.length, hasSearched]);
  // Measure and animate height on showResults changes (layout effect to avoid flicker)
  useLayoutEffect(() => {
    const wrap = resultsWrapRef.current;
    const list = listRef.current;
    const panel = panelRef.current;
    if (!wrap || !list) return;
    const viewportHeight = window.innerHeight;
    const panelTop = panel ? panel.getBoundingClientRect().top : wrap.getBoundingClientRect().top;
    const measured = list.scrollHeight;
    const inputHeight = inputRef.current?.getBoundingClientRect().height ?? 56;
    // reserve space for input and tiny gaps inside the panel
    const capped = Math.max(120, viewportHeight - panelTop - inputHeight - 64);
    const maxAllowed = Math.min(capped, Math.floor(viewportHeight * 0.72));
    setContentMax(maxAllowed);
    const final = Math.min(measured, maxAllowed);

    if (showResults) {
      // opening: animate from 0 -> final px
      setWrapHeight(0);
      // respect reduced motion
      const prefersReduced = window?.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setWrapHeight(final);
        return;
      }
      requestAnimationFrame(() => requestAnimationFrame(() => setWrapHeight(final)));
      return;
    }

    // closing: animate from current (capped) px -> 0
    const from = final;
    setWrapHeight(from);
    requestAnimationFrame(() => requestAnimationFrame(() => setWrapHeight(0)));
    const id = window.setTimeout(() => setWrapHeight(0), CLOSE_MS + 10);
    return () => window.clearTimeout(id);
  }, [showResults]);

  // When items change while shown (e.g. load more or fewer results), smoothly adjust the wrapper max-height
  useLayoutEffect(() => {
    if (!showResults) return;
    const wrap = resultsWrapRef.current;
    const list = listRef.current;
    if (!wrap || !list) return;

    const measured = list.scrollHeight + items.length * 0;
    const final = Math.min(measured, contentMax ?? measured);

    // Determine previous measured height (fallback to current wrapper height)
    const currentWrapHeight = wrap.getBoundingClientRect().height;
    const prevMeasured = prevMeasuredRef.current || currentWrapHeight || measured;
    prevMeasuredRef.current = measured;

    // If already essentially equal, do nothing
    if (Math.abs(prevMeasured - final) < 2) return;

    const prefersReduced = window?.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setWrapHeight(final);
      return;
    }

    // If the content shrank, start from the previous (larger) height then animate down to final
    if (final < prevMeasured) {
      setWrapHeight(prevMeasured);
      requestAnimationFrame(() => requestAnimationFrame(() => setWrapHeight(final)));
      return;
    }

    // Content grew — animate straightforwardly to the new final
    requestAnimationFrame(() => setWrapHeight(final));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, contentMax, showResults]);

  // Recompute max height when the viewport size changes or user scrolls while open
  useEffect(() => {
    if (!showResults) return;
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const wrap = resultsWrapRef.current;
        const list = listRef.current;
        if (!wrap || !list) return;
        const viewportHeight = window.innerHeight;
        const panelTop = panelRef.current
          ? panelRef.current.getBoundingClientRect().top
          : wrap.getBoundingClientRect().top;
        const inputHeight = inputRef.current?.getBoundingClientRect().height ?? 56;
        const capped = Math.max(120, viewportHeight - panelTop - inputHeight - 64);
        const maxAllowed = Math.min(capped, Math.floor(viewportHeight * 0.72));
        setContentMax(maxAllowed);
        const measured = list.scrollHeight;
        const final = Math.min(measured, maxAllowed);
        setWrapHeight(final);
      });
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("scroll", onResize);
      cancelAnimationFrame(raf);
    };
  }, [showResults]);

  // --- mount/unmount animation state ---
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false); // drives enter/exit transitions
  const EXIT_MS = 400; // keep in sync with CSS below

  // Lock scroll and trigger **smooth enter animation**
  useEffect(() => {
    setMounted(true);
    try {
      lockScroll();
    } catch {}

    // Use double rAF to ensure initial styles are committed before we flip to "show"
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShow(true));
    });

    return () => {
      cancelAnimationFrame(id);
      try {
        unlockScroll();
      } catch {}
    };
  }, []);

  const requestClose = useCallback(() => {
    // First collapse the results area smoothly, then hide the panel
    setShowResults(false);
    // give the results wrapper time to animate closed
    const collapseDelay = RESIZE_MS + 20;
    let t2: number | undefined;
    const t = window.setTimeout(() => {
      setShow(false); // play panel exit animation
      t2 = window.setTimeout(() => onClose(), EXIT_MS);
    }, collapseDelay);
    return () => {
      window.clearTimeout(t);
      if (t2) window.clearTimeout(t2);
    };
  }, [onClose]);

  // Global key handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (q) {
          e.preventDefault();
          setQ("");
          focusSearchInput();
          return;
        }
        requestClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusSearchInput, q, requestClose]);

  // Focus input after the panel is visible to avoid flash
  useEffect(() => {
    if (show) {
      const id = setTimeout(() => focusSearchInput(), 10);
      return () => clearTimeout(id);
    }
  }, [focusSearchInput, show]);

  // Debounced search with cancellation
  useEffect(() => {
    const term = deferredQ.trim();
    const ac = new AbortController();
    if (!term) {
      // Cancel any inflight state and clear results for empty query
      ac.abort();
      setItems([]);
      setAfter(null);
      setHasNext(false);
      setHighlight(0);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      // mark that a search has been attempted for empty-result messaging
      setHasSearched(true);
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(term)}&lang=${encodeURIComponent(pathLocale)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: ac.signal,
          },
        );
        const json = (await res.json()) as SearchResponse;
        // use transition to avoid blocking input while results list re-renders
        startTransition(() => {
          setItems(json.posts);
          setAfter(json.pageInfo.endCursor);
          setHasNext(json.pageInfo.hasNextPage);
          setHighlight(0);
        });
      } catch {
        // ignore aborted/failed fetch
      } finally {
        setLoading(false);
      }
    }, 200); // tighter debounce to reduce jank

    return () => {
      ac.abort();
      clearTimeout(timer);
    };
  }, [deferredQ, pathLocale]);

  // Reset visible count when the query (deferred) changes (new search)
  useEffect(() => {
    setVisibleCount(deferredQ ? 5 : 5);
  }, [deferredQ]);

  // Prevent clipping of the first result when results change:
  // - scroll the container to top and re-measure after paint
  useEffect(() => {
    if (!showResults) return;
    const sc = resultsWrapRef.current;
    const list = listRef.current;
    if (!sc) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      try {
        sc.scrollTop = 0;
      } catch (_) {}
      raf2 = requestAnimationFrame(() => {
        if (!list) return;
        const measured =
          list.scrollHeight + items.length * 0 + visibleCount * 0 + deferredQ.length * 0;
        const final = Math.min(measured, contentMax ?? measured);
        // update wrapper height to match new content (small, safe remeasure)
        setWrapHeight(final);
      });
    });
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [items.length, visibleCount, deferredQ, showResults, contentMax]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (q) {
          e.preventDefault();
          setQ("");
          focusSearchInput();
          return;
        }
        requestClose();
        return;
      }
      if (items.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const current = items[highlight];
        if (current) {
          requestClose();
          router.push(`/posts/${current.slug}`);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusSearchInput, items, highlight, router, requestClose, q]);

  // Ensure highlighted item is scrolled into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[highlight] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) requestClose();
  };

  const empty = !loading && hasSearched && items.length === 0;

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
      onMouseDown={onBackdrop}
      className={cn(
        // Backdrop: use a single consistent backdrop regardless of how the
        // overlay was opened (keyboard or click). This ensures Ctrl+K and
        // clicking the "Find an article" button look the same.
        "fixed inset-0 z-100",
        // Respect prefers-reduced-motion by letting OS disable transitions
        "motion-reduce:transition-none",
        show ? "bg-black/70" : "bg-transparent",
      )}
      style={{
        transitionProperty: "background-color, opacity, filter",
        transitionDuration: `${EXIT_MS}ms`,
        transitionTimingFunction: "cubic-bezier(.16,1,.3,1)", // silkier ease
      }}
    >
      <div
        className={cn(
          "mx-auto w-full max-w-[min(40rem,calc(100vw-2rem))]",
          DROPDOWN_RADIUS,
          "bg-[hsl(var(--bg))] p-0 shadow-2xl",
          "text-neutral-900 dark:text-neutral-100",
          "mt-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))]",
          "sm:mt-[calc(env(safe-area-inset-top)+5rem)]",
          // panel enter/exit states
          show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.98] translate-y-1",
          "motion-reduce:transition-none",
        )}
        ref={panelRef}
        style={{
          transitionProperty: "opacity, transform",
          transitionDuration: `${EXIT_MS}ms`,
          transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* Input row */}
        <div
          className="
            flex items-center gap-2 rounded-xl px-3 py-2
            bg-transparent text-neutral-900
            dark:text-neutral-100
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="opacity-60 text-neutral-500 dark:text-neutral-400"
          >
            <path
              d="M21 21l-4.3-4.3m1.3-5.2a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <input
            type="search"
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tPlaceholder}
            aria-label={tSearchLabel}
            className="
                w-full bg-transparent py-2 text-inherit
                placeholder-neutral-500 dark:placeholder-neutral-400
                appearance-none border-0 focus:border-0 focus-visible:border-0
                outline-none focus:outline-none focus-visible:outline-none
                ring-0 focus:ring-0 focus-visible:ring-0
              "
          />
          {q ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                focusSearchInput();
              }}
              className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
              aria-label={CLEAR_LABEL}
            >
              {CLEAR_LABEL}
            </button>
          ) : null}
        </div>

        {/* Results (single animated container) */}
        <div
          ref={resultsWrapRef}
          className="min-h-0 overflow-y-auto"
          style={{
            height: typeof wrapHeight === "number" ? `${wrapHeight}px` : wrapHeight,
            padding: 0,
            opacity: showResults ? 1 : 0,
            transform: showResults ? "translateY(0)" : "translateY(-6px)",
            transition: `height ${RESIZE_MS}ms cubic-bezier(.16,1,.3,1), opacity 220ms ease, transform 220ms ease`,
            willChange: "height, opacity, transform",
          }}
        >
          <ul
            ref={listRef}
            className="divide-y divide-neutral-200 dark:divide-white/10"
            style={{ margin: 0, padding: 0, listStyle: "none" }}
          >
            {empty && (
              <li className="px-3 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                {tNoResults}
              </li>
            )}

            {!loading &&
              items.length > 0 &&
              items.slice(0, visibleCount).map((it, i) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(i)}
                    onClick={() => {
                      requestClose();
                      router.push(`/posts/${it.slug}`);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 px-3 py-3 text-left rounded-none cursor-pointer",
                      "hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
                      i === highlight && "bg-neutral-50 dark:bg-neutral-800/60",
                      // only the last rendered item should have bottom rounding
                      i === Math.min(visibleCount, items.length) - 1 && LAST_ITEM_RADIUS,
                    )}
                    aria-current={i === highlight ? "true" : undefined}
                  >
                    {it.image ? (
                      <Image
                        src={it.image ?? ""}
                        alt=""
                        width={48}
                        height={48}
                        className="mt-0.5 h-12 w-12 flex-none rounded-md object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div
                        className="mt-0.5 h-12 w-12 flex-none rounded-md bg-neutral-200 dark:bg-neutral-700"
                        aria-hidden="true"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {it.title}
                      </div>
                      <div
                        className="line-clamp-1 text-sm text-neutral-600 dark:text-neutral-400"
                        /* biome-disable-next-line lint/security/noDangerouslySetInnerHtml */
                        dangerouslySetInnerHTML={{ __html: it.excerpt }}
                      />
                    </div>
                  </button>
                </li>
              ))}

            {!loading && visibleCount < items.length && (
              <li className="px-5 py-3 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => Math.min(v + 5, items.length))}
                  className="cursor-pointer text-sm text-neutral-800 dark:text-neutral-300 hover:underline"
                >
                  {tLoadMore}
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
