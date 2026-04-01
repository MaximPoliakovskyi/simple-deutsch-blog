"use client";

import { useEffect } from "react";

/**
 * Mounts/unmounts inside the Loading Suspense fallback.
 * When NEXT_PUBLIC_DEBUG_ROUTE_TRANSITION=1 it emits console timestamps so
 * you can see EXACTLY when (and whether) the fallback is shown during
 * client-side navigation vs only on hard load / cache miss.
 *
 * If you NEVER see "[loading]" during a <Link> click it confirms React's
 * startTransition kept the previous page visible and loading.tsx was bypassed.
 * If you DO see it, the CMS fetch cache missed and the skeleton was the right
 * fallback to have instead of null (blank).
 */
export default function LoadingDebug() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEBUG_ROUTE_TRANSITION !== "1") return;
    const t = typeof performance !== "undefined" ? performance.now().toFixed(1) : "?";
    console.log(`[loading.tsx] Suspense fallback MOUNTED  T=${t}ms`);
    return () => {
      const t2 = typeof performance !== "undefined" ? performance.now().toFixed(1) : "?";
      console.log(`[loading.tsx] Suspense fallback UNMOUNTED T=${t2}ms`);
    };
  }, []);

  return null;
}
