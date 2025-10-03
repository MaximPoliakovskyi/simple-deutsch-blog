'use client';

import { useEffect, useMemo, useRef, useState, useDeferredValue, startTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
};

export default function SearchBox({
  placeholder = 'Search posts…',
  className = '',
  autoFocus = false,
  debounceMs = 400,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Read initial value from URL only once on mount.
  const initial = useMemo(() => (searchParams.get('q') ?? '').trim(), []);
  const [value, setValue] = useState(initial);

  // Defer the value so typing stays responsive even if the page below is heavy.
  const deferredValue = useDeferredValue(value);

  // If the URL changes (back/forward, pagination click), update the input
  // BUT ONLY when the input is NOT focused — to avoid clobbering keystrokes.
  useEffect(() => {
    const nextUrlValue = (searchParams.get('q') ?? '').trim();
    if (document.activeElement !== inputRef.current) {
      if (nextUrlValue !== value) setValue(nextUrlValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Debounced navigation when the (deferred) value changes.
  useEffect(() => {
    const t = setTimeout(() => {
      const q = deferredValue.trim();
      const nextUrl = q ? `/search?q=${encodeURIComponent(q)}` : `/search`;

      // Guard: avoid pushing the same URL repeatedly
      const currentQ = (searchParams.get('q') ?? '').trim();
      if (currentQ === q) return;

      startTransition(() => {
        router.replace(nextUrl);
      });
    }, debounceMs);

    return () => clearTimeout(t);
  }, [deferredValue, debounceMs, router, searchParams]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search posts"
        className={[
          // layout
          'w-full rounded-xl px-4 py-2 text-base',
          // theme-aware colors
          'bg-neutral-100 text-neutral-900 placeholder-neutral-500 border border-neutral-300',
          'dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-white/10',
          // focus: remove UA outline, use accent ring
          'appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[var(--sd-accent)] focus:ring-offset-0',
        ].join(' ')}
      />

      {value ? (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className={[
            'rounded-lg px-3 py-2 text-sm transition-colors border',
            // theme-aware colors
            'text-neutral-700 border-neutral-300 hover:bg-neutral-100',
            'dark:text-neutral-300 dark:border-white/10 dark:hover:bg-white/5',
          ].join(' ')}
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
