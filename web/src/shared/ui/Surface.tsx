import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type SurfaceVariant = "raised" | "soft" | "plain";
type SurfacePadding = "none" | "sm" | "md" | "lg" | "xl";

const variantClassName: Record<SurfaceVariant, string> = {
  raised: "sd-surface--raised",
  soft: "sd-surface--soft",
  plain: "sd-surface--plain",
};

const paddingClassName: Record<SurfacePadding, string | null> = {
  none: null,
  sm: "sd-surface--pad-sm",
  md: "sd-surface--pad-md",
  lg: "sd-surface--pad-lg",
  xl: "sd-surface--pad-xl",
};

type Props<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  padding?: SurfacePadding;
  variant?: SurfaceVariant;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function Surface<T extends ElementType = "div">({
  as,
  children,
  className,
  padding = "none",
  variant = "raised",
  ...rest
}: Props<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn("sd-surface", variantClassName[variant], paddingClassName[padding], className)}
      {...rest}
    >
      {children}
    </Component>
  );
}
