// app/global-error.tsx
"use client";

/**
 * TURBOPACK CSS CHUNK FIX:
 * Do NOT import globals.css here. Importing the same CSS in both layout.tsx and
 * global-error.tsx causes Turbopack to generate conflicting chunks, resulting in:
 * "No link element found for chunk /_next/static/chunks/src_styles_globals_...css"
 *
 * Since global-error.tsx replaces the root layout when an error occurs, the page
 * has already loaded with styles. We use inline styles for basic layout instead.
 */
import StatusPage from "@/components/ui/StatusPage";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const message = isDev
    ? error.message
    : "Ein globaler Fehler ist aufgetreten. Bitte laden Sie die Seite neu.";

  return (
    <html lang={DEFAULT_LOCALE}>
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#ffffff",
          color: "#000000",
        }}
      >
        <StatusPage
          code="Fehler"
          title="App-Fehler"
          message={message}
          actions={[
            { type: "button", onClick: () => reset(), label: "Neu laden" },
            { type: "link", href: `/${DEFAULT_LOCALE}`, label: "Zur Startseite" },
          ]}
        >
          {!isDev && error.digest ? (
            <p className="mt-4 text-xs opacity-70">Error ID: {error.digest}</p>
          ) : null}
        </StatusPage>
      </body>
    </html>
  );
}
