"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode, TransitionEvent } from "react";
import {
  startTransition as reactStartTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type TransitionDirection,
  TransitionNavContext,
  type TransitionPhase,
} from "@/components/transition/useTransitionNav";
import { forceUnlockScroll, lockScroll, unlockScroll } from "@/lib/scrollLock";

const ENTER_MS = 520;
const EXIT_MS = 520;
const COVERED_MS = 60;
const READY_MAX_MS = 1800;
const WATCHDOG_BUFFER_MS = 150;
const GLOBAL_STUCK_TIMEOUT_MS = 3200;
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_ROUTE_TRANSITION === "1";

function normalizeRoutePathname(pathname: string) {
  let value = pathname || "/";
  const basePathRaw = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
  if (basePathRaw) {
    const basePath = basePathRaw.startsWith("/") ? basePathRaw : `/${basePathRaw}`;
    if (value === basePath) {
      value = "/";
    } else if (value.startsWith(`${basePath}/`)) {
      value = value.slice(basePath.length);
    }
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

function waitDoubleRaf() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
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

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const rawPathname = usePathname() || "/";
  const pathname = normalizeRoutePathname(rawPathname);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [direction, setDirection] = useState<TransitionDirection>("forward");
  const [token, setToken] = useState(0);
  const [targetPathname, setTargetPathname] = useState<string | null>(null);
  const [logoAngle, setLogoAngle] = useState(0);
  const [logoRotateMs, setLogoRotateMs] = useState(0);

  const phaseRef = useRef<TransitionPhase>("idle");
  const pathnameRef = useRef(pathname);
  const targetPathnameRef = useRef<string | null>(null);
  const targetHrefRef = useRef<string | null>(null);
  const activeTokenRef = useRef(0);
  const tokenCounterRef = useRef(0);
  const pushedTokenRef = useRef<number | null>(null);

  const phaseWatchdogRef = useRef<number | null>(null);
  const globalStuckWatchdogRef = useRef<number | null>(null);
  const pathnameWaitersRef = useRef<
    Array<{ token: number; pathname: string; resolve: () => void }>
  >([]);
  const readySignalsRef = useRef<Map<number, Set<string>>>(new Map());
  const routeReadyWaitersRef = useRef<
    Array<{ token: number; pathname: string; resolve: () => void }>
  >([]);

  const isActive = phase !== "idle";

  const logDev = useCallback((event: string, extra: Record<string, unknown> = {}) => {
    if (!DEBUG) return;
    console.log("[route-transition]", {
      event,
      phase: phaseRef.current,
      token: activeTokenRef.current,
      pathname: pathnameRef.current,
      targetPathname: targetPathnameRef.current,
      ...extra,
    });
  }, []);

  const clearPhaseWatchdog = useCallback(() => {
    if (phaseWatchdogRef.current !== null) {
      window.clearTimeout(phaseWatchdogRef.current);
      phaseWatchdogRef.current = null;
    }
  }, []);

  const clearRouteReadyState = useCallback(() => {
    readySignalsRef.current.clear();
    routeReadyWaitersRef.current = [];
  }, []);

  const setPhaseSafe = useCallback((nextPhase: TransitionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const resetToIdle = useCallback(
    (reason: string) => {
      clearPhaseWatchdog();
      clearRouteReadyState();
      pathnameWaitersRef.current = [];
      unlockScroll();
      activeTokenRef.current = 0;
      targetPathnameRef.current = null;
      targetHrefRef.current = null;
      pushedTokenRef.current = null;
      setTargetPathname(null);
      setToken(0);
      setPhaseSafe("idle");
      logDev("reset-idle", { reason });
    },
    [clearPhaseWatchdog, clearRouteReadyState, logDev, setPhaseSafe],
  );

  const goCovered = useCallback(
    (reason: string, expectedToken: number) => {
      if (activeTokenRef.current !== expectedToken || phaseRef.current !== "entering") return;
      setPhaseSafe("covered");
      logDev("covered", { reason, expectedToken });
    },
    [logDev, setPhaseSafe],
  );

  const goWaitingReady = useCallback(
    (reason: string, expectedToken: number) => {
      if (activeTokenRef.current !== expectedToken || phaseRef.current !== "covered") return;
      setPhaseSafe("waiting_ready");
      logDev("waiting-ready", { reason, expectedToken });
    },
    [logDev, setPhaseSafe],
  );

  const goExiting = useCallback(
    (reason: string, expectedToken: number) => {
      if (activeTokenRef.current !== expectedToken || phaseRef.current !== "waiting_ready") return;
      setPhaseSafe("exiting");
      logDev("exiting", { reason, expectedToken });
    },
    [logDev, setPhaseSafe],
  );

  const beginTransition = useCallback(
    ({
      nextDirection = "forward",
      nextTargetPathname,
      nextTargetHref,
    }: {
      nextDirection?: TransitionDirection;
      nextTargetPathname: string;
      nextTargetHref: string;
    }) => {
      if (phaseRef.current !== "idle") {
        logDev("begin-blocked", { phase: phaseRef.current });
        return false;
      }

      clearPhaseWatchdog();
      clearRouteReadyState();
      pathnameWaitersRef.current = [];

      const nextToken = tokenCounterRef.current + 1;
      tokenCounterRef.current = nextToken;
      activeTokenRef.current = nextToken;
      targetPathnameRef.current = nextTargetPathname;
      targetHrefRef.current = nextTargetHref;
      pushedTokenRef.current = null;
      readySignalsRef.current.set(nextToken, new Set());

      setDirection(nextDirection);
      setToken(nextToken);
      setTargetPathname(nextTargetPathname);
      setPhaseSafe("entering");

      lockScroll();
      logDev("begin", { nextTargetPathname, nextTargetHref, token: nextToken });
      return true;
    },
    [clearPhaseWatchdog, clearRouteReadyState, logDev, setPhaseSafe],
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
        nextTargetPathname: nextPathname,
        nextTargetHref: href,
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
        nextTargetPathname: nextPathname,
        nextTargetHref: href,
      });
    },
    [beginTransition, prefersReducedMotion, router],
  );

  const signalRouteReady = useCallback(
    (readyPathname: string, readyToken: number) => {
      if (!readyToken || readyToken !== activeTokenRef.current) return;

      const normalizedPathname = normalizeRoutePathname(readyPathname);
      const readySet = readySignalsRef.current.get(readyToken) ?? new Set<string>();
      readySet.add(normalizedPathname);
      readySignalsRef.current.set(readyToken, readySet);

      const remaining: typeof routeReadyWaitersRef.current = [];
      for (const waiter of routeReadyWaitersRef.current) {
        if (waiter.pathname === normalizedPathname && waiter.token === readyToken) {
          waiter.resolve();
        } else {
          remaining.push(waiter);
        }
      }
      routeReadyWaitersRef.current = remaining;
      logDev("route-ready", { readyPathname: normalizedPathname, readyToken });
    },
    [logDev],
  );

  useEffect(() => {
    pathnameRef.current = pathname;

    const remaining: typeof pathnameWaitersRef.current = [];
    for (const waiter of pathnameWaitersRef.current) {
      if (waiter.pathname === pathname && waiter.token === activeTokenRef.current) {
        waiter.resolve();
      } else {
        remaining.push(waiter);
      }
    }
    pathnameWaitersRef.current = remaining;
  }, [pathname]);

  useEffect(() => {
    if (phase === "idle") {
      clearPhaseWatchdog();
      return;
    }

    const expectedToken = activeTokenRef.current;
    const timeoutByPhase: Record<Exclude<TransitionPhase, "idle">, number> = {
      entering: ENTER_MS,
      covered: COVERED_MS,
      waiting_ready: READY_MAX_MS,
      exiting: EXIT_MS,
    };

    clearPhaseWatchdog();
    phaseWatchdogRef.current = window.setTimeout(() => {
      if (activeTokenRef.current !== expectedToken) return;
      if (phaseRef.current !== phase) return;

      if (phase === "entering") {
        goCovered("watchdog", expectedToken);
        return;
      }
      if (phase === "covered") {
        goWaitingReady("covered-watchdog", expectedToken);
        return;
      }
      if (phase === "waiting_ready") {
        goExiting("ready-watchdog", expectedToken);
        return;
      }
      if (phase === "exiting") {
        resetToIdle("exit-watchdog");
      }
    }, timeoutByPhase[phase] + WATCHDOG_BUFFER_MS);

    return () => clearPhaseWatchdog();
  }, [clearPhaseWatchdog, goCovered, goExiting, goWaitingReady, phase, resetToIdle]);

  useEffect(() => {
    if (phase !== "covered") return;

    const expectedToken = activeTokenRef.current;
    const href = targetHrefRef.current;

    if (href && pushedTokenRef.current !== expectedToken) {
      pushedTokenRef.current = expectedToken;
      reactStartTransition(() => {
        router.push(href);
      });
    }

    goWaitingReady("covered-enter", expectedToken);
  }, [goWaitingReady, phase, router]);

  useEffect(() => {
    if (phase !== "waiting_ready") return;

    const expectedToken = activeTokenRef.current;
    const expectedPathname = targetPathnameRef.current;
    if (!expectedPathname) {
      goExiting("missing-target", expectedToken);
      return;
    }

    const waitForPathname = (waitToken: number, waitPathname: string, timeoutMs: number) => {
      if (pathnameRef.current === waitPathname && activeTokenRef.current === waitToken) {
        return Promise.resolve(true);
      }

      return new Promise<boolean>((resolve) => {
        let settled = false;

        const finish = (value: boolean) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          pathnameWaitersRef.current = pathnameWaitersRef.current.filter(
            (x) => x.resolve !== onMatch,
          );
          resolve(value);
        };

        const onMatch = () => finish(true);

        const timeoutId = window.setTimeout(() => finish(false), timeoutMs);
        pathnameWaitersRef.current.push({
          token: waitToken,
          pathname: waitPathname,
          resolve: onMatch,
        });
      });
    };

    const waitForRouteReadySignal = (
      waitToken: number,
      waitPathname: string,
      timeoutMs: number,
    ) => {
      const readySet = readySignalsRef.current.get(waitToken);
      if (readySet?.has(waitPathname) && activeTokenRef.current === waitToken) {
        return Promise.resolve(true);
      }

      return new Promise<boolean>((resolve) => {
        let settled = false;

        const finish = (value: boolean) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          routeReadyWaitersRef.current = routeReadyWaitersRef.current.filter(
            (x) => x.resolve !== onMatch,
          );
          resolve(value);
        };

        const onMatch = () => finish(true);
        const timeoutId = window.setTimeout(() => finish(false), timeoutMs);
        routeReadyWaitersRef.current.push({
          token: waitToken,
          pathname: waitPathname,
          resolve: onMatch,
        });
      });
    };

    let cancelled = false;
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    const remainingMs = () => {
      const now = typeof performance !== "undefined" ? performance.now() : Date.now();
      return Math.max(0, READY_MAX_MS - (now - startedAt));
    };

    const run = async () => {
      const pathMatched = await waitForPathname(expectedToken, expectedPathname, remainingMs());
      if (!pathMatched || cancelled) {
        goExiting("path-timeout", expectedToken);
        return;
      }
      if (activeTokenRef.current !== expectedToken || phaseRef.current !== "waiting_ready") return;

      await waitDoubleRaf();
      if (cancelled) return;
      if (activeTokenRef.current !== expectedToken || phaseRef.current !== "waiting_ready") return;

      const readyMatched = await waitForRouteReadySignal(
        expectedToken,
        expectedPathname,
        remainingMs(),
      );
      if (!readyMatched || cancelled) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[route-transition] route-ready timeout for ${expectedPathname} (token ${expectedToken})`,
          );
        }
        goExiting("ready-timeout", expectedToken);
        return;
      }
      if (activeTokenRef.current !== expectedToken || phaseRef.current !== "waiting_ready") return;

      goExiting("ready", expectedToken);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [goExiting, phase]);

  useEffect(() => {
    if (phase !== "idle") return;
    unlockScroll();
  }, [phase]);

  useEffect(() => {
    if (globalStuckWatchdogRef.current !== null) {
      window.clearTimeout(globalStuckWatchdogRef.current);
      globalStuckWatchdogRef.current = null;
    }
    if (phase === "idle") return;

    const expectedToken = activeTokenRef.current;
    globalStuckWatchdogRef.current = window.setTimeout(() => {
      if (phaseRef.current === "idle") return;
      if (activeTokenRef.current !== expectedToken) return;

      logDev("global-stuck-reset", { phase: phaseRef.current, expectedToken });
      setPhaseSafe("idle");
      clearRouteReadyState();
      pathnameWaitersRef.current = [];
      activeTokenRef.current = 0;
      targetPathnameRef.current = null;
      targetHrefRef.current = null;
      pushedTokenRef.current = null;
      setTargetPathname(null);
      setToken(0);
      forceUnlockScroll();
    }, GLOBAL_STUCK_TIMEOUT_MS);

    return () => {
      if (globalStuckWatchdogRef.current !== null) {
        window.clearTimeout(globalStuckWatchdogRef.current);
        globalStuckWatchdogRef.current = null;
      }
    };
  }, [clearRouteReadyState, logDev, phase, setPhaseSafe]);

  const settleOverlayPhase = useCallback(
    (source: "transitionend" | "transitioncancel") => {
      const expectedToken = activeTokenRef.current;
      if (phaseRef.current === "entering") {
        goCovered(source, expectedToken);
        return;
      }
      if (phaseRef.current === "exiting") {
        resetToIdle(source);
      }
    },
    [goCovered, resetToIdle],
  );

  const onOverlayTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
      settleOverlayPhase("transitionend");
    },
    [settleOverlayPhase],
  );

  const onOverlayTransitionCancel = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "transform") return;
      settleOverlayPhase("transitioncancel");
    },
    [settleOverlayPhase],
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setLogoRotateMs(0);
      setLogoAngle(0);
      return;
    }

    if (phase === "idle") {
      setLogoRotateMs(0);
      setLogoAngle(0);
      return;
    }

    if (phase === "entering") {
      setLogoRotateMs(ENTER_MS);
      setLogoAngle(360);
      return;
    }

    if (phase === "covered" || phase === "waiting_ready") {
      setLogoRotateMs(0);
      return;
    }

    if (phase === "exiting") {
      setLogoRotateMs(EXIT_MS);
      setLogoAngle(720);
    }
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      clearPhaseWatchdog();
      clearRouteReadyState();
      pathnameWaitersRef.current = [];
      if (globalStuckWatchdogRef.current !== null) {
        window.clearTimeout(globalStuckWatchdogRef.current);
        globalStuckWatchdogRef.current = null;
      }
      forceUnlockScroll();
    };
  }, [clearPhaseWatchdog, clearRouteReadyState]);

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

  return (
    <TransitionNavContext.Provider value={contextValue}>
      {children}
      <div
        aria-hidden="true"
        onTransitionEnd={onOverlayTransitionEnd}
        onTransitionCancel={onOverlayTransitionCancel}
        data-phase={phase}
        data-direction={direction}
        className="rt-overlay"
      >
        <Image
          src="/main-logo.svg"
          alt=""
          width={220}
          height={220}
          className="rt-overlay__logo"
          style={{
            transform: `rotate(${logoAngle}deg)`,
            transitionDuration: `${logoRotateMs}ms`,
          }}
          priority
        />
      </div>
    </TransitionNavContext.Provider>
  );
}
