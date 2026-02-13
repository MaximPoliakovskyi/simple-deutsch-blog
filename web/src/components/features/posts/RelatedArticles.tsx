import PostCard from "@/components/features/posts/PostCard";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { type Locale } from "@/i18n/locale";
import {
  getLatestPostsForRelated,
  getRelatedPostsByCategorySlug,
  getRelatedPostsByTagSlug,
  type PostListItem,
} from "@/server/wp/api";

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

  for (const categorySlug of uniqueCategorySlugs) {
    if (picked.length >= MAX_RELATED_POSTS) break;
    try {
      const { posts } = await getRelatedPostsByCategorySlug({
        slug: categorySlug,
        first: QUERY_PAGE_SIZE,
        locale,
      });
      tryAddPosts(posts);
    } catch (error) {
      console.error(`[related] failed category fetch for "${categorySlug}"`, error);
    }
  }

  for (const tagSlug of uniqueTagSlugs) {
    if (picked.length >= MAX_RELATED_POSTS) break;
    try {
      const { posts } = await getRelatedPostsByTagSlug({
        slug: tagSlug,
        first: QUERY_PAGE_SIZE,
        locale,
      });
      tryAddPosts(posts);
    } catch (error) {
      console.error(`[related] failed tag fetch for "${tagSlug}"`, error);
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

  const t = TRANSLATIONS[locale];
  const sectionTitle = (t.relatedArticles as string) ?? "Related articles";
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <section className="mt-14 border-t border-neutral-200/70 pt-8 dark:border-neutral-800/70">
      <h2 className="mb-5 text-2xl font-semibold tracking-tight">{sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
        {relatedPosts.map((post) => (
          <div key={getPostKey(post)}>
            <PostCard post={{ ...post, href: `${prefix}/posts/${post.slug}` }} priority={false} />
          </div>
        ))}
      </div>
    </section>
  );
}
