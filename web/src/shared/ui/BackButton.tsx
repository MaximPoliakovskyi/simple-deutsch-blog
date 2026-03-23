"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import Button from "@/shared/ui/Button";

const SCROLL_THRESHOLD = 600;

export default function BackButton() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);
  const desiredVisible = useRef(false);

  useEffect(() => {
    function onScroll() {
      desiredVisible.current = window.scrollY > SCROLL_THRESHOLD;
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          setVisible(desiredVisible.current);
          ticking.current = false;
        });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Button
      aria-label={t("common.backToTop")}
      className="fixed bottom-8 right-6 z-[var(--z-floating)]"
      onClick={handleClick}
      size="icon"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
        transition:
          "transform var(--motion-duration-fast) var(--motion-ease-standard), opacity 140ms ease-out",
      }}
      title={t("common.backToTop")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6 15 L12 9 L18 15"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </Button>
  );
}
