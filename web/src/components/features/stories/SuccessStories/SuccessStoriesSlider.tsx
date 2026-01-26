// src/components/SuccessStories/SuccessStoriesSlider.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "@/components/features/posts/PostCard";
import type { WPPostCard } from "@/server/wp/api";

type Props = {
  posts: WPPostCard[];
  title?: string;
  description?: string;
};

type Direction = "prev" | "next";

export default function SuccessStoriesSlider({ posts = [], title = "Success stories", description = "" }: Props) {
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

  // Server already filtered and prepared the posts, just use them directly
  // Remove the success-stories chip from display if it exists
  const displayPosts = posts.map((post) => ({
    ...post,
    categories: {
      nodes: post?.categories?.nodes?.filter((cat) => 
        cat?.slug !== "success-stories" && 
        cat?.slug !== "success-stories-uk" &&
        cat?.slug !== "success-stories-ru"
      ) ?? [],
    },
  }));

  const baseBtn =
    "h-10 w-10 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const enabledBtn = "border-white/20 text-white hover:bg-white/10";
  const disabledBtn = "border-white/10 bg-white/5 text-white/40 cursor-not-allowed";

  return (
    <div className="dark -mx-[calc(50vw-50%)] w-screen bg-[#0B0D16]">
      <section
        aria-label={title}
        data-slider-scope
        className="mx-auto max-w-7xl px-4 py-10 text-white"
      >
        {/* Force white titles; keep smooth hover color */}
        <style>{`
          [data-slider-scope][data-slider-scope] h1,
          [data-slider-scope][data-slider-scope] h2,
          [data-slider-scope][data-slider-scope] h3,
          [data-slider-scope][data-slider-scope] h4,
          [data-slider-scope][data-slider-scope] h5,
          [data-slider-scope][data-slider-scope] h6,
          [data-slider-scope][data-slider-scope] h1 *,
          [data-slider-scope][data-slider-scope] h2 *,
          [data-slider-scope][data-slider-scope] h3 *,
          [data-slider-scope][data-slider-scope] h4 *,
          [data-slider-scope][data-slider-scope] h5 *,
          [data-slider-scope][data-slider-scope] h6 *,
          [data-slider-scope][data-slider-scope] .post-title,
          [data-slider-scope][data-slider-scope] [data-post-title],
          [data-slider-scope][data-slider-scope] .prose :where(h1,h2,h3,h4,h5,h6),
          [data-slider-scope][data-slider-scope] .prose :where(h1,h2,h3,h4,h5,h6) a {
            color: #ffffff !important;
            transition: color 420ms cubic-bezier(.22,1,.36,1) !important;
            will-change: color;
          }
          [data-slider-scope][data-slider-scope] .group:hover h1,
          [data-slider-scope][data-slider-scope] .group:hover h2,
          [data-slider-scope][data-slider-scope] .group:hover h3,
          [data-slider-scope][data-slider-scope] .group:hover h4,
          [data-slider-scope][data-slider-scope] .group:hover h5,
          [data-slider-scope][data-slider-scope] .group:hover h6,
          [data-slider-scope][data-slider-scope] .group:focus-within h1,
          [data-slider-scope][data-slider-scope] .group:focus-within h2,
          [data-slider-scope][data-slider-scope] .group:focus-within h3,
          [data-slider-scope][data-slider-scope] .group:focus-within h4,
          [data-slider-scope][data-slider-scope] .group:focus-within h5,
          [data-slider-scope][data-slider-scope] .group:focus-within h6,
          [data-slider-scope][data-slider-scope] .group:hover h1 *,
          [data-slider-scope][data-slider-scope] .group:hover h2 *,
          [data-slider-scope][data-slider-scope] .group:hover h3 *,
          [data-slider-scope][data-slider-scope] .group:hover h4 *,
          [data-slider-scope][data-slider-scope] .group:hover h5 *,
          [data-slider-scope][data-slider-scope] .group:hover h6 *,
          [data-slider-scope][data-slider-scope] .group:focus-within h1 *,
          [data-slider-scope][data-slider-scope] .group:focus-within h2 *,
          [data-slider-scope][data-slider-scope] .group:focus-within h3 *,
          [data-slider-scope][data-slider-scope] .group:focus-within h4 *,
          [data-slider-scope][data-slider-scope] .group:focus-within h5 *,
          [data-slider-scope][data-slider-scope] .group:focus-within h6 * {
            color: #d1d5db !important; /* gray-300 */
            transition: color 420ms cubic-bezier(.22,1,.36,1) !important;
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
        <p className="mb-8 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
          {description}
        </p>

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

          {displayPosts.map((post, i: number) => (
            <div key={post.id ?? post.slug ?? i} data-card className="snap-start shrink-0">
              <PostCard post={post} priority={i < 3} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
