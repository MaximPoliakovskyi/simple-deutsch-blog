// src/app/[locale]/not-found.tsx
import Link from "next/link";

export default function LocaleNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-6 text-lg text-neutral-600 dark:text-neutral-400">
        Сторінку не знайдено / Страница не найдена
      </p>
      <Link href="/" className="text-blue-600 hover:underline dark:text-blue-400">
        На головну / На главную
      </Link>
    </div>
  );
}
