import * as assert from "node:assert/strict";
import { test } from "node:test";
import { mapPathToLocale } from "./pathMapping";

test('"/" -> "/ru"', () => {
  assert.equal(mapPathToLocale("/", "ru"), "/ru");
});

test('"/en" -> "/uk"', () => {
  assert.equal(mapPathToLocale("/en", "uk"), "/uk");
});

test("post translation map with prefixed slug", () => {
  assert.equal(
    mapPathToLocale("/en/posts/german-case-system", "ru", {
      translationMap: { ru: "/ru/posts/translated" },
    }),
    "/ru/posts/translated",
  );
});

test("post translation map with unprefixed slug is normalized", () => {
  assert.equal(
    mapPathToLocale("/en/posts/german-case-system", "ru", {
      translationMap: { ru: "/posts/translated" },
    }),
    "/ru/posts/translated",
  );
});

test("preserves query/hash on translated post route", () => {
  assert.equal(
    mapPathToLocale("/en/posts/german-case-system?ref=nav#x", "ru", {
      translationMap: { ru: "/ru/posts/translated" },
    }),
    "/ru/posts/translated?ref=nav#x",
  );
});

test("missing post translation falls back to locale home and preserves query/hash", () => {
  assert.equal(mapPathToLocale("/posts/german-case-system?ref=nav#x", "uk"), "/uk?ref=nav#x");
});

test('"/search?q=artikel&after=cursor1" -> "/ru/search?q=artikel&after=cursor1"', () => {
  assert.equal(
    mapPathToLocale("/search?q=artikel&after=cursor1", "ru"),
    "/ru/search?q=artikel&after=cursor1",
  );
});

test('"/en/categories/grammar" -> "/uk/categories/grammar"', () => {
  assert.equal(mapPathToLocale("/en/categories/grammar", "uk"), "/uk/categories/grammar");
});

test('"/levels/b1" -> "/ru/levels/b1"', () => {
  assert.equal(mapPathToLocale("/levels/b1", "ru"), "/ru/levels/b1");
});
