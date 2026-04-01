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
import { forceUnlockScroll, lockScroll, unlockScroll } from "@/lib/scroll";

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

export function useRouteReadySignal() {
  const pathname = normalizeRoutePathname(usePathname() || "/");
  const { token, signalRouteReady } = useTransitionNav();
  return useCallback(() => {
    signalRouteReady(pathname, token);
  }, [pathname, signalRouteReady, token]);
}

// ---------------------------------------------------------------------------
// AppFadeWrapper (formerly app-fade-wrapper.tsx)
// ---------------------------------------------------------------------------

type FadeState = "visible" | "fading-out" | "hidden" | "fading-in";

export function AppFadeWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const { phase } = useTransitionNav();
  const [fadeState, setFadeState] = useState<FadeState>("visible");
  const wasTransitionActiveRef = useRef(false);
  const previousPathnameRef = useRef(pathname);

  useIsomorphicLayoutEffect(() => {
    if (phase !== "idle") {
      wasTransitionActiveRef.current = true;
      setFadeState((current) =>
        current === "hidden" || current === "fading-out" ? current : "fading-out",
      );
      return;
    }
    if (!wasTransitionActiveRef.current) return;
    // Skip the "hidden" snap: content is already opacity:0 from fading-out.
    // Going directly to fading-in avoids the ~33 ms blank frame that occurred
    // between the overlay exiting and the content becoming visible.
    const firstFrame = requestAnimationFrame(() => {
      setFadeState("fading-in");
    });
    return () => {
      cancelAnimationFrame(firstFrame);
    };
  }, [phase]);

  useEffect(() => {
    if (fadeState !== "fading-in") return;
    const timeout = window.setTimeout(() => {
      setFadeState("visible");
      wasTransitionActiveRef.current = false;
    }, 1000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [fadeState]);

  useIsomorphicLayoutEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;
    // For navigations that do NOT go through the custom overlay (standard <Link>
    // clicks, browser back/forward), Next.js natively keeps the previous page
    // visible via startTransition, then swaps. Manually setting `hidden` here
    // was overriding that native behaviour, causing a blank flash. The
    // loading.tsx skeleton handles the in-progress Suspense state instead.
  }, [pathname]);

  return (
    <div className="app-fade">
      <div className={`app-route-fade app-route-fade--${fadeState}`}>{children}</div>
    </div>
  );
}
