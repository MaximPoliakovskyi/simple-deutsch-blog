"use client";

import { useRouter } from "next/navigation";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Minimal stub — the full animated overlay has been removed for performance.
// Components that previously called navigateFromLogo / navigateFromLanguageSwitch
// now get a plain router.push() instead of a 3 000 ms slide animation.
// ---------------------------------------------------------------------------

export function isUnmodifiedLeftClick(event: ReactMouseEvent<HTMLElement>) {
  return !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0;
}

export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function AppFadeWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function RouteReady() {
  return null;
}

export function useTransitionNav() {
  const router = useRouter();
  return {
    navigateFromLogo: (href: string) => {
      router.push(href);
      return true;
    },
    navigateFromLanguageSwitch: (href: string) => {
      router.push(href);
      return true;
    },
  };
}
