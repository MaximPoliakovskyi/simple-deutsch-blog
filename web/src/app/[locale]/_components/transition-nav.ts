"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import { createContext, useContext } from "react";

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
  if (!context) {
    throw new Error("useTransitionNav must be used inside RouteTransitionProvider");
  }
  return context;
}

export function isUnmodifiedLeftClick(event: ReactMouseEvent<HTMLElement>) {
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0;
}
