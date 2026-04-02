// src/components/LatestPosts/LatestPostsSlider.tsx
"use client";

import { useSliderScroll } from "@/lib/hooks/use-slider-scroll";
import type { WPPostCard } from "@/lib/posts";
import PostCard from "./cards";

type Props = {
  posts: WPPostCard[];
  title?: string;
};

export default function LatestPostsSlider({ posts = [], title = "Latest posts" }: Props) {
  const { scrollerRef, isAtStart, isAtEnd, scrollByOneColumn } = useSliderScroll();

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
        {/* [data-latest-slider-scope] color-inheritance rules live in globals.css */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="type-title">{title}</h2>
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
            gap-8 pt-2 pb-4
            [-ms-overflow-style:none] [scrollbar-width:none]
          "
          style={{ scrollBehavior: "smooth" }}
        >
          {/* [data-stories-scroller] and [data-card] flex rules live in globals.css */}
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
