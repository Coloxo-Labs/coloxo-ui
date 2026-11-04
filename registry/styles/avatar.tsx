"use client";
import { CheckIcon, UserIcon } from "@/lib/icons";

import {
  useState,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
  type ComponentType,
  type SVGProps,
} from "react";
import { Icon } from "./icon";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  badge:
    "absolute right-0 bottom-0 inline-flex items-center justify-center overflow-hidden bg-cx-primary z-[2] [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_img]:block",
  badge_2xl: "w-5 h-5 rounded-md shadow-[0_0_0_1.67px_var(--cx-color-bg-primary)]",
  badge_lg: "w-4 h-4 rounded-sm shadow-[0_0_0_1.5px_var(--cx-color-bg-primary)]",
  badge_md: "w-3.5 h-3.5 rounded-sm shadow-[0_0_0_1.5px_var(--cx-color-bg-primary)]",
  badge_sm: "w-3 h-3 rounded-sm shadow-[0_0_0_1.5px_var(--cx-color-bg-primary)]",
  badge_xl: "w-[18px] h-[18px] rounded-sm shadow-[0_0_0_1.5px_var(--cx-color-bg-primary)]",
  badge_xs: "w-2 h-2 rounded-sm shadow-[0_0_0_1.5px_var(--cx-color-bg-primary)]",
  away: "bg-cx-yellow-500",
  borderPad_2xl: "p-0.5",
  borderPad_lg: "p-[1.5px]",
  borderPad_md: "p-px",
  borderPad_sm: "p-px",
  borderPad_xl: "p-0.5",
  borderPad_xs: "p-px",
  busy: "bg-cx-red-500",
  content:
    "relative inline-flex w-full h-full items-center justify-center overflow-hidden bg-cx-tertiary text-cx-quaternary font-sans font-semibold",
  contrastBorder: "shadow-[inset_0_0_0_1px_var(--cx-color-avatar-contrast-border)]",
  count:
    "absolute -right-0.5 -bottom-0.5 min-w-5 h-5 px-1 inline-flex items-center justify-center rounded-full bg-cx-primary text-cx-secondary text-[10px] font-semibold leading-none shadow-[0_0_0_1.5px_var(--cx-color-bg-primary),inset_0_0_0_1px_var(--cx-color-border-secondary)] z-[2]",
  focusable:
    "outline outline-2 outline-transparent outline-offset-2 group-focus-visible:outline-[var(--cx-color-focus-ring)]",
  hasImage:
    "before:content-[''] before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:z-[1] before:shadow-[inset_0_0_0_1px_rgb(var(--cx-alpha-white)/0.32)] before:[mask-image:linear-gradient(to_bottom,black_0%,transparent_25%,transparent_75%,black_100%)]",
  image: "w-full h-full object-cover block",
  initials:
    "inline-flex items-center justify-center w-full h-full text-cx-secondary bg-[var(--cx-color-avatar-bg)]",
  lg: "w-12 h-12 text-lg leading-7",
  md: "w-10 h-10 text-base leading-6",
  offline: "bg-cx-neutral-400",
  online: "bg-cx-green-500",
  placeholder:
    "inline-flex items-center justify-center w-full h-full text-cx-quaternary bg-cx-tertiary",
  root: "relative inline-flex shrink-0 items-center justify-center overflow-visible select-none",
  roundedFull: "rounded-full",
  roundedMd: "rounded-md",
  size2xl: "w-16 h-16 text-xl leading-[1.875rem]",
  sm: "w-8 h-8 text-sm leading-5",
  status:
    "absolute right-0 bottom-0 rounded-full border-solid border-[var(--cx-color-bg-primary)] box-content z-[2]",
  status_2xl: "w-4 h-4 border-2",
  status_lg: "w-3 h-3 border-2",
  status_md: "w-2.5 h-2.5 border-[1.5px]",
  status_sm: "w-2 h-2 border-[1.5px]",
  status_xl: "w-3.5 h-3.5 border-2",
  status_xs: "w-1.5 h-1.5 border-[1.5px]",
  verified:
    "absolute inline-flex items-center justify-center rounded-full bg-cx-brand text-cx-white border-solid border-[var(--cx-color-bg-primary)] z-[2] [&_svg]:w-[60%] [&_svg]:h-[60%]",
  verified_2xl: "right-0 bottom-0 w-5 h-5 border-2",
  verified_lg: "right-0 bottom-0 w-4 h-4 border-2",
  verified_md: "right-0 bottom-0 w-3.5 h-3.5 border-[1.5px]",
  verified_sm: "right-0 bottom-0 w-3 h-3 border-[1.5px]",
  verified_xl: "right-0 bottom-0 w-[18px] h-[18px] border-2",
  verified_xs: "-right-px -bottom-px w-2.5 h-2.5 border-[1.5px]",
  withBorder: "shadow-[0_0_0_1px_var(--cx-color-border-secondary)] bg-cx-primary",
  xl: "w-14 h-14 text-xl leading-[1.875rem]",
  xs: "w-6 h-6 text-xs leading-4",
};

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

