import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  body: "text-cx-primary font-normal",
  caption: "text-slate-500 font-normal",
  code: "inline font-mono font-normal text-cx-secondary bg-slate-100 border border-solid py-0.5 px-1.5",
  colorBrand: "text-cx-brand-tertiary",
  colorError: "text-cx-error",
  colorInherit: "text-inherit",
  colorPrimary: "text-cx-primary",
  colorQuaternary: "text-cx-quaternary",
  colorSecondary: "text-cx-secondary",
  colorSuccess: "text-cx-success",
  colorTertiary: "text-cx-tertiary",
  colorWarning: "text-cx-warning",
  heading: "font-sans text-cx-primary m-0",
  overline: "text-slate-500 font-bold text-xs leading-4 tracking-[0.08em] uppercase",
  "size-lg": "text-lg leading-7",
  "size-md": "text-base leading-6",
  "size-sm": "text-sm leading-5",
  "size-xs": "text-xs leading-4",
  text: "text-cx-primary font-normal",
  weightBold: "font-bold",
  weightMedium: "font-medium",
  weightRegular: "font-normal",
  weightSemibold: "font-semibold",
};

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
export type TextElement =
  | "p"
  | "span"
  | "div"
  | "strong"
  | "em"
  | "label"
  | "li"
  | "figcaption";

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
  regular: CX.weightRegular,
  medium: CX.weightMedium,
  semibold: CX.weightSemibold,
  bold: CX.weightBold,
} as const;

const colorClass = {
  primary: CX.colorPrimary,
  secondary: CX.colorSecondary,
  tertiary: CX.colorTertiary,
  quaternary: CX.colorQuaternary,
  brand: CX.colorBrand,
  error: CX.colorError,
  success: CX.colorSuccess,
  warning: CX.colorWarning,
  inherit: CX.colorInherit,
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
        CX.text,
        CX[variant],
        CX[`size-${size}`],
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
  regular: CX.weightRegular,
  medium: CX.weightMedium,
  semibold: CX.weightSemibold,
  bold: CX.weightBold,
} as const;

const headingTrackingClass = {
  normal: CX.trackingNormal,
  tight: CX.trackingTight,
  tighter: CX.trackingTighter,
} as const;

function defaultHeadingSize(level: HeadingLevel): HeadingSize {
  if (level <= 2) return "xl";
  if (level === 3) return "lg";
  if (level === 4) return "md";
  return "sm";
}

export function Heading({
  level = 2,
  size,
  weight,
  tracking,
  className,
  ...rest
}: HeadingProps) {
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
        CX.heading,
        CX[`heading-${resolvedSize}`],
        headingWeightClass[resolvedWeight],
        headingTrackingClass[resolvedTracking],
        className,
      )}
      {...rest}
    />
  );
}
