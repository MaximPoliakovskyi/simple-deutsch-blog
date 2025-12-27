// src/components/SearchOverlay.tsx
"use client";
/* biome-disable */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useDeferredValue, useLayoutEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/core/i18n/LocaleProvider";

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

/** Public button to open the overlay */
export function SearchButton({
  className = "",
  variant = "default",
  ariaLabel = "Find an article",
}: {
  className?: string;
  variant?: "default" | "icon";
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [openMethod, setOpenMethod] = useState<OpenMethod>(undefined);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        // Only open from the visible button instance. Multiple SearchButton
        // components are mounted (desktop + mobile), so guard by checking
        // whether this button is actually visible in the layout.
        const btn = buttonRef.current;
        if (!btn) return;
        // offsetParent is null for display: none (and some other hidden cases).
        const isVisible = btn.offsetParent !== null;
        if (!isVisible) return;
        e.preventDefault();
        // mark that overlay was opened via keyboard so the overlay can
        // adapt its appearance if desired
        setOpenMethod("keyboard");
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setOpenMethod("click");
          setOpen(true);
        }}
        className={cn(
          // base layout — pill for default, round for icon
          "flex text-sm focus:outline-none",
          // pill appearance (default) / compact circle (icon)
          variant === "icon"
            ? "items-center justify-center w-9.5 h-9.5 rounded-full p-0"
            : "items-center gap-2 rounded-full px-5 py-2",
          // transitions and micro-interaction (smaller scale for the labeled pill)
          variant === "icon"
            ? "transition transform-gpu duration-200 ease-out hover:scale-[1.03]"
            : "transition transform-gpu duration-200 ease-out hover:scale-[1.02]",
          "shadow-sm hover:shadow-md disabled:opacity-60",
          // use shared pill surface token so header/search pills match exactly
          "sd-pill",
          // focus outline
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          className,
        )}
        style={{ outlineColor: "oklch(0.371 0 0)", borderColor: "transparent" }}
        aria-label={ariaLabel}
        title={`${ariaLabel} (Ctrl+K)`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M11 4a7 7 0 015.29 11.71l3.5 3.5-1.41 1.41-3.5-3.5A7 7 0 1111 4zm0 2a5 5 0 100 10 5 5 0 000-10z"
            fill="currentColor"
          />
        </svg>
        {variant === "default" && <span>{ariaLabel}</span>}
      </button>
      {open && (
        <SearchOverlay
          onClose={() => {
            setOpen(false);
            setOpenMethod(undefined);
          }}
          openMethod={openMethod}
        />
      )}
    </>
  );
}

/** The overlay itself — rendered in a portal to <body> so it covers the entire page */
type SearchOverlayProps = {
  onClose: () => void;
  openMethod?: OpenMethod;
};

export default function SearchOverlay({ onClose, openMethod }: SearchOverlayProps) {
  const { t, locale } = useI18n();
  const tPlaceholder = t("searchPlaceholder");
  const tSearchLabel = t("searchAria");
  const CLEAR_LABEL = "Clear"; // fixed label across locales per requirement
  const tNoResults = t("noResults");
  const tLoadMore = t("loadMore");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [q, setQ] = useState("");
  const deferredQ = useDeferredValue(q); // keep input responsive while results update
  const [items, setItems] = useState<SlimPost[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [after, setAfter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(5);
  const [isPending, startTransition] = useTransition();

  // Animated results wrapper state
  const resultsWrapRef = useRef<HTMLDivElement | null>(null);
  const prevMeasuredRef = useRef<number>(0);
  const [showResults, setShowResults] = useState(false);
  const [wrapHeight, setWrapHeight] = useState<string | number>(0);
  const [contentMax, setContentMax] = useState<number | null>(null);
  const OPEN_MS = 340;
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
      const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    const measured = list.scrollHeight;
    const final = Math.min(measured, contentMax ?? measured);

    // Determine previous measured height (fallback to current wrapper height)
    const prevMeasured = prevMeasuredRef.current || (typeof wrapHeight === "number" ? wrapHeight : measured);
    prevMeasuredRef.current = measured;

    // If already essentially equal, do nothing
    if (Math.abs(prevMeasured - final) < 2) return;

    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  }, [items.length, hasNext, contentMax, showResults]);

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
        const panelTop = panelRef.current ? panelRef.current.getBoundingClientRect().top : wrap.getBoundingClientRect().top;
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
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    // Use double rAF to ensure initial styles are committed before we flip to "show"
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShow(true));
    });

    return () => {
      cancelAnimationFrame(id);
      document.documentElement.style.overflow = prev;
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
          inputRef.current?.focus();
          return;
        }
        requestClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [q, requestClose]);

  // Focus input after the panel is visible to avoid flash
  useEffect(() => {
    if (show) {
      const id = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(id);
    }
  }, [show]);

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
          `/api/search?q=${encodeURIComponent(term)}&lang=${encodeURIComponent(locale)}`,
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
  }, [deferredQ, locale, startTransition]);

  // Reset visible count when the query (deferred) changes (new search)
  useEffect(() => {
    setVisibleCount(5);
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
        const measured = list.scrollHeight;
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
          inputRef.current?.focus();
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
  }, [items, highlight, router, requestClose]);

  // Ensure highlighted item is scrolled into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[highlight] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  const loadMore = useCallback(async () => {
    if (!hasNext || !after) return;
    const term = q.trim();
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(term)}&after=${encodeURIComponent(after)}&lang=${encodeURIComponent(locale)}`,
        { method: "GET", cache: "no-store" },
      );
      const json = (await res.json()) as SearchResponse;
      setItems((prev) => [...prev, ...json.posts]);
      setAfter(json.pageInfo.endCursor);
      setHasNext(json.pageInfo.hasNextPage);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [after, hasNext, q, locale]);

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
          "rounded-2xl bg-[hsl(var(--bg))] p-0 shadow-2xl",
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
            bg-white text-neutral-900
            dark:bg-ui-darkButton dark:text-neutral-100
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
                inputRef.current?.focus();
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
              <li className="px-3 py-3 text-sm text-neutral-600 dark:text-neutral-400">{tNoResults}</li>
            )}

            {!loading && items.length > 0 &&
              items.slice(0, visibleCount).map((it, i) => (
                <li key={it.id} className="rounded-md first:rounded-t-2xl last:rounded-b-2xl overflow-hidden">
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => {
                    requestClose();
                    router.push(`/posts/${it.slug}`);
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-3 text-left",
                    "hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
                    i === highlight && "bg-neutral-50 dark:bg-neutral-800/60",
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
                <span
                  role="button"
                  tabIndex={0}
                  onClick={() => setVisibleCount((v) => Math.min(v + 5, items.length))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setVisibleCount((v) => Math.min(v + 5, items.length));
                    }
                  }}
                  className="cursor-pointer text-sm text-neutral-800 dark:text-neutral-300 hover:underline"
                >
                  {tLoadMore}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
