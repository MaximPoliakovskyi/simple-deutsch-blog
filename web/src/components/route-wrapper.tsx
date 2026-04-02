"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  createContext,
  startTransition as reactStartTransition,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  forceUnlockScroll,
  lockScroll,
  resetScrollToTop,
  setManualScrollRestoration,
  unlockScroll,
} from "@/lib/scroll";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ---------------------------------------------------------------------------
// Types & Context (formerly transition-nav.ts)
// ---------------------------------------------------------------------------

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
  signalRouteReady: (pathname: string, token: number) => void;
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
// Shared helpers
// ---------------------------------------------------------------------------

const ENTER_MS = 1500;
const EXIT_MS = 1500;
const COVERED_MS = 90;
const READY_MAX_MS = 2200;
const OPACITY_MS = 140;
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_ROUTE_TRANSITION === "1";

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

function createAbortError() {
  return new Error("Route transition aborted");
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.message === "Route transition aborted";
}

function waitDoubleRaf(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }
    let firstFrame = 0;
    let secondFrame = 0;
    const cleanup = () => {
      if (firstFrame) cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
      signal?.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(createAbortError());
    };
    if (signal) signal.addEventListener("abort", onAbort, { once: true });
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        cleanup();
        resolve();
      });
    });
  });
}

function waitForMs(signal: AbortSignal, durationMs: number) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(createAbortError());
      return;
    }
    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve();
    }, durationMs);
    const cleanup = () => {
      window.clearTimeout(timeoutId);
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(createAbortError());
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function now() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPrefersReducedMotion(media.matches);
    onChange();
    if (media.addEventListener) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);
  return prefersReducedMotion;
}

// ---------------------------------------------------------------------------
// RouteTransitionProvider (formerly route-transition-provider.tsx)
// ---------------------------------------------------------------------------

type ActiveTransition = {
  direction: TransitionDirection;
  href: string;
  targetPathname: string;
  token: number;
};

type ActiveRun = { controller: AbortController; token: number };

