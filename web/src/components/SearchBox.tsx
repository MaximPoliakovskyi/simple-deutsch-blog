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

  const initial = useMemo(() => (searchParams.get('q') ?? '').trim(), []);
  const [value, setValue] = useState(initial);
  const deferredValue = useDeferredValue(value);

  useEffect(() => {
    const next = (searchParams.get('q') ?? '').trim();
    if (document.activeElement !== inputRef.current && next !== value) {
      setValue(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = deferredValue.trim();
      const nextUrl = q ? `/search?q=${encodeURIComponent(q)}` : `/search`;
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
          // color: pure white in light; theme background in dark
          'bg-white text-neutral-900 placeholder-neutral-500 border border-neutral-300',
          'dark:bg-[hsl(var(--bg))] dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-white/10',
          // focus (no UA blue outline)
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