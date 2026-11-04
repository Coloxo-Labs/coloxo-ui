"use client";
import { CircleCheckIcon, TriangleAlertIcon, InfoIcon, CircleXIcon, XIcon } from "@/lib/icons";

import type { ErrorInfo, HTMLAttributes, MouseEvent, ReactNode } from "react";
import { Component, useCallback, useEffect, useRef, useState } from "react";
import { FeaturedIcon } from "./featured-icon";
import type { FeaturedIconColor } from "./featured-icon";
import { Icon } from "./icon";
import { IconButton } from "./icon-button";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  actions: "inline-flex shrink-0 items-center",
  actionsTop: "self-start mt-[0.05rem]",
  actionsCenter: "self-center",
  alignCenter: "items-center",
  alignStart: "items-start",
  banner: "w-full rounded-none border-x-0",
  card: "bg-cx-primary border border-solid border-cx-secondary",
  close: "-mr-1 shrink-0",
  closeCenter: "self-center mt-0",
  closeStart: "-mt-1 self-start",
  description: "mt-1 text-sm leading-5 text-cx-tertiary",
  exiting: "opacity-0 !max-h-0 pt-0 pb-0 mt-0 mb-0 overflow-hidden border-0 pointer-events-none",
  extra: "mt-2 text-sm leading-5 text-cx-tertiary",
  floating: "bg-cx-primary border border-solid border-cx-secondary shadow-lg",
  floatingShadow: "shadow-lg",
  framed: "border border-solid",
  inlineIcon: "inline-flex shrink-0",
  inlineIconOffset: "mt-[0.1rem]",
  root: "flex gap-4 p-4 rounded-xl font-sans relative box-border transition-[opacity,max-height,padding,margin,border-width] duration-200 ease-[ease]",
  section: "flex-1 min-w-0",
  tintError: "bg-cx-red-50 border-cx-red-200",
  tintInfo: "bg-cx-brand-50 border-cx-brand-200",
  tintSuccess: "bg-cx-green-50 border-cx-green-200",
  tintWarning: "bg-cx-yellow-50 border-cx-yellow-200",
  iconError: "text-cx-red-600",
  iconInfo: "text-cx-brand-600",
  iconSuccess: "text-cx-green-600",
  iconWarning: "text-cx-yellow-600",
  title: "text-sm font-semibold leading-5 text-cx-primary",
};

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

const tintClass: Record<AlertVariant, string> = {
  info: CX.tintInfo,
  success: CX.tintSuccess,
  warning: CX.tintWarning,
  error: CX.tintError,
};

const iconClass: Record<AlertVariant, string> = {
  info: CX.iconInfo,
  success: CX.iconSuccess,
  warning: CX.iconWarning,
  error: CX.iconError,
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
  const alignCenter = !hasDescription && !children;
  const tinted = isInline || banner || (isFilled && type === "card");

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
  const resolvedIcon = !showStatusIcon
    ? null
    : icon === undefined
      ? defaultIcons[resolvedVariant]
      : icon;

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
        CX.root,
        alignCenter ? CX.alignCenter : CX.alignStart,
        type === "floating" && !tinted
          ? CX.floating
          : tinted
            ? cx(CX.framed, tintClass[resolvedVariant], type === "floating" && CX.floatingShadow)
            : CX.card,
        banner && CX.banner,
        exiting && CX.exiting,
        className,
      )}
      role="alert"
      style={rootStyle}
      {...rest}
    >
      {resolvedIcon ? (
        isInline || banner ? (
          <span
            className={cx(
              CX.inlineIcon,
              iconClass[resolvedVariant],
              alignCenter ? undefined : CX.inlineIconOffset,
            )}
          >
            <Icon size="md">{resolvedIcon}</Icon>
          </span>
        ) : (
          <FeaturedIcon type="light-circle" color={featuredColor[resolvedVariant]} size="sm">
            {resolvedIcon}
          </FeaturedIcon>
        )
      ) : null}
      <div className={CX.section}>
        {resolvedTitle ? <div className={CX.title}>{resolvedTitle}</div> : null}
        {description ? <div className={CX.description}>{description}</div> : null}
        {children ? <div className={CX.extra}>{children}</div> : null}
      </div>
      {action ? (
        <div className={cx(CX.actions, hasDescription ? CX.actionsTop : CX.actionsCenter)}>
          {action}
        </div>
      ) : null}
      {isClosable ? (
        <IconButton
          aria-label="Dismiss alert"
          variant="tertiary"
          size="sm"
          className={cx(CX.close, alignCenter ? CX.closeCenter : CX.closeStart)}
          onClick={handleClose}
        >
          {resolvedCloseIcon}
        </IconButton>
      ) : null}
    </div>
  );
}

export type AlertErrorBoundaryProps = {
  children: ReactNode;
  /** Ant Design alias for title */
  message?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type AlertErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class AlertErrorBoundary extends Component<AlertErrorBoundaryProps, AlertErrorBoundaryState> {
  override state: AlertErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): AlertErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }

  override render() {
    const { children, message, title, description } = this.props;

    if (this.state.hasError) {
      const resolvedDescription =
        description ?? (this.state.error ? this.state.error.message : undefined);

      return (
        <AlertBase
          variant="error"
          title={title ?? message ?? "Something went wrong"}
          description={resolvedDescription}
        />
      );
    }

    return children;
  }
}

export const Alert = Object.assign(AlertBase, {
  ErrorBoundary: AlertErrorBoundary,
});
