import { SORTED_FREQUENT_WORDS, type FrequentWord } from "./frequent-words-data";

/** Returns the first word in the priority list as a stable SSR/fallback. */
export function getDefaultWord(): FrequentWord {
  return SORTED_FREQUENT_WORDS[0];
}

/**
 * Picks a uniformly random word from the 300-word priority list.
 * Intended to be called once on mount — not persisted between page loads.
 */
export function selectFrequentWord(): FrequentWord {
  return SORTED_FREQUENT_WORDS[Math.floor(Math.random() * SORTED_FREQUENT_WORDS.length)];
}
