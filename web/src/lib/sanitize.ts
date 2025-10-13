import "server-only";
import createDOMPurify from "isomorphic-dompurify";

// DOMPurify works both on the server (via JSDOM) and in the browser.
// Docs: https://www.npmjs.com/package/isomorphic-dompurify
const DOMPurify = createDOMPurify();

/**
 * Sanitize untrusted HTML from WordPress.
 * - Server-first (RSC) by default, but also safe in Client Components.
 * - Adds noopener/noreferrer to target=_blank links.
 */
export function sanitize(html: string): string {
  // Add safe link defaults
  const safe = DOMPurify.sanitize(html, {
    ADD_ATTR: ["target", "rel"],
    // You can allow specific iframes/attrs via hooks if needed.
  });

  // Post-process links: add rel for target=_blank
  return safe.replace(
    /<a\b([^>]*\s)?target=["']?_blank["']?([^>]*)>/gi,
    (_m, pre = "", post = "") => `<a ${pre}target="_blank" rel="noopener noreferrer"${post}>`,
  );
}
