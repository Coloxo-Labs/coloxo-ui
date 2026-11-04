"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { Avatar, type AvatarProps } from "./Avatar";
import { cx } from "../../utils/cx";
import styles from "./AvatarLabelGroup.module.css";

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
    <figure className={cx(styles.root, className)}>
      <Avatar
        {...avatarProps}
        size={size}
        border={border}
        rounded={rounded}
        className={avatarClassName}
      />
      <figcaption className={styles.caption}>
        <p className={cx(styles.title, styles[`title_${size}` as keyof typeof styles])}>{title}</p>
        {subtitle ? (
          <p className={cx(styles.subtitle, styles[`subtitle_${size}` as keyof typeof styles])}>
            {subtitle}
          </p>
        ) : null}
      </figcaption>
    </figure>
  );
}
