import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  root: "inline-flex items-center justify-center min-w-[1.25rem] border border-solid border-cx-secondary rounded-sm bg-cx-secondary text-cx-secondary font-mono text-xs leading-4 font-medium shadow-sm whitespace-nowrap",
};

export type KbdProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Kbd({ children, className, ...rest }: KbdProps) {
  return (
    <span className={cx(CX.root, className)} {...rest}>
      {children}
    </span>
  );
}
