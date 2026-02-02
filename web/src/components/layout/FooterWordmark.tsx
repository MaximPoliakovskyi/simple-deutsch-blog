"use client";

import { useLayoutEffect, useRef, useState } from "react";

type Props = { className?: string };

export default function FooterWordmark({ className = "" }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [fontSize, setFontSize] = useState<number | undefined>(undefined);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const BASE = 320;
    // Don't use a fixed MIN_FONT; compute a dynamic minimum based on
    // the available width so the mark can continue shrinking on small screens.
    const SAFETY = 0.98;
    const MAX_ADJUST = 32;

    let ro: ResizeObserver | null = null;

    const getAvailableWidth = (el: HTMLDivElement) => el.getBoundingClientRect().width;

    function measureAndFit() {
      const wrapper = wrapperRef.current;
      const textEl = textRef.current;
      if (!wrapper || !textEl) return;

      // Ensure span has correct baseline styles for measurement
      textEl.style.whiteSpace = "nowrap";
      textEl.style.display = "inline-block";
      textEl.style.lineHeight = "1";
      textEl.style.overflow = "visible";

      textEl.style.fontSize = `${BASE}px`;

      const availableWidth = getAvailableWidth(wrapper);
      const textWidth = textEl.getBoundingClientRect().width;
      if (!availableWidth || !textWidth) return;

      // dynamic minimum font size based on available width (so very small
      // devices can still render the wordmark fully by shrinking text).
      const dynamicMin = Math.max(12, Math.floor(availableWidth / 20));

      const scale = (availableWidth / textWidth) * SAFETY;
      let nextSize = Math.floor(BASE * Math.min(scale, 1));

      // Ensure we respect the dynamic minimum
      if (nextSize < dynamicMin) nextSize = dynamicMin;

      setFontSize(nextSize);
      requestAnimationFrame(() => {
        let rendered = textEl.getBoundingClientRect().width;
        let attempts = 0;
        while (rendered > availableWidth && attempts < MAX_ADJUST) {
          nextSize = Math.max(8, nextSize - 1);
          textEl.style.fontSize = `${nextSize}px`;
          rendered = textEl.getBoundingClientRect().width;
          attempts += 1;
        }
        setFontSize(nextSize);
      });
    }

    if ("fonts" in document && document.fonts?.ready) {
      document.fonts.ready.then(measureAndFit).catch(() => measureAndFit());
    } else {
      measureAndFit();
    }

    if (typeof ResizeObserver !== "undefined" && wrapperRef.current) {
      ro = new ResizeObserver(() => measureAndFit());
      ro.observe(wrapperRef.current);
    }

    window.addEventListener("resize", measureAndFit);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener("resize", measureAndFit);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`w-full max-w-full pt-12 ${className}`}>
      <span
        ref={textRef}
        aria-hidden
        className="inline-block whitespace-nowrap leading-[1.05] font-extrabold pointer-events-none select-none text-center text-[#181C26] dark:text-white"
        style={{ fontSize: fontSize ? `${fontSize}px` : undefined, lineHeight: "1.05" }}
      >
        Simple Deutsch®
      </span>
    </div>
  );
}
