import type { HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./Typography.module.css";

export type TextVariant = "body" | "caption" | "overline" | "code";
export type TextSize = "xs" | "sm" | "md" | "lg";
export type TextWeight = "regular" | "medium" | "semibold" | "bold";
export type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "quaternary"
  | "brand"
  | "error"
  | "success"
  | "warning"
  | "inherit";
export type TextElement = "p" | "span" | "div" | "strong" | "em" | "label" | "li" | "figcaption";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "sm" | "md" | "lg" | "xl" | "2xl";
export type HeadingWeight = TextWeight;
export type HeadingTracking = "normal" | "tight" | "tighter";

export type TextProps = HTMLAttributes<HTMLElement> & {
  /** Polymorphic root element. Defaults to `p`. */
  as?: TextElement;
  /** Typographic function. */
  variant?: TextVariant;
  /** Font-size / line-height scale. Default `md` (16/24). */
  size?: TextSize;
  /** Font weight override. */
  weight?: TextWeight;
  /** Semantic color tone. When omitted, variant defaults apply. */
  color?: TextColor;
};

const weightClass = {
  regular: styles.weightRegular,
  medium: styles.weightMedium,
  semibold: styles.weightSemibold,
  bold: styles.weightBold,
} as const;

const colorClass = {
  primary: styles.colorPrimary,
  secondary: styles.colorSecondary,
  tertiary: styles.colorTertiary,
  quaternary: styles.colorQuaternary,
  brand: styles.colorBrand,
  error: styles.colorError,
  success: styles.colorSuccess,
  warning: styles.colorWarning,
  inherit: styles.colorInherit,
} as const;

export function Text({
  as: Comp = "p",
  variant = "body",
  size = "md",
  weight,
  color,
  className,
  ...rest
}: TextProps) {
  return (
    <Comp
      className={cx(
        styles.text,
        styles[variant],
        styles[`size-${size}`],
        weight ? weightClass[weight] : undefined,
        color ? colorClass[color] : undefined,
        className,
      )}
      {...rest}
    />
  );
}

export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  /** Semantic document outline level (renders h1–h6). */
  level?: HeadingLevel;
  /** Visual scale independent of level. Defaults from level when omitted. */
  size?: HeadingSize;
  /** Font weight override. Defaults: bold for xl/2xl, semibold otherwise. */
  weight?: HeadingWeight;
  /** Letter-spacing. Defaults to tighter for 2xl, normal otherwise. */
  tracking?: HeadingTracking;
};

const headingTag = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

const headingWeightClass = {
  regular: styles.weightRegular,
  medium: styles.weightMedium,
  semibold: styles.weightSemibold,
  bold: styles.weightBold,
} as const;

const headingTrackingClass = {
  normal: styles.trackingNormal,
  tight: styles.trackingTight,
  tighter: styles.trackingTighter,
} as const;

function defaultHeadingSize(level: HeadingLevel): HeadingSize {
  if (level <= 2) return "xl";
  if (level === 3) return "lg";
  if (level === 4) return "md";
  return "sm";
}

export function Heading({ level = 2, size, weight, tracking, className, ...rest }: HeadingProps) {
  const Comp = headingTag[level];
  const resolvedSize = size ?? defaultHeadingSize(level);
  const defaultWeight: HeadingWeight =
    resolvedSize === "xl" || resolvedSize === "2xl" ? "bold" : "semibold";
  const resolvedWeight = weight ?? defaultWeight;
  const resolvedTracking: HeadingTracking =
    tracking ?? (resolvedSize === "2xl" ? "tighter" : "normal");

  return (
    <Comp
      className={cx(
        styles.heading,
        styles[`heading-${resolvedSize}`],
        headingWeightClass[resolvedWeight],
        headingTrackingClass[resolvedTracking],
        className,
      )}
      {...rest}
    />
  );
}
