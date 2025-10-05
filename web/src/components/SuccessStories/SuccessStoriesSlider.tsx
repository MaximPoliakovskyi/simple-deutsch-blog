// src/components/SuccessStoriesSlider.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import PostCard from "@/components/PostCard";

type PostLike = { id?: string | number; slug?: string; [k: string]: unknown };

export default function SuccessStoriesSlider({
  posts = [],
  title = "Success stories",
}: {
  posts: PostLike[];
  title?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const updateEdgeState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const EPS = 2;
    setIsAtStart(scrollLeft <= EPS);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - EPS);
  };

  const getGapPx = () => {
    const el = scrollerRef.current;
    if (!el) return 24; // fallback for gap-6
    const cs = getComputedStyle(el);
    const gap = parseFloat(cs.columnGap || "0");
    return Number.isFinite(gap) && gap > 0 ? gap : 24;
  };

  const scrollByCard = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const gap = getGapPx();
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  useEffect(() => {
    updateEdgeState();
    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateEdgeState, { passive: true });

    const ro = new ResizeObserver(() => updateEdgeState());
    ro.observe(el);

    const tm = setInterval(updateEdgeState, 300);
    const stopAfter = setTimeout(() => clearInterval(tm), 2500);

    return () => {
      el.removeEventListener("scroll", updateEdgeState);
      ro.disconnect();
      clearInterval(tm);
      clearTimeout(stopAfter);
    };
  }, []);

  if (!posts?.length) return null;

  const baseBtn =
    "h-10 w-10 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const enabledBtnDark = "border-white/20 text-white hover:bg-white/10";
  const disabledBtnDark =
    "border-white/10 bg-white/5 text-white/40 cursor-not-allowed";

  return (
    // Dark strip “island” (works even when page is light)
    <div className="dark -mx-[calc(50vw-50%)] w-screen bg-[#0B0D16]">
      <section
        aria-label={title}
        role="region"
        data-slider-scope
        className="mx-auto max-w-7xl px-4 py-10 text-white"
      >
        {/* HEADLINE COLOR FIX (scoped) */}
        <style>{`
          /* Make absolutely sure headings inside cards are bright.
             We use high specificity + !important to beat Tailwind utilities like text-foreground/70. */
          [data-slider-scope] .post-title,
          [data-slider-scope] [data-post-title],
          [data-slider-scope] h1,
          [data-slider-scope] h2,
          [data-slider-scope] h3,
          [data-slider-scope] h4,
          [data-slider-scope] h5,
          [data-slider-scope] h6,
          [data-slider-scope] h1 a,
          [data-slider-scope] h2 a,
          [data-slider-scope] h3 a,
          [data-slider-scope] h4 a,
          [data-slider-scope] h5 a,
          [data-slider-scope] h6 a,
          [data-slider-scope] .prose :where(h1,h2,h3,h4,h5,h6),
          [data-slider-scope] .prose :where(h1,h2,h3,h4,h5,h6) a {
            color: #ffffff !important;
            opacity: 1 !important;                 /* defeat text-opacity classes */
            --tw-text-opacity: 1 !important;       /* defeat Tailwind v3 var */
            -webkit-text-fill-color: #ffffff !important; /* in case of WebKit quirks */
          }
        `}</style>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous"
              aria-disabled={isAtStart}
              disabled={isAtStart}
              onClick={() => !isAtStart && scrollByCard("prev")}
              className={`${baseBtn} ${
                isAtStart ? disabledBtnDark : enabledBtnDark
              }`}
              title={isAtStart ? "At the first slide" : "Previous"}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              aria-disabled={isAtEnd}
              disabled={isAtEnd}
              onClick={() => !isAtEnd && scrollByCard("next")}
              className={`${baseBtn} ${
                isAtEnd ? disabledBtnDark : enabledBtnDark
              }`}
              title={isAtEnd ? "At the last slide" : "Next"}
            >
              ›
            </button>
          </div>
        </div>

        {/* Scroller */}
        <div
          ref={scrollerRef}
          data-stories-scroller
          className="
            flex snap-x snap-mandatory overflow-x-auto
            gap-6 lg:gap-8 pb-4
            [-ms-overflow-style:none] [scrollbar-width:none]
          "
          style={{ scrollBehavior: "smooth" }}
        >
          <style>{`
            [data-stories-scroller]::-webkit-scrollbar { display: none; }

            /* Card widths for 1/2/3 columns */
            [data-card] { flex: 0 0 100%; }
            @media (min-width: 640px) {
              [data-card] { flex: 0 0 calc((100% - 24px)/2); }
            }
            @media (min-width: 1024px) {
              [data-card] { flex: 0 0 calc((100% - 64px)/3); }
            }
          `}</style>

          {posts.map((post: any, i: number) => (
            <div key={post.id ?? post.slug ?? i} data-card className="snap-start shrink-0">
              <PostCard post={post} priority={i < 3} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
