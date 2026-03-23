import type { PostCardPost } from "@/features/posts/PostCard";
import type { PostListItem, WPPostCard } from "@/server/wp/types";
import { formatPostCardDate } from "@/shared/i18n/i18n";
import type { Locale } from "@/shared/i18n/locale";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";

type SourcePost = PostListItem | WPPostCard;

export function mapPostCardMeta(post: SourcePost, locale: Locale): PostCardPost {
  const postSlug = String(post.slug ?? "");
  const dateText = formatPostCardDate(post.date, locale);

  return {
    ...post,
    href: buildLocalizedHref(locale, `/posts/${postSlug}`),
    dateText,
    readingText: post.readingText ?? null,
  };
}
