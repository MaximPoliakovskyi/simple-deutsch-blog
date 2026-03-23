"use client";

import { formatTranslation, getTranslations, resolveClientLocale } from "@/shared/i18n/i18n";
import type { Locale } from "@/shared/i18n/locale";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import StatusPage from "./StatusPage";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
  locale?: Locale;
};

export default function ErrorBoundaryStatus({ error, reset, locale }: Props) {
  const resolvedLocale = locale ?? resolveClientLocale();
  const t = getTranslations(resolvedLocale);
  const isDev = process.env.NODE_ENV === "development";
  const message = isDev ? error.message : t["error.message"];

  return (
    <StatusPage
      code={t["error.code"]}
      title={t["error.title"]}
      message={message}
      actions={[
        { type: "button", onClick: () => reset(), label: t["error.retry"] },
        {
          type: "link",
          href: buildLocalizedHref(resolvedLocale, "/"),
          label: t["error.backHome"],
        },
      ]}
    >
      {!isDev && error.digest ? (
        <p className="mt-4 text-xs opacity-70">
          {formatTranslation(t["error.id"], { id: error.digest })}
        </p>
      ) : null}
    </StatusPage>
  );
}
