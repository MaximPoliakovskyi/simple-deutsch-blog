import type React from "react";
import { cn } from "@/shared/lib/cn";

type Quote = { text: string; author?: string };

type SectionTextProps = {
  title?: React.ReactNode;
  lead?: string;
  paragraphs?: string[];
  quote?: Quote;
  children?: React.ReactNode;
  className?: string;
};

export default function SectionText({
  title,
  lead,
  paragraphs,
  quote,
  children,
  className,
}: SectionTextProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mx-auto flex w-full max-w-[72ch] flex-col gap-[var(--space-6)] text-center md:gap-[var(--space-8)] md:text-left">
        {title ? (
          typeof title === "string" ? (
            <h2 className="text-center text-[length:var(--text-section-title)] font-semibold leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--sd-text)]">
              {title}
            </h2>
          ) : (
            <div className="text-center">{title}</div>
          )
        ) : null}

        {lead ? (
          <p className="text-[length:var(--text-lg)] leading-[var(--leading-relaxed)] text-[var(--sd-text-muted)]">
            {lead}
          </p>
        ) : null}

        {paragraphs ? (
          <div className="flex flex-col gap-[var(--space-6)] text-[length:var(--text-lg)] leading-[var(--leading-relaxed)] text-[var(--sd-text-muted)]">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}

        {quote ? (
          <blockquote className="mx-auto border-l-2 border-[var(--sd-border)] pl-[var(--space-4)] text-left italic text-[length:var(--text-lg)] leading-[var(--leading-relaxed)] text-[var(--sd-text-muted)] md:pl-[var(--space-6)]">
            {quote.text}
            {quote.author ? (
              <cite className="mt-[var(--space-2)] block text-[var(--text-sm)] not-italic">
                {"\u2014"} {quote.author}
              </cite>
            ) : null}
          </blockquote>
        ) : null}

        {children}
      </div>
    </div>
  );
}
