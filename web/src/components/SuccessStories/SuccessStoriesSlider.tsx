// src/components/SuccessStoriesSlider.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import PostCard from "@/components/PostCard";

type PostLike = { id?: string | number; slug?: string; [k: string]: unknown };

// --- helpers: robustly detect category names on several common shapes
function extractCategoryNames(post: any): string[] {
  const out = new Set<string>();

  // WPGraphQL common shapes
  const fromNodes = (nodes?: any[]) =>
    nodes?.forEach((n) => {
      const name = (n?.name ?? n?.categoryName ?? n?.title ?? "").toString().trim();
      if (name) out.add(name.toLowerCase());
    });

  // categories: { nodes: [...] } or { edges: [{ node: ...}] }
  if (post?.categories?.nodes) fromNodes(post.categories.nodes);
  if (Array.isArray(post?.categories?.edges))
    post.categories.edges.forEach((e: any) => fromNodes([e?.node]));

  // category / terms fallbacks
  if (Array.isArray(post?.category?.nodes)) fromNodes(post.category.nodes);
  if (Array.isArray(post?.terms?.nodes)) fromNodes(post.terms.nodes);

  // arrays of strings
  const arrays = [
    post?.categoryNames,
    post?.categoriesNames,
    post?.categories,
    post?.category,
    post?.cats,
  ].filter(Array.isArray) as any[][];
  arrays.forEach((arr) =>
    arr.forEach((v: any) => {
      const name = (typeof v === "string" ? v : v?.name)?.toString().trim();
      if (name) out.add(name.toLowerCase());
    })
  );

  return Array.from(out);
}

function isSuccessStories(post: any): boolean {
  const cats = extractCategoryNames(post);
  return cats.includes("success stories") || cats.includes("success story");
}

