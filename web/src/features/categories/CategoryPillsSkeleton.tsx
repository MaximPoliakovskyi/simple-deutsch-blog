const DEFAULT_WIDTHS = ["w-36", "w-24", "w-32", "w-40", "w-28", "w-44"];

export default function CategoryPillsSkeleton({
  count = 6,
  alignment = "center",
}: {
  count?: number;
  alignment?: "left" | "center";
}) {
  const seenWidths = new Map<string, number>();
  const items = Array.from({ length: count }, (_, index) => {
    const widthClass = DEFAULT_WIDTHS[index % DEFAULT_WIDTHS.length];
    const occurrence = (seenWidths.get(widthClass) ?? 0) + 1;
    seenWidths.set(widthClass, occurrence);
    return { key: `${widthClass}-${occurrence}`, widthClass };
  });

  return (
    <div
      aria-hidden="true"
      className={[
        "my-[var(--space-8)]",
        "sd-chip-group",
        alignment === "center" ? "sd-chip-group--center" : "sd-chip-group--start",
      ].join(" ")}
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={[
            "sd-shimmer",
            "relative h-10 overflow-hidden rounded-full",
            item.widthClass,
            "border border-[var(--sd-border-subtle)] bg-[var(--sd-surface-elevated)] shadow-[var(--shadow-xs)]",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
