// src/components/Header.tsx

type Props = Record<string, never>; // No props

export default function Header() {
  return (
    <header className="flex h-[90vh] flex-col items-center justify-center bg-[hsl(var(--bg))] text-center">
      <div className="px-4">
        <h1 className="text-6xl font-bold tracking-tight text-[hsl(var(--fg))]">Simple Deutsch</h1>
        <p className="mt-4 text-2xl text-[hsl(var(--fg-muted))]">
          Simple German, clearly explained.
        </p>
      </div>
    </header>
  );
}
