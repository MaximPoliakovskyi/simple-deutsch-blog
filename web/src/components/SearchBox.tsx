// src/components/SearchBox.tsx
'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

export default function SearchBox({ placeholder = 'Search posts…', className = '', autoFocus = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = (searchParams.get('q') ?? '').trim();
  const [value, setValue] = useState(initial);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const next = (searchParams.get('q') ?? '').trim();
    setValue(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = value.trim();
      startTransition(() => {
        const url = q ? `/search?q=${encodeURIComponent(q)}` : `/search`;
        router.replace(url);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [value, router, startTransition]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
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
      {isPending ? <span className="text-sm opacity-70">Searching…</span> : null}
    </div>
  );
}
