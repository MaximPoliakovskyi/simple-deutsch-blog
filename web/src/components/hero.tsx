"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/providers";
import type { Locale } from "@/lib/i18n";
import type { WPPostCard } from "@/lib/posts";
import { CategoryPills } from "./category-pills";
import PostCard from "./post-card";
import type { TypewriterWordsProps } from "./typewriter-words";

// ---------------------------------------------------------------------------
// Inlined from hero-content.ts and hero-styles.ts (deleted)
// ---------------------------------------------------------------------------

const HERO_STATIC_LINE_CLASS_NAMES: Record<
  string,
  { titleClassName: string; line1ClassName: string; line2ClassName: string }
> = {
  en: {
    titleClassName: "",
    line1ClassName: "block whitespace-normal text-balance sm:whitespace-nowrap",
    line2ClassName: "block whitespace-normal text-balance min-[430px]:whitespace-nowrap",
  },
  uk: {
    titleClassName: "lg:max-w-[980px] xl:max-w-[1100px]",
    line1ClassName: "mx-auto block whitespace-normal text-balance",
    line2ClassName: "mx-auto block whitespace-normal text-balance",
  },
  ru: {
    titleClassName: "lg:max-w-[980px] xl:max-w-[1100px]",
    line1ClassName: "mx-auto block whitespace-normal text-balance",
    line2ClassName: "mx-auto block whitespace-normal text-balance",
  },
};

const HERO_TITLE_CLASS_NAME =
  "m-0 flex w-full max-w-4xl flex-col items-center p-0 text-center font-sans !text-[clamp(2.75rem,7.5vw,3.25rem)] font-bold !leading-[1.15] !tracking-tight text-[hsl(var(--fg))] select-text sm:!text-5xl lg:!text-6xl xl:!text-7xl dark:text-[hsl(var(--fg))]";

const HERO_DESCRIPTION_CLASS_NAME =
  "type-lead mx-auto mt-0 max-w-xl text-center text-[hsl(var(--fg-muted))]";

const TypewriterWords = dynamic<TypewriterWordsProps>(() => import("./typewriter-words"));

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  initialPosts: WPPostCard[];
  pageSize?: number;
  locale?: Locale;
};

