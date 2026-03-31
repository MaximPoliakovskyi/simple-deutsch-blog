"use client";

const DEFAULT_WIDTHS = ["w-36", "w-24", "w-32", "w-40", "w-28", "w-44"];

export default function CategoryPillsSkeleton({
  count = 6,
  alignment = "center",
}: {
  count?: number;
  alignment?: "left" | "center";
}) {
  const containerClass = `mx-0 my-8 flex flex-wrap gap-3 ${alignment === "center" ? "justify-center" : "justify-start"}`;
  const items = Array.from({ length: count }, (_, index) => ({
    key: `${DEFAULT_WIDTHS[index % DEFAULT_WIDTHS.length]}-${Math.floor(index / DEFAULT_WIDTHS.length)}`,
    widthClass: DEFAULT_WIDTHS[index % DEFAULT_WIDTHS.length],
  }));

  return (
    <div className={containerClass} aria-hidden="true">
      {items.map((item) => (
        <div
          key={item.key}
          className={[
            "relative h-10 rounded-full overflow-hidden",
            item.widthClass,
            "border border-white/8 bg-neutral-900/90 shadow-sm",
            "sd-shimmer",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
