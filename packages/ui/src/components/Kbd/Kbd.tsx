import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./Kbd.module.css";

export type KbdProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Kbd({ children, className, ...rest }: KbdProps) {
  return (
    <span className={cx(styles.root, className)} {...rest}>
      {children}
    </span>
  );
}
