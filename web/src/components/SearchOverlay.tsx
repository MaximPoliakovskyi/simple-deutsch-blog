// src/components/SearchOverlay.tsx
"use client";
/* biome-disable */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/LocaleProvider";

type SlimPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
};

function cn(...a: Array<string | false | null | undefined>) {
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
  const [openMethod, setOpenMethod] = useState<'click' | 'keyboard' | undefined>(undefined);

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
        setOpenMethod('keyboard');
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
          setOpenMethod('click');
          setOpen(true);
        }}
        className={cn(
          "flex items-center gap-2 rounded-full text-sm transition-colors focus:outline-none focus-visible:outline-none",
          // light: use requested background color; add subtle border
          "bg-[#FAFAFA] text-neutral-700 border border-[#E6E7EB] hover:bg-[#dcdde0]",
          // dark: keep subtle styling
          "dark:bg-white/5 dark:text-neutral-200 dark:border-white/10 dark:hover:bg-white/10",
          variant === "icon" ? "px-2 py-2 rounded-md" : "px-4 py-2",
          className,
        )}
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
export default function SearchOverlay({
  onClose,
  openMethod,
}: {
  onClose: () => void;
  openMethod?: 'click' | 'keyboard' | undefined;
}) {
  const { t } = useI18n();
  const tPlaceholder = t('searchPlaceholder');
  const tSearchLabel = t('searchAria');
  const tClear = t('clear');
  const tLoading = t('loading');
  const tNoResults = t('noResults');
  const tLoadMore = t('loadMore');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [q, setQ] = useState("");
  const [items, setItems] = useState<SlimPost[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [after, setAfter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setShow(false); // play exit animation
    const t = setTimeout(() => onClose(), EXIT_MS);
    return () => clearTimeout(t);
  }, [onClose]);

  // Global key handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  // Focus input after the panel is visible to avoid flash
  useEffect(() => {
    if (show) {
      const id = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(id);
    }
  }, [show]);

  // Debounced search with cancellation
  useEffect(() => {
    const term = q.trim();
    const ac = new AbortController();
    const timer = setTimeout(async () => {
      if (!term) {
        setItems([]);
        setAfter(null);
        setHasNext(false);
        setHighlight(0);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          method: "GET",
          cache: "no-store",
          signal: ac.signal,
        });
        const json = (await res.json()) as {
          posts: SlimPost[];
          pageInfo: { endCursor: string | null; hasNextPage: boolean };
        };
        setItems(json.posts);
        setAfter(json.pageInfo.endCursor);
        setHasNext(json.pageInfo.hasNextPage);
        setHighlight(0);
      } catch {
        // ignore aborted/failed fetch
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      ac.abort();
      clearTimeout(timer);
    };
  }, [q]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
        `/api/search?q=${encodeURIComponent(term)}&after=${encodeURIComponent(after)}`,
        { method: "GET", cache: "no-store" },
      );
      const json = (await res.json()) as {
        posts: SlimPost[];
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
      };
      setItems((prev) => [...prev, ...json.posts]);
      setAfter(json.pageInfo.endCursor);
      setHasNext(json.pageInfo.hasNextPage);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [after, hasNext, q]);

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) requestClose();
  };

  const empty = q.trim().length > 0 && !loading && items.length === 0;

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
        "fixed inset-0 z-[100]",
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
          "rounded-2xl bg-[hsl(var(--bg))] p-2 shadow-2xl",
          "text-neutral-900 dark:text-neutral-100",
          "mt-[max(5.5rem,calc(env(safe-area-inset-top)+4rem))]",
          "sm:mt-[calc(env(safe-area-inset-top)+5rem)]",
          // panel enter/exit states
          show ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-[0.98] translate-y-1",
          "motion-reduce:transition-none",
        )}
        style={{
          transitionProperty: "opacity, transform",
          transitionDuration: `${EXIT_MS}ms`,
          transitionTimingFunction: "cubic-bezier(.16,1,.3,1)",
        }}
      >
        {/* Input row */}
        <div
          className="
            flex items-center gap-2 rounded-xl px-3 py-2 border
            bg-white text-neutral-900
            dark:bg-[hsl(var(--bg))] dark:text-neutral-100 dark:border-white/10
            focus-within:ring-2 focus-within:ring-[var(--sd-accent)]
          "
          // use a specific light-mode border color (avoid utility conflict)
          style={{ borderColor: '#E6E7EB' }}
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
              appearance-none focus:outline-none focus:ring-0 focus:shadow-none
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
                aria-label={tClear}
            >
                {tClear}
            </button>
          ) : null}
        </div>

        {/* Results */}
        <div className="max-h[60vh] max-h-[60vh] overflow-auto py-2">
          {loading && (
            <div className="px-3 py-3 text-sm text-neutral-500 dark:text-neutral-400">{tLoading}</div>
          )}
          {empty && (
            <div className="px-3 py-3 text-sm text-neutral-600 dark:text-neutral-400">
              {tNoResults}
            </div>
          )}

          <ul ref={listRef} className="divide-y divide-neutral-200 dark:divide-white/10">
            {items.map((it, i) => (
              <li key={it.id}>
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
          </ul>

          {hasNext && (
            <div className="p-2 text-center">
              <button
                type="button"
                onClick={loadMore}
                className="rounded-lg border px-3 py-1.5 text-sm
                           border-neutral-200 hover:bg-neutral-50
                           dark:border-white/10 dark:hover:bg-neutral-800/60"
              >
                {tLoadMore}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
