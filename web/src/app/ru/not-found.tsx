import Link from "next/link";
import { TRANSLATIONS } from "@/lib/i18n";

const t = TRANSLATIONS["ru"];

export const metadata = {
  title: t.pageNotFoundTitle,
  robots: { index: false },
};

export default function RuNotFound() {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black text-white">
      <div className="text-center px-4">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" className="opacity-40" />
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold">{t.pageNotFoundHeading}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/75">{t.pageNotFoundMessage}</p>

        <div className="mt-6">
          <Link href="/ru" className="inline-flex items-center rounded-md bg-[#1d9bf0] px-4 py-2 text-sm font-medium text-white hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0]/70">
            {t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
