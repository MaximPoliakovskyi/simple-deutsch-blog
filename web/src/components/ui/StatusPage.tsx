// src/components/StatusPage.tsx
import Link from "next/link";
import type { ReactNode } from "react";

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

export default function StatusPage({
  code,
  title,
  message,
  actions = [],
  children,
}: Props) {
  return (
    <main className="min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="text-center max-w-prose">
        {code ? (
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-wide mb-6">
            {code}
          </div>
        ) : null}
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">{title}</h1>
        {message ? (
          <p className="text-balance text-sm md:text-base opacity-80 mb-8">{message}</p>
        ) : null}
        {children}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actions.map((a, i) => {
            const key = a.type === "link" ? `link-${a.href}` : `btn-${a.label}-${i}`;
            return a.type === "link" ? (
              <Link
                key={key}
                href={a.href}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-foreground/5"
              >
                {a.label}
              </Link>
            ) : (
              <button
                key={key}
                type="button"
                onClick={a.onClick}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-foreground/5"
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
