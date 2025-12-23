import "server-only";
import createDOMPurify from "isomorphic-dompurify";

const DOMPurify = createDOMPurify();

export function sanitize(html: string): string {
  const safe = DOMPurify.sanitize(html, { ADD_ATTR: ["target", "rel"] });
  return safe.replace(
    /<a\b([^>]*\s)?target=["']?_blank["']?([^>]*)>/gi,
    (_m, pre = "", post = "") => `<a ${pre}target="_blank" rel="noopener noreferrer"${post}>`,
  );
}
