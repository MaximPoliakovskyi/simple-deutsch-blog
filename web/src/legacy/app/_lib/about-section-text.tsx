import type React from "react";

type Quote = { text: string; author?: string };

type SectionTextProps = {
  title?: React.ReactNode;
  lead?: string;
  paragraphs?: string[];
  quote?: Quote;
  children?: React.ReactNode;
  // allow overriding outer container classes if needed
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
    <div className={`w-full flex flex-col items-center ${className ?? ""}`}>
      <div className="w-full max-w-232 mx-auto">
        <div className="mx-auto w-full max-w-[72ch] text-left space-y-3 md:space-y-4">
          {title ? (
            typeof title === "string" ? (
              <h2 className="type-title text-[var(--sd-text)] text-center">{title}</h2>
            ) : (
              // allow passing custom heading nodes (e.g. h1)
              <div className="text-center">{title}</div>
            )
          ) : null}

          {lead ? (
            <p className="type-lead text-[var(--sd-text-muted)] text-left">{lead}</p>
          ) : null}

          {paragraphs && (
            <div className="space-y-6 text-base sm:text-lg leading-[1.78] text-[var(--sd-text-muted)] hyphens-auto wrap-break-word">
              {paragraphs.map((p) => (
                <p key={p} className="md:text-left text-center">
                  {p}
                </p>
              ))}
            </div>
          )}

          {quote ? (
            <blockquote className="mx-auto my-10 border-l-2 border-[var(--sd-border)] pl-4 text-lg italic leading-[1.7] text-[var(--sd-text-muted)] md:pl-6">
              {quote.text}
              {quote.author ? (
                <cite className="type-caption block mt-2 not-italic">— {quote.author}</cite>
              ) : null}
            </blockquote>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
