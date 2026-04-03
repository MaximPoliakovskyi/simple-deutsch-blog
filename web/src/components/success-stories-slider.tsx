// src/components/SuccessStories/SuccessStoriesSlider.tsx
"use client";

import { useSliderScroll } from "@/lib/hooks/use-slider-scroll";
import type { WPPostCard } from "@/lib/posts";
import PostCard from "./cards";

type Props = {
  posts: WPPostCard[];
  title?: string;
  description?: string;
};

export default function SuccessStoriesSlider({
  posts = [],
  title = "Success stories",
  description = "",
}: Props) {
  const { scrollerRef, isAtStart, isAtEnd, scrollByOneColumn } = useSliderScroll();

  // Categories are pre-filtered server-side in home-page.tsx; no useMemo needed.
  if (!posts.length) return null;

  const baseBtn =
    "h-10 w-10 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const enabledBtn = "border-neutral-300 text-neutral-700 hover:bg-neutral-200/60 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-700/40 cursor-pointer";
  const disabledBtn = "border-neutral-200 text-neutral-400 dark:border-neutral-700 dark:text-neutral-600 cursor-not-allowed";

  return (
    <div className="bg-gradient-section -mx-[calc(50vw-50%)] w-screen">
      <section
        aria-label={title}
        data-slider-scope
        className="mx-auto max-w-7xl px-4 py-10 dark:text-white"
      >
        {/* [data-slider-scope] dark-mode heading rules live in globals.css */}
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
            gap-8 pt-2 pb-4
            [-ms-overflow-style:none] [scrollbar-width:none]
          "
          style={{ scrollBehavior: "smooth" }}
        >
          {/* [data-stories-scroller] and [data-card] flex rules live in globals.css */}
          {posts.map((post, i: number) => (
            <div key={post.id ?? post.slug ?? i} data-card className="snap-start shrink-0">
              <PostCard post={post} priority={i < 3} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
