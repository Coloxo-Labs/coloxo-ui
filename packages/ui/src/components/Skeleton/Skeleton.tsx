import type { HTMLAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./Skeleton.module.css";

export type SkeletonVariant = "text" | "circular" | "rectangular";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  lines?: number;
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
  if (variant === "text" && lines > 1) {
    return (
      <div className={cx(styles.stack, className)} {...rest}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cx(styles.root, styles.text)}
            style={{ width: index === lines - 1 ? "72%" : width, height, ...style }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cx(styles.root, styles[variant], className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}
