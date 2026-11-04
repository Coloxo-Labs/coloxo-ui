import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./ButtonGroup.module.css";

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function ButtonGroup({ className, children, ...rest }: ButtonGroupProps) {
  return (
    <div className={cx(styles.root, className)} role="group" {...rest}>
      {children}
    </div>
  );
}
