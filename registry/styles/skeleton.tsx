import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

export type SkeletonVariant = "text" | "circular" | "rectangular";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  lines?: number;
};

const VARIANTS: Record<SkeletonVariant, string> = {
  text: "h-4 rounded-md",
  circular: "rounded-full",
  rectangular: "rounded-lg",
};

export function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const base = cx(
    "animate-pulse bg-slate-200 dark:bg-slate-800",
    VARIANTS[variant],
    className,
  );

  if (variant === "text" && lines > 1) {
    return (
      <div className="flex flex-col gap-2" {...rest}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={base}
            style={{
              width: index === lines - 1 ? "72%" : (width ?? "100%"),
              height,
            }}
          />
        ))}
      </div>
    );
  }

  return <div aria-hidden="true" className={base} style={{ width, height, ...style }} {...rest} />;
}
