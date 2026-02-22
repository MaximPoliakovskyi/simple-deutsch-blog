"use client";

import { type RefObject, useLayoutEffect } from "react";

type MainNavElement = HTMLElement;

export function useMainNavHeightVar(navRef: RefObject<MainNavElement | null>) {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const nav =
      navRef.current ?? document.querySelector<MainNavElement>('nav[data-main-nav="true"]');
    if (!nav) return;

    const updateMainNavHeight = () => {
      const height = Math.ceil(nav.getBoundingClientRect().height);
      root.style.setProperty("--main-nav-h", `${height}px`);
    };

    updateMainNavHeight();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateMainNavHeight);
      ro.observe(nav);
    }

    window.addEventListener("resize", updateMainNavHeight);
    window.addEventListener("orientationchange", updateMainNavHeight);

    return () => {
      window.removeEventListener("resize", updateMainNavHeight);
      window.removeEventListener("orientationchange", updateMainNavHeight);
      ro?.disconnect();
    };
  }, [navRef]);
}
