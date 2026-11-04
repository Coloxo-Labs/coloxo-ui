import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import styles from "./FeaturedIcon.module.css";

export type FeaturedIconType =
  "light-circle" | "dark-circle" | "modern" | "modern-neue" | "outline";

export type FeaturedIconColor = "brand" | "gray" | "error" | "warning" | "success";
export type FeaturedIconSize = "sm" | "md" | "lg" | "xl";

export type FeaturedIconProps = HTMLAttributes<HTMLSpanElement> & {
  type?: FeaturedIconType;
  color?: FeaturedIconColor;
  size?: FeaturedIconSize;
  children: ReactNode;
};

const typeClass = {
  "light-circle": styles.lightCircle,
  "dark-circle": styles.darkCircle,
  modern: styles.modern,
  "modern-neue": styles.modernNeue,
  outline: styles.outline,
} as const;

const colorClass = {
  brand: styles.colorBrand,
  gray: styles.colorGray,
  error: styles.colorError,
  warning: styles.colorWarning,
  success: styles.colorSuccess,
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
      className={cx(styles.root, typeClass[type], colorClass[color], styles[size], className)}
      {...rest}
    >
      <Icon size={iconSize === "xs" ? "xs" : iconSize === "sm" ? "sm" : "lg"}>{children}</Icon>
    </span>
  );
}
