"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { normalizeRoutePathname, useTransitionNav } from "@/shared/transition/useTransitionNav";

type RouteReadyProps = {
  when?: boolean;
};

export function RouteReady({ when = true }: RouteReadyProps) {
  const pathname = normalizeRoutePathname(usePathname() || "/");
  const { token, signalRouteReady } = useTransitionNav();

  useEffect(() => {
    if (!when || !token) return;

    let frameId = 0;

    frameId = requestAnimationFrame(() => {
      signalRouteReady(pathname, token);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [pathname, signalRouteReady, token, when]);

  return null;
}
