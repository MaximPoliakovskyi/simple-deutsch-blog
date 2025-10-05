// src/components/SuccessStoriesSlider.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import PostCard from "@/components/PostCard";

/**
 * Slider that mirrors a grid like:
 *   section.grid gap-6 sm:grid-cols-2 lg:grid-cols-3
 *
 * - Same column widths as the grid at each breakpoint
 * - Same gaps (gap-6 = 24px) at all breakpoints
 * - Scroll-snap to each “column” width
 * - Prev/Next buttons move exactly one column (card) at a time
 * - Dark strip background preserved (as previously requested)
 * - Headings inside cards forced to white for readability on dark strip
 */
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

  // Keep edge state (for disabling buttons)
  const updateEdgeState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const EPS = 2;
    setIsAtStart(scrollLeft <= EPS);
    setIsAtEnd(scrollLeft + clientWidth >= scrollWidth - EPS);
  };

  // gap-6 = 24px used across breakpoints to match the screenshot grid
  const GAP_PX = 24;

  // Scroll by exactly one “column” (card) width + gap to mimic grid paging
  const scrollByOneColumn = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;

    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + GAP_PX : el.clientWidth * 0.9;

    el.scrollBy({
      left: dir === "next" ? step : -step,
      behavior: "smooth",
    });
  };

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
  }, []);

  if (!posts?.length) return null;

  // ✅ Filter only posts from the "Success stories" category
  const filteredPosts = posts.filter(
    (post: any) =>
      post?.categories?.nodes?.some(
        (cat: any) => cat?.name?.toLowerCase() === "success stories"
      )
  );

  // Buttons styled for dark strip
  const baseBtn =
    "h-10 w-10 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const enabledBtn = "border-white/20 text-white hover:bg-white/10";
  const disabledBtn =
    "border-white/10 bg-white/5 text-white/40 cursor-not-allowed";

  return (
    // Dark strip “island” (works even when page theme is light)
    <div className="dark -mx-[calc(50vw-50%)] w-screen bg-[#0B0D16]">
      <section
        aria-label={title}
        role="region"
        data-slider-scope
        className="mx-auto max-w-7xl px-4 py-10 text-white"
      >
        {/* Force post titles to white on the dark strip (scoped) */}
        <style>{`
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
            opacity: 1 !important;
            --tw-text-opacity: 1 !important;
            -webkit-text-fill-color: #ffffff !important;
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
              onClick={() => !isAtStart && scrollByOneColumn("prev")}
              className={`${baseBtn} ${isAtStart ? disabledBtn : enabledBtn}`}
              title={isAtStart ? "At the first slide" : "Previous"}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              aria-disabled={isAtEnd}
              disabled={isAtEnd}
              onClick={() => !isAtEnd && scrollByOneColumn("next")}
              className={`${baseBtn} ${isAtEnd ? disabledBtn : enabledBtn}`}
              title={isAtEnd ? "At the last slide" : "Next"}
            >
              ›
            </button>
          </div>
        </div>

        {/* SCROLLER — mirrors grid: gap-6; sm:2 cols; lg:3 cols */}
        <div
          ref={scrollerRef}
          data-stories-scroller
          className="
            flex snap-x snap-mandatory overflow-x-auto
            gap-6 pb-4
            [-ms-overflow-style:none] [scrollbar-width:none]
          "
          style={{ scrollBehavior: "smooth" }}
        >
          <style>{`
            [data-stories-scroller]::-webkit-scrollbar { display: none; }

            /* Column widths that exactly match the grid:
               base: 1 column
               sm (≥640px): 2 columns
               lg (≥1024px): 3 columns
               gap-6 at all breakpoints (24px)
            */
            [data-card] { flex: 0 0 100%; }
            @media (min-width: 640px) {                   /* sm:grid-cols-2 */
              [data-card] { flex: 0 0 calc((100% - 24px) / 2); }
            }
            @media (min-width: 1024px) {                  /* lg:grid-cols-3 */
              [data-card] { flex: 0 0 calc((100% - 48px) / 3); } /* 2 gaps × 24px */
            }
          `}</style>

          {filteredPosts.map((post: any, i: number) => (
            <div
              key={post.id ?? post.slug ?? i}
              data-card
              className="snap-start shrink-0"
            >
              <PostCard post={post} priority={i < 3} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
