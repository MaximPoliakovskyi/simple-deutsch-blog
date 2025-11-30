// app/posts/PostsPage.tsx
import PostCard, { type PostCardPost } from "@/components/PostCard";
import { fetchPosts, type Locale } from "@/lib/api";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/lib/i18n";

type PostsPageProps = {
  locale: Locale;
};

export default async function PostsPage({ locale }: PostsPageProps) {
  // Load posts for the provided locale
  const posts = await fetchPosts(locale);

  type PostNode = {
    id: string;
    slug: string;
    title: string;
    date?: string;
    excerpt?: string | null;
    featuredImage?: unknown;
  };

  const nodes = posts as PostNode[];

  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{t.posts}</h1>
      {nodes.length === 0 ? (
        <p className="text-neutral-600">{t.noPosts}</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
          {nodes.map((post) => (
            <li key={post.id}>
              <PostCard post={post as PostCardPost} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
