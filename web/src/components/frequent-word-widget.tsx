"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type Locale, TRANSLATIONS } from "@/lib/i18n";
import { getDefaultWord, selectFrequentWord } from "@/lib/frequent-word";
import type { FrequentWord } from "@/lib/frequent-words-data";
import { WORD_DISPLAY_INDEX } from "@/lib/frequent-words-data";

type Props = {
  locale: Locale;
  articleSlug: string;
};

export default function FrequentWordWidget({ locale, articleSlug }: Props) {
  const t = TRANSLATIONS[locale];

  // Initialize with the deterministic default so SSR and the initial client
  // render produce identical markup (no hydration mismatch).
  const [word, setWord] = useState<FrequentWord>(getDefaultWord);
  const [visible, setVisible] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const selected = selectFrequentWord();
    setWord(selected);
    // Small delay so the swap isn't jarring
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const translation = word.translations[locale];
  const displayIndex = WORD_DISPLAY_INDEX.get(word.rank) ?? 1;
  const priorityWordsHref = `/${locale}/priority-words#${displayIndex}`;

  const frequencyLabel = (t["frequentWord.frequency"] ?? "#{rank} in the list").replace(
    "{rank}",
    String(displayIndex),
  );
  const tooltip = t["frequentWord.tooltip"] ?? "Word in the first-priority vocabulary list";

  return (
    <div
      className="text-left"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s ease" }}
    >
      {/* Label */}
      <p className="type-ui-label text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        {t["frequentWord.label"] ?? "Priority word"}
      </p>

      {/* Article + German word */}
      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-1">
        {word.article && (
          <span className="font-normal text-gray-400 dark:text-gray-500 mr-1.5">{word.article}</span>
        )}
        {word.word}
      </p>

      {/* Localized translation */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {translation}
      </p>

      {/* Frequency rank link */}
      <Link
        href={priorityWordsHref}
        className="inline-block text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline decoration-dotted underline-offset-2 mb-3"
        title={tooltip}
      >
        {frequencyLabel}
      </Link>

      {/* German example sentence */}
      <p className="text-xs text-gray-500 dark:text-gray-400 italic leading-relaxed">
        {word.example}
      </p>
    </div>
  );
}
