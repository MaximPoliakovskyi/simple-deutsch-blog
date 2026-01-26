// src/components/LatestPosts/LatestPostsSlider.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "@/components/features/posts/PostCard";
import type { WPPostCard } from "@/server/wp/api";

type Props = {
  posts: WPPostCard[];
  title?: string;
};

type Direction = "prev" | "next";

export default function LatestPostsSlider({ posts = [], title = "Latest posts" }: Props) {
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

  // ✅ Align with site grid gap-x-8 (32px)
  const GAP_PX = 32;

  const scrollByOneColumn = (dir: Direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + GAP_PX : el.clientWidth * 0.9;
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
    const stopAfter = setTimeout(() => clearInterval(tm), 2000);
    return () => {
      el.removeEventListener("scroll", updateEdgeState);
      ro.disconnect();
      clearInterval(tm);
      clearTimeout(stopAfter);
    };
  }, [updateEdgeState]);

  if (!posts?.length) return null;

  const baseBtn =
    "h-10 w-10 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const enabledBtn =
    "border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer dark:border-white/20 dark:text-white dark:hover:bg-white/10";
  const disabledBtn =
    "border-neutral-200 text-neutral-400 cursor-not-allowed dark:border-white/10 dark:text-white/40";

  return (
    <div className="-mx-[calc(50vw-50%)] w-screen">
      <section
        aria-label={title}
        data-latest-slider-scope
        className="mx-auto max-w-7xl px-4 py-10 text-neutral-900 dark:text-white"
      >
        {/* Scope title color inheritance to slider */}
        <style>{`
          [data-latest-slider-scope] .post-title,
          [data-latest-slider-scope] [data-post-title],
          [data-latest-slider-scope] h1,
          [data-latest-slider-scope] h2,
          [data-latest-slider-scope] h3,
          [data-latest-slider-scope] h4,
          [data-latest-slider-scope] h5,
          [data-latest-slider-scope] h6,
          [data-latest-slider-scope] h1 a,
          [data-latest-slider-scope] h2 a,
          [data-latest-slider-scope] h3 a,
          [data-latest-slider-scope] h4 a,
          [data-latest-slider-scope] h5 a,
          [data-latest-slider-scope] h6 a {
            color: inherit;
            -webkit-text-fill-color: currentColor;
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

        <div
          ref={scrollerRef}
          data-stories-scroller
          className="
            flex snap-x snap-mandatory overflow-x-auto
            gap-8 pb-4
            [-ms-overflow-style:none] [scrollbar-width:none]
          "
          style={{ scrollBehavior: "smooth" }}
        >
          {/* ✅ Updated only this section */}
          <style>{`
            [data-stories-scroller]::-webkit-scrollbar { display: none; }
            [data-card] { flex: 0 0 100%; } /* 1 column (mobile) */
            @media (min-width: 768px) {      /* md: 2 columns */
              [data-card] { flex: 0 0 calc((100% - 32px) / 2); }
            }
            @media (min-width: 1280px) {     /* xl: 3 columns */
              [data-card] { flex: 0 0 calc((100% - 64px) / 3); }
            }
          `}</style>

          {posts.map((post: WPPostCard, i: number) => (
            <div key={post.id ?? post.slug ?? i} data-card className="snap-start shrink-0">
              <PostCard post={post} priority={i < 3} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
