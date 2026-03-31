"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Direction = "prev" | "next";

const GAP_PX = 32;

export function useSliderScroll() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const updateEdgeState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const EPS = 2;
    setIsAtStart(scrollLeft <= EPS);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - EPS);
  }, []);

  const scrollByOneColumn = useCallback((dir: Direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + GAP_PX : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    updateEdgeState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateEdgeState, { passive: true });
    const ro = new ResizeObserver(() => updateEdgeState());
    ro.observe(el);
    const tm = setInterval(updateEdgeState, 300);
    const stopAfter = setTimeout(() => clearInterval(tm), 2000);
    return () => {
      el.removeEventListener("scroll", updateEdgeState);
      ro.disconnect();
      clearInterval(tm);
      clearTimeout(stopAfter);
    };
  }, [updateEdgeState]);

  return { scrollerRef, isAtStart, isAtEnd, scrollByOneColumn };
}
