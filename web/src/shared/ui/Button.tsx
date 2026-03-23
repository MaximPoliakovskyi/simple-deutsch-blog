"use client";

import { type ButtonHTMLAttributes, type ForwardedRef, forwardRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type ButtonVariant = "pill" | "ghost" | "control" | "filter";
export type ButtonSize = "sm" | "md" | "icon" | "control";

const variantClassName: Record<ButtonVariant, string> = {
  pill: "sd-button--pill",
  ghost: "sd-button--ghost",
  control: "sd-button--control",
  filter: "sd-button--filter",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "sd-button--sm",
  md: "sd-button--md",
  icon: "sd-button--icon",
  control: "sd-button--control-size",
};

type ButtonClassOptions = {
  active?: boolean;
  className?: string;
  fullWidth?: boolean;
  justify?: "center" | "start";
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function buttonClasses({
  className,
  fullWidth = false,
  justify = "center",
  size = "md",
  variant = "pill",
}: ButtonClassOptions = {}) {
  return cn(
    "sd-button sd-interactive",
    variantClassName[variant],
    sizeClassName[size],
    fullWidth && "w-full",
    justify === "start" && "justify-start text-left",
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonClassOptions & {
    children?: ReactNode;
  };

function ButtonInner(
  {
    active = false,
    className,
    fullWidth = false,
    justify = "center",
    size = "md",
    variant = "pill",
    ...rest
  }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      className={buttonClasses({ className, fullWidth, justify, size, variant })}
      data-active={active ? "true" : undefined}
      type={rest.type ?? "button"}
      {...rest}
    />
  );
}

const Button = forwardRef<HTMLButtonElement, Props>(ButtonInner);

export default Button;
