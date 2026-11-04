import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../utils/cx";
import styles from "./AnnouncementBar.module.css";

export type AnnouncementBarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  trailing?: ReactNode;
};

export function AnnouncementBar({ children, trailing, className, ...rest }: AnnouncementBarProps) {
  return (
    <div className={cx(styles.root, className)} role="status" {...rest}>
      <div className={styles.content}>{children}</div>
      {trailing ? <div className={styles.trailing}>{trailing}</div> : null}
    </div>
  );
}
