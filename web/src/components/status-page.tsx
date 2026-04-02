import type { ReactNode } from "react";

type LinkAction = { type: "link"; href: string; label: string };
type ButtonAction = { type: "button"; onClick: () => void; label: string };
type Action = LinkAction | ButtonAction;

type Props = {
  icon?: ReactNode;
  code?: string;
  title: string;
  message?: string;
  actions?: Action[];
  children?: ReactNode;
};

const primaryCls =
  "type-button inline-flex items-center rounded-[var(--radius)] bg-[var(--sd-accent)] px-5 py-2.5 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)]/60";
const secondaryCls =
  "type-button inline-flex items-center rounded-[var(--radius)] border px-5 py-2.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)]/60";

export default function StatusPage({ icon, code, title, message, actions = [], children }: Props) {
  return (
    <main className="sd-fade-in-slow min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="text-center max-w-prose">
        {icon ? (
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-black/8 dark:bg-white/8">
            {icon}
          </div>
        ) : null}
        {code ? (
          <div className="type-ui-label mb-5 inline-flex items-center rounded-full border px-3 py-1 uppercase tracking-[0.16em] opacity-60">
            {code}
          </div>
        ) : null}
        <h1 className="type-display mb-3">{title}</h1>
        {message ? <p className="type-lead mb-8 text-balance opacity-70">{message}</p> : null}
        {children}
        {actions.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {actions.map((a, i) => {
              const isPrimary = i === 0;
              const cls = isPrimary ? primaryCls : secondaryCls;
              const key = a.type === "link" ? `link-${a.href}` : `btn-${a.label}-${i}`;
              return a.type === "link" ? (
                <a key={key} href={a.href} className={cls}>
                  {a.label}
                </a>
              ) : (
                <button key={key} type="button" onClick={a.onClick} className={cls}>
                  {a.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
