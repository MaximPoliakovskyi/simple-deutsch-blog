"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
import { forceUnlockScroll } from "@/shared/lib/scrollLock";
import {
  normalizeRoutePathname,
  TransitionNavContext,
  type TransitionNavigationOptions,
  type TransitionPhase,
} from "@/shared/transition/useTransitionNav";

const DESKTOP_ENTER_DURATION_MS = 180;
const DESKTOP_EXIT_DURATION_MS = 140;
const MOBILE_ENTER_DURATION_MS = 140;
const MOBILE_EXIT_DURATION_MS = 110;
const DESKTOP_LOGO_ROTATION_DEG = 220;
const MOBILE_LOGO_ROTATION_DEG = 120;
const CHUNK_RETRY_KEY = "sd-chunk-reload-attempted";

type ResolvedTransitionNavigationOptions = {
  forceInstantScrollBehavior: boolean;
  scroll: boolean;
};

type ActiveTransition = {
  href: string;
  options: ResolvedTransitionNavigationOptions;
  targetPathname: string;
  token: number;
};

function toPathname(href: string, currentPathname: string) {
  if (typeof window === "undefined") return normalizeRoutePathname(currentPathname);

  try {
    return normalizeRoutePathname(new URL(href, window.location.origin).pathname);
  } catch {
    return normalizeRoutePathname(href.startsWith("/") ? href : currentPathname);
  }
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

function useIsMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobileViewport(media.matches);
    onChange();

    if (media.addEventListener) {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return isMobileViewport;
}

function resolveNavigationOptions(
  options: TransitionNavigationOptions | undefined,
): ResolvedTransitionNavigationOptions {
  return {
    forceInstantScrollBehavior: options?.forceInstantScrollBehavior ?? false,
    scroll: options?.scroll ?? true,
  };
}

function isChunkLoadError(reason: unknown) {
  if (!reason) return false;

  const text =
    typeof reason === "string"
      ? reason
      : reason instanceof Error
        ? `${reason.name} ${reason.message}`
        : String(reason);

  return (
    text.includes("ChunkLoadError") ||
    text.includes("Failed to load chunk") ||
    text.includes("/_next/static/chunks/") ||
    text.includes("/_next/static/css/")
  );
}

function recoverFromChunkLoadOnce(targetHref?: string | null) {
  try {
    const attempted = sessionStorage.getItem(CHUNK_RETRY_KEY) === "1";
    if (attempted) return;
    sessionStorage.setItem(CHUNK_RETRY_KEY, "1");

    const url = new URL(targetHref ?? window.location.href, window.location.origin);
    url.searchParams.set("__reload", Date.now().toString());

    if (targetHref) {
      window.location.assign(url.toString());
      return;
    }

    window.location.replace(url.toString());
  } catch {
    if (targetHref) {
      window.location.assign(targetHref);
      return;
    }

    window.location.reload();
  }
}

export function RouteTransitionProvider({
  children,
  enableAnalytics = false,
}: {
  children: ReactNode;
  enableAnalytics?: boolean;
}) {
  const router = useRouter();
  const pathname = normalizeRoutePathname(usePathname() || "/");
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobileViewport = useIsMobileViewport();
  const enterDurationMs = isMobileViewport ? MOBILE_ENTER_DURATION_MS : DESKTOP_ENTER_DURATION_MS;
  const exitDurationMs = isMobileViewport ? MOBILE_EXIT_DURATION_MS : DESKTOP_EXIT_DURATION_MS;
  const logoRotationDeg = isMobileViewport ? MOBILE_LOGO_ROTATION_DEG : DESKTOP_LOGO_ROTATION_DEG;

  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [token, setToken] = useState(0);
  const [targetPathname, setTargetPathname] = useState<string | null>(null);

  const phaseRef = useRef<TransitionPhase>("idle");
  const pathnameRef = useRef(pathname);
  const tokenCounterRef = useRef(0);
  const activeTransitionRef = useRef<ActiveTransition | null>(null);
  const navigationStartedRef = useRef(false);
  const pathnameMatchedRef = useRef(false);
  const contentReadyRef = useRef(false);
  const scrollBehaviorRestoreRef = useRef<(() => void) | null>(null);
  const enterFeedbackTimerRef = useRef<number | null>(null);

  const setPhaseSafe = useCallback((nextPhase: TransitionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const restoreDocumentScrollBehavior = useCallback(() => {
    const restore = scrollBehaviorRestoreRef.current;
    if (!restore) return;

    scrollBehaviorRestoreRef.current = null;
    restore();
  }, []);

  const clearEnterFeedbackTimer = useCallback(() => {
    if (enterFeedbackTimerRef.current !== null) {
      window.clearTimeout(enterFeedbackTimerRef.current);
      enterFeedbackTimerRef.current = null;
    }
  }, []);

  const startRouterNavigation = useCallback(
    (activeTransition: ActiveTransition) => {
      if (navigationStartedRef.current) return;

      navigationStartedRef.current = true;

      reactStartTransition(() => {
        if (activeTransition.options.scroll) {
          router.push(activeTransition.href);
          return;
        }

        router.push(activeTransition.href, { scroll: false });
      });
    },
    [router],
  );

  const forceInstantScrollBehavior = useCallback(() => {
    if (typeof document === "undefined" || scrollBehaviorRestoreRef.current) return;

    const html = document.documentElement;
    const previousInlineBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    scrollBehaviorRestoreRef.current = () => {
      html.style.scrollBehavior = previousInlineBehavior;
    };
  }, []);

  const resetTransition = useCallback(() => {
    clearEnterFeedbackTimer();
    restoreDocumentScrollBehavior();
    activeTransitionRef.current = null;
    navigationStartedRef.current = false;
    pathnameMatchedRef.current = false;
    contentReadyRef.current = false;
    setTargetPathname(null);
    setToken(0);
    setPhaseSafe("idle");
  }, [clearEnterFeedbackTimer, restoreDocumentScrollBehavior, setPhaseSafe]);

  const maybeStartExit = useCallback(() => {
    if (phaseRef.current !== "loading") return;
    if (!pathnameMatchedRef.current || !contentReadyRef.current) return;
    setPhaseSafe("exiting");
  }, [setPhaseSafe]);

  const startNavigation = useCallback(
    (href: string, options?: TransitionNavigationOptions) => {
      if (!href || phaseRef.current !== "idle") return false;

      const nextTargetPathname = toPathname(href, pathnameRef.current);
      if (nextTargetPathname === pathnameRef.current) return false;

      const nextToken = tokenCounterRef.current + 1;
      tokenCounterRef.current = nextToken;

      activeTransitionRef.current = {
        href,
        options: resolveNavigationOptions(options),
        targetPathname: nextTargetPathname,
        token: nextToken,
      };

      navigationStartedRef.current = false;
      pathnameMatchedRef.current = false;
      contentReadyRef.current = false;

      if (activeTransitionRef.current.options.forceInstantScrollBehavior) {
        forceInstantScrollBehavior();
      }

      setToken(nextToken);
      setTargetPathname(nextTargetPathname);

      startRouterNavigation(activeTransitionRef.current);

      if (prefersReducedMotion) {
        setPhaseSafe("loading");
        return true;
      }

      setPhaseSafe("entering");
      clearEnterFeedbackTimer();
      enterFeedbackTimerRef.current = window.setTimeout(() => {
        if (phaseRef.current === "entering") {
          setPhaseSafe("loading");
        }
      }, enterDurationMs);
      return true;
    },
    [
      clearEnterFeedbackTimer,
      enterDurationMs,
      forceInstantScrollBehavior,
      prefersReducedMotion,
      setPhaseSafe,
      startRouterNavigation,
    ],
  );

  const signalRouteReady = useCallback(
    (readyPathname: string, readyToken: number) => {
      const activeTransition = activeTransitionRef.current;
      if (!activeTransition || readyToken !== activeTransition.token) return;

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
    if (phase !== "exiting") return;

    const timeoutId = window.setTimeout(
      () => {
        if (phaseRef.current === "exiting") {
          resetTransition();
        }
      },
      prefersReducedMotion ? 0 : exitDurationMs,
    );

    return () => window.clearTimeout(timeoutId);
  }, [exitDurationMs, phase, prefersReducedMotion, resetTransition]);

  useEffect(() => {
    return () => {
      clearEnterFeedbackTimer();
      restoreDocumentScrollBehavior();
      forceUnlockScroll();
    };
  }, [clearEnterFeedbackTimer, restoreDocumentScrollBehavior]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("__reload")) {
        url.searchParams.delete("__reload");
        window.history.replaceState({}, "", url.toString());
      } else {
        sessionStorage.removeItem(CHUNK_RETRY_KEY);
      }
    } catch {}

    const recoverFromChunkLoad = () => {
      recoverFromChunkLoadOnce(activeTransitionRef.current?.href);
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error ?? event.message)) {
        recoverFromChunkLoad();
      }
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        event.preventDefault();
        recoverFromChunkLoad();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      isActive: phase !== "idle",
      pathname,
      phase,
      signalRouteReady,
      startNavigation,
      targetPathname,
      token,
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
          ["--rt-duration" as string]: `${phase === "exiting" ? exitDurationMs : enterDurationMs}ms`,
          ["--rt-logo-rotation" as string]: `${logoRotationDeg}deg`,
        }}
      >
        <Image
          src="/main-logo.svg"
          alt=""
          width={420}
          height={420}
          className="rt-overlay__logo"
          unoptimized
        />
      </div>
      {enableAnalytics ? (
        <>
          <Analytics mode="production" />
          <SpeedInsights sampleRate={0.1} />
        </>
      ) : null}
    </TransitionNavContext.Provider>
  );
}
