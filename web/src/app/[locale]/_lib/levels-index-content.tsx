import Link from "next/link";
import { normalizeLevelSlug, sortWordPressBadgesByCefr } from "@/lib/cefr";
import {
  buildLocalizedHref,
  type CefrLevelCode,
  formatLocalizedPostCount,
  getCefrLevelLabel,
  type Locale,
  TRANSLATIONS,
} from "@/lib/i18n";
import { getWordPressLevelBadges } from "@/lib/posts";

/** Extracts the leading emoji character (if any) from a WordPress tag name like "🟢 A1 (Beginner)". */
function extractLeadingEmoji(name: string | null | undefined): string | null {
  if (!name) return null;
  const match = name.match(/^\p{Emoji_Presentation}/u);
  return match ? match[0] : null;
}

function localizedBadgeTitle(slug: string | undefined, locale: Locale): string | null {
  const code = normalizeLevelSlug(slug)?.toUpperCase() as CefrLevelCode | undefined;
  if (!code) return null;
  // getCefrLevelLabel returns e.g. "A1 - Початковий"; strip the "A1 - " prefix to get just the label.
  const full = getCefrLevelLabel(locale, code);
  const label = full.replace(/^[A-C][12]\s*[—–-]\s*/i, "").trim();
  return `${code} (${label})`;
}

export async function LevelsIndexContent({ locale }: { locale: Locale }) {
  const t = TRANSLATIONS[locale];
  const badges = sortWordPressBadgesByCefr(await getWordPressLevelBadges(locale));

  return (
    <div className="-mx-[calc(50vw-50%)] w-screen">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="type-display mb-4">{t.levelsHeading}</h1>
        <p className="type-lead mb-8 max-w-2xl text-neutral-600 dark:text-neutral-300">
          {t.levelsDescription}
        </p>
        <ul className="list-none grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {badges.map((badge, idx) => (
            <li
              key={badge.id}
              className="sd-fade-in-item rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <Link
                href={buildLocalizedHref(
                  locale,
                  `/levels/${normalizeLevelSlug(badge.slug) ?? badge.slug}`,
                )}
                className="group block"
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    {extractLeadingEmoji(badge.name) && (
                      <span className="shrink-0 text-xl leading-none" aria-hidden="true">
                        {extractLeadingEmoji(badge.name)}
                      </span>
                    )}
                    <h2 className="type-heading-4 group-hover:underline">
                      {localizedBadgeTitle(badge.slug, locale) ?? badge.name}
                    </h2>
                  </div>
                  <span className="type-caption text-neutral-500">
                    {formatLocalizedPostCount(badge.count ?? 0, locale)}
                  </span>
                </div>
                {badge.description ? (
                  <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                    {badge.description}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
