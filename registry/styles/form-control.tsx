import type { SVGAttributes } from "react";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  head: "opacity-100",
  lg: "w-5 h-5",
  md: "w-4 h-4",
  root: "block",
  sm: "w-3.5 h-3.5",
  track: "opacity-25",
};

export type SpinnerProps = SVGAttributes<SVGSVGElement> & {
  size?: "sm" | "md" | "lg";
};

export function Spinner({ size = "md", className, ...rest }: SpinnerProps) {
  return (
    <svg
      className={cx(CX.root, CX[size], className)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <circle className={CX.track} cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
      <path
        className={CX.head}
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
