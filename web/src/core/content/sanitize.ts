import "server-only";
import createDOMPurify from "isomorphic-dompurify";

const domPurify = createDOMPurify();
const anchorOptions: Parameters<typeof domPurify.sanitize>[1] = { ADD_ATTR: ["target", "rel"] };

export function sanitize(html: string): string {
  const safe = domPurify.sanitize(html, anchorOptions);
  return safe.replace(
    /<a\b([^>]*\s)?target=["']?_blank["']?([^>]*)>/gi,
    (_m, pre = "", post = "") => `<a ${pre}target="_blank" rel="noopener noreferrer"${post}>`,
  );
}
