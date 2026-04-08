"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { MOTION } from "@/lib/motion";
import { resetScrollToTop, setManualScrollRestoration } from "@/lib/scroll";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ---------------------------------------------------------------------------
// Types & Context
// ---------------------------------------------------------------------------

// Full legacy phase type kept for CSS data-phase compatibility and external consumers.
export type TransitionPhase = "idle" | "entering" | "covered" | "waiting_ready" | "exiting";
export type TransitionDirection = "forward" | "back";

export type TransitionNavContextValue = {
  phase: TransitionPhase;
  direction: TransitionDirection;
  isActive: boolean;
  token: number;
  pathname: string;
  targetPathname: string | null;
  navigateFromLogo: (href: string) => boolean;
  navigateFromLanguageSwitch: (href: string) => boolean;
};

export const TransitionNavContext = createContext<TransitionNavContextValue | null>(null);

export function useTransitionNav() {
  const context = useContext(TransitionNavContext);
  if (!context) throw new Error("useTransitionNav must be used inside RouteTransitionProvider");
  return context;
}

export function isUnmodifiedLeftClick(event: ReactMouseEvent<HTMLElement>) {
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ENTER_MS = MOTION.routeEnter; // 600ms
const EXIT_MS = MOTION.routeExit; // 600ms

function normalizeRoutePathname(pathname: string) {
  let value = pathname || "/";
  const basePathRaw = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (basePathRaw) {
    const basePath = basePathRaw.startsWith("/") ? basePathRaw : `/${basePathRaw}`;
    if (value === basePath) value = "/";
    else if (value.startsWith(`${basePath}/`)) value = value.slice(basePath.length);
  }
  if (!value.startsWith("/")) value = `/${value}`;
  if (value.length > 1) value = value.replace(/\/+$/, "");
  return value || "/";
}

function toPathname(href: string, currentPathname: string) {
  if (typeof window === "undefined") return normalizeRoutePathname(currentPathname);
  try {
    return normalizeRoutePathname(new URL(href, window.location.origin).pathname);
  } catch {
    return normalizeRoutePathname(href.startsWith("/") ? href : currentPathname);
  }
}

// ---------------------------------------------------------------------------
// RouteTransitionProvider
// Simplified: idle → entering (slide in, 600ms) → exiting (slide out, 600ms) → idle.
// Navigation is triggered at the midpoint of the entering animation.
// ---------------------------------------------------------------------------

type SimplePhase = "idle" | "entering" | "exiting";

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const rawPathname = usePathname() || "/";
  const pathname = normalizeRoutePathname(rawPathname);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<SimplePhase>("idle");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const phaseRef = useRef<SimplePhase>("idle");
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const resetToIdle = useCallback(() => {
    clearTimers();
    phaseRef.current = "idle";
    setPhase("idle");
  }, [clearTimers]);

  const beginTransition = useCallback(
    (href: string) => {
      if (!href || phaseRef.current !== "idle") return false;
      if (prefersReducedMotion) {
        router.push(href);
        return true;
      }

      phaseRef.current = "entering";
      setPhase("entering");

      // Navigate at the midpoint of the enter animation.
      const t1 = window.setTimeout(() => {
        router.push(href);
      }, ENTER_MS / 2);

      // Start exit phase after enter completes.
      const t2 = window.setTimeout(() => {
        if (phaseRef.current === "entering") {
          phaseRef.current = "exiting";
          setPhase("exiting");
        }
      }, ENTER_MS);

      // Return to idle after exit completes.
      const t3 = window.setTimeout(resetToIdle, ENTER_MS + EXIT_MS);

      timersRef.current = [t1, t2, t3];
      return true;
    },
    [prefersReducedMotion, resetToIdle, router],
  );

  const navigateFromLogo = useCallback(
    (href: string) => {
      if (!href) return false;
      if (toPathname(href, pathname) === pathname) return false;
      return beginTransition(href);
    },
    [beginTransition, pathname],
  );

  const navigateFromLanguageSwitch = useCallback(
    (href: string) => {
      if (!href) return false;
      if (toPathname(href, pathname) === pathname) return false;
      return beginTransition(href);
    },
    [beginTransition, pathname],
  );

  // No-op signalRouteReady removed — was deprecated and had no consumers.

  // Map to legacy phase type for CSS data-phase compatibility.
  const legacyPhase: TransitionPhase =
    phase === "entering" ? "entering" : phase === "exiting" ? "exiting" : "idle";

  const contextValue = useMemo(
    () => ({
      phase: legacyPhase,
      direction: "forward" as TransitionDirection,
      isActive: phase !== "idle",
      token: 0,
      pathname,
      targetPathname: null,
      navigateFromLogo,
      navigateFromLanguageSwitch,
    }),
    [legacyPhase, navigateFromLanguageSwitch, navigateFromLogo, pathname, phase],
  );

  return (
    <TransitionNavContext.Provider value={contextValue}>
      {children}
      {!isInitialLoad && (
        <div
          aria-hidden="true"
          data-phase={legacyPhase}
          data-direction="forward"
          className="rt-overlay"
        >
          <Image
            src="/main-logo.svg"
            alt=""
            width={220}
            height={220}
            className="rt-overlay__logo"
            priority
          />
        </div>
      )}
    </TransitionNavContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// AppFadeWrapper
// ---------------------------------------------------------------------------

type FadeState = "visible" | "fading-out" | "hidden" | "fading-in";

export function AppFadeWrapper({ children }: { children: ReactNode }) {
  const pathname = normalizeRoutePathname(usePathname() || "/");
  const { phase } = useTransitionNav();
  const [fadeState, setFadeState] = useState<FadeState>("visible");
  const phaseRef = useRef(phase);
  const wasTransitionActiveRef = useRef(false);
  const committedPathnameRef = useRef(pathname);
  const pathnameResetTokenRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Fade content during logo/language-switch overlay transitions.
  // For normal <Link> navigation wasTransitionActiveRef stays false → no-op.
  useIsomorphicLayoutEffect(() => {
    if (phase === "entering" || phase === "exiting") {
      wasTransitionActiveRef.current = true;
      setFadeState((s) => (s === "hidden" || s === "fading-out" ? s : "fading-out"));
      return;
    }
    if (!wasTransitionActiveRef.current) return;
    const raf = requestAnimationFrame(() => setFadeState("fading-in"));
    return () => cancelAnimationFrame(raf);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fadeState !== "fading-in") return;
    const timeout = window.setTimeout(() => {
      setFadeState("visible");
      wasTransitionActiveRef.current = false;
    }, MOTION.routeContent);
    return () => window.clearTimeout(timeout);
  }, [fadeState]);

  // Scroll reset on normal (non-transition) navigation.
  useIsomorphicLayoutEffect(() => {
    setManualScrollRestoration();
    if (committedPathnameRef.current === pathname) return;
    committedPathnameRef.current = pathname;
    pathnameResetTokenRef.current += 1;
    const resetToken = pathnameResetTokenRef.current;

    if (phaseRef.current === "idle") setFadeState("hidden");
    resetScrollToTop();

    let firstFrame = 0;
    let secondFrame = 0;
    firstFrame = requestAnimationFrame(() => {
      if (pathnameResetTokenRef.current !== resetToken) return;
      setManualScrollRestoration();
      resetScrollToTop();
      secondFrame = requestAnimationFrame(() => {
        if (pathnameResetTokenRef.current !== resetToken) return;
        setManualScrollRestoration();
        resetScrollToTop();
        if (phaseRef.current === "idle") setFadeState("visible");
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [pathname]);

  return (
    <div className="app-fade">
      <div className={`app-route-fade app-route-fade--${fadeState}`}>{children}</div>
    </div>
  );
}
