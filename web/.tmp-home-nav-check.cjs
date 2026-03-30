const { chromium } = require('playwright');
(async () => {
  const base = 'http://localhost:3000';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(base + '/en/blog', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const postLink = page.locator("a[href*='/en/posts/']").first();
  await postLink.waitFor({ timeout: 20000 });
  const href = await postLink.getAttribute('href');
  await postLink.click();
  await page.waitForURL('**/en/posts/**', { timeout: 20000 });
  const logo = page.locator("a[aria-label='Home'], a:has-text('simple-deutsch.de')").first();
  await logo.click();
  await page.waitForURL('**/en', { timeout: 20000 });
  console.log('OK', { from: href, to: page.url() });
  await browser.close();
})();
