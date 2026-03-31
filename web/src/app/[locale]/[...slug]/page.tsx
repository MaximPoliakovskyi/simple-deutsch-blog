import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLevelLabel, TRANSLATIONS } from "@/lib/i18n";
import { getCategoryBySlug, getTagBySlug } from "@/lib/posts";
import { buildI18nAlternates } from "@/lib/seo";
import { getOptionalRouteLocale, getRequiredRouteLocale } from "../locale-route";

import AboutPage from "../about/about-page";
import HomePage from "../home-page";
import { CategoriesIndexContent } from "../categories/categories-index-content";
import { CategoryPageContent } from "../categories/category-page-content";
import ImprintPage from "../imprint/imprint-page";
import { LevelsIndexContent } from "../levels/levels-index-content";
import { LevelPageContent } from "../levels/level-page-content";
import PartnershipsClient from "../partnerships/partnerships-page";
import PostsIndex from "../posts/posts-index";
import { generatePostMetadata, renderPostPage } from "../posts/post-page";
import PrivacyPage from "../privacy/privacy-page";
import TeamPageContent, { generateTeamMetadata } from "../team/team-page";
import TermsPage from "../terms/terms-page";

export const revalidate = 60;

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const validated = getOptionalRouteLocale(locale);

  if (!validated) return {};

  const t = TRANSLATIONS[validated];
  const [section, ...rest] = slug;

  switch (section) {
    case "about":
      return {
        title: `${t.about} — ${t.siteTitle}`,
        alternates: buildI18nAlternates("/about", validated),
      };

    case "posts":
      if (rest.length === 0) {
        return {
          title: `${t.posts} — ${t.siteTitle}`,
          alternates: buildI18nAlternates("/posts", validated),
        };
      }
      if (rest.length === 1) {
        return generatePostMetadata({
          params: Promise.resolve({ slug: rest[0] }),
          locale: validated,
        });
      }
      return {};

    case "categories":
      if (rest.length === 0) {
        return {
          title: `${t.categories} — ${t.siteTitle}`,
          alternates: buildI18nAlternates("/categories", validated),
        };
      }
      if (rest.length === 1) {
        const term = await getCategoryBySlug(rest[0], validated);
        return {
          title: term
            ? `Category: ${term.name} — ${t.siteTitle}`
            : (t.categoryNotFound as string),
          alternates: buildI18nAlternates(`/categories/${rest[0]}`, validated),
        };
      }
      return {};

    case "levels":
    case "tags":
      if (rest.length === 0) {
        return {
          title: `${t.levels} — ${t.siteTitle}`,
          alternates: buildI18nAlternates("/levels", validated),
        };
      }
      if (rest.length === 1) {
        const tag = rest[0];
        const term = await getTagBySlug(tag, validated);
        if (!term) {
          return {
            title: t.levelNotFound as string,
            alternates: buildI18nAlternates(`/levels/${tag}`, validated),
          };
        }
        const prefix =
          (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
        const code = tag.toUpperCase();
        const levelLabel = getLevelLabel(tag, validated);
        const title =
          levelLabel && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(code)
            ? `${prefix} ${code} (${levelLabel}) — ${t.siteTitle}`
            : `${prefix} ${term.name} — ${t.siteTitle}`;
        return { title, alternates: buildI18nAlternates(`/levels/${tag}`, validated) };
      }
      return {};

    case "partnerships": {
      const dict = TRANSLATIONS[validated];
      return {
        title: `${dict["partnerships.meta.title"]} | ${dict.siteTitle}`,
        description: dict["partnerships.meta.description"] as string,
        alternates: buildI18nAlternates("/partnerships", validated),
      };
    }

    case "team":
      return generateTeamMetadata(validated);

    case "imprint":
      return {
        title: `${t["imprint.title"]} — ${t.siteTitle}`,
        alternates: buildI18nAlternates("/imprint", validated),
      };

    case "privacy":
      return {
        title: `${t["privacy.title"]} — ${t.siteTitle}`,
        alternates: buildI18nAlternates("/privacy", validated),
      };

    case "terms":
      return {
        title: `${t["terms.title"]} — ${t.siteTitle}`,
        alternates: buildI18nAlternates("/terms", validated),
      };

    default:
      return {};
  }
}
export default async function CatchAllRoute({ params }: Props) {
  const { locale, slug } = await params;
  const validated = getRequiredRouteLocale(locale);
  const [section, ...rest] = slug;

  switch (section) {
    case "about":
      return <AboutPage locale={validated} />;

    case "posts":
      if (rest.length === 0) return <PostsIndex locale={validated} />;
      if (rest.length === 1)
        return renderPostPage({
          params: Promise.resolve({ slug: rest[0] }),
          locale: validated,
        });
      notFound();
      break;

    case "categories":
      if (rest.length === 0) return <CategoriesIndexContent locale={validated} />;
      if (rest.length === 1)
        return <CategoryPageContent category={rest[0]} locale={validated} />;
      notFound();
      break;

    case "levels":
    case "tags":
      if (rest.length === 0) return <LevelsIndexContent locale={validated} />;
      if (rest.length === 1) return <LevelPageContent locale={validated} tag={rest[0]} />;
      notFound();
      break;

    case "partnerships":
      return (
        <PartnershipsClient contactEmail="partnerships@simple-deutsch.de" locale={validated} />
      );

    case "team":
      return <TeamPageContent locale={validated} />;

    case "imprint":
      return <ImprintPage locale={validated} />;

    case "privacy":
      return <PrivacyPage locale={validated} />;

    case "terms":
      return <TermsPage locale={validated} />;

    case "start":
      return (
        <main data-testid="start-marker">
          <HomePage locale={validated} />
        </main>
      );

    case "blog":
    default:
      notFound();
  }
}