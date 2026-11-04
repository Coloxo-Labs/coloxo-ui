import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  root: "inline-flex items-stretch",
};

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function ButtonGroup({ className, children, ...rest }: ButtonGroupProps) {
  return (
    <div className={cx(CX.root, className)} role="group" {...rest}>
      {children}
    </div>
  );
}
