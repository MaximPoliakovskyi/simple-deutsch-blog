// src/components/Header.tsx
import Link from 'next/link';
import { SearchButton } from '@/components/SearchOverlay';

export default function Header() {
  return (
    <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
      <Link href="/" className="text-lg font-semibold">
        Simple Deutsch
      </Link>
      <nav className="flex items-center gap-3">
        <Link href="/posts" className="text-sm text-neutral-700 hover:underline">
          Posts
        </Link>
        <SearchButton />
      </nav>
    </header>
  );
}
