"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { Avatar, type AvatarProps } from "./avatar";
import { cx } from "@/lib/utils";

const CX = {
  root: "m-0 flex min-w-0 flex-1 items-center gap-2",
  caption: "min-w-0 flex-1",
  title: "m-0 truncate font-sans font-semibold text-cx-primary",
  subtitle: "m-0 truncate font-sans font-normal text-cx-tertiary",
  title_sm: "text-sm leading-5",
  title_md: "text-sm leading-5",
  title_lg: "text-base leading-6",
  subtitle_sm: "text-xs leading-4",
  subtitle_md: "text-sm leading-5",
  subtitle_lg: "text-base leading-6",
};

export type AvatarLabelGroupSize = "sm" | "md" | "lg";

export type AvatarLabelGroupProps = Omit<AvatarProps, "size"> & {
  size?: AvatarLabelGroupSize;
  title: ReactNode;
  subtitle?: ReactNode;
  avatarClassName?: string;
} & Omit<HTMLAttributes<HTMLElement>, keyof AvatarProps | "title">;

export function AvatarLabelGroup({
  title,
  subtitle,
  size = "md",
  className,
  avatarClassName,
  rounded,
  border = true,
  ...avatarProps
}: AvatarLabelGroupProps) {
  return (
    <figure className={cx(CX.root, className)}>
      <Avatar
        {...avatarProps}
        size={size}
        border={border}
        rounded={rounded}
        className={avatarClassName}
      />
      <figcaption className={CX.caption}>
        <p className={cx(CX.title, CX[`title_${size}`])}>{title}</p>
        {subtitle ? <p className={cx(CX.subtitle, CX[`subtitle_${size}`])}>{subtitle}</p> : null}
      </figcaption>
    </figure>
  );
}
