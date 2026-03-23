import Link from "next/link";
import type { ReactNode } from "react";
import PageHeading from "@/shared/ui/PageHeading";
import Section from "@/shared/ui/Section";
import Surface from "@/shared/ui/Surface";

type LinkAction = { type: "link"; href: string; label: string };
type ButtonAction = { type: "button"; onClick: () => void; label: string };
type Action = LinkAction | ButtonAction;

type Props = {
  code?: string;
  title: string;
  message?: string;
  actions?: Action[];
  children?: ReactNode;
};

export default function StatusPage({ code, title, message, actions = [], children }: Props) {
  return (
    <Section as="main" containerSize="narrow" spacing="lg">
      <Surface className="text-center" padding="xl" variant="soft">
        <div className="flex flex-col items-center gap-[var(--space-6)]">
          {code ? <span className="sd-badge">{code}</span> : null}
          <PageHeading
            align="center"
            description={message}
            descriptionClassName="text-[var(--text-base)]"
            title={title}
          />
          {children ? <div className="text-[var(--sd-text-muted)]">{children}</div> : null}
          <div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
            {actions.map((action, index) => {
              const key =
                action.type === "link" ? `link-${action.href}` : `button-${action.label}-${index}`;

              return action.type === "link" ? (
                <Link
                  key={key}
                  href={action.href}
                  className="sd-button sd-button--md sd-button--pill sd-interactive"
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  key={key}
                  type="button"
                  onClick={action.onClick}
                  className="sd-button sd-button--md sd-button--ghost sd-interactive"
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </Surface>
    </Section>
  );
}
