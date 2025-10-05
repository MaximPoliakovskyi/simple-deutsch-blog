"use client";

import { useRef } from "react";
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

  const scrollByCard = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 /* gap */ : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  };

  if (!posts?.length) return null;

  return (
    <section aria-label={title} className="mx-auto max-w-7xl px-4 pt-8 pb-2" role="region">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollByCard("prev")}
            className="h-10 w-10 rounded-full border border-[hsl(var(--muted-4))] hover:bg-[hsl(var(--muted-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollByCard("next")}
            className="h-10 w-10 rounded-full border border-[hsl(var(--muted-4))] hover:bg-[hsl(var(--muted-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        data-stories-scroller
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollBehavior: "smooth" }}
      >
        <style>{`[data-stories-scroller]::-webkit-scrollbar { display: none; }`}</style>

        {posts.map((post: any, i: number) => (
          <div
            key={post.id ?? post.slug ?? i}
            data-card
            className="snap-start shrink-0 basis-[85%] sm:basis-[60%] lg:basis-[32%]"
          >
            <PostCard post={post} priority={i < 3} />
          </div>
        ))}
      </div>
    </section>
  );
}
