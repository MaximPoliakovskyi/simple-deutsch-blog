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
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "3rem", fontWeight: 700, margin: 0 }}>Fehler</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0.5rem 0" }}>App-Fehler</h1>
          <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>{message}</p>
          {!isDev && error.digest ? <p style={{ fontSize: "0.75rem", opacity: 0.5 }}>Error ID: {error.digest}</p> : null}
          <button type="button" onClick={() => reset()} style={{ padding: "0.5rem 1.25rem", borderRadius: "0.375rem", border: "1px solid currentColor", background: "transparent", cursor: "pointer" }}>Neu laden</button>
        </div>
      </body>
    </html>
  );
}
