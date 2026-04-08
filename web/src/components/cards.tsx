// Barrel re-export for backward-compat.
// PostCard lives in post-card.tsx (no "use client" → server-renderable).
// Interactive pills live in category-pills.tsx ("use client").

export { CategoryPills, CategoryPillsSkeleton, WordPressBadgePills } from "./category-pills";
export { default, type PostCardPost, type PostCardProps } from "./post-card";
