import type { ReactNode } from "react";
import { formatLongDate, formatTranslation, type TranslationDictionary } from "@/shared/i18n/i18n";
import type { Locale } from "@/shared/i18n/locale";
import PageHeading from "@/shared/ui/PageHeading";
import Section from "@/shared/ui/Section";
import Surface from "@/shared/ui/Surface";

const LEGAL_LAST_UPDATED_KEYS = {
  imprint: "imprint.lastUpdated",
  privacy: "privacy.lastUpdated",
  terms: "terms.lastUpdated",
} as const;

const LEGAL_LAST_UPDATED_AT = {
  imprint: "2025-12-27",
  privacy: "2025-12-25",
  terms: "2025-12-25",
} as const;

type LegalDocument = keyof typeof LEGAL_LAST_UPDATED_KEYS;

type Props = {
  children: ReactNode;
  lastUpdated: string;
  title: string;
};

function splitLegalLines(content: string | undefined) {
  return (content ?? "")
    .split(/\n|\\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function getLegalLastUpdated(
  document: LegalDocument,
  locale: Locale,
  dictionary: TranslationDictionary,
) {
  const formattedDate =
    formatLongDate(LEGAL_LAST_UPDATED_AT[document], locale, { timeZone: "UTC" }) ??
    LEGAL_LAST_UPDATED_AT[document];

  return formatTranslation(dictionary[LEGAL_LAST_UPDATED_KEYS[document]], { date: formattedDate });
}

export function renderLegalList(content: string | undefined) {
  const items = splitLegalLines(content)
    .map((item) => item.replace(/^[-\s]+/, ""))
    .filter(Boolean);

  if (!items.length) {
    return null;
  }

  return (
    <ul className="space-y-[var(--space-2)] pl-[var(--space-6)] text-[var(--sd-text-muted)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function renderLegalParagraphs(content: string | undefined) {
  const lines = splitLegalLines(content);

  if (!lines.length) {
    return null;
  }

  return lines.map((line) => <p key={line}>{line}</p>);
}

export function inlineContact(email: string, prefix: ReactNode) {
  return (
    <p>
      {prefix}{" "}
      <a className="text-[var(--sd-accent-strong)] underline" href={`mailto:${email}`}>
        {email}
      </a>
    </p>
  );
}

export default function LegalPageLayout({ children, lastUpdated, title }: Props) {
  return (
    <Section as="main" containerSize="narrow" spacing="md">
      <Surface padding="xl" variant="soft">
        <div className="flex flex-col gap-[var(--space-8)]">
          <PageHeading
            title={title}
            description={lastUpdated}
            descriptionClassName="text-[var(--text-sm)]"
          />
          <article className="sd-prose prose max-w-none">{children}</article>
        </div>
      </Surface>
    </Section>
  );
}
