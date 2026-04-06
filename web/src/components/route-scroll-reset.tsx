"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

function setManualScrollRestoration() {
  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  } catch {}
}

function resetScrollToTop() {
  const html = document.documentElement;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  html.scrollTop = 0;
  document.body.scrollTop = 0;
}

export default function RouteScrollReset() {
  const _pathname = usePathname() ?? "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const keepManual = () => setManualScrollRestoration();
    setManualScrollRestoration();
    window.addEventListener("pageshow", keepManual);
    return () => window.removeEventListener("pageshow", keepManual);
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;

    setManualScrollRestoration();
    resetScrollToTop();

    const rafId = window.requestAnimationFrame(() => {
      setManualScrollRestoration();
      resetScrollToTop();
      html.style.scrollBehavior = previousScrollBehavior;
    });

    return () => {
      window.cancelAnimationFrame(rafId);
      html.style.scrollBehavior = previousScrollBehavior;
    };
  }, [_pathname]);

  return null;
}