type Waiter = { pathname: string; settle: (matched: boolean) => void; token: number };

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const rawPathname = usePathname() || "/";
  const pathname = normalizeRoutePathname(rawPathname);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [direction, setDirection] = useState<TransitionDirection>("forward");
  const [token, setToken] = useState(0);
  const [targetPathname, setTargetPathname] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const phaseRef = useRef<TransitionPhase>("idle");
  const pathnameRef = useRef(pathname);
  const tokenCounterRef = useRef(0);
  const activeRunRef = useRef<ActiveRun | null>(null);
  const activeTransitionRef = useRef<ActiveTransition | null>(null);
  const pathnameWaitersRef = useRef<Waiter[]>([]);
  const routeReadyWaitersRef = useRef<Waiter[]>([]);
  const readySignalsRef = useRef<Map<number, Set<string>>>(new Map());
  const pushedTokenRef = useRef<number | null>(null);

  const shouldRenderOverlay = !isInitialLoad;
  const isActive = phase !== "idle";

  const logDev = useCallback((event: string, extra: Record<string, unknown> = {}) => {
    if (!DEBUG) return;
    console.log("[route-transition]", {
      event,
      phase: phaseRef.current,
      token: activeTransitionRef.current?.token ?? 0,
      pathname: pathnameRef.current,
      targetPathname: activeTransitionRef.current?.targetPathname ?? null,
      ...extra,
    });
  }, []);

  const setPhaseSafe = useCallback((nextPhase: TransitionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const clearWaiters = useCallback(() => {
    const pw = pathnameWaitersRef.current;
    const rw = routeReadyWaitersRef.current;
    pathnameWaitersRef.current = [];
    routeReadyWaitersRef.current = [];
    for (const w of pw) w.settle(false);
    for (const w of rw) w.settle(false);
  }, []);

  const clearReadySignals = useCallback(() => {
    readySignalsRef.current.clear();
  }, []);

  const isCurrentTransition = useCallback((expectedToken: number) => {
    return (
      activeTransitionRef.current?.token === expectedToken &&
      activeRunRef.current?.token === expectedToken &&
      !activeRunRef.current.controller.signal.aborted
    );
  }, []);

  const cancelActiveRun = useCallback(
    (reason: string) => {
      const activeRun = activeRunRef.current;
      if (!activeRun) return;
      activeRunRef.current = null;
      if (!activeRun.controller.signal.aborted) activeRun.controller.abort();
      clearWaiters();
      logDev("cancel-run", { reason, token: activeRun.token });
    },
    [clearWaiters, logDev],
  );

  const resetToIdle = useCallback(
    (reason: string) => {
      cancelActiveRun(reason);
      clearReadySignals();
      unlockScroll();
      activeTransitionRef.current = null;
      pushedTokenRef.current = null;
      setTargetPathname(null);
      setToken(0);
      setPhaseSafe("idle");
      logDev("reset-idle", { reason });
    },
    [cancelActiveRun, clearReadySignals, logDev, setPhaseSafe],
  );

  const waitForPathnameMatch = useCallback(
    (signal: AbortSignal, expectedToken: number, expectedPathname: string, timeoutMs: number) => {
      if (signal.aborted) return Promise.resolve(false);
      if (pathnameRef.current === expectedPathname && isCurrentTransition(expectedToken))
        return Promise.resolve(true);
      return new Promise<boolean>((resolve) => {
        let settled = false;
        let timeoutId = 0;
        const finish = (matched: boolean) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          signal.removeEventListener("abort", onAbort);
          pathnameWaitersRef.current = pathnameWaitersRef.current.filter((w) => w !== waiterEntry);
          resolve(matched);
        };
        const onAbort = () => finish(false);
        const waiterEntry: Waiter = {
          token: expectedToken,
          pathname: expectedPathname,
          settle: finish,
        };
        timeoutId = window.setTimeout(() => finish(false), timeoutMs);
        signal.addEventListener("abort", onAbort, { once: true });
        pathnameWaitersRef.current.push(waiterEntry);
      });
    },
    [isCurrentTransition],
  );

  const waitForRouteReadySignal = useCallback(
    (signal: AbortSignal, expectedToken: number, expectedPathname: string, timeoutMs: number) => {
      if (signal.aborted) return Promise.resolve(false);
      const readySet = readySignalsRef.current.get(expectedToken);
      if (readySet?.has(expectedPathname) && isCurrentTransition(expectedToken))
        return Promise.resolve(true);
      return new Promise<boolean>((resolve) => {
        let settled = false;
        let timeoutId = 0;
        const finish = (matched: boolean) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          signal.removeEventListener("abort", onAbort);
          routeReadyWaitersRef.current = routeReadyWaitersRef.current.filter(
            (w) => w !== waiterEntry,
          );
          resolve(matched);
        };
        const onAbort = () => finish(false);
        const waiterEntry: Waiter = {
          token: expectedToken,
          pathname: expectedPathname,
          settle: finish,
        };
        timeoutId = window.setTimeout(() => finish(false), timeoutMs);
        signal.addEventListener("abort", onAbort, { once: true });
        routeReadyWaitersRef.current.push(waiterEntry);
      });
    },
    [isCurrentTransition],
  );

  const runTransition = useCallback(
    async (activeTransition: ActiveTransition, signal: AbortSignal) => {
      const readyStartAt = () => now();
      try {
        await waitForMs(signal, ENTER_MS);
        if (!isCurrentTransition(activeTransition.token)) return;
        setPhaseSafe("covered");
        logDev("covered", { token: activeTransition.token });
        await waitForMs(signal, COVERED_MS);
        if (!isCurrentTransition(activeTransition.token)) return;
        if (pushedTokenRef.current !== activeTransition.token) {
          pushedTokenRef.current = activeTransition.token;
          reactStartTransition(() => {
            router.push(activeTransition.href);
          });
        }
        setPhaseSafe("waiting_ready");
        logDev("waiting-ready", { token: activeTransition.token });
        const loadingStartedAt = readyStartAt();
        const pathnameMatched = await waitForPathnameMatch(
          signal,
          activeTransition.token,
          activeTransition.targetPathname,
          READY_MAX_MS,
        );
        if (!isCurrentTransition(activeTransition.token)) return;
        if (pathnameMatched) {
          await waitDoubleRaf(signal);
          if (!isCurrentTransition(activeTransition.token)) return;
          const elapsedMs = readyStartAt() - loadingStartedAt;
          const remainingMs = Math.max(0, READY_MAX_MS - elapsedMs);
          const readyMatched = await waitForRouteReadySignal(
            signal,
            activeTransition.token,
            activeTransition.targetPathname,
            remainingMs,
          );
          if (!isCurrentTransition(activeTransition.token)) return;
          if (!readyMatched && process.env.NODE_ENV !== "production") {
            console.warn(
              `[route-transition] route-ready timeout for ${activeTransition.targetPathname} (token ${activeTransition.token})`,
            );
          }
        }
        setPhaseSafe("exiting");
        logDev("exiting", { token: activeTransition.token });
        await waitForMs(signal, EXIT_MS);
        if (!isCurrentTransition(activeTransition.token)) return;
        resetToIdle("completed");
      } catch (error) {
        if (isAbortError(error)) return;
        if (process.env.NODE_ENV !== "production")
          console.error("[route-transition] transition failed", error);
        if (!isCurrentTransition(activeTransition.token)) return;
        resetToIdle("error");
      }
    },
    [
      isCurrentTransition,
      logDev,
      resetToIdle,
      router,
      setPhaseSafe,
      waitForPathnameMatch,
      waitForRouteReadySignal,
    ],
  );

  const beginTransition = useCallback(
    ({
      nextDirection = "forward",
      nextTargetHref,
      nextTargetPathname,
    }: {
      nextDirection?: TransitionDirection;
      nextTargetHref: string;
      nextTargetPathname: string;
    }) => {
      if (activeRunRef.current && !activeRunRef.current.controller.signal.aborted) {
        logDev("begin-blocked", { phase: phaseRef.current, reason: "run-active" });
        return false;
      }
      if (phaseRef.current !== "idle") {
        logDev("begin-blocked", { phase: phaseRef.current });
        return false;
      }
      const nextToken = tokenCounterRef.current + 1;
      tokenCounterRef.current = nextToken;
      cancelActiveRun("pre-begin-safety");
      clearWaiters();
      clearReadySignals();
      const nextTransition: ActiveTransition = {
        token: nextToken,
        href: nextTargetHref,
        targetPathname: nextTargetPathname,
        direction: nextDirection,
      };
      const controller = new AbortController();
      activeRunRef.current = { token: nextToken, controller };
      activeTransitionRef.current = nextTransition;
      pushedTokenRef.current = null;
      readySignalsRef.current.set(nextToken, new Set());
      setDirection(nextDirection);
      setToken(nextToken);
      setTargetPathname(nextTargetPathname);
      setPhaseSafe("entering");
      lockScroll();
      logDev("begin", {
        token: nextToken,
        nextTargetHref,
        nextTargetPathname,
        direction: nextDirection,
      });
      void runTransition(nextTransition, controller.signal);
      return true;
    },
    [cancelActiveRun, clearReadySignals, clearWaiters, logDev, runTransition, setPhaseSafe],
  );

  const navigateFromLogo = useCallback(
    (href: string) => {
      if (!href) return false;
      const nextPathname = toPathname(href, pathnameRef.current);
      if (nextPathname === pathnameRef.current) return false;
      if (prefersReducedMotion) {
        router.push(href);
        return true;
      }
      return beginTransition({
        nextDirection: "forward",
        nextTargetHref: href,
        nextTargetPathname: nextPathname,
      });
    },
    [beginTransition, prefersReducedMotion, router],
  );

  const navigateFromLanguageSwitch = useCallback(
    (href: string) => {
      if (!href) return false;
      const nextPathname = toPathname(href, pathnameRef.current);
      if (nextPathname === pathnameRef.current) return false;
      if (prefersReducedMotion) {
        router.push(href);
        return true;
      }
      return beginTransition({
        nextDirection: "forward",
        nextTargetHref: href,
        nextTargetPathname: nextPathname,
      });
    },
    [beginTransition, prefersReducedMotion, router],
  );

  const signalRouteReady = useCallback(
    (readyPathname: string, readyToken: number) => {
      if (!readyToken || activeTransitionRef.current?.token !== readyToken) return;
      const normalizedPathname = normalizeRoutePathname(readyPathname);
      const readySet = readySignalsRef.current.get(readyToken) ?? new Set<string>();
      readySet.add(normalizedPathname);
      readySignalsRef.current.set(readyToken, readySet);
      const remaining: Waiter[] = [];
      for (const waiter of routeReadyWaitersRef.current) {
        if (waiter.token === readyToken && waiter.pathname === normalizedPathname)
          waiter.settle(true);
        else remaining.push(waiter);
      }
      routeReadyWaitersRef.current = remaining;
      logDev("route-ready", { readyPathname: normalizedPathname, readyToken });
    },
    [logDev],
  );

  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    pathnameRef.current = pathname;
    const activeToken = activeTransitionRef.current?.token;
    if (!activeToken) return;
    const remaining: Waiter[] = [];
    for (const waiter of pathnameWaitersRef.current) {
      if (waiter.token === activeToken && waiter.pathname === pathname) waiter.settle(true);
      else remaining.push(waiter);
    }
    pathnameWaitersRef.current = remaining;
  }, [pathname]);

  useEffect(() => {
    return () => {
      resetToIdle("unmount");
      forceUnlockScroll();
    };
  }, [resetToIdle]);

  const contextValue = useMemo(
    () => ({
      phase,
      direction,
      isActive,
      token,
      pathname,
      targetPathname,
      navigateFromLogo,
      navigateFromLanguageSwitch,
      signalRouteReady,
    }),
    [
      direction,
      isActive,
      navigateFromLanguageSwitch,
      navigateFromLogo,
      pathname,
      phase,
      signalRouteReady,
      targetPathname,
      token,
    ],
  );

  const overlayStyle = useMemo(
    () => ({
      ["--rt-enter-ms" as string]: `${ENTER_MS}ms`,
      ["--rt-exit-ms" as string]: `${EXIT_MS}ms`,
      ["--rt-opacity-ms" as string]: `${OPACITY_MS}ms`,
    }),
    [],
  );

  return (
    <TransitionNavContext.Provider value={contextValue}>
      {children}
      {shouldRenderOverlay ? (
        <div
          aria-hidden="true"
          data-phase={phase}
          data-direction={direction}
          className="rt-overlay"
          style={overlayStyle}
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
      ) : null}
    </TransitionNavContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// RouteReady (formerly route-ready.tsx)
// ---------------------------------------------------------------------------

export function RouteReady({ when = true }: { when?: boolean }) {
  const pathname = normalizeRoutePathname(usePathname() || "/");
  const { token, signalRouteReady } = useTransitionNav();

  useEffect(() => {
    if (!when) return;
    let cancelled = false;
    const run = async () => {
      await waitDoubleRaf();
      if (cancelled) return;
      signalRouteReady(pathname, token);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, signalRouteReady, token, when]);

  return null;
}

// ---------------------------------------------------------------------------
// AppFadeWrapper (formerly app-fade-wrapper.tsx)
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

  // ─── Phase effect ────────────────────────────────────────────────────────
  // Only participates in the custom logo/locale-switch overlay transition.
  // For normal <Link> navigation wasTransitionActiveRef.current stays false
  // so the effect short-circuits and content always remains at opacity:1.
  //
  // Phase visibility contract:
  //   entering / covered / waiting_ready — overlay fully covers the screen:
  //     keep page content at opacity:0 (class fading-out).
  //   exiting — overlay slides away over EXIT_MS (1500 ms):
  //     page content STILL stays at opacity:0. Revealing content during the
  //     slide would bleed partial content under the moving panel.
  //   idle — slide animation is complete, overlay is CSS-hidden in the same
  //     React commit (transition-duration:0ms on the idle rule, so no flash):
  //     fire one rAF so the browser paints the now-invisible overlay, then
  //     start the 1000 ms opacity:0→1 CSS fade-in. No blank frame.
  useIsomorphicLayoutEffect(() => {
    if (DEBUG) {
      console.log(
        `[AppFadeWrapper] phase=${phase} fadeState=${fadeState} T=${performance.now().toFixed(1)}`,
      );
    }

    // All phases where the overlay is on screen (or sliding out) → keep content
    // hidden beneath it. This includes "exiting": the 1500 ms slide-out must
    // complete before content is revealed, so there is no partial-content bleed
    // under the moving overlay panel.
    if (
      phase === "entering" ||
      phase === "covered" ||
      phase === "waiting_ready" ||
      phase === "exiting"
    ) {
      wasTransitionActiveRef.current = true;
      setFadeState((current) =>
        current === "hidden" || current === "fading-out" ? current : "fading-out",
      );
      return;
    }

    // phase === "idle": slide animation is fully complete. The overlay has
    // already snapped to opacity:0 / visibility:hidden (transition-duration:0ms
    // on the idle CSS rule) in the same React commit that changed the phase.
    // A single rAF gives the browser one paint to make that invisible, then the
    // CSS fade-in begins from opacity:0 → no blank white frame between slide
    // end and fade-in start.
    if (!wasTransitionActiveRef.current) return;
    const raf = requestAnimationFrame(() => {
      if (DEBUG) {
        console.log(`[AppFadeWrapper] → fading-in T=${performance.now().toFixed(1)}`);
      }
      setFadeState("fading-in");
    });
    return () => cancelAnimationFrame(raf);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps -- fadeState read only for debug

  useEffect(() => {
    if (fadeState !== "fading-in") return;
    const timeout = window.setTimeout(() => {
      setFadeState("visible");
      wasTransitionActiveRef.current = false;
      if (DEBUG) {
        console.log(`[AppFadeWrapper] → visible T=${performance.now().toFixed(1)}`);
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [fadeState]);

  // Hide normal route commits until the scroll reset has completed.
  useIsomorphicLayoutEffect(() => {
    setManualScrollRestoration();

    if (committedPathnameRef.current === pathname) return;
    committedPathnameRef.current = pathname;
    pathnameResetTokenRef.current += 1;
    const resetToken = pathnameResetTokenRef.current;

    if (phaseRef.current === "idle") {
      setFadeState("hidden");
    }

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

        if (phaseRef.current === "idle") {
          setFadeState("visible");
        }
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [pathname]);

  // ─── Pathname effect — INTENTIONALLY REMOVED ─────────────────────────────
  //
  // The previous implementation had a third useIsomorphicLayoutEffect that
  // watched [pathname, phase] and ran this sequence:
  //
  //   pathname changes (new page committed)
  //   → setFadeState("hidden")      // opacity:0, no CSS transition — INSTANT BLANK
  //   → rAF → rAF → "fading-in"    // then 1 000 ms fade from 0
  //
  // This ran synchronously in the same microtask as React's commit of the new
  // page. New content was fully in the DOM but immediately made invisible,
  // then took ~1 second to reappear. That was the primary ~1 s blank.
  //
  // Why removal is safe:
  // Next.js wraps <Link> navigation in React's startTransition. startTransition
  // keeps the previous page's Suspense-resolved content visible while the new
  // RSC payload streams in — the old page literally does not unmount until the
  // new one is committed. Once the new page commits, it should be immediately
  // visible; there is no reason to artificially hide it.

  return (
    <div className="app-fade">
      <div className={`app-route-fade app-route-fade--${fadeState}`}>{children}</div>
    </div>
  );
}
