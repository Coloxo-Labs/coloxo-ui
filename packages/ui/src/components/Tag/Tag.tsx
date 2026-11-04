import { XIcon } from "../../icons";
import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import styles from "./Tag.module.css";

export type TagSize = "sm" | "md" | "lg";

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  size?: TagSize;
  onClose?: () => void;
  avatarSrc?: string;
  dot?: boolean;
  count?: number | string;
  children: ReactNode;
};

export function Tag({
  size = "md",
  onClose,
  avatarSrc,
  dot,
  count,
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <span className={cx(styles.root, styles[size], className)} {...rest}>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {avatarSrc ? <img className={styles.avatar} src={avatarSrc} alt="" /> : null}
      <span className={styles.label}>{children}</span>
      {count != null ? <span className={styles.count}>{count}</span> : null}
      {onClose ? (
        <button type="button" className={styles.close} aria-label="Remove tag" onClick={onClose}>
          <Icon size="xs">
            <XIcon />
          </Icon>
        </button>
      ) : null}
    </span>
  );
}
