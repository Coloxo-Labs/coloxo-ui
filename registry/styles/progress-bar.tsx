import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  fill: "h-full bg-cx-brand rounded-full transition",
  meta: "flex justify-between gap-3",
  root: "flex flex-col gap-2 w-full font-sans",
  track: "h-2 bg-cx-quaternary rounded-full overflow-hidden",
};

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
    <div className={cx(CX.root, className)} {...rest}>
      {(label || showValue) && (
        <div className={CX.meta}>
          {label ? <span className={CX.label}>{label}</span> : <span />}
          {showValue ? <span className={CX.value}>{Math.round(pct)}%</span> : null}
        </div>
      )}
      <div
        className={CX.track}
        role="progressbar"
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div className={CX.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
