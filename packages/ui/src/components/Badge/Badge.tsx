import { XIcon } from "../../icons";
import type { HTMLAttributes, ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import styles from "./Badge.module.css";

export type BadgeType = "pill-color" | "badge-color" | "badge-modern";
export type BadgeColor =
  | "brand"
  | "gray"
  | "error"
  | "warning"
  | "success"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "orange";

export type BadgeSize = "sm" | "md" | "lg";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  type?: BadgeType;
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  avatarSrc?: string;
  onClose?: () => void;
  children: ReactNode;
};

const colorClass = {
  brand: styles.colorBrand,
  gray: styles.colorGray,
  error: styles.colorError,
  warning: styles.colorWarning,
  success: styles.colorSuccess,
  blue: styles.colorBlue,
  indigo: styles.colorIndigo,
  purple: styles.colorPurple,
  pink: styles.colorPink,
  orange: styles.colorOrange,
} as const;

const typeClass = {
  "pill-color": styles.pillColor,
  "badge-color": styles.badgeColor,
  "badge-modern": styles.badgeModern,
} as const;

export function Badge({
  type = "pill-color",
  color,
  size = "md",
  dot,
  avatarSrc,
  onClose,
  className,
  children,
  ...rest
}: BadgeProps) {
  const resolvedColor = color ?? "brand";
  const applyColor = type !== "badge-modern";

  return (
    <span
      className={cx(
        styles.root,
        typeClass[type],
        applyColor && colorClass[resolvedColor],
        styles[size],
        className,
      )}
      {...rest}
    >
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {avatarSrc ? <img className={styles.avatar} src={avatarSrc} alt="" /> : null}
      <span className={styles.label}>{children}</span>
      {onClose ? (
        <button type="button" className={styles.close} aria-label="Remove" onClick={onClose}>
          <Icon size="xs">
            <XIcon />
          </Icon>
        </button>
      ) : null}
    </span>
  );
}