const sizeClass: Record<AvatarSize, string> = {
  xs: CX.xs,
  sm: CX.sm,
  md: CX.md,
  lg: CX.lg,
  xl: CX.xl,
  "2xl": CX.size2xl,
};

const borderPadClass: Record<AvatarSize, string> = {
  xs: CX.borderPad_xs,
  sm: CX.borderPad_sm,
  md: CX.borderPad_md,
  lg: CX.borderPad_lg,
  xl: CX.borderPad_xl,
  "2xl": CX.borderPad_2xl,
};

const statusSizeClass: Record<AvatarSize, string> = {
  xs: CX.status_xs,
  sm: CX.status_sm,
  md: CX.status_md,
  lg: CX.status_lg,
  xl: CX.status_xl,
  "2xl": CX.status_2xl,
};

const verifiedSizeClass: Record<AvatarSize, string> = {
  xs: CX.verified_xs,
  sm: CX.verified_sm,
  md: CX.verified_md,
  lg: CX.verified_lg,
  xl: CX.verified_xl,
  "2xl": CX.verified_2xl,
};

const badgeSizeClass: Record<AvatarSize, string> = {
  xs: CX.badge_xs,
  sm: CX.badge_sm,
  md: CX.badge_md,
  lg: CX.badge_lg,
  xl: CX.badge_xl,
  "2xl": CX.badge_2xl,
};

const statusColor: Record<AvatarStatus, string> = {
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
  const shape = rounded ? CX.roundedFull : CX.roundedMd;
  const placeholderNode = renderPlaceholderIcon(placeholderIcon, size) ?? placeholder ?? (
    <Icon size={size === "xs" || size === "sm" ? "sm" : size === "md" ? "md" : "lg"}>
      <UserIcon />
    </Icon>
  );

  const badgeContent = (() => {
    if (status) {
      return (
        <span
          className={cx(CX.status, statusSizeClass[size], statusColor[status])}
          aria-label={status}
        />
      );
    }
    if (verified) {
      return (
        <span className={cx(CX.verified, verifiedSizeClass[size])} aria-label="Verified">
          <CheckIcon aria-hidden />
        </span>
      );
    }
    if (count != null) {
      return (
        <span className={CX.count} aria-label={`Count ${count}`}>
          {count > 99 ? "99+" : count}
        </span>
      );
    }
    if (badge) {
      return <span className={cx(CX.badge, badgeSizeClass[size])}>{badge}</span>;
    }
    return null;
  })();

  return (
    <span
      className={cx(
        CX.root,
        sizeClass[size],
        border && CX.withBorder,
        border && borderPadClass[size],
        shape,
        focusable && CX.focusable,
        className,
      )}
      data-avatar=""
      {...rest}
    >
      <span
        className={cx(
          CX.content,
          shape,
          contrastBorder && CX.contrastBorder,
          canShowImage && CX.hasImage,
        )}
      >
        {canShowImage ? (
          <img
            className={CX.image}
            src={src ?? undefined}
            alt={alt}
            onError={(event) => {
              setFailed(true);
              imgProps?.onError?.(event);
            }}
            {...imgProps}
          />
        ) : label ? (
          <span className={CX.initials} aria-hidden={alt ? undefined : true}>
            {label}
          </span>
        ) : (
          <span className={CX.placeholder}>{placeholderNode}</span>
        )}
      </span>
      {badgeContent}
    </span>
  );
}
