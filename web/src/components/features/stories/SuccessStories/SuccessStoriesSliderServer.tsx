import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";
import { getPostsByCategory } from "@/server/wp/api";
import SuccessStoriesSlider from "./SuccessStoriesSlider";

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
  const preparedPosts = posts.map((post) => {
    const dateText = post.date
      ? new Intl.DateTimeFormat(
          effectiveLocale === "uk" ? "uk-UA" : effectiveLocale === "ru" ? "ru-RU" : "en-US",
          { dateStyle: "long", timeZone: "UTC" },
        ).format(new Date(post.date))
      : null;

    const prefix = effectiveLocale === "en" ? "" : `/${effectiveLocale}`;
    const href = `${prefix}/posts/${post.slug}`;

    return {
      ...post,
      readingText: post.readingText ?? null,
      dateText,
      href,
    };
  });

  return (
    <SuccessStoriesSlider
      posts={preparedPosts}
      title={t.successStories}
      description={t.successStoriesDescription}
    />
  );
}
