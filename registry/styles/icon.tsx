import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  root: "inline-flex items-center justify-center shrink-0 text-inherit",
};

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export type IconProps = HTMLAttributes<HTMLSpanElement> & {
  size?: IconSize;
  children: ReactNode;
};

export function Icon({
  size = "md",
  className,
  children,
  ...rest
}: IconProps) {
  return (
    <span className={cx(CX.root, CX[size], className)} aria-hidden={rest["aria-hidden"] ?? true} {...rest}>
      {children}
    </span>
  );
}
