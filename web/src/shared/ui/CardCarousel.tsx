"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { cn } from "@/shared/lib/cn";
import Button from "@/shared/ui/Button";
import Section from "@/shared/ui/Section";

type Direction = "prev" | "next";

type CarouselItem = {
  key: string;
  node: ReactNode;
};

type Props = {
  ariaLabel?: string;
  className?: string;
  description?: string;
  fullBleed?: boolean;
  items: CarouselItem[];
  title: string;
  tone?: "contrast" | "default" | "muted";
};

const SLIDER_GAP_PX = 32;

type ArrowIconProps = {
  direction: Direction;
};

function ArrowIcon({ direction }: ArrowIconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={direction === "prev" ? "rotate-180" : undefined}
    >
      <path
        d="M8 5l8 7-8 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function CardCarousel({
  ariaLabel,
  className,
  description,
  fullBleed = true,
  items,
  title,
  tone = "default",
}: Props) {
  const { t } = useI18n();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const updateEdgeState = useCallback(() => {
    const element = scrollerRef.current;
    if (!element) return;

    const { clientWidth, scrollLeft, scrollWidth } = element;
    const epsilon = 2;
    setIsAtStart(scrollLeft <= epsilon);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - epsilon);
  }, []);

  const scrollByOneColumn = useCallback((direction: Direction) => {
    const element = scrollerRef.current;
    if (!element) return;

    const card = element.querySelector<HTMLElement>("[data-slider-card]");
    const step = card ? card.offsetWidth + SLIDER_GAP_PX : element.clientWidth * 0.9;
    element.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    updateEdgeState();

    const element = scrollerRef.current;
    if (!element) return;

    element.addEventListener("scroll", updateEdgeState, { passive: true });
    const resizeObserver = new ResizeObserver(() => updateEdgeState());
    resizeObserver.observe(element);

    const poll = setInterval(updateEdgeState, 300);
    const stopPolling = setTimeout(() => clearInterval(poll), 2000);

    return () => {
      element.removeEventListener("scroll", updateEdgeState);
      resizeObserver.disconnect();
      clearInterval(poll);
      clearTimeout(stopPolling);
    };
  }, [updateEdgeState]);

  if (!items.length) {
    return null;
  }

  const isContrast = tone === "contrast";
  const mutedControlClassName = isContrast
    ? "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.4)]"
    : "border-[#e5e5e5] text-[#a1a1a1]";
  const activeControlClassName = isContrast
    ? "border-[rgba(255,255,255,0.2)] text-white"
    : "border-[#d4d4d4] text-[#404040]";

  const controls = (
    <div className="flex items-center gap-2">
      <Button
        aria-disabled={isAtStart}
        aria-label={t("carousel.previous")}
        className={cn(
          "h-10 w-10 rounded-full border-[0.8px] p-0",
          isAtStart ? mutedControlClassName : activeControlClassName,
        )}
        disabled={isAtStart}
        onClick={() => !isAtStart && scrollByOneColumn("prev")}
        size="control"
        title={isAtStart ? t("carousel.atStart") : t("carousel.previous")}
        variant="control"
      >
        <ArrowIcon direction="prev" />
      </Button>
      <Button
        aria-disabled={isAtEnd}
        aria-label={t("carousel.next")}
        className={cn(
          "h-10 w-10 rounded-full border-[0.8px] p-0",
          isAtEnd ? mutedControlClassName : activeControlClassName,
        )}
        disabled={isAtEnd}
        onClick={() => !isAtEnd && scrollByOneColumn("next")}
        size="control"
        title={isAtEnd ? t("carousel.atEnd") : t("carousel.next")}
        variant="control"
      >
        <ArrowIcon direction="next" />
      </Button>
    </div>
  );

  return (
    <Section
      aria-label={ariaLabel ?? title}
      className={className}
      fullBleed={fullBleed}
      spacing="md"
      tone={tone}
      containerClassName="px-4"
    >
      <div className="flex flex-col gap-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="max-w-2xl">
            <h2
              className={cn(
                "text-3xl font-semibold tracking-tight",
                isContrast ? "text-white" : "text-[#171717]",
              )}
            >
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "mt-4 text-base leading-relaxed",
                  isContrast ? "text-neutral-300" : "text-neutral-600 dark:text-neutral-300",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          <div className="hidden sm:flex">{controls}</div>
        </div>

        <div ref={scrollerRef} className="sd-slider-track" style={{ scrollBehavior: "smooth" }}>
          {items.map((item) => (
            <div key={item.key} className="sd-slider-item" data-slider-card>
              {item.node}
            </div>
          ))}
        </div>

        <div className="flex justify-end sm:hidden">{controls}</div>
      </div>
    </Section>
  );
}
