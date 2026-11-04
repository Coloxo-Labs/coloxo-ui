import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  darkCircle: "rounded-full",
  lg: "w-12 h-12",
  lightCircle: "rounded-full",
  md: "w-10 h-10",
  modern: "bg-cx-primary border border-solid border-cx-secondary rounded-lg shadow-sm",
  modernNeue: "bg-cx-primary rounded-xl",
  outline: "rounded-full relative after:inset-2 after:opacity-6",
  root: "inline-flex items-center justify-center shrink-0 relative",
  sm: "w-8 h-8",
  xl: "w-14 h-14",
};

export type FeaturedIconType =
  | "light-circle"
  | "dark-circle"
  | "modern"
  | "modern-neue"
  | "outline";

export type FeaturedIconColor = "brand" | "gray" | "error" | "warning" | "success";
export type FeaturedIconSize = "sm" | "md" | "lg" | "xl";

export type FeaturedIconProps = HTMLAttributes<HTMLSpanElement> & {
  type?: FeaturedIconType;
  color?: FeaturedIconColor;
  size?: FeaturedIconSize;
  children: ReactNode;
};

const typeClass = {
  "light-circle": CX.lightCircle,
  "dark-circle": CX.darkCircle,
  modern: CX.modern,
  "modern-neue": CX.modernNeue,
  outline: CX.outline,
} as const;

const colorClass = {
  brand: CX.colorBrand,
  gray: CX.colorGray,
  error: CX.colorError,
  warning: CX.colorWarning,
  success: CX.colorSuccess,
} as const;

export function FeaturedIcon({
  type = "light-circle",
  color = "brand",
  size = "md",
  className,
  children,
  ...rest
}: FeaturedIconProps) {
  const iconSize = size === "sm" ? "xs" : size === "md" || size === "lg" ? "sm" : "lg";

  return (
    <span
      className={cx(CX.root, typeClass[type], colorClass[color], CX[size], className)}
      {...rest}
    >
      <Icon size={iconSize === "xs" ? "xs" : iconSize === "sm" ? "sm" : "lg"}>{children}</Icon>
    </span>
  );
}
