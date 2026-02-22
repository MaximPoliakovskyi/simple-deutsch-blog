"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  startTransition as reactStartTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  TransitionNavContext,
  type TransitionNavigationOptions,
  type TransitionPhase,
} from "@/components/transition/useTransitionNav";
import { forceUnlockScroll, lockScroll, unlockScroll } from "@/lib/scrollLock";

const ENTER_DURATION_MS = 760;
const EXIT_DURATION_MS = 760;

type ResolvedTransitionNavigationOptions = {
  scroll: boolean;
  forceInstantScrollBehavior: boolean;
};

type ActiveTransition = {
  token: number;
  href: string;
  targetPathname: string;
  options: ResolvedTransitionNavigationOptions;
};

type MotionState = {
  overlayX: number;
  logoAngle: number;
};

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

function waitNextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function easeInOutCubic(value: number) {
  if (value < 0.5) {
    return 4 * value * value * value;
  }

  return 1 - Math.pow(-2 * value + 2, 3) / 2;
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

function resolveNavigationOptions(
  options: TransitionNavigationOptions | undefined,
): ResolvedTransitionNavigationOptions {
  return {
    scroll: options?.scroll ?? true,
    forceInstantScrollBehavior: options?.forceInstantScrollBehavior ?? false,
  };
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = normalizeRoutePathname(usePathname() || "/");
  const prefersReducedMotion = usePrefersReducedMotion();

  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [token, setToken] = useState(0);
  const [targetPathname, setTargetPathname] = useState<string | null>(null);
  const [motion, setMotion] = useState<MotionState>({
    overlayX: -100,
    logoAngle: 0,
  });

  const phaseRef = useRef<TransitionPhase>("idle");
  const pathnameRef = useRef(pathname);
  const tokenCounterRef = useRef(0);
  const activeTransitionRef = useRef<ActiveTransition | null>(null);
  const navigationStartedRef = useRef(false);
  const pathnameMatchedRef = useRef(false);
  const contentReadyRef = useRef(false);
  const scrollBehaviorRestoreRef = useRef<(() => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animationRunIdRef = useRef(0);

  const setPhaseSafe = useCallback((nextPhase: TransitionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const cancelMotionAnimation = useCallback(() => {
    animationRunIdRef.current += 1;
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const restoreDocumentScrollBehavior = useCallback(() => {
    const restore = scrollBehaviorRestoreRef.current;
    if (!restore) return;
    scrollBehaviorRestoreRef.current = null;
    restore();
  }, []);

  const forceInstantScrollBehavior = useCallback(() => {
    if (typeof document === "undefined") return;
    if (scrollBehaviorRestoreRef.current) return;

    const html = document.documentElement;
    const previousInlineBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    scrollBehaviorRestoreRef.current = () => {
      html.style.scrollBehavior = previousInlineBehavior;
    };
  }, []);

  const resetTransition = useCallback(() => {
    cancelMotionAnimation();
    unlockScroll();
    restoreDocumentScrollBehavior();
    activeTransitionRef.current = null;
    navigationStartedRef.current = false;
    pathnameMatchedRef.current = false;
    contentReadyRef.current = false;
    setTargetPathname(null);
    setToken(0);
    setMotion({
      overlayX: -100,
      logoAngle: 0,
    });
    setPhaseSafe("idle");
  }, [cancelMotionAnimation, restoreDocumentScrollBehavior, setPhaseSafe]);

  const maybeStartExit = useCallback(() => {
    const activeTransition = activeTransitionRef.current;
    if (!activeTransition) return;
    if (phaseRef.current !== "loading") return;
    if (!pathnameMatchedRef.current || !contentReadyRef.current) return;

    setPhaseSafe("exiting");
  }, [setPhaseSafe]);

  const animateMotion = useCallback(
    ({
      from,
      to,
      durationMs,
      onComplete,
    }: {
      from: MotionState;
      to: MotionState;
      durationMs: number;
      onComplete: () => void;
    }) => {
      cancelMotionAnimation();
      setMotion(from);

      const runId = animationRunIdRef.current + 1;
      animationRunIdRef.current = runId;
      const startAt = performance.now();

      const frame = (now: number) => {
        if (animationRunIdRef.current !== runId) return;

        const rawProgress = Math.min(1, (now - startAt) / durationMs);
        const easedProgress = easeInOutCubic(rawProgress);

        setMotion({
          overlayX: from.overlayX + (to.overlayX - from.overlayX) * easedProgress,
          logoAngle: from.logoAngle + (to.logoAngle - from.logoAngle) * easedProgress,
        });

        if (rawProgress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(frame);
          return;
        }

        animationFrameRef.current = null;
        setMotion(to);
        onComplete();
      };

      animationFrameRef.current = window.requestAnimationFrame(frame);
    },
    [cancelMotionAnimation],
  );

  const startNavigation = useCallback(
    (href: string, options?: TransitionNavigationOptions) => {
      if (!href) return false;
      if (phaseRef.current !== "idle") return false;

      const nextTargetPathname = toPathname(href, pathnameRef.current);
      if (nextTargetPathname === pathnameRef.current) return false;

      const nextToken = tokenCounterRef.current + 1;
      tokenCounterRef.current = nextToken;

      activeTransitionRef.current = {
        token: nextToken,
        href,
        targetPathname: nextTargetPathname,
        options: resolveNavigationOptions(options),
      };

      navigationStartedRef.current = false;
      pathnameMatchedRef.current = false;
      contentReadyRef.current = false;

      if (activeTransitionRef.current.options.forceInstantScrollBehavior) {
        forceInstantScrollBehavior();
      }

      lockScroll();
      setToken(nextToken);
      setTargetPathname(nextTargetPathname);
      if (prefersReducedMotion) {
        setMotion({
          overlayX: 0,
          logoAngle: 0,
        });
        setPhaseSafe("covered");
      } else {
        setMotion({
          overlayX: -100,
          logoAngle: -360,
        });
        setPhaseSafe("entering");
      }
      return true;
    },
    [forceInstantScrollBehavior, prefersReducedMotion, setPhaseSafe],
  );

  const signalRouteReady = useCallback(
    (readyPathname: string, readyToken: number) => {
      const activeTransition = activeTransitionRef.current;
      if (!activeTransition) return;
      if (!readyToken || readyToken !== activeTransition.token) return;

      const normalizedReadyPathname = normalizeRoutePathname(readyPathname);
      if (normalizedReadyPathname !== activeTransition.targetPathname) return;

      contentReadyRef.current = true;
      maybeStartExit();
    },
    [maybeStartExit],
  );

  useEffect(() => {
    pathnameRef.current = pathname;

    const activeTransition = activeTransitionRef.current;
    if (!activeTransition) return;

    pathnameMatchedRef.current = pathname === activeTransition.targetPathname;
    maybeStartExit();
  }, [maybeStartExit, pathname]);

  useEffect(() => {
    if (phase !== "covered") return;

    const activeTransition = activeTransitionRef.current;
    if (!activeTransition || navigationStartedRef.current) return;

    setMotion({
      overlayX: 0,
      logoAngle: 0,
    });

    navigationStartedRef.current = true;

    reactStartTransition(() => {
      if (activeTransition.options.scroll) {
        router.push(activeTransition.href);
        return;
      }

      router.push(activeTransition.href, { scroll: false });
    });

    setPhaseSafe("loading");
  }, [phase, router, setPhaseSafe]);

  useEffect(() => {
    if (phase !== "entering") return;

    const activeTransition = activeTransitionRef.current;
    if (!activeTransition) return;

    animateMotion({
      from: {
        overlayX: -100,
        logoAngle: -360,
      },
      to: {
        overlayX: 0,
        logoAngle: 0,
      },
      durationMs: ENTER_DURATION_MS,
      onComplete: () => {
        if (activeTransitionRef.current?.token !== activeTransition.token) return;
        if (phaseRef.current !== "entering") return;
        setPhaseSafe("covered");
      },
    });

    return cancelMotionAnimation;
  }, [animateMotion, cancelMotionAnimation, phase, setPhaseSafe]);

  useEffect(() => {
    if (!prefersReducedMotion || phase !== "exiting") return;

    let cancelled = false;

    const run = async () => {
      await waitNextFrame();
      if (cancelled) return;
      if (phaseRef.current !== "exiting") return;
      resetTransition();
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [phase, prefersReducedMotion, resetTransition]);

  useEffect(() => {
    if (phase !== "exiting" || prefersReducedMotion) return;

    const activeTransition = activeTransitionRef.current;
    if (!activeTransition) return;

    animateMotion({
      from: {
        overlayX: 0,
        logoAngle: 0,
      },
      to: {
        overlayX: 100,
        logoAngle: 360,
      },
      durationMs: EXIT_DURATION_MS,
      onComplete: () => {
        if (activeTransitionRef.current?.token !== activeTransition.token) return;
        if (phaseRef.current !== "exiting") return;
        resetTransition();
      },
    });

    return cancelMotionAnimation;
  }, [animateMotion, cancelMotionAnimation, phase, prefersReducedMotion, resetTransition]);

  useEffect(() => {
    return () => {
      cancelMotionAnimation();
      restoreDocumentScrollBehavior();
      forceUnlockScroll();
    };
  }, [cancelMotionAnimation, restoreDocumentScrollBehavior]);

  const contextValue = useMemo(
    () => ({
      phase,
      isActive: phase !== "idle",
      token,
      pathname,
      targetPathname,
      startNavigation,
      signalRouteReady,
    }),
    [pathname, phase, signalRouteReady, startNavigation, targetPathname, token],
  );

  return (
    <TransitionNavContext.Provider value={contextValue}>
      {children}
      <div
        aria-hidden="true"
        data-phase={phase}
        className="rt-overlay"
        style={{
          transform: `translate3d(${motion.overlayX}%, 0, 0)`,
        }}
      >
        <Image
          src="/main-logo.svg"
          alt=""
          width={220}
          height={220}
          className="rt-overlay__logo"
          unoptimized
          style={{
            transform: `rotate(${motion.logoAngle}deg)`,
          }}
        />
      </div>
    </TransitionNavContext.Provider>
  );
}
