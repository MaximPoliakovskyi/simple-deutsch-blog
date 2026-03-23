export function generateTocFromHtml(html: string) {
  const toc: { id: string; text: string; depth: number }[] = [];
  const seen: Record<string, number> = {};

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/<[^>]+>/g, "")
      .replace(/[\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const newHtml = html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (full, level, attrs, inner) => {
      const depth = Number(level);
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return full;

      let id = slugify(text) || `section-${toc.length + 1}`;
      if (seen[id] == null) seen[id] = 0;
      seen[id] += 1;
      if (seen[id] > 1) id = `${id}-${seen[id]}`;

      toc.push({ id, text, depth });

      const attrsWithoutId = (attrs || "").replace(/\s+id=("[^"]*"|'[^']*'|[^\s>]*)/i, "");
      return `<h${level} id="${id}"${attrsWithoutId}>${inner}</h${level}>`;
    },
  );

  return { html: newHtml, toc };
}

export default generateTocFromHtml;
