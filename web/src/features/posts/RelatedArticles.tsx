import PostCard from "@/features/posts/PostCard";
import { mapPostCardMeta } from "@/features/posts/postCardMeta";
import {
  getLatestPostsForRelated,
  getRelatedPostsByCategorySlug,
  getRelatedPostsByTagSlug,
} from "@/server/wp/posts";
import type { PostListItem } from "@/server/wp/types";
import { getTranslations } from "@/shared/i18n/i18n";
import type { Locale } from "@/shared/i18n/locale";

const MAX_RELATED_POSTS = 3;
const QUERY_PAGE_SIZE = 9;

type RelatedArticlesProps = {
  locale: Locale;
  currentPostId?: string;
  currentPostDatabaseId?: number;
  currentPostSlug: string;
  categorySlugs: string[];
  tagSlugs: string[];
};

function getPostKey(post: Pick<PostListItem, "id" | "databaseId" | "slug">): string {
  if (typeof post.databaseId === "number") return `db:${post.databaseId}`;
  if (post.id) return `id:${post.id}`;
  return `slug:${post.slug}`;
}

function uniqueSlugs(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  values.forEach((value) => {
    const slug = (value ?? "").trim().toLowerCase();
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    out.push(slug);
  });
  return out;
}

export default async function RelatedArticles({
  locale,
  currentPostId,
  currentPostDatabaseId,
  currentPostSlug,
  categorySlugs,
  tagSlugs,
}: RelatedArticlesProps) {
  const picked: PostListItem[] = [];
  const pickedKeys = new Set<string>();
  const currentKey = getPostKey({
    id: currentPostId ?? "",
    databaseId: currentPostDatabaseId,
    slug: currentPostSlug,
  });

  const tryAddPosts = (posts: PostListItem[]) => {
    for (const post of posts) {
      if (picked.length >= MAX_RELATED_POSTS) break;
      const postKey = getPostKey(post);
      if (postKey === currentKey) continue;
      if (post.slug === currentPostSlug) continue;
      if (pickedKeys.has(postKey)) continue;
      picked.push(post);
      pickedKeys.add(postKey);
    }
  };

  const uniqueCategorySlugs = uniqueSlugs(categorySlugs);
  const uniqueTagSlugs = uniqueSlugs(tagSlugs);

  if (uniqueCategorySlugs.length) {
    const categoryResults = await Promise.all(
      uniqueCategorySlugs.map(async (categorySlug) => {
        try {
          const { posts } = await getRelatedPostsByCategorySlug({
            slug: categorySlug,
            first: QUERY_PAGE_SIZE,
            locale,
          });
          return posts;
        } catch (error) {
          console.error(`[related] failed category fetch for "${categorySlug}"`, error);
          return [] as PostListItem[];
        }
      }),
    );

    for (const posts of categoryResults) {
      if (picked.length >= MAX_RELATED_POSTS) break;
      tryAddPosts(posts);
    }
  }

  if (uniqueTagSlugs.length) {
    const tagResults = await Promise.all(
      uniqueTagSlugs.map(async (tagSlug) => {
        try {
          const { posts } = await getRelatedPostsByTagSlug({
            slug: tagSlug,
            first: QUERY_PAGE_SIZE,
            locale,
          });
          return posts;
        } catch (error) {
          console.error(`[related] failed tag fetch for "${tagSlug}"`, error);
          return [] as PostListItem[];
        }
      }),
    );

    for (const posts of tagResults) {
      if (picked.length >= MAX_RELATED_POSTS) break;
      tryAddPosts(posts);
    }
  }

  if (picked.length < MAX_RELATED_POSTS) {
    try {
      const { posts } = await getLatestPostsForRelated({
        first: 24,
        locale,
      });
      tryAddPosts(posts);
    } catch (error) {
      console.error("[related] failed latest posts fetch", error);
    }
  }

  const relatedPosts = picked.slice(0, MAX_RELATED_POSTS);
  if (relatedPosts.length === 0) return null;

  const t = getTranslations(locale);
  const sectionTitle = t["post.relatedArticles"];

  return (
    <section className="mt-[var(--space-16)] border-t border-[var(--sd-border-subtle)] pt-[var(--space-8)]">
      <h2 className="mb-[var(--space-5)] text-[length:var(--text-section-title)] font-semibold tracking-[var(--tracking-tight)] text-[var(--sd-text)]">
        {sectionTitle}
      </h2>
      <div className="sd-post-grid sd-post-grid--compact">
        {relatedPosts.map((post) => (
          <div key={getPostKey(post)}>
            <PostCard post={mapPostCardMeta(post, locale)} priority={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
