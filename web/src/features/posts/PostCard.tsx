"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPostCardDate, translateCategory } from "@/shared/i18n/i18n";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import { isHiddenCategory } from "@/shared/lib/hiddenCategories";
import { getLevelLabel } from "@/shared/lib/levels";

type FeaturedImageNode = {
  node?: {
    sourceUrl?: string | null;
    altText?: string | null;
    mediaDetails?: { width?: number | null; height?: number | null } | null;
  } | null;
};

type FeaturedImageFlat = {
  url?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type Categories = { nodes: Array<{ name: string; slug: string }> } | null;

export type PostCardPost = {
  author?: { node?: { name?: string | null } | null } | null;
  categories?: Categories;
  content?: string | null;
  date?: string | null;
  dateText?: string | null;
  excerpt?: string | null;
  featuredImage?: FeaturedImageNode | FeaturedImageFlat | null;
  featuredImageUrl?: string | null;
  href?: string | null;
  id?: string;
  readingMinutes?: number | null;
  readingText?: string | null;
  readingWords?: number | null;
  readingWordsPerMinute?: number | null;
  slug: string;
  title: string;
};

export type PostCardProps = {
  className?: string;
  post: PostCardPost;
  priority?: boolean;
  safeExcerpt?: boolean;
};

function hasNode(featuredImage: unknown): featuredImage is FeaturedImageNode {
  return Boolean(featuredImage && typeof featuredImage === "object" && "node" in featuredImage);
}

function hasFlatUrl(featuredImage: unknown): featuredImage is FeaturedImageFlat {
  return Boolean(featuredImage && typeof featuredImage === "object" && "url" in featuredImage);
}

function extractImage(post: PostCardPost) {
  const featuredImage = post.featuredImage;
  if (hasNode(featuredImage)) {
    const node = featuredImage.node;
    if (node?.sourceUrl) {
      return { alt: String(node.altText ?? ""), url: String(node.sourceUrl) };
    }
  }

  if (hasFlatUrl(featuredImage) && featuredImage.url) {
    return { alt: String(featuredImage.alt ?? ""), url: String(featuredImage.url) };
  }

  if (post.featuredImageUrl) {
    return { alt: "", url: post.featuredImageUrl };
  }

  return { alt: "", url: "" };
}

export default function PostCard({ post, className, priority = false }: PostCardProps) {
  const image = extractImage(post);
  const { locale, t } = useI18n();
  const computedDateText = formatPostCardDate(post.date, locale) ?? "";

  const imageAlt = (image.alt?.trim() || post.title || "").slice(0, 280);
  const categories = (post.categories?.nodes ?? []).filter(
    (
      category,
    ): category is {
      name: string;
      slug: string;
    } =>
      Boolean(category?.slug) &&
      Boolean(category?.name) &&
      !isHiddenCategory(category.name, category.slug),
  );
  const href = post.href ?? buildLocalizedHref(locale, `/posts/${post.slug}`);

  return (
    <article className={["group", className].filter(Boolean).join(" ")}>
      <Link href={href} className="block" aria-label={post.title}>
        <div className="relative aspect-4/3 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--sd-image-placeholder)]">
          <div
            className="absolute inset-0 origin-center transform-gpu will-change-transform group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
            style={{
              transitionDuration: "var(--motion-duration-slower)",
              transitionProperty: "transform",
              transitionTimingFunction: "var(--motion-ease-emphasized)",
            }}
          >
            {image.url ? (
              <Image
                alt={imageAlt}
                className="pointer-events-none select-none object-cover"
                decoding="async"
                fetchPriority={priority ? "high" : "auto"}
                fill
                loading={priority ? "eager" : "lazy"}
                priority={priority}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                src={image.url}
              />
            ) : (
              <div className="absolute inset-0" />
            )}
          </div>
        </div>

        {((post.dateText ?? computedDateText) || post.readingText) && (
          <p className="mt-4 text-[14px] leading-5 text-[var(--sd-text-muted)]">
            {post.dateText ?? computedDateText}{" "}
            {(post.dateText ?? computedDateText) && post.readingText ? (
              <span aria-hidden>{"\u00B7"}</span>
            ) : null}{" "}
            {post.readingText}
          </p>
        )}

        <h3 className="mt-1 text-[24px] font-semibold leading-[32px] tracking-[-0.6px] text-[var(--sd-text)] sm:text-[26px] sm:leading-[35px] lg:text-[28px] lg:leading-[37.8px] lg:tracking-[-0.7px]">
          <span className="transition-colors duration-300 group-hover:text-[var(--sd-text-soft)] group-focus-within:text-[var(--sd-text-soft)]">
            {post.title}
          </span>
        </h3>
      </Link>

      {categories.length > 0 ? (
        <div className="pt-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                aria-label={`${t("category.viewAria")} ${getLevelLabel(category.slug, locale) ?? translateCategory(category.name, category.slug, locale)}`}
                className="inline-flex h-[27.6px] items-center rounded-full border border-[#e5e5e5] bg-white px-[12.8px] py-[4.8px] text-[12px] font-medium leading-[18px] text-[#404040] transition-colors hover:bg-[#f5f5f5] dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
                href={buildLocalizedHref(locale, `/categories/${category.slug}`)}
              >
                {getLevelLabel(category.slug, locale) ??
                  translateCategory(category.name, category.slug, locale)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
