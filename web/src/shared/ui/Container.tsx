import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type ContainerSize = "wide" | "narrow" | "content" | "full";

const sizeClassName: Record<ContainerSize, string> = {
  wide: "sd-container--wide",
  narrow: "sd-container--narrow",
  content: "sd-container--content",
  full: "sd-container--full",
};

type Props<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  size?: ContainerSize;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function Container<T extends ElementType = "div">({
  as,
  children,
  className,
  size = "wide",
  ...rest
}: Props<T>) {
  const Component = as ?? "div";

  return (
    <Component className={cn("sd-container", sizeClassName[size], className)} {...rest}>
      {children}
    </Component>
  );
}
