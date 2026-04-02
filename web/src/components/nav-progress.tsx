"use client";

/**
 * NavProgress — thin accent-bar navigation progress indicator.
 *
 * Fires on any internal anchor click and completes when the new pathname
 * is committed. This makes even fully synchronous pages (partnerships,
 * about, team, terms, etc.) feel responsive during navigation, since
 * the Suspense loading.tsx fallback only fires when a component actually
 * awaits data.
 *
 * Design:
 * - 2px accent-colored bar anchored to the very top edge of the screen
 * - Crawls toward 85% while in-flight, then snaps to 100% + fades on commit
 * - Guaranteed minimum visible duration (MIN_VISIBLE_MS) so fast sync pages
 *   show the same visible feedback as slow async pages
 * - Skipped for anchors with data-no-progress="true" (e.g. the logo link
 *   which uses the full overlay transition instead)
 * - Skipped entirely when prefers-reduced-motion: reduce is set
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { MOTION } from "@/lib/motion";

type State = "idle" | "running" | "done";

// Fraction of remaining distance to close each tick (asymptotic crawl).
const CRAWL_RATE = 0.12;
// Target ceiling while in-flight — never reaches 100% until navigation commits.
const CRAWL_MAX = 85;
// Tick interval for the crawl animation.
const TICK_MS = 80;
// How long the "done" state stays at 100% before fading out.
const DONE_HOLD_MS = MOTION.fast;
// Minimum duration the bar is visible — ensures fast sync pages still show
// clear feedback instead of a barely-perceptible flash.
const MIN_VISIBLE_MS = 350;

export default function NavProgress() {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [barState, setBarState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const prevPathRef = useRef(pathname);
  const startTimeRef = useRef<number>(0);
  const crawlRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (crawlRef.current !== null) {
      clearInterval(crawlRef.current);
      crawlRef.current = null;
    }
    if (doneRef.current !== null) {
      clearTimeout(doneRef.current);
      doneRef.current = null;
    }
  };

  const finishBar = () => {
    clearTimers();
    setProgress(100);
    setBarState("done");
    doneRef.current = setTimeout(() => {
      setBarState("idle");
      setProgress(0);
    }, DONE_HOLD_MS + 200);
  };

  // Start progress on any internal link click.
  useEffect(() => {
    if (prefersReducedMotion) return;

    const onLinkClick = (e: MouseEvent) => {
      // Ignore modified clicks (new tab, etc.)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;

      const a = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!a) return;

      // Skip anchors that use the full overlay transition instead (e.g. logo).
      if (a.dataset.noProgress === "true") return;

      const href = a.getAttribute("href") ?? "";
      // Only internal relative paths or same-origin absolute paths.
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        (href.startsWith("http") && !href.startsWith(window.location.origin))
      ) {
        return;
      }

      clearTimers();
      startTimeRef.current = performance.now();
      setProgress(10);
      setBarState("running");

      crawlRef.current = setInterval(() => {
        setProgress((p) => p + (CRAWL_MAX - p) * CRAWL_RATE);
      }, TICK_MS);
    };

    document.addEventListener("click", onLinkClick, { capture: true });
    return () => document.removeEventListener("click", onLinkClick, { capture: true });
  }, [prefersReducedMotion]);

  // Complete when pathname commits to the new route.
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    if (barState !== "running") return;

    // Enforce minimum visible duration so fast sync pages show the bar long
    // enough to register as intentional feedback rather than a stray flash.
    const elapsed = performance.now() - startTimeRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

    if (remaining > 0) {
      // Keep crawling until min duration passes, then complete.
      doneRef.current = setTimeout(finishBar, remaining);
    } else {
      finishBar();
    }
  }, [pathname, barState, prefersReducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount.
  useEffect(() => () => clearTimers(), []);

  if (barState === "idle" || prefersReducedMotion) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[99999] h-[2px] pointer-events-none"
      style={{
        opacity: barState === "done" ? 0 : 1,
        transition: barState === "done" ? `opacity ${DONE_HOLD_MS}ms ease-out` : "none",
      }}
    >
      <div
        className="h-full bg-[var(--sd-accent)]"
        style={{
          width: `${progress}%`,
          transition: barState === "running"
            ? `width ${TICK_MS * 1.2}ms ease-out`
            : `width ${MOTION.fast}ms ease-out`,
        }}
      />
    </div>
  );
}
