// src/components/StatusPage.tsx
import Link from "next/link";
import { ReactNode } from "react";

type Action =
  | { type: "link"; href: string; label: string }
  | { type: "button"; onClick: () => void; label: string };

export default function StatusPage({
  code,
  title,
  message,
  actions = [],
  children,
}: {
  code?: string;
  title: string;
  message?: string;
  actions?: Action[];
  children?: ReactNode;
}) {
  return (
    <main className="min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="text-center max-w-prose">
        {code ? (
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs uppercase tracking-wide mb-6">
            {code}
          </div>
        ) : null}
        <h1 className="text-3xl md:text-4xl font-semibold mb-3">{title}</h1>
        {message ? <p className="text-balance text-sm md:text-base opacity-80 mb-8">{message}</p> : null}
        {children}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actions.map((a, i) =>
            a.type === "link" ? (
              <Link
                key={i}
                href={a.href}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-foreground/5"
              >
                {a.label}
              </Link>
            ) : (
              <button
                key={i}
                type="button"
                onClick={a.onClick}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-foreground/5"
              >
                {a.label}
              </button>
            ),
          )}
        </div>
      </div>
    </main>
  );
}