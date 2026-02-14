export default function Loading() {
  return (
    <div
      data-route-fallback="pending"
      aria-hidden="true"
      className="mx-auto w-full max-w-7xl px-4 py-12"
      style={{ minHeight: "60vh", visibility: "hidden" }}
    />
  );
}
