import * as assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from "./locale";
import { buildI18nAlternates } from "./seo";

const EXPECTED_ORIGIN = "http://localhost:3000";

type Alternates = ReturnType<typeof buildI18nAlternates>;

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof URL) return value.toString();
  return String(value);
}

function getLanguages(alternates: Alternates): Record<string, unknown> {
  return (alternates?.languages ?? {}) as Record<string, unknown>;
}

function assertHasAllLocales(languages: Record<string, unknown>) {
  for (const locale of SUPPORTED_LOCALES) {
    assert.ok(languages[locale], `missing hreflang for ${locale}`);
  }
  assert.ok(languages["x-default"], "missing x-default hreflang");
}

test("home alternates", () => {
  const currentLocale: Locale = "ru";
  const alternates = buildI18nAlternates("/", currentLocale);
  assert.equal(alternates?.canonical, `${EXPECTED_ORIGIN}/ru`);
  const languages = getLanguages(alternates);
  assertHasAllLocales(languages);
  assert.equal(toStringValue(languages.en), `${EXPECTED_ORIGIN}/en`);
  assert.equal(toStringValue(languages.ru), `${EXPECTED_ORIGIN}/ru`);
  assert.equal(toStringValue(languages.uk), `${EXPECTED_ORIGIN}/uk`);
  assert.equal(toStringValue(languages["x-default"]), `${EXPECTED_ORIGIN}/${DEFAULT_LOCALE}`);
});

test("static route alternates", () => {
  const currentLocale: Locale = "uk";
  const alternates = buildI18nAlternates("/about", currentLocale);
  assert.equal(alternates?.canonical, `${EXPECTED_ORIGIN}/uk/about`);
  const languages = getLanguages(alternates);
  assertHasAllLocales(languages);
  assert.equal(toStringValue(languages.en), `${EXPECTED_ORIGIN}/en/about`);
  assert.equal(toStringValue(languages.ru), `${EXPECTED_ORIGIN}/ru/about`);
  assert.equal(toStringValue(languages.uk), `${EXPECTED_ORIGIN}/uk/about`);
  assert.equal(toStringValue(languages["x-default"]), `${EXPECTED_ORIGIN}/${DEFAULT_LOCALE}/about`);
});

test("search route preserves query", () => {
  const currentLocale: Locale = "en";
  const alternates = buildI18nAlternates("/search?q=test", currentLocale);
  assert.equal(alternates?.canonical, `${EXPECTED_ORIGIN}/en/search?q=test`);
  const languages = getLanguages(alternates);
  assertHasAllLocales(languages);
  assert.equal(toStringValue(languages.en), `${EXPECTED_ORIGIN}/en/search?q=test`);
  assert.equal(toStringValue(languages.ru), `${EXPECTED_ORIGIN}/ru/search?q=test`);
  assert.equal(toStringValue(languages.uk), `${EXPECTED_ORIGIN}/uk/search?q=test`);
  assert.equal(
    toStringValue(languages["x-default"]),
    `${EXPECTED_ORIGIN}/${DEFAULT_LOCALE}/search?q=test`,
  );
});

test("post route uses translation map", () => {
  const currentLocale: Locale = "ru";
  const alternates = buildI18nAlternates("/posts/german-case-system", currentLocale, {
    translationMap: {
      en: "/en/posts/german-case-system",
      ru: "/ru/posts/nemetskaya-sistema-padezhey",
      uk: "/uk/posts/nimecka-sistema-vidminkiv",
    },
  });
  assert.equal(alternates?.canonical, `${EXPECTED_ORIGIN}/ru/posts/nemetskaya-sistema-padezhey`);
  const languages = getLanguages(alternates);
  assertHasAllLocales(languages);
  assert.equal(toStringValue(languages.en), `${EXPECTED_ORIGIN}/en/posts/german-case-system`);
  assert.equal(
    toStringValue(languages.ru),
    `${EXPECTED_ORIGIN}/ru/posts/nemetskaya-sistema-padezhey`,
  );
  assert.equal(
    toStringValue(languages.uk),
    `${EXPECTED_ORIGIN}/uk/posts/nimecka-sistema-vidminkiv`,
  );
  assert.equal(
    toStringValue(languages["x-default"]),
    `${EXPECTED_ORIGIN}/${DEFAULT_LOCALE}/posts/german-case-system`,
  );
});

test("post route with prefixed pathname and prefixed translation map", () => {
  const currentLocale: Locale = "ru";
  const alternates = buildI18nAlternates("/ru/posts/german-case-system", currentLocale, {
    translationMap: {
      en: "/en/posts/german-case-system",
      ru: "/ru/posts/nemetskaya-sistema-padezhey",
      uk: "/uk/posts/nimecka-sistema-vidminkiv",
    },
  });
  assert.equal(alternates?.canonical, `${EXPECTED_ORIGIN}/ru/posts/nemetskaya-sistema-padezhey`);
  const languages = getLanguages(alternates);
  assertHasAllLocales(languages);
  assert.equal(toStringValue(languages.en), `${EXPECTED_ORIGIN}/en/posts/german-case-system`);
  assert.equal(
    toStringValue(languages.ru),
    `${EXPECTED_ORIGIN}/ru/posts/nemetskaya-sistema-padezhey`,
  );
  assert.equal(
    toStringValue(languages.uk),
    `${EXPECTED_ORIGIN}/uk/posts/nimecka-sistema-vidminkiv`,
  );
  assert.equal(
    toStringValue(languages["x-default"]),
    `${EXPECTED_ORIGIN}/${DEFAULT_LOCALE}/posts/german-case-system`,
  );
});

test("post route without translation map falls back", () => {
  const currentLocale: Locale = "uk";
  const alternates = buildI18nAlternates("/posts/german-case-system", currentLocale);
  assert.equal(alternates?.canonical, `${EXPECTED_ORIGIN}/uk`);
  const languages = getLanguages(alternates);
  assertHasAllLocales(languages);
  assert.equal(toStringValue(languages.en), `${EXPECTED_ORIGIN}/en`);
  assert.equal(toStringValue(languages.ru), `${EXPECTED_ORIGIN}/ru`);
  assert.equal(toStringValue(languages.uk), `${EXPECTED_ORIGIN}/uk`);
  assert.equal(toStringValue(languages["x-default"]), `${EXPECTED_ORIGIN}/${DEFAULT_LOCALE}`);
});

test("uses origin only from NEXT_PUBLIC_SITE_URL (strips path/query)", () => {
  const saved = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/some/path?x=1";
  try {
    const alternates = buildI18nAlternates("/about", "en");
    const languages = getLanguages(alternates);
    assert.equal(alternates?.canonical, "https://example.com/en/about");
    assert.equal(toStringValue(languages.en), "https://example.com/en/about");
    assert.equal(
      toStringValue(languages["x-default"]),
      `https://example.com/${DEFAULT_LOCALE}/about`,
    );
  } finally {
    if (saved === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = saved;
    }
  }
});

test("pathname without leading slash is normalized", () => {
  const saved = process.env.NEXT_PUBLIC_SITE_URL;
  if (saved === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  }

  try {
    const alternates = buildI18nAlternates("about", "ru");
    const languages = getLanguages(alternates);
    assert.equal(alternates?.canonical, `${EXPECTED_ORIGIN}/ru/about`);
    assert.equal(toStringValue(languages.en), `${EXPECTED_ORIGIN}/en/about`);
    assert.equal(
      toStringValue(languages["x-default"]),
      `${EXPECTED_ORIGIN}/${DEFAULT_LOCALE}/about`,
    );
  } finally {
    if (saved === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = saved;
    }
  }
});
