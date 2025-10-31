/**
 * generateTocFromHtml
 * - Finds heading tags (h1..h6) in an HTML string
 * - Produces a Table of Contents (array of { id, text, depth })
 * - Injects stable id attributes into the headings and returns the new HTML
 *
 * This uses a conservative regex-based approach which works for typical
 * sanitized post HTML where headings are not deeply nested.
 */
export function generateTocFromHtml(html: string) {
  const toc: { id: string; text: string; depth: number }[] = [];
  const seen: Record<string, number> = {};

  // slugify helper
  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/<[^>]+>/g, "")
      .replace(/[\s]+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .replace(/\-+/g, "-")
      .replace(/^-|-$/g, "");

  // Replace headings and collect toc entries
  const newHtml = html.replace(/<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    const depth = Number(level);
    // Extract text-only content for slug generation and display
    const text = inner.replace(/<[^>]+>/g, "").trim();
    if (!text) return full; // skip empty headings

    let id = slugify(text) || `section-${toc.length + 1}`;
    // ensure unique
    if (seen[id] == null) seen[id] = 0;
    seen[id] += 1;
    if (seen[id] > 1) id = `${id}-${seen[id]}`;

    toc.push({ id, text, depth });

    // preserve any existing attributes but ensure id attr
    // Remove existing id if present to avoid duplicates
    const attrsWithoutId = (attrs || "").replace(/\s+id=(\"[^\"]*\"|'[^']*'|[^\s>]*)/i, "");
    return `<h${level} id="${id}"${attrsWithoutId}>${inner}</h${level}>`;
  });

  return { html: newHtml, toc };
}

export default generateTocFromHtml;
