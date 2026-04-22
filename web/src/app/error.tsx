// app/error.tsx
"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const message = isDev ? error.message : "Something went wrong. Please try again.";

  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
      <p style={{ fontSize: "3rem", fontWeight: 700, margin: 0 }}>Error</p>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0.5rem 0" }}>Unexpected Error</h1>
      <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>{message}</p>
      {!isDev && error.digest ? <p style={{ fontSize: "0.75rem", opacity: 0.5 }}>Error ID: {error.digest}</p> : null}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button type="button" onClick={() => reset()} style={{ padding: "0.5rem 1.25rem", borderRadius: "0.375rem", border: "1px solid currentColor", background: "transparent", cursor: "pointer" }}>Try again</button>
      </div>
    </div>
  );
}
