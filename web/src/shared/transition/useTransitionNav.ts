"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { createContext, useContext } from "react";

export type TransitionPhase = "idle" | "entering" | "covered" | "loading" | "exiting";

export type TransitionNavigationOptions = {
  scroll?: boolean;
  forceInstantScrollBehavior?: boolean;
};

export type TransitionNavContextValue = {
  phase: TransitionPhase;
  isActive: boolean;
  token: number;
  pathname: string;
  targetPathname: string | null;
  startNavigation: (href: string, options?: TransitionNavigationOptions) => boolean;
  signalRouteReady: (pathname: string, token: number) => void;
};

export const TransitionNavContext = createContext<TransitionNavContextValue | null>(null);

export function normalizeRoutePathname(pathname: string) {
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

export function useTransitionNav() {
  const context = useContext(TransitionNavContext);
  if (!context) {
    throw new Error("useTransitionNav must be used inside RouteTransitionProvider");
  }
  return context;
}

export function isUnmodifiedLeftClick(event: ReactMouseEvent<HTMLElement>) {
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0;
}
