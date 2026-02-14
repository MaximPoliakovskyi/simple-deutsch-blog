"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useTransitionNav } from "@/components/transition/useTransitionNav";

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

function waitDoubleRaf() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

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
