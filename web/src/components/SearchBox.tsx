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
  const initial = useMemo(() => (searchParams.get('q') ?? '').trim(), [/* mount only */]);
  const [value, setValue] = useState(initial);

  // Defer the value so typing stays responsive even if the page below is heavy.
  const deferredValue = useDeferredValue(value);

  // If the URL changes (back/forward, pagination click), update the input
  // BUT ONLY when the input is NOT focused — to avoid clobbering keystrokes.
  useEffect(() => {
    const nextUrlValue = (searchParams.get('q') ?? '').trim();
    if (document.activeElement !== inputRef.current) {
      // Only update if different to avoid useless renders
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

      // Mark as a transition so React prioritizes typing over navigation
      startTransition(() => {
        router.replace(nextUrl);
      });
    }, debounceMs);

    return () => clearTimeout(t);
    // Intentionally depend on deferredValue and searchParams
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
        className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-base outline-none
                   focus-visible:ring-2 focus-visible:ring-blue-500"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-100"
        >
          Clear
        </button>
      ) : null}
      {/* Removed the “Searching…” message */}
    </div>
  );
}