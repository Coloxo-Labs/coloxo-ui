"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";
import { CheckIcon, UserIcon } from "@/lib/icons";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";
import type { AvatarStatus } from "./avatar";

const CX = {
  root: "relative inline-flex shrink-0 items-center justify-center rounded-full bg-cx-primary shadow-[0_0_0_1px_var(--cx-color-border-secondary)]",
  sm: "h-[4.5rem] w-[4.5rem] p-[3px]",
  md: "h-24 w-24 p-1",
  lg: "h-40 w-40 p-1.5",
  placeholderSm: "p-1",
  placeholderMd: "p-[5px]",
  placeholderLg: "p-[7px]",
  photo:
    "relative flex h-full w-full items-center justify-center overflow-hidden rounded-full outline outline-[0.75px] -outline-offset-[0.75px] outline-black/15 before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:rounded-[inherit] before:shadow-[inset_0_0_0_1.5px_rgb(var(--cx-alpha-white)/0.32)] before:[mask-image:linear-gradient(to_bottom,black_0%,transparent_25%,transparent_75%,black_100%)]",
  photo_sm: "shadow-none outline-[0.5px]",
  photo_md: "shadow-xl",
  photo_lg: "shadow-xl",
  fallback:
    "relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-cx-tertiary text-cx-quaternary shadow-[0_0_0_1px_var(--cx-color-border-secondary)]",
  image: "block h-full w-full object-cover",
  initials: "font-sans font-semibold text-cx-quaternary",
  initials_sm: "text-xl",
  initials_md: "text-4xl",
  initials_lg: "text-5xl",
  status:
    "absolute z-[2] box-content rounded-full border-2 border-solid border-[var(--cx-color-bg-primary)]",
  status_sm: "right-0.5 bottom-0.5 h-3 w-3",
  status_md: "right-1 bottom-1 h-4 w-4",
  status_lg: "right-2 bottom-2 h-5 w-5",
  online: "bg-[var(--cx-color-fg-success-secondary)]",
  offline: "bg-cx-quaternary",
  busy: "bg-[var(--cx-color-fg-error-secondary)]",
  away: "bg-[var(--cx-color-fg-warning-secondary)]",
  verified:
    "absolute z-[2] inline-flex items-center justify-center rounded-full border-2 border-solid border-[var(--cx-color-bg-primary)] bg-cx-brand text-cx-white [&_svg]:h-[55%] [&_svg]:w-[55%]",
  verified_sm: "right-0.5 bottom-0.5 h-5 w-5",
  verified_md: "right-1 bottom-1 h-6 w-6",
  verified_lg: "right-2 bottom-2 h-8 w-8",
  badge:
    "absolute z-[2] inline-flex overflow-hidden rounded-md bg-cx-primary shadow-[0_0_0_2px_var(--cx-color-bg-primary)] [&>*]:flex [&>*]:h-full [&>*]:w-full [&>*]:items-center [&>*]:justify-center [&_img]:h-full [&_img]:w-full [&_img]:object-cover",
  badge_sm: "right-0.5 bottom-0.5 h-4 w-4",
  badge_md: "right-1 bottom-1 h-5 w-5",
  badge_lg: "right-2 bottom-2 h-7 w-7",
};

export type AvatarProfilePhotoSize = "sm" | "md" | "lg";

export type AvatarProfilePhotoProps = HTMLAttributes<HTMLSpanElement> & {
  src?: string | null;
  alt?: string;
  initials?: string;
  placeholder?: ReactNode;
  size?: AvatarProfilePhotoSize;
  status?: AvatarStatus;
  verified?: boolean;
  badge?: ReactNode;
};

const sizeClass = {
  sm: {
    root: CX.sm,
    placeholder: CX.placeholderSm,
    status: CX.status_sm,
    verified: CX.verified_sm,
    badge: CX.badge_sm,
    photo: CX.photo_sm,
    initials: CX.initials_sm,
  },
  md: {
    root: CX.md,
    placeholder: CX.placeholderMd,
    status: CX.status_md,
    verified: CX.verified_md,
    badge: CX.badge_md,
    photo: CX.photo_md,
    initials: CX.initials_md,
  },
  lg: {
    root: CX.lg,
    placeholder: CX.placeholderLg,
    status: CX.status_lg,
    verified: CX.verified_lg,
    badge: CX.badge_lg,
    photo: CX.photo_lg,
    initials: CX.initials_lg,
  },
} as const;

const statusClass: Record<AvatarStatus, string> = {
  online: CX.online,
  offline: CX.offline,
  busy: CX.busy,
  away: CX.away,
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
  const sizes = sizeClass[size];

  const badgeContent = (() => {
    if (verified) {
      return (
        <span className={cx(CX.verified, sizes.verified)} aria-label="Verified">
          <CheckIcon aria-hidden />
        </span>
      );
    }
    if (badge) {
      return <span className={cx(CX.badge, sizes.badge)}>{badge}</span>;
    }
    if (status) {
      return (
        <span className={cx(CX.status, sizes.status, statusClass[status])} aria-label={status} />
      );
    }
    return null;
  })();

  return (
    <span
      className={cx(CX.root, sizes.root, !canShowImage && sizes.placeholder, className)}
      {...rest}
    >
      {canShowImage ? (
        <span className={cx(CX.photo, sizes.photo)}>
          <img
            className={CX.image}
            src={src ?? undefined}
            alt={alt}
            onError={() => setFailed(true)}
          />
        </span>
      ) : (
        <span className={cx(CX.fallback, sizes.photo)}>
          {label ? (
            <span className={cx(CX.initials, sizes.initials)}>{label}</span>
          ) : (
            (placeholder ?? (
              <Icon size={size === "sm" ? "lg" : "xl"}>
                <UserIcon />
              </Icon>
            ))
          )}
        </span>
      )}
      {badgeContent}
    </span>
  );
}
