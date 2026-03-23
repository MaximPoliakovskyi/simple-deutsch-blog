import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import Container, { type ContainerSize } from "@/shared/ui/Container";

type SectionTone = "default" | "muted" | "contrast";
type SectionSpacing = "none" | "sm" | "md" | "lg" | "hero";

const toneClassName: Record<SectionTone, string | null> = {
  default: null,
  muted: "sd-section--muted",
  contrast: "sd-section--contrast",
};

const spacingClassName: Record<SectionSpacing, string | null> = {
  none: null,
  sm: "sd-section--sm",
  md: "sd-section--md",
  lg: "sd-section--lg",
  hero: "sd-section--hero",
};

type Props<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  className?: string;
  containerClassName?: string;
  containerSize?: ContainerSize;
  fullBleed?: boolean;
  spacing?: SectionSpacing;
  tone?: SectionTone;
  withContainer?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export default function Section<T extends ElementType = "section">({
  as,
  children,
  className,
  containerClassName,
  containerSize = "wide",
  fullBleed = false,
  spacing = "md",
  tone = "default",
  withContainer = true,
  ...rest
}: Props<T>) {
  const Component = as ?? "section";
  const content = withContainer ? (
    <Container size={containerSize} className={containerClassName}>
      {children}
    </Container>
  ) : (
    children
  );

  const section = (
    <Component
      className={cn("sd-section", toneClassName[tone], spacingClassName[spacing], className)}
      {...rest}
    >
      {content}
    </Component>
  );

  if (!fullBleed) {
    return section;
  }

  return <div className="sd-full-bleed">{section}</div>;
}
