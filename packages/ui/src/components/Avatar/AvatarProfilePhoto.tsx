"use client";
import { CheckIcon, UserIcon } from "../../icons";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../Icon/Icon";
import { cx } from "../../utils/cx";
import type { AvatarStatus } from "./Avatar";
import styles from "./AvatarProfilePhoto.module.css";

export type AvatarProfilePhotoSize = "sm" | "md" | "lg";

export type AvatarProfilePhotoProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string | null;
  alt?: string;
  initials?: string;
  placeholder?: ReactNode;
  size?: AvatarProfilePhotoSize;
  status?: AvatarStatus;
  verified?: boolean;
  /** Company/custom badge (bottom-right). Mutually exclusive with status/verified. */
  badge?: ReactNode;
};

const sizeClass = {
  sm: {
    root: styles.sm,
    status: styles.status_sm,
    verified: styles.verified_sm,
    badge: styles.badge_sm,
    photo: styles.photo_sm,
    initials: styles.initials_sm,
  },
  md: {
    root: styles.md,
    status: styles.status_md,
    verified: styles.verified_md,
    badge: styles.badge_md,
    photo: styles.photo_md,
    initials: styles.initials_md,
  },
  lg: {
    root: styles.lg,
    status: styles.status_lg,
    verified: styles.verified_lg,
    badge: styles.badge_lg,
    photo: styles.photo_lg,
    initials: styles.initials_lg,
  },
} as const;

const statusClass: Record<AvatarStatus, string | undefined> = {
  online: styles.online,
  offline: styles.offline,
  busy: styles.busy,
  away: styles.away,
};

function initialsFrom(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 2 && !/\s/.test(trimmed)) return trimmed.toUpperCase();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "").toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function AvatarProfilePhoto({
  src,
  alt = "",
  initials,
  placeholder,
  size = "md",
  status,
  verified,
  badge,
  className,
  ...rest
}: AvatarProfilePhotoProps) {
  const [failed, setFailed] = useState(false);
  const canShowImage = Boolean(src) && !failed;
  const label = initials ? initialsFrom(initials) : "";
  const isPlaceholder = !canShowImage;
  const sizes = sizeClass[size];

  // Corner indicators are mutually exclusive: verified/badge win over status when set.
  const badgeContent = (() => {
    if (verified) {
      return (
        <span className={cx(styles.verified, sizes.verified)} aria-label="Verified">
          <CheckIcon aria-hidden />
        </span>
      );
    }
    if (badge) {
      return <span className={cx(styles.badge, sizes.badge)}>{badge}</span>;
    }
    if (status) {
      return (
        <span
          className={cx(styles.status, sizes.status, statusClass[status])}
          aria-label={status}
        />
      );
    }
    return null;
  })();

  return (
    <span
      className={cx(
        styles.root,
        sizes.root,
        isPlaceholder && styles.placeholderPad,
        className,
      )}
      {...rest}
    >
      {canShowImage ? (
        <span className={cx(styles.photo, sizes.photo)}>
          <img
            className={styles.image}
            src={src ?? undefined}
            alt={alt}
            onError={() => setFailed(true)}
          />
        </span>
      ) : (
        <span className={cx(styles.fallback, sizes.photo)}>
          {label ? (
            <span className={cx(styles.initials, sizes.initials)}>{label}</span>
          ) : (
            placeholder ?? (
              <Icon size={size === "sm" ? "lg" : "xl"}>
                <UserIcon />
              </Icon>
            )
          )}
        </span>
      )}
      {badgeContent}
    </span>
  );
}
