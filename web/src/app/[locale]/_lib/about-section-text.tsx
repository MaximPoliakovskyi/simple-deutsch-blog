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
        <div className="mx-auto w-full max-w-[72ch] text-center md:text-left space-y-6 md:space-y-8">
          {title ? (
            typeof title === "string" ? (
              <h2 className="text-3xl md:text-4xl font-semibold leading-[1.05] tracking-tight text-(--sd-text) text-center">
                {title}
              </h2>
            ) : (
              // allow passing custom heading nodes (e.g. h1)
              <div className="text-center">{title}</div>
            )
          ) : null}

          {lead ? (
            <p className="text-lg md:text-xl leading-relaxed text-(--sd-text-muted) text-center md:text-left">
              {lead}
            </p>
          ) : null}

          {paragraphs && (
            <div className="space-y-6 text-lg md:text-xl leading-relaxed text-(--sd-text-muted) hyphens-auto wrap-break-word">
              {paragraphs.map((p) => (
                <p key={p} className="md:text-left text-center">
                  {p}
                </p>
              ))}
            </div>
          )}

          {quote ? (
            <blockquote className="mx-auto italic text-xl text-(--sd-text-muted) my-10 border-l-2 border-(--sd-border) pl-4 md:pl-6">
              {quote.text}
              {quote.author ? (
                <cite className="block mt-2 text-sm not-italic">— {quote.author}</cite>
              ) : null}
            </blockquote>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
