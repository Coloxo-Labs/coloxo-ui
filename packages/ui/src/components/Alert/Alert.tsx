"use client";
import { CircleCheckIcon, TriangleAlertIcon, InfoIcon, CircleXIcon, XIcon } from "../../icons";

import type { HTMLAttributes, MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FeaturedIcon } from "../FeaturedIcon/FeaturedIcon";
import type { FeaturedIconColor } from "../FeaturedIcon/FeaturedIcon";
import { Icon } from "../Icon/Icon";
import { IconButton } from "../IconButton/IconButton";
import { cx } from "../../utils/cx";
import { AlertErrorBoundary } from "./AlertErrorBoundary";
import type { AlertErrorBoundaryProps } from "./AlertErrorBoundary";
import styles from "./Alert.module.css";

export type AlertVariant = "info" | "success" | "warning" | "error";
export type AlertType = "card" | "inline" | "floating";
export type AlertAppearance = "outlined" | "filled";

export type AlertClosableConfig = {
  closeIcon?: ReactNode;
  onClose?: (e?: MouseEvent<HTMLButtonElement>) => void;
  afterClose?: () => void;
};

export type AlertProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  variant?: AlertVariant;
  type?: AlertType;
  /** Primary heading (Ant Design: `message`) */
  title?: ReactNode;
  /** Ant Design alias for `title` */
  message?: ReactNode;
  description?: ReactNode;
  /** Full-bleed banner; defaults variant to warning when `variant` is omitted */
  banner?: boolean;
  /** Default `true` — set `false` to hide the status icon */
  showIcon?: boolean;
  icon?: ReactNode | null;
  closable?: boolean | AlertClosableConfig;
  closeIcon?: ReactNode;
  onClose?: (e?: MouseEvent<HTMLButtonElement>) => void;
  afterClose?: () => void;
  action?: ReactNode;
  /** Tinted status background on card layout */
  filled?: boolean;
  appearance?: AlertAppearance;
};

const defaultIcons: Record<AlertVariant, ReactNode> = {
  info: <InfoIcon />,
  success: <CircleCheckIcon />,
  warning: <TriangleAlertIcon />,
  error: <CircleXIcon />,
};

const featuredColor: Record<AlertVariant, FeaturedIconColor> = {
  info: "brand",
  success: "success",
  warning: "warning",
  error: "error",
};

const CLOSE_DURATION_MS = 200;

function resolveClosable(closable: AlertProps["closable"]) {
  if (closable === true) {
    return { enabled: true as const, config: {} as AlertClosableConfig };
  }
  if (closable && typeof closable === "object") {
    return { enabled: true as const, config: closable };
  }
  return { enabled: false as const, config: {} as AlertClosableConfig };
}

function AlertBase({
  variant,
  type = "card",
  title,
  message,
  description,
  banner = false,
  showIcon = true,
  icon,
  closable,
  closeIcon,
  onClose,
  afterClose,
  action,
  filled,
  appearance,
  className,
  children,
  style,
  ...rest
}: AlertProps) {
  const resolvedVariant: AlertVariant = variant ?? (banner ? "warning" : "info");
  const resolvedTitle = title ?? message;
  const hasDescription = Boolean(description);
  const isInline = type === "inline";
  const isFilled = filled === true || appearance === "filled";

  const { enabled: isClosable, config: closableConfig } = resolveClosable(closable);
  const resolvedCloseIcon = closeIcon ?? closableConfig.closeIcon ?? <XIcon />;

  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const exitHeightRef = useRef<number | null>(null);

  const runAfterClose = useCallback(() => {
    const cb = afterClose ?? closableConfig.afterClose;
    cb?.();
  }, [afterClose, closableConfig.afterClose]);

  useEffect(() => {
    if (!exiting) {
      return;
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
      runAfterClose();
    }, CLOSE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [exiting, runAfterClose]);

  const handleClose = (e: MouseEvent<HTMLButtonElement>) => {
    closableConfig.onClose?.(e);
    onClose?.(e);
    if (rootRef.current) {
      exitHeightRef.current = rootRef.current.offsetHeight;
    }
    setExiting(true);
  };

  const showStatusIcon = showIcon !== false && icon !== null;
  const resolvedIcon =
    !showStatusIcon ? null : icon === undefined ? defaultIcons[resolvedVariant] : icon;

  if (!visible) {
    return null;
  }

  const rootStyle =
    exiting && exitHeightRef.current != null
      ? { ...style, maxHeight: exitHeightRef.current }
      : style;

  return (
    <div
      ref={rootRef}
      className={cx(
        styles.root,
        styles[type],
        isInline && styles[resolvedVariant],
        banner && styles.banner,
        banner && styles[resolvedVariant],
        isFilled && type === "card" && styles.filled,
        isFilled && type === "card" && styles[resolvedVariant],
        !hasDescription && !children && styles.alignCenter,
        exiting && styles.exiting,
        className,
      )}
      role="alert"
      style={rootStyle}
      {...rest}
    >
      {resolvedIcon ? (
        isInline || banner ? (
          <span className={cx(styles.inlineIcon, styles[resolvedVariant])}>
            <Icon size="md">{resolvedIcon}</Icon>
          </span>
        ) : (
          <FeaturedIcon type="light-circle" color={featuredColor[resolvedVariant]} size="sm">
            {resolvedIcon}
          </FeaturedIcon>
        )
      ) : null}
      <div className={styles.section}>
        {resolvedTitle ? <div className={styles.title}>{resolvedTitle}</div> : null}
        {description ? <div className={styles.description}>{description}</div> : null}
        {children ? <div className={styles.extra}>{children}</div> : null}
      </div>
      {action ? (
        <div
          className={cx(styles.actions, hasDescription && styles.actionsWithDescription)}
        >
          {action}
        </div>
      ) : null}
      {isClosable ? (
        <IconButton
          aria-label="Dismiss alert"
          variant="tertiary"
          size="sm"
          className={styles.close}
          onClick={handleClose}
        >
          {resolvedCloseIcon}
        </IconButton>
      ) : null}
    </div>
  );
}

export type { AlertErrorBoundaryProps };

export const Alert = Object.assign(AlertBase, {
  ErrorBoundary: AlertErrorBoundary,
});
