import { mapPostCardMeta } from "@/features/posts/postCardMeta";
import { getPostsByCategory } from "@/server/wp/posts";
import type { WPPostCard } from "@/server/wp/types";
import { getTranslations } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
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

  const t = getTranslations(effectiveLocale);
  const preparedPosts = posts.map((post) => mapPostCardMeta(post, effectiveLocale));

  return (
    <SuccessStoriesSlider
      posts={preparedPosts}
      title={t["stories.title"]}
      description={t["stories.description"]}
    />
  );
}