export default function HeroWithFilters({ categories, initialPosts, pageSize = 6, locale }: Props) {
  const { t, locale: uiLocale } = useI18n();
  const heroHeadingId = useId();
  const featuredPostsHeadingId = useId();
  const [allPosts, setAllPosts] = useState<WPPostCard[]>(initialPosts);
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<string, WPPostCard[]>>(new Map([["all", initialPosts]]));
  const requestIdRef = useRef(0);
  const animatedWords = useMemo(() => t("heroAnimatedWords").split("|"), [t]);
  const heroDescriptionLines = useMemo(() => t("heroDescription").split("\n"), [t]);
  const promoCta = t("promoCta");
  const stableWidthCh = useMemo(
    () => Math.max(...animatedWords.map((word) => word.length)) + 1.5,
    [animatedWords],
  );
  const staticLineClassNames = useMemo(
    () => HERO_STATIC_LINE_CLASS_NAMES[uiLocale as string] ?? HERO_STATIC_LINE_CLASS_NAMES.en,
    [uiLocale],
  );

  useEffect(() => {
    cacheRef.current = new Map([["all", initialPosts]]);
    requestIdRef.current += 1;
    setAllPosts(initialPosts);
    setDisplayedCount(pageSize);
    setIsLoading(false);
  }, [initialPosts, pageSize]);

  const handleCategorySelect = useCallback(
    async (slug: string | null) => {
      const key = slug ?? "all";
      const cached = cacheRef.current.get(key);
      if (cached) {
        setAllPosts(cached);
        setDisplayedCount(pageSize);
        setIsLoading(false);
        return;
      }

      if (!slug) {
        setAllPosts(initialPosts);
        setDisplayedCount(pageSize);
        setIsLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setIsLoading(true);

      try {
        const url = new URL("/api/posts", window.location.origin);
        url.searchParams.set("first", "100");
        url.searchParams.set("category", slug);
        url.searchParams.set("lang", locale ?? "en");

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { posts?: WPPostCard[] };
        if (requestIdRef.current !== requestId) return;

        const posts = data.posts ?? [];
        cacheRef.current.set(key, posts);
        setAllPosts(posts);
        setDisplayedCount(pageSize);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        if (requestIdRef.current === requestId) {
          setAllPosts([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [initialPosts, locale, pageSize],
  );

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => prev + pageSize);
  }, [pageSize]);

  const displayedPosts = useMemo(
    () => allPosts.slice(0, displayedCount),
    [allPosts, displayedCount],
  );
  const hasMore = displayedCount < allPosts.length;

  return (
    <>
      <section className="sd-fade-in-slow mx-auto max-w-7xl pt-0 pb-0 text-center sm:pt-14 md:pt-16">
        <div className="flex w-full justify-center">
          <h1
            id={heroHeadingId}
            className={`${HERO_TITLE_CLASS_NAME} ${staticLineClassNames.titleClassName} mb-6 sm:mb-8`}
          >
            <span className={staticLineClassNames.line1ClassName}>{t("heroLine1")}</span>
            <span className={staticLineClassNames.line2ClassName}>{t("heroLine2")}</span>
            <span className="mt-1 flex w-full justify-center sm:mt-2">
              <span
                className="inline-flex items-baseline justify-center whitespace-nowrap text-blue-600"
                style={{
                  width: `${stableWidthCh}ch`,
                  minWidth: `${stableWidthCh}ch`,
                  flexShrink: 0,
                }}
              >
                <TypewriterWords
                  words={animatedWords}
                  className="text-inherit"
                  reserveWidth={false}
                  typeMsPerChar={115}
                  deleteMsPerChar={45}
                  pauseAfterTypeMs={2600}
                  pauseAfterDeleteMs={850}
                  showCursor
                />
              </span>
            </span>
          </h1>
        </div>

        <p className={HERO_DESCRIPTION_CLASS_NAME}>
          {heroDescriptionLines.map((line, index) => (
            <span key={line}>
              {index > 0 ? <br /> : null}
              {line}
            </span>
          ))}
          {promoCta ? (
            <>
              {" "}
              <a className="inline text-blue-600 underline" href="#top">
                {promoCta}
              </a>
            </>
          ) : null}
        </p>

        <CategoryPills
          categories={categories}
          initialSelected={null}
          onSelect={handleCategorySelect}
        />
      </section>

      <section aria-labelledby={featuredPostsHeadingId} className="flex flex-col gap-8">
        <h2 id={featuredPostsHeadingId} className="sr-only">
          {t("latestPosts") || "Latest articles"}
        </h2>

        {displayedPosts.length === 0 && !isLoading && <div>{t("noPosts")}</div>}

        {displayedPosts.length > 0 && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 py-2 md:grid-cols-2 xl:grid-cols-3">
            {displayedPosts.map((post, idx) => (
              <div key={post.id ?? post.slug}>
                <PostCard post={post} priority={idx < 3} locale={uiLocale} />
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className={[
              "type-button mx-auto rounded-full px-5 py-2",
              "transition duration-200 ease-out",
              "transform-gpu hover:scale-[1.03] motion-reduce:transform-none",
              "shadow-md hover:shadow-lg disabled:opacity-60",
              "cursor-pointer disabled:cursor-not-allowed",
              "sd-pill",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
            ].join(" ")}
            style={{ outlineColor: "oklch(0.371 0 0)", borderColor: "transparent" }}
          >
            {isLoading ? t("loading") || "Loading..." : t("loadMore") || "Load more"}
          </button>
        )}
      </section>
    </>
  );
}

