import { DEFAULT_LOCALE, formatPostCardDate, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { buildLocalePostHref, getPostsByCategory, type WPPostCard } from "@/lib/posts";
import SuccessStoriesSlider from "./success-stories-slider";

type Props = {
  locale?: Locale;
};

function getCategorySlug(locale: Locale): string {
  if (locale === "uk") return "success-stories-uk";
  if (locale === "ru") return "success-stories-ru";
  return "success-stories";
}

async function getSuccessStoryPosts(locale: Locale): Promise<WPPostCard[]> {
  const categorySlug = getCategorySlug(locale);
  const response = await getPostsByCategory({
    first: 8,
    after: null,
    locale,
    categorySlug,
  });

  return response.posts ?? [];
}

export default async function SuccessStoriesSliderServer({ locale }: Props = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const posts = await getSuccessStoryPosts(effectiveLocale);

  if (!posts.length) return null;

  const t = TRANSLATIONS[effectiveLocale];
  const preparedPosts = posts.map((post) => ({
    ...post,
    readingText: post.readingText ?? null,
    dateText: formatPostCardDate(post.date, effectiveLocale),
    href: buildLocalePostHref(effectiveLocale, post.slug),
  }));

  return (
    <SuccessStoriesSlider
      posts={preparedPosts}
      title={t.successStories}
      description={t.successStoriesDescription}
    />
  );
}
