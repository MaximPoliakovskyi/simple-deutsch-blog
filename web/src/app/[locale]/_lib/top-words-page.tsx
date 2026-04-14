import { DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { SORTED_FREQUENT_WORDS, WORD_DISPLAY_INDEX } from "@/lib/frequent-words-data";
import TopWordsScrollHighlight from "./top-words-scroll";

type Props = {
  locale?: Locale;
};

export default function TopWordsPage({ locale = DEFAULT_LOCALE }: Props) {
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];

  return (
    <main className="sd-fade-in-slow mx-auto max-w-7xl px-4 py-12">
      <TopWordsScrollHighlight />

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="type-display mb-3 text-gray-900 dark:text-white">
            {t["topWords.title"] ?? "Top German words"}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {t["topWords.subtitle"] ?? "The most useful frequent German words"}
          </p>
        </div>

        {/* Word list */}
        <ol className="divide-y divide-gray-100 dark:divide-neutral-800" aria-label={t["topWords.title"] ?? "Top German words"}>
          {SORTED_FREQUENT_WORDS.map((entry) => {
            const displayIndex = WORD_DISPLAY_INDEX.get(entry.rank) ?? 0;
            const translation = entry.translations[locale] ?? entry.translations.en;
            return (
              <li
                key={entry.rank}
                id={String(displayIndex)}
                className="top-words-entry flex gap-3 py-2.5 px-2 rounded-lg scroll-mt-20 transition-colors"
              >
                {/* Rank — narrow fixed column */}
                <span className="shrink-0 w-8 text-right text-xs tabular-nums text-gray-400 dark:text-gray-500 leading-5 pt-0.5">
                  {displayIndex}.
                </span>
                {/* Word + translation: stacked on mobile, inline on sm+ */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-4 gap-0.5 min-w-0">
                  <span className="shrink-0 font-semibold text-gray-900 dark:text-white text-sm sm:w-44">
                    {entry.article && (
                      <span className="font-normal text-gray-400 dark:text-gray-500 mr-1">{entry.article}</span>
                    )}
                    {entry.word}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 break-words">
                    {translation}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <style>{`
        .top-words-highlight {
          background-color: rgb(254 249 195 / 0.8);
        }
        :is(.dark) .top-words-highlight,
        :is([data-theme="dark"]) .top-words-highlight {
          background-color: rgb(120 53 15 / 0.25);
        }
      `}</style>
    </main>
  );
}

