import type { HTMLAttributes, ReactNode } from "react";
import { Avatar, type AvatarSize } from "../Avatar/Avatar";
import { cx } from "../../utils/cx";
import styles from "./AvatarGroup.module.css";

export type AvatarGroupItem = {
  src?: string;
  alt?: string;
  initials?: string;
  key?: string;
};

export type AvatarGroupProps = HTMLAttributes<HTMLDivElement> & {
  items: AvatarGroupItem[];
  max?: number;
  size?: AvatarSize;
  /** Outer ring on each avatar (Untitled default look in stacks). */
  border?: boolean;
  overflowLabel?: ReactNode;
};

export function AvatarGroup({
  items,
  max = 5,
  size = "md",
  border = false,
  overflowLabel,
  className,
  ...rest
}: AvatarGroupProps) {
  const visible = items.slice(0, max);
  const overflow = Math.max(0, items.length - max);
  const sizeClass = size === "2xl" ? styles.size2xl : styles[size];

  return (
    <div className={cx(styles.root, className)} role="group" {...rest}>
      {visible.map((item, index) => (
        <span key={item.key ?? item.src ?? item.initials ?? index} className={styles.item}>
          <Avatar
            src={item.src}
            alt={item.alt}
            initials={item.initials}
            size={size}
            border={border}
          />
        </span>
      ))}
      {overflow > 0 ? (
        <span className={cx(styles.overflow, sizeClass)} aria-label={`${overflow} more`}>
          {overflowLabel ?? `+${overflow}`}
        </span>
      ) : null}
    </div>
  );
}
