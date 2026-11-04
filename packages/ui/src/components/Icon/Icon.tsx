import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./Icon.module.css";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export type IconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: IconSize;
  children: ReactNode;
};

export function Icon({ size = "md", className, children, ...rest }: IconProps) {
  return (
    <span
      className={cx(styles.root, styles[size], className)}
      aria-hidden={rest["aria-hidden"] ?? true}
      {...rest}
    >
      {children}
    </span>
  );
}
