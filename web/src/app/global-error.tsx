// app/global-error.tsx
"use client";

import StatusPage from "@/components/status-page";
/**
 * TURBOPACK CSS CHUNK FIX:
 * Do NOT import globals.css here. Importing the same CSS in both layout.tsx and
 * global-error.tsx causes Turbopack to generate conflicting chunks, resulting in:
 * "No link element found for chunk /_next/static/chunks/src_styles_globals_...css"
 *
 * Since global-error.tsx replaces the root layout when an error occurs, the page
 * has already loaded with styles. We use inline styles for basic layout instead.
 */
import { DEFAULT_LOCALE } from "@/lib/i18n";

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
      {/* Use the same application font without re-importing globals.css. */}
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily:
            '"Nunito", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