export default function SuccessStoriesSlider({
  posts = [],
  title = "Success stories",
}: {
  posts: PostLike[];
  title?: string;
}) {
  // filter posts by category (only change requested)
  const filteredPosts = Array.isArray(posts) ? posts.filter(isSuccessStories) : [];
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const updateEdgeState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;

    const EPS = 4;
    const left = Math.max(0, Math.round(scrollLeft));
    const max = Math.max(0, Math.round(scrollWidth - clientWidth));

    setIsAtStart(left <= EPS);
    setIsAtEnd(left >= max - EPS);
  };

  const scrollByCard = (dir: "prev" | "next") => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const gap = 24; // matches gap-6 below
    const step = card ? card.offsetWidth + gap : el.clientWidth * 0.9;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
    requestAnimationFrame(updateEdgeState);
    setTimeout(updateEdgeState, 350);
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

  if (!filteredPosts.length) return null;

  // —— Fixed palette (identical in day & night) ——
  const PRIMARY_TEXT = "#EDEFF2"; // headings / body
  const SECONDARY_TEXT = "#A2A8B3"; // meta / muted

  const BTN_BORDER = "#3F4654";
  const BTN_HOVER_BG = "#161B25";
  const BTN_DISABLED_BG = "#11151D";
  const BTN_DISABLED_TEXT = "#6B7380";

  // Category chip palette (unchanged across themes)
  const CHIP_BG = "#121824";
  const CHIP_BORDER = "#2C3442";
  const CHIP_TEXT = "#EDEFF2";
  const CHIP_HOVER_BG = "#1A2130";

  // Button styles (fixed colors + smooth hover)
  const baseBtn =
    "slider-btn h-10 w-10 rounded-full border relative overflow-hidden " +
    "transition-colors transition-transform duration-300 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent " +
    "pointer-events-auto";
  const enabledBtn = `border-[${BTN_BORDER}] text-[${PRIMARY_TEXT}] hover:scale-105`;
  const disabledBtn = `border-[${BTN_BORDER}] bg-[${BTN_DISABLED_BG}] text-[${BTN_DISABLED_TEXT}] opacity-60 cursor-not-allowed`;

  return (
    // Full-bleed, screen-tall background: SAME dark color for day & night
    <div
      className="
        -mx-[calc(50vw-50%)] w-screen min-h-screen
        bg-[#0B0D16]
        grid place-items-center
      "
    >
      {/* Scoped fixed-colors region */}
      <section
        aria-label={title}
        role="region"
        data-fixed-colors
        className="
          relative
          mx-auto max-w-7xl w-full px-4 pt-8 pb-2
          rounded-2xl bg-transparent
        "
      >
        {/* Scoped CSS: fixed colors + smooth color fill on button hover */}
        <style>{`
          [data-fixed-colors]{
            --fixed-primary: ${PRIMARY_TEXT};
            --fixed-secondary: ${SECONDARY_TEXT};
            --chip-bg: ${CHIP_BG};
            --chip-border: ${CHIP_BORDER};
            --chip-text: ${CHIP_TEXT};
            --chip-hover-bg: ${CHIP_HOVER_BG};
            --btn-hover-bg: ${BTN_HOVER_BG};
          }
          [data-fixed-colors],
          [data-fixed-colors] * {
            color: var(--fixed-primary) !important;
          }
          [data-fixed-colors] .text-muted-foreground,
          [data-fixed-colors] [data-meta],
          [data-fixed-colors] time,
          [data-fixed-colors] small {
            color: var(--fixed-secondary) !important;
            opacity: 1 !important;
          }

          /* Category chips */
          [data-fixed-colors] .badge,
          [data-fixed-colors] .tag,
          [data-fixed-colors] .pill,
          [data-fixed-colors] [data-chip],
          [data-fixed-colors] .category,
          [data-fixed-colors] .cat,
          [data-fixed-colors] a[href*="/category"],
          [data-fixed-colors] a[href*="/categories"] {
            background-color: var(--chip-bg) !important;
            border: 1px solid var(--chip-border) !important;
            color: var(--chip-text) !important;
            box-shadow: none !important;
            opacity: 1 !important;
          }
          [data-fixed-colors] .badge:hover,
          [data-fixed-colors] .tag:hover,
          [data-fixed-colors] .pill:hover,
          [data-fixed-colors] [data-chip]:hover,
          [data-fixed-colors] .category:hover,
          [data-fixed-colors] .cat:hover,
          [data-fixed-colors] a[href*="/category"]:hover,
          [data-fixed-colors] a[href*="/categories"]:hover {
            background-color: var(--chip-hover-bg) !important;
            border-color: var(--chip-border) !important;
            color: var(--chip-text) !important;
          }

          /* Slider buttons: smooth color fill on hover via ::before */
          .slider-btn::before{
            content:"";
            position:absolute;
            inset:0;
            background: var(--btn-hover-bg);
            border-radius:9999px;
            transform: scale(0.2);
            opacity:0;
            transition: transform 250ms ease, opacity 250ms ease;
            z-index:0;
          }
          .slider-btn:hover::before{
            transform: scale(1);
            opacity:1;
          }
          .slider-btn[disabled]::before{
            opacity:0 !important;
            transform: scale(0.2) !important;
          }
          .slider-btn > span{
            position: relative;
            z-index:1;
          }
        `}</style>

        <div className="mb-4 flex items-center justify-between relative z-10">
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous"
              aria-disabled={isAtStart}
              disabled={isAtStart}
              onClick={() => !isAtStart && scrollByCard("prev")}
              className={`${baseBtn} ${isAtStart ? disabledBtn : enabledBtn}`}
              title={isAtStart ? "At the first slide" : "Previous"}
            >
              <span className="select-none text-2xl md:text-3xl leading-none">‹</span>
            </button>
            <button
              type="button"
              aria-label="Next"
              aria-disabled={isAtEnd}
              disabled={isAtEnd}
              onClick={() => !isAtEnd && scrollByCard("next")}
              className={`${baseBtn} ${isAtEnd ? disabledBtn : enabledBtn}`}
              title={isAtEnd ? "At the last slide" : "Next"}
            >
              <span className="select-none text-2xl md:text-3xl leading-none">›</span>
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

          {filteredPosts.map((post: any, i: number) => (
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
    </div>
  );
}
