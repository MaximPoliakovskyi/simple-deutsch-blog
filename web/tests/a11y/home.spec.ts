// tests/a11y/home.spec.ts

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("homepage has no serious/critical a11y issues", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  const results = await new AxeBuilder({ page })
    // You can filter tags if you want only WCAG 2.1/2.2
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  // Fail if any serious or critical issues remain
  const violations = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(violations, JSON.stringify(violations, null, 2)).toHaveLength(0);
});
