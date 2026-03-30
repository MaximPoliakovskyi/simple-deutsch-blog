const { chromium } = require("playwright");

async function run(base, locale) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];

  page.on("console", (m) => {
    const text = m.text();
    if (m.type() === "error" || text.includes("[dbg]")) {
      errors.push(`${m.type()}:${text}`);
    }
  });
  page.on("pageerror", (e) => errors.push(`pageerror:${e.message}\n${e.stack || ""}`));

  await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.getAttribute("data-app-visible") === "1");

  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href*="/posts/"]')).map((a) => ({
      href: a.getAttribute("href") || "",
      text: (a.textContent || "").trim().slice(0, 90),
    })),
  );

  const out = [];
  for (const entry of links.slice(0, 6)) {
    await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.documentElement.getAttribute("data-app-visible") === "1");

    await page.evaluate(() => {
      window.__probe = "alive";
    });

    const link = page.locator(`a[href="${entry.href}"]`).filter({ visible: true }).first();
    await Promise.all([page.waitForURL(/\/posts\//, { timeout: 20000 }), link.click()]);
    await page.waitForLoadState("networkidle");

    const finalUrl = page.url();
    const probe = await page.evaluate(() => window.__probe || null);
    const body = ((await page.textContent("body")) || "").toLowerCase();
    out.push({
      clickedHref: entry.href,
      clickedText: entry.text,
      finalUrl,
      clientSide: probe === "alive",
      unexpected: body.includes("unexpected error"),
    });
  }

  console.log(`LOCALE ${locale}`);
  for (const item of out) {
    console.log(
      `clickedHref=${item.clickedHref} | clickedText=${item.clickedText} | finalUrl=${item.finalUrl} | clientSide=${item.clientSide} | unexpected=${item.unexpected}`,
    );
  }
  console.log(`BROWSER_LOGS_START ${locale}`);
  for (const e of errors) console.log(e);
  console.log(`BROWSER_LOGS_END ${locale}`);

  await browser.close();
}

(async () => {
  const base = process.argv[2] || "http://localhost:3014";
  for (const locale of ["en", "uk", "ru"]) {
    await run(base, locale);
  }
})();
