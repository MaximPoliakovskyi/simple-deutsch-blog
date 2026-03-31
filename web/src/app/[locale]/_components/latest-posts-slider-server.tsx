import { DEFAULT_LOCALE, formatPostCardDate, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { buildLocalePostHref, getPosts, type WPPostCard } from "@/lib/posts";
import LatestPostsSlider from "./latest-posts-slider";

type Props = {
  locale?: Locale;
};

async function getSliderPosts(locale?: Locale): Promise<WPPostCard[]> {
  const response = await getPosts({ first: 8, locale });
  return (response.posts?.nodes ?? []) as WPPostCard[];
}

export default async function LatestPostsSliderServer({ locale }: Props = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const posts = await getSliderPosts(effectiveLocale);
  if (!posts.length) return null;

  const t = TRANSLATIONS[effectiveLocale];

  const mapped = posts.map((post) => ({
    ...post,
    readingText: post.readingText ?? null,
    dateText: formatPostCardDate(post.date, effectiveLocale),
    href: buildLocalePostHref(effectiveLocale, post.slug),
  }));

  return <LatestPostsSlider posts={mapped} title={t.latestPosts} />;
}
