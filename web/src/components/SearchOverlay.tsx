// src/components/SearchOverlay.tsx
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

type SlimPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
};

function classNames(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(' ');
}

/** Public button to open the overlay */
export function SearchButton({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={classNames(
          'flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50',
          className
        )}
        aria-label="Find an article"
        title="Find an article (Ctrl+K)"
      >
        <span>Find an article</span>
        <span className="rounded-md border px-1.5 text-xs text-neutral-500">Ctrl K</span>
      </button>
      {open && <SearchOverlay onClose={() => setOpen(false)} />}
    </>
  );
}

/** The overlay itself — now rendered in a portal to <body> so it covers the entire page */
export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [items, setItems] = useState<SlimPost[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [after, setAfter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const close = useCallback(() => onClose(), [onClose]);

  // Mount portal & lock scroll
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      const term = q.trim();
      if (!term) {
        setItems([]); setAfter(null); setHasNext(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { method: 'GET', cache: 'no-store' });
        const json = (await res.json()) as { posts: SlimPost[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } };
        setItems(json.posts);
        setAfter(json.pageInfo.endCursor);
        setHasNext(json.pageInfo.hasNextPage);
        setHighlight(0);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (items.length === 0) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlight(h => Math.min(h + 1, items.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight(h => Math.max(h - 1, 0)); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const current = items[highlight];
        if (current) { close(); router.push(`/posts/${current.slug}`); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, highlight, router, close]);

  const loadMore = useCallback(async () => {
    if (!hasNext || !after) return;
    const term = q.trim();
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}&after=${encodeURIComponent(after)}`, { method: 'GET', cache: 'no-store' });
      const json = (await res.json()) as { posts: SlimPost[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } };
      setItems(prev => [...prev, ...json.posts]);
      setAfter(json.pageInfo.endCursor);
      setHasNext(json.pageInfo.hasNextPage);
    } finally {
      setLoading(false);
    }
  }, [after, hasNext, q]);

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  const empty = q.trim().length > 0 && !loading && items.length === 0;

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={onBackdrop}
    >
      <div className="mx-auto mt-28 w-full max-w-xl rounded-2xl bg-white p-2 shadow-2xl">
        {/* Input row */}
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="opacity-60">
            <path d="M21 21l-4.3-4.3m1.3-5.2a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find an article"
            aria-label="Search"
            className="w-full bg-transparent py-2 outline-none"
          />
          {q ? (
            <button
              type="button"
              onClick={() => { setQ(''); inputRef.current?.focus(); }}
              className="text-xs text-neutral-500 hover:text-neutral-800"
              aria-label="Clear"
            >
              CLEAR
            </button>
          ) : null}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-auto py-2">
          {loading && <div className="px-3 py-3 text-sm text-neutral-500">Loading…</div>}
          {empty && <div className="px-3 py-3 text-sm text-neutral-600">No results. Try a different term.</div>}

          <ul className="divide-y">
            {items.map((it, i) => (
              <li key={it.id}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => { close(); router.push(`/posts/${it.slug}`); }}
                  className={classNames(
                    'flex w-full items-start gap-3 px-3 py-3 text-left hover:bg-neutral-50',
                    i === highlight && 'bg-neutral-50'
                  )}
                >
                  {it.image ? (
                    <img src={it.image} alt="" width={48} height={48} className="mt-0.5 h-12 w-12 flex-none rounded-md object-cover" />
                  ) : (
                    <div className="mt-0.5 h-12 w-12 flex-none rounded-md bg-neutral-200" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-neutral-900">{it.title}</div>
                    <div className="line-clamp-1 text-sm text-neutral-600" dangerouslySetInnerHTML={{ __html: it.excerpt }} />
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {hasNext && (
            <div className="p-2 text-center">
              <button type="button" onClick={loadMore} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">
                Load more
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
