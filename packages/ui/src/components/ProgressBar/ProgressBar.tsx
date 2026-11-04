import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./ProgressBar.module.css";

export type ProgressBarProps = HTMLAttributes<HTMLDivElement> & {
  value: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  className,
  "aria-label": ariaLabel,
  ...rest
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cx(styles.root, className)} {...rest}>
      {(label || showValue) && (
        <div className={styles.meta}>
          {label ? <span className={styles.label}>{label}</span> : <span />}
          {showValue ? <span className={styles.value}>{Math.round(pct)}%</span> : null}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
