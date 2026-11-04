"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import * as RxToggle from "@radix-ui/react-toggle";
import { cx } from "../../utils/cx";
import styles from "./Toggle.module.css";

export type ToggleSize = "sm" | "md" | "lg";
export type ToggleVariant = "default" | "outline";

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** Controlled pressed state */
  pressed?: boolean;
  /** Uncontrolled initial pressed state */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  size?: ToggleSize;
  variant?: ToggleVariant;
  /** Optional leading icon */
  icon?: ReactNode;
  children?: ReactNode;
};

export function Toggle({
  pressed,
  defaultPressed,
  onPressedChange,
  size = "md",
  variant = "default",
  icon,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ToggleProps) {
  const iconOnly = Boolean(icon && children == null);

  return (
    <RxToggle.Root
      type={type}
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      className={cx(
        styles.root,
        styles[size],
        variant === "outline" ? styles.outline : styles.default,
        iconOnly && styles.iconOnly,
        className,
      )}
      {...rest}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden={children ? true : undefined}>
          {icon}
        </span>
      ) : null}
      {children != null ? <span className={styles.label}>{children}</span> : null}
    </RxToggle.Root>
  );
}
