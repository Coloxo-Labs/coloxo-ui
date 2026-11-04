"use client";
import { CheckIcon, UserIcon } from "../../icons";

import {
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
  type ComponentType,
  type SVGProps,
} from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import styles from "./Avatar.module.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string | null;
  alt?: string;
  /** Initials string — multi-word names are reduced to 2 letters. */
  initials?: string;
  /** Custom placeholder node when no image/initials. */
  placeholder?: ReactNode;
  placeholderIcon?: ReactNode | ComponentType<SVGProps<SVGSVGElement>>;
  size?: AvatarSize;
  status?: AvatarStatus;
  verified?: boolean;
  /** Outer border with padding (Untitled `border`). */
  border?: boolean;
  /** Inner contrast ring. Default true. */
  contrastBorder?: boolean;
  /** Circular when true (default); soft square when false. */
  rounded?: boolean;
  /** Company logo / custom badge (bottom-right). Mutually exclusive with status/verified/count. */
  badge?: ReactNode;
  /** Small count pill (e.g. +3). */
  count?: number;
  /** Focus ring when parent `.group` is focus-visible (e.g. link wrap). */
  focusable?: boolean;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
};

function initialsFrom(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  // Already short initials like "AL"
  if (trimmed.length <= 2 && !/\s/.test(trimmed)) return trimmed.toUpperCase();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function renderPlaceholderIcon(icon: AvatarProps["placeholderIcon"], size: AvatarSize): ReactNode {
  if (!icon) return null;
  const iconSize =
    size === "xs" ? "sm" : size === "sm" || size === "md" ? "md" : size === "lg" ? "lg" : "xl";
  if (typeof icon === "function") {
    const Comp = icon;
    return (
      <Icon size={iconSize}>
        <Comp />
      </Icon>
    );
  }
  return <Icon size={iconSize}>{icon}</Icon>;
}

export function Avatar({
  src,
  alt = "",
  initials,
  placeholder,
  placeholderIcon,
  size = "md",
  status,
  verified,
  border = false,
  contrastBorder = true,
  rounded = true,
  badge,
  count,
  focusable = false,
  className,
  imgProps,
  ...rest
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const canShowImage = Boolean(src) && !failed;
  const label = initials ? initialsFrom(initials) : "";
  const sizeClass = size === "2xl" ? styles.size2xl : styles[size];
  const placeholderNode = renderPlaceholderIcon(placeholderIcon, size) ?? placeholder ?? (
    <Icon size={size === "xs" || size === "sm" ? "sm" : size === "md" ? "md" : "lg"}>
      <UserIcon />
    </Icon>
  );

  const badgeContent = (() => {
    if (status) {
      return (
        <span
          className={cx(
            styles.status,
            styles[`status_${size}` as keyof typeof styles],
            styles[status],
          )}
          aria-label={status}
        />
      );
    }
    if (verified) {
      return (
        <span
          className={cx(styles.verified, styles[`verified_${size}` as keyof typeof styles])}
          aria-label="Verified"
        >
          <CheckIcon aria-hidden />
        </span>
      );
    }
    if (count != null) {
      return (
        <span className={styles.count} aria-label={`Count ${count}`}>
          {count > 99 ? "99+" : count}
        </span>
      );
    }
    if (badge) {
      return (
        <span className={cx(styles.badge, styles[`badge_${size}` as keyof typeof styles])}>
          {badge}
        </span>
      );
    }
    return null;
  })();

  return (
    <span
      className={cx(
        styles.root,
        sizeClass,
        border && styles.withBorder,
        border && styles[`borderPad_${size}` as keyof typeof styles],
        rounded ? styles.roundedFull : styles.roundedMd,
        focusable && styles.focusable,
        className,
      )}
      data-avatar=""
      {...rest}
    >
      <span
        className={cx(
          styles.content,
          rounded ? styles.roundedFull : styles.roundedMd,
          contrastBorder && styles.contrastBorder,
          canShowImage && styles.hasImage,
        )}
      >
        {canShowImage ? (
          <img
            className={styles.image}
            src={src ?? undefined}
            alt={alt}
            onError={(event) => {
              setFailed(true);
              imgProps?.onError?.(event);
            }}
            {...imgProps}
          />
        ) : label ? (
          <span className={styles.initials} aria-hidden={alt ? undefined : true}>
            {label}
          </span>
        ) : (
          <span className={styles.placeholder}>{placeholderNode}</span>
        )}
      </span>
      {badgeContent}
    </span>
  );
}
