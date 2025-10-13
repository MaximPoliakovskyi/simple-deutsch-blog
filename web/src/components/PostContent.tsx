"use client";

type Props = {
  html: string; // already sanitized upstream (Phase 3.5)
  className?: string;
};

/**
 * PostContent — wraps sanitized HTML with Tailwind Typography "prose" styles.
 * Notes:
 * - Keep sanitization in the server layer (Phase 3.5).
 * - Here we just inject the trusted/sanitized HTML string.
 */
/* biome-disable */
export default function PostContent({ html, className = "" }: Props) {
  return (
    <article
      className={[
        // Base typography
        "prose prose-slate md:prose-lg lg:prose-xl",
        // Let article be as wide as the container that holds it
        "max-w-none",
        // Nice defaults for images/links/code via element modifiers
        // (These match plugin docs: e.g., prose-a:, prose-img:, prose-pre:)
        "prose-a:underline hover:prose-a:no-underline",
        "prose-img:rounded-xl",
        "prose-pre:rounded-xl",
        "prose-pre:overflow-x-auto",
        // Optional if you add dark mode later (Phase 5.5):
        // 'dark:prose-invert',
        className,
      ].join(" ")}
      // HTML content already sanitized on the server side (3.5)
      /* biome-disable-next-line lint/security/noDangerouslySetInnerHtml */
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
