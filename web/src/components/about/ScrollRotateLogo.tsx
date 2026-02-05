"use client";

import type React from "react";
import { useEffect, useRef } from "react";

type Props = {
  children: React.ReactElement;
  /** degrees per pixel scrolled */
  degPerPx?: number;
  /** optional clamp in degrees (positive); pass null to disable */
  clamp?: number | null;
};

export default function ScrollRotateLogo({ children, degPerPx = 0.15, clamp = null }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScroll = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = wrapperRef.current;
    if (!node) return;

    // Respect reduced motion
    const prefersReduced = window?.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    node.style.willChange = "transform";
    node.style.transformOrigin = "center";
    node.style.transform = "rotate(0deg)";

    if (prefersReduced) return;

    const onFrame = () => {
      rafRef.current = null;
      const deg = lastScroll.current * degPerPx;
      const value = clamp != null ? Math.max(-clamp, Math.min(clamp, deg)) : deg;
      if (node) node.style.transform = `rotate(${value}deg)`;
    };

    const onScroll = () => {
      lastScroll.current = window.scrollY || window.pageYOffset || 0;
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(onFrame);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // set initial position
    rafRef.current = requestAnimationFrame(() => {
      lastScroll.current = window.scrollY || window.pageYOffset || 0;
      onFrame();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [degPerPx, clamp]);

  return (
    <div ref={wrapperRef} className="inline-block">
      {children}
    </div>
  );
}
