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
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

const ENTER_MS = 650;
const EXIT_MS = 650;
const COVERED_MS = 50;
const READY_MAX_MS = 2000;
const WATCHDOG_BUFFER_MS = 150;
const NAV_INDEX_KEY = "__navIndex";
const DEBUG = process.env.NEXT_PUBLIC_DEBUG_ROUTE_TRANSITION === "1";

type TransitionMode = "push" | "pop";

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

function readNavIndex(state: unknown): number | null {
  if (!state || typeof state !== "object") return null;
  const maybeIndex = (state as Record<string, unknown>)[NAV_INDEX_KEY];
  return typeof maybeIndex === "number" && Number.isFinite(maybeIndex) ? maybeIndex : null;
}

function withNavIndex(state: unknown, navIndex: number) {
  if (state && typeof state === "object") {
    return {
      ...(state as Record<string, unknown>),
      [NAV_INDEX_KEY]: navIndex,
    };
  }
  return { [NAV_INDEX_KEY]: navIndex };
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

  const [debugToken, setDebugToken] = useState(0);
  const [debugTargetPathname, setDebugTargetPathname] = useState<string | null>(null);

  const phaseRef = useRef<TransitionPhase>("idle");
  const directionRef = useRef<TransitionDirection>("forward");
  const pathnameRef = useRef(pathname);
  const targetPathnameRef = useRef<string | null>(null);
  const targetHrefRef = useRef<string | null>(null);
  const activeTokenRef = useRef(0);
  const tokenCounterRef = useRef(0);
  const modeRef = useRef<TransitionMode>("push");
  const pushedTokenRef = useRef<number | null>(null);
  const historyIndexRef = useRef(0);

  const phaseWatchdogRef = useRef<number | null>(null);
  const pathnameWaitersRef = useRef<
    Array<{ token: number; pathname: string; resolve: () => void }>
  >([]);
  const readyWaitersRef = useRef<Array<{ token: number; pathname: string; resolve: () => void }>>(
    [],
  );
  const readySignalsRef = useRef(new Set<string>());

  const isActive = phase !== "idle";

  const logDev = useCallback((event: string, extra: Record<string, unknown> = {}) => {
    if (!DEBUG) return;
    console.log("[route-transition]", {
      event,
      phase: phaseRef.current,
      direction: directionRef.current,
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

  const setPhaseSafe = useCallback((nextPhase: TransitionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const resetToIdle = useCallback(
    (reason: string) => {
      clearPhaseWatchdog();
      unlockScroll();
      activeTokenRef.current = 0;
      targetPathnameRef.current = null;
      targetHrefRef.current = null;
      pushedTokenRef.current = null;
      modeRef.current = "push";
      setTargetPathname(null);
      setToken(0);
      setPhaseSafe("idle");
      setDebugToken(0);
      setDebugTargetPathname(null);
      logDev("reset-idle", { reason });
    },
    [clearPhaseWatchdog, logDev, setPhaseSafe],
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
      nextDirection,
      nextMode,
      nextTargetPathname,
      nextTargetHref,
      trigger,
      allowReplaceActive,
    }: {
      nextDirection: TransitionDirection;
      nextMode: TransitionMode;
      nextTargetPathname: string;
      nextTargetHref: string | null;
      trigger: "logo" | "language" | "popstate";
      allowReplaceActive: boolean;
    }) => {
      if (!allowReplaceActive && phaseRef.current !== "idle") {
        logDev("begin-blocked", { trigger, phase: phaseRef.current });
        return false;
      }

      clearPhaseWatchdog();

      const nextToken = tokenCounterRef.current + 1;
      tokenCounterRef.current = nextToken;
      activeTokenRef.current = nextToken;
      directionRef.current = nextDirection;
      modeRef.current = nextMode;
      targetPathnameRef.current = nextTargetPathname;
      targetHrefRef.current = nextTargetHref;
      pushedTokenRef.current = null;

      setDirection(nextDirection);
      setToken(nextToken);
      setTargetPathname(nextTargetPathname);
      setPhaseSafe("entering");

      lockScroll();

      setDebugToken(nextToken);
      setDebugTargetPathname(nextTargetPathname);

      logDev("begin", {
        trigger,
        nextMode,
        nextDirection,
        nextTargetPathname,
        nextTargetHref,
        token: nextToken,
      });
      return true;
    },
    [clearPhaseWatchdog, logDev, setPhaseSafe],
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
        nextMode: "push",
        nextTargetPathname: nextPathname,
        nextTargetHref: href,
        trigger: "logo",
        allowReplaceActive: false,
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
        nextMode: "push",
        nextTargetPathname: nextPathname,
        nextTargetHref: href,
        trigger: "language",
        allowReplaceActive: false,
      });
    },
    [beginTransition, prefersReducedMotion, router],
  );

  const signalRouteReady = useCallback((readyPathname: string, readyToken: number) => {
    const normalizedPathname = normalizeRoutePathname(readyPathname);
    const key = `${readyToken}:${normalizedPathname}`;
    readySignalsRef.current.add(key);

    const remaining: typeof readyWaitersRef.current = [];
    for (const waiter of readyWaitersRef.current) {
      if (waiter.token === readyToken && waiter.pathname === normalizedPathname) {
        waiter.resolve();
      } else {
        remaining.push(waiter);
      }
    }
    readyWaitersRef.current = remaining;
  }, []);

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
    if (typeof window === "undefined") return;

    const historyRef = window.history;
    const initialIndex = readNavIndex(historyRef.state) ?? 0;
    historyIndexRef.current = initialIndex;
    if (readNavIndex(historyRef.state) === null) {
      historyRef.replaceState(
        withNavIndex(historyRef.state, initialIndex),
        "",
        window.location.href,
      );
    }

    const originalPushState = historyRef.pushState.bind(historyRef);
    const originalReplaceState = historyRef.replaceState.bind(historyRef);

    historyRef.pushState = ((state: unknown, title: string, url?: string | URL | null) => {
      const nextIndex = historyIndexRef.current + 1;
      historyIndexRef.current = nextIndex;
      originalPushState(withNavIndex(state, nextIndex), title, url);
    }) as History["pushState"];

    historyRef.replaceState = ((state: unknown, title: string, url?: string | URL | null) => {
      const indexFromState = readNavIndex(state);
      const nextIndex = indexFromState ?? historyIndexRef.current;
      historyIndexRef.current = nextIndex;
      originalReplaceState(withNavIndex(state, nextIndex), title, url);
    }) as History["replaceState"];

    const onPopState = (event: PopStateEvent) => {
      const nextIndex = readNavIndex(event.state) ?? Math.max(0, historyIndexRef.current - 1);
      const previousIndex = historyIndexRef.current;
      historyIndexRef.current = nextIndex;

      if (readNavIndex(event.state) === null) {
        historyRef.replaceState(
          withNavIndex(historyRef.state, nextIndex),
          "",
          window.location.href,
        );
      }

      if (prefersReducedMotion) return;

      const nextPathname = normalizeRoutePathname(window.location.pathname);
      const popDirection: TransitionDirection = nextIndex < previousIndex ? "back" : "forward";

      beginTransition({
        nextDirection: popDirection,
        nextMode: "pop",
        nextTargetPathname: nextPathname,
        nextTargetHref: null,
        trigger: "popstate",
        allowReplaceActive: true,
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      historyRef.pushState = originalPushState;
      historyRef.replaceState = originalReplaceState;
    };
  }, [beginTransition, prefersReducedMotion]);

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
        if (process.env.NODE_ENV !== "production") {
          console.warn("[route-transition] readiness timeout; forcing exit", {
            token: expectedToken,
            pathname: pathnameRef.current,
            targetPathname: targetPathnameRef.current,
          });
        }
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

    if (modeRef.current === "push" && href && pushedTokenRef.current !== expectedToken) {
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

    const waitForReady = (waitToken: number, waitPathname: string, timeoutMs: number) => {
      const key = `${waitToken}:${waitPathname}`;
      if (readySignalsRef.current.has(key)) return Promise.resolve(true);

      return new Promise<boolean>((resolve) => {
        let settled = false;

        const finish = (value: boolean) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeoutId);
          readyWaitersRef.current = readyWaitersRef.current.filter((x) => x.resolve !== onReady);
          resolve(value);
        };

        const onReady = () => finish(true);

        const timeoutId = window.setTimeout(() => finish(false), timeoutMs);
        readyWaitersRef.current.push({
          token: waitToken,
          pathname: waitPathname,
          resolve: onReady,
        });
      });
    };

    let cancelled = false;
    const startedAt = performance.now();

    const remaining = () => Math.max(1, READY_MAX_MS - (performance.now() - startedAt));

    const run = async () => {
      const pathMatched = await waitForPathname(expectedToken, expectedPathname, remaining());
      if (!pathMatched || cancelled) {
        goExiting("path-timeout", expectedToken);
        return;
      }
      if (activeTokenRef.current !== expectedToken || phaseRef.current !== "waiting_ready") return;

      await waitDoubleRaf();
      if (cancelled) return;
      if (activeTokenRef.current !== expectedToken || phaseRef.current !== "waiting_ready") return;

      const readyMatched = await waitForReady(expectedToken, expectedPathname, remaining());
      if (!readyMatched && process.env.NODE_ENV !== "production") {
        console.warn("[route-transition] RouteReady timeout; forcing exit", {
          token: expectedToken,
          expectedPathname,
          currentPathname: pathnameRef.current,
        });
      }
      if (cancelled) return;
      goExiting(readyMatched ? "ready" : "ready-timeout", expectedToken);
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [goExiting, phase]);

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
    return () => {
      clearPhaseWatchdog();
      unlockScroll();
    };
  }, [clearPhaseWatchdog]);

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
          width={140}
          height={140}
          className="rt-overlay__logo"
          priority
        />
      </div>
      {DEBUG && (
        <div className="rt-debug-hud" aria-hidden="true">
          <div>{`phase: ${phase}`}</div>
          <div>{`direction: ${direction}`}</div>
          <div>{`token: ${debugToken}`}</div>
          <div>{`pathname: ${pathname}`}</div>
          <div>{`targetPathname: ${debugTargetPathname ?? "-"}`}</div>
        </div>
      )}
    </TransitionNavContext.Provider>
  );
}
