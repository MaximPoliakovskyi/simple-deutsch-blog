"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import { cn } from "@/shared/lib/cn";
import { lockScroll, unlockScroll } from "@/shared/lib/scrollLock";

const CLOSE_MS = 200;
const PAGE_SIZE = 5;

type SearchPost = {
  excerpt: string | null;
  id: string;
  image: string | null;
  slug: string;
  title: string;
};

type SearchResponse = {
  posts: SearchPost[];
};

type SearchOverlayProps = {
  onClose: () => void;
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const { locale, t } = useI18n();

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchPost[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleItems = items.slice(0, visibleCount);
  const showResults = query.trim().length > 0 && (loading || items.length > 0 || hasSearched);
  const isEmpty = !loading && hasSearched && items.length === 0;

  const focusInput = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    try {
      input.focus({ preventScroll: true });
    } catch {
      input.focus();
    }
  }, []);

  const finishClose = useCallback(
    (afterClose?: () => void) => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }

      setOpen(false);
      closeTimeoutRef.current = window.setTimeout(() => {
        closeTimeoutRef.current = null;
        onClose();
        afterClose?.();
      }, CLOSE_MS);
    },
    [onClose],
  );

  const navigateToPost = useCallback(
    (slug: string) => {
      const href = buildLocalizedHref(locale, `/posts/${slug}`);
      finishClose(() => window.location.assign(href));
    },
    [finishClose, locale],
  );

  useEffect(() => {
    setMounted(true);
    lockScroll();

    const frameId = requestAnimationFrame(() => {
      setOpen(true);
      focusInput();
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      unlockScroll();
    };
  }, [focusInput]);

  useEffect(() => {
    const term = query.trim();

    if (!term) {
      setItems([]);
      setHighlight(0);
      setHasSearched(false);
      setLoading(false);
      setVisibleCount(PAGE_SIZE);
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setHasSearched(true);
      setLoading(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(term)}&lang=${encodeURIComponent(locale)}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setItems([]);
          setHighlight(0);
          return;
        }

        const payload = (await response.json()) as SearchResponse;
        setItems(payload.posts);
        setHighlight(0);
        setVisibleCount(PAGE_SIZE);
      } catch {
        if (!controller.signal.aborted) {
          setItems([]);
          setHighlight(0);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [locale, query]);

  useEffect(() => {
    const highlightedElement = listRef.current?.querySelector<HTMLElement>(
      `[data-result-index="${highlight}"]`,
    );

    highlightedElement?.scrollIntoView({ block: "nearest" });
  }, [highlight]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (query) {
          setQuery("");
          focusInput();
          return;
        }

        finishClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!activeElement || activeElement === first || !panel.contains(activeElement)) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
        return;
      }

      if (!activeElement || activeElement === last || !panel.contains(activeElement)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [finishClose, focusInput, query]);

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("search.title")}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          finishClose();
        }
      }}
      className={cn(
        "fixed inset-0 z-[900] bg-[var(--sd-overlay-backdrop)] px-4",
        "transition-opacity duration-200 ease-out motion-reduce:transition-none",
        open ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className="mx-auto w-full max-w-[min(40rem,calc(100vw-2rem))]"
        style={{ paddingTop: "100px" }}
      >
        <div
          ref={panelRef}
          className={cn(
            "overflow-hidden rounded-[16px] border border-[rgba(255,255,255,0.1)] bg-[#0b101e] text-white shadow-[var(--shadow-lg)]",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            open ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0",
          )}
        >
          <div className="flex items-center gap-2 px-3 py-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="text-[#a1a1a1]"
            >
              <path
                d="M21 21l-4.3-4.3m1.3-5.2a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>

            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (items.length === 0) return;

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setHighlight((current) => Math.min(current + 1, items.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setHighlight((current) => Math.max(current - 1, 0));
                } else if (event.key === "Enter") {
                  const current = items[highlight];
                  if (!current) return;
                  event.preventDefault();
                  navigateToPost(current.slug);
                }
              }}
              placeholder={t("search.placeholder")}
              aria-label={t("search.label")}
              className="h-10 w-full bg-transparent py-2 text-[16px] leading-[26px] text-[#f5f5f5] outline-none placeholder:text-[#a1a1a1]"
            />

            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  focusInput();
                }}
                className="text-[12px] font-medium leading-4 text-[#a1a1a1] hover:text-white"
                aria-label={t("search.clear")}
              >
                {t("search.clear")}
              </button>
            ) : null}
          </div>

          {showResults ? (
            <div
              className="border-t border-[rgba(255,255,255,0.1)]"
              style={{ maxHeight: "min(30.5rem, calc(100vh - 12rem))" }}
            >
              <ul ref={listRef} className="sd-hide-scrollbar m-0 list-none overflow-y-auto p-0">
                {loading ? (
                  <li className="px-3 py-3 text-sm text-[#a1a1a1]">{t("common.loading")}</li>
                ) : null}

                {isEmpty ? (
                  <li className="px-3 py-3 text-sm text-[#a1a1a1]">{t("search.empty")}</li>
                ) : null}

                {!loading &&
                  visibleItems.map((item, index) => (
                    <li
                      key={item.id}
                      className="border-t border-[rgba(255,255,255,0.1)] first:border-t-0"
                    >
                      <button
                        type="button"
                        data-result-index={index}
                        onMouseEnter={() => setHighlight(index)}
                        onClick={() => navigateToPost(item.slug)}
                        className={cn(
                          "flex w-full items-start gap-3 px-3 py-[13px] text-left transition-colors",
                          index === highlight
                            ? "bg-[rgba(38,38,38,0.6)]"
                            : "hover:bg-[rgba(38,38,38,0.6)]",
                        )}
                        aria-current={index === highlight ? "true" : undefined}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt=""
                            width={48}
                            height={48}
                            sizes="48px"
                            className="mt-0.5 h-12 w-12 flex-none rounded-[8px] object-cover"
                          />
                        ) : (
                          <div
                            className="mt-0.5 h-12 w-12 flex-none rounded-[8px] bg-[var(--sd-image-placeholder)]"
                            aria-hidden="true"
                          />
                        )}

                        <div className="min-w-0 pt-px">
                          <div className="truncate text-[14px] font-medium leading-5 text-[#f5f5f5]">
                            {item.title}
                          </div>
                          <div
                            className="line-clamp-1 text-[14px] font-medium leading-5 text-[#a1a1a1]"
                            /* biome-disable-next-line lint/security/noDangerouslySetInnerHtml */
                            dangerouslySetInnerHTML={{ __html: item.excerpt ?? "" }}
                          />
                        </div>
                      </button>
                    </li>
                  ))}

                {!loading && visibleCount < items.length ? (
                  <li className="border-t border-[rgba(255,255,255,0.1)] px-3 py-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((current) => Math.min(current + PAGE_SIZE, items.length))
                      }
                      className="text-[14px] leading-5 text-[#a1a1a1] hover:text-white hover:underline"
                    >
                      {t("common.loadMore")}
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
