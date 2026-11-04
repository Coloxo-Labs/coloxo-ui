import type { SVGAttributes } from "react";
import { cx } from "../../utils/cx";
import styles from "./Spinner.module.css";

export type SpinnerProps = SVGAttributes<SVGSVGElement> & {
  size?: "sm" | "md" | "lg";
};

export function Spinner({ size = "md", className, ...rest }: SpinnerProps) {
  return (
    <svg
      className={cx(styles.root, styles[size], className)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <circle className={styles.track} cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
      <path
        className={styles.head}
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
