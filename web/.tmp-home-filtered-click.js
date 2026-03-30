const { chromium } = require("playwright");

async function test(base, locale) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];

  page.on("console", (m) => {
    if (m.type() === "error") errs.push(`console:${m.text()}`);
  });
  page.on("pageerror", (e) => errs.push(`pageerror:${e.message}`));

  await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.getAttribute("data-app-visible") === "1");

  const categoryButtons = page.locator("button").filter({ hasText: /./ });
  const count = await categoryButtons.count();

  let clickedCategory = "none";
  for (let i = 0; i < count; i += 1) {
    const b = categoryButtons.nth(i);
    const txt = ((await b.textContent()) || "").trim();
    if (!txt) continue;
    if (/all|всі|все/i.test(txt)) continue;
    if (txt.length < 2) continue;
    await b.click();
    clickedCategory = txt;
    break;
  }

  await page.waitForTimeout(1200);

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*="/posts/"]')).map((a) => ({
      href: a.getAttribute("href") || "",
      text: (a.textContent || "").trim().slice(0, 60),
    })),
  );

  const first = links[0];
  if (!first) {
    console.log(`LOCALE ${locale} no-post-links-after-filter category=${clickedCategory}`);
    await browser.close();
    return;
  }

  await page.evaluate(() => {
    window.__probe = "alive";
  });

  const target = page
    .locator(`a[href="${first.href}"]`)
    .filter({ visible: true })
    .first();

  try {
    await Promise.all([
      page.waitForURL(/\/posts\//, { timeout: 20000 }),
      target.click(),
    ]);
  } catch (error) {
    console.log(`LOCALE ${locale}`);
    console.log(`category=${clickedCategory}`);
    console.log(`clickedHref=${first.href}`);
    console.log(`finalUrl=${page.url()}`);
    console.log(`navError=${error instanceof Error ? error.message : String(error)}`);
    console.log(`errors=${errs.length ? errs.join(" || ") : "none"}`);
    await browser.close();
    return;
  }

  await page.waitForLoadState("networkidle");
  const finalUrl = page.url();
  const probe = await page.evaluate(() => window.__probe || null);
  const body = ((await page.textContent("body")) || "").toLowerCase();

  console.log(`LOCALE ${locale}`);
  console.log(`category=${clickedCategory}`);
  console.log(`clickedHref=${first.href}`);
  console.log(`finalUrl=${finalUrl}`);
  console.log(`probe=${probe === null ? "null" : probe}`);
  console.log(`unexpected=${body.includes("unexpected error")}`);
  console.log(`errors=${errs.length ? errs.join(" || ") : "none"}`);

  await browser.close();
}

(async () => {
  const base = process.argv[2] || "http://localhost:3000";
  for (const locale of ["en", "uk", "ru"]) {
    await test(base, locale);
  }
})();
