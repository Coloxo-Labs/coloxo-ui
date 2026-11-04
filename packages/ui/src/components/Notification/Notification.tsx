"use client";
import { CircleCheckIcon, TriangleAlertIcon, InfoIcon, CircleXIcon, XIcon } from "../../icons";

import {
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import * as RxToast from "@radix-ui/react-toast";
import { Avatar } from "../Avatar/Avatar";
import type { AvatarSize, AvatarStatus } from "../Avatar/Avatar";
import { FeaturedIcon } from "../FeaturedIcon/FeaturedIcon";
import type { FeaturedIconColor } from "../FeaturedIcon/FeaturedIcon";
import { IconButton } from "../IconButton/IconButton";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { cx } from "../../utils/cx";
import styles from "./Notification.module.css";

export type NotificationVariant = "success" | "info" | "warning" | "error";

export type NotificationPlacement =
  "top" | "topLeft" | "topRight" | "bottom" | "bottomLeft" | "bottomRight";

export type NotificationLayout = "default" | "avatar" | "image" | "progress";

export type NotificationAvatarConfig = {
  src?: string | null;
  alt?: string;
  initials?: string;
  status?: AvatarStatus;
  size?: AvatarSize;
};

export type NotificationImageConfig = {
  src: string;
  alt?: string;
};

export type NotificationContentProgressConfig = {
  value: number;
  max?: number;
  label?: ReactNode;
  showValue?: boolean;
};

export type NotificationAction = {
  label: string;
  onClick: () => void;
};

export type NotificationClosableConfig = {
  closeIcon?: ReactNode;
  onClose?: () => void;
};

export type NotificationOptions = {
  /** Primary heading (Ant Design: `title` / deprecated `message`) */
  title?: ReactNode;
  /** Ant Design alias for `title` */
  message?: ReactNode;
  description?: ReactNode;
  /** Auto-close delay in ms. `0` or `false` keeps the notification open. */
  duration?: number | false;
  /** Legacy single text action */
  action?: NotificationAction;
  /** Ant Design `actions` — custom button group */
  actions?: ReactNode;
  id?: string;
  /** Ant Design alias for `id` — same key updates an existing notification */
  key?: string;
  placement?: NotificationPlacement;
  icon?: ReactNode | null;
  closable?: boolean | NotificationClosableConfig;
  closeIcon?: ReactNode | false | null;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  role?: "alert" | "status";
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  onClose?: () => void;
  variant?: NotificationVariant;
  layout?: NotificationLayout;
  avatar?: ReactNode | NotificationAvatarConfig;
  image?: ReactNode | NotificationImageConfig;
  /** Content progress bar (Untitled). Distinct from showProgress auto-close strip. */
  progress?: number | NotificationContentProgressConfig;
  /**
   * Coloxo spring enter/exit (scale + opacity). Defaults to the provider /
   * global `animated` setting (on by default).
   */
  animated?: NotificationAnimationConfig;
};

export type NotificationConfig = NotificationOptions & {
  title?: ReactNode;
  message?: ReactNode;
  variant?: NotificationVariant;
};

export type NotificationStackConfig = boolean | { threshold?: number };

/** Enter/exit motion. `true` enables defaults; `{ delay }` staggers the enter animation. */
export type NotificationAnimationConfig =
  | boolean
  | {
      /** When false, notifications appear instantly. Default true. */
      enabled?: boolean;
      /** Delay before the enter animation starts, in ms. Default 0. */
      delay?: number;
    };

export type NotificationGlobalConfig = {
  duration?: number | false;
  placement?: NotificationPlacement;
  top?: number;
  bottom?: number;
  maxCount?: number;
  stack?: NotificationStackConfig;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  closeIcon?: ReactNode | false | null;
  rtl?: boolean;
  /**
   * Coloxo spring enter/exit (scale + opacity), on by default.
   * Pass `false` to disable, or `{ delay }` to stagger the enter animation.
   */
  animated?: NotificationAnimationConfig;
};

type NotificationRecord = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  variant: NotificationVariant;
  duration: number | false;
  action?: NotificationAction;
  actions?: ReactNode;
  placement: NotificationPlacement;
  icon?: ReactNode | null;
  layout: NotificationLayout;
  avatar?: ReactNode | NotificationAvatarConfig;
  image?: ReactNode | NotificationImageConfig;
  contentProgress?: NotificationContentProgressConfig;
  closable: boolean | NotificationClosableConfig;
  closeIcon?: ReactNode | false | null;
  showProgress: boolean;
  pauseOnHover: boolean;
  role: "alert" | "status";
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  onClose?: () => void;
  createdAt: number;
  animated: boolean;
  animationDelay: number;
};

const DEFAULT_DURATION_MS = 4500;
const DEFAULT_PLACEMENT: NotificationPlacement = "topRight";
const DEFAULT_OFFSET = 24;
const DEFAULT_STACK_THRESHOLD = 3;
const DEFAULT_STACK_CONFIG = { threshold: DEFAULT_STACK_THRESHOLD } as const;
const DEFAULT_ANIMATED = true;
const DEFAULT_ANIMATION_DELAY_MS = 0;

function resolveAnimation(config: NotificationAnimationConfig | undefined): {
  enabled: boolean;
  delay: number;
} {
  if (config === false) return { enabled: false, delay: DEFAULT_ANIMATION_DELAY_MS };
  if (config === true || config == null) {
    return { enabled: DEFAULT_ANIMATED, delay: DEFAULT_ANIMATION_DELAY_MS };
  }
  return {
    enabled: config.enabled ?? DEFAULT_ANIMATED,
    delay:
      typeof config.delay === "number" ? Math.max(0, config.delay) : DEFAULT_ANIMATION_DELAY_MS,
  };
}

const PLACEMENTS: NotificationPlacement[] = [
  "top",
  "topLeft",
  "topRight",
  "bottom",
  "bottomLeft",
  "bottomRight",
];

let memory: NotificationRecord[] = [];
const listeners = new Set<(items: NotificationRecord[]) => void>();

/** Providers that portal into a custom container (not document.body). */
let customContainerProviderCount = 0;
const customContainerListeners = new Set<() => void>();

function setCustomContainerProviderCount(delta: number) {
  customContainerProviderCount = Math.max(0, customContainerProviderCount + delta);
  for (const listener of customContainerListeners) listener();
}

let globalConfig: NotificationGlobalConfig = {
  duration: DEFAULT_DURATION_MS,
  placement: DEFAULT_PLACEMENT,
  top: DEFAULT_OFFSET,
  bottom: DEFAULT_OFFSET,
  stack: DEFAULT_STACK_CONFIG,
  showProgress: false,
  pauseOnHover: true,
  animated: DEFAULT_ANIMATED,
};

function emit() {
  for (const listener of listeners) listener([...memory]);
}

function resolveStackThreshold(stack: NotificationStackConfig | undefined): number | null {
  if (stack === false) return null;
  if (stack === true || stack == null) return DEFAULT_STACK_THRESHOLD;
  return stack.threshold ?? DEFAULT_STACK_THRESHOLD;
}

function resolveDuration(
  value: number | false | undefined,
  fallback: number | false,
): number | false {
  if (value === false || value === 0) return false;
  if (typeof value === "number") return value;
  if (fallback === false || fallback === 0) return false;
  return typeof fallback === "number" ? fallback : DEFAULT_DURATION_MS;
}

function resolveTitle(options: NotificationOptions, fallbackTitle?: ReactNode): ReactNode {
  return options.title ?? options.message ?? fallbackTitle ?? "";
}

function inferLayout(options: NotificationOptions): NotificationLayout {
  if (options.layout) return options.layout;
  if (options.avatar != null) return "avatar";
  if (options.image != null) return "image";
  if (options.progress != null) return "progress";
  return "default";
}

function resolveContentProgress(
  progress: number | NotificationContentProgressConfig | undefined,
): NotificationContentProgressConfig | undefined {
  if (progress == null) return undefined;
  if (typeof progress === "number") {
    return { value: progress, max: 100, showValue: true };
  }
  return {
    value: progress.value,
    max: progress.max ?? 100,
    label: progress.label,
    showValue: progress.showValue ?? true,
  };
}

function renderLeadingAvatar(avatar: ReactNode | NotificationAvatarConfig) {
  if (isValidElement(avatar)) {
    return <div className={styles.avatar}>{avatar}</div>;
  }
  const config = avatar as NotificationAvatarConfig;
  return (
    <div className={styles.avatar}>
      <Avatar
        src={config.src}
        alt={config.alt}
        initials={config.initials}
        status={config.status}
        size={config.size ?? "md"}
      />
    </div>
  );
}

function renderLeadingImage(image: ReactNode | NotificationImageConfig) {
  if (isValidElement(image)) {
    return <div className={styles.leadingMedia}>{image}</div>;
  }
  const config = image as NotificationImageConfig;
  return (
    <div className={styles.leadingMedia}>
      <img className={styles.thumb} src={config.src} alt={config.alt ?? ""} />
    </div>
  );
}

function resolveClosable(closable: boolean | NotificationClosableConfig | undefined) {
  if (closable === false) {
    return { enabled: false as const, config: {} as NotificationClosableConfig };
  }
  if (closable && typeof closable === "object") {
    return { enabled: true as const, config: closable };
  }
  return { enabled: true as const, config: {} as NotificationClosableConfig };
}

function applyMaxCount(items: NotificationRecord[], maxCount?: number) {
  if (!maxCount || maxCount <= 0 || items.length <= maxCount) return items;
  return items.slice(items.length - maxCount);
}

function normalizeRecord(
  variant: NotificationVariant,
  options: NotificationOptions,
  titleFallback?: ReactNode,
): NotificationRecord {
  const id =
    options.key ??
    options.id ??
    `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const layout = inferLayout(options);
  const durationSource =
    options.duration === undefined && options.progress != null ? false : options.duration;
  const animation = resolveAnimation(options.animated ?? globalConfig.animated);

  return {
    id,
    title: resolveTitle(options, titleFallback),
    description: options.description,
    variant: options.variant ?? variant,
    duration: resolveDuration(durationSource, globalConfig.duration ?? DEFAULT_DURATION_MS),
    action: options.action,
    actions: options.actions,
    placement: options.placement ?? globalConfig.placement ?? DEFAULT_PLACEMENT,
    icon: options.icon,
    layout,
    avatar: options.avatar,
    image: options.image,
    contentProgress: resolveContentProgress(options.progress),
    closable: options.closable ?? true,
    closeIcon: options.closeIcon ?? globalConfig.closeIcon,
    showProgress: options.showProgress ?? globalConfig.showProgress ?? false,
    pauseOnHover: options.pauseOnHover ?? globalConfig.pauseOnHover ?? true,
    role: options.role ?? "alert",
    className: options.className,
    style: options.style,
    onClick: options.onClick,
    onClose: options.onClose,
    createdAt: Date.now(),
    animated: animation.enabled,
    animationDelay: animation.delay,
  };
}

function upsert(record: NotificationRecord) {
  const existing = memory.findIndex((item) => item.id === record.id);
  if (existing >= 0) {
    memory = memory.map((item, index) =>
      index === existing ? { ...item, ...record, createdAt: item.createdAt } : item,
    );
  } else {
    memory = [...memory, record];
  }
  memory = applyMaxCount(memory, globalConfig.maxCount);
  emit();
  return record.id;
}

function push(
  variant: NotificationVariant,
  titleOrConfig: string | NotificationConfig,
  options: NotificationOptions = {},
) {
  if (typeof titleOrConfig === "string") {
    return upsert(normalizeRecord(variant, options, titleOrConfig));
  }
  return upsert(normalizeRecord(variant, { ...titleOrConfig, ...options }, titleOrConfig.title));
}

export function dismissNotification(id?: string) {
  if (id == null) {
    const closing = [...memory];
    memory = [];
    emit();
    for (const item of closing) item.onClose?.();
    return;
  }
  const target = memory.find((item) => item.id === id);
  memory = memory.filter((item) => item.id !== id);
  emit();
  target?.onClose?.();
}

export function configureNotification(config: NotificationGlobalConfig) {
  globalConfig = { ...globalConfig, ...config };
  emit();
}

type NotificationMethod = {
  (title: string, options?: NotificationOptions): string;
  (config: NotificationConfig): string;
};

function createMethod(variant: NotificationVariant): NotificationMethod {
  return ((titleOrConfig: string | NotificationConfig, options?: NotificationOptions) =>
    push(variant, titleOrConfig, options ?? {})) as NotificationMethod;
}

export const notification = {
  success: createMethod("success"),
  info: createMethod("info"),
  warning: createMethod("warning"),
  error: createMethod("error"),
  open: (config: NotificationConfig) => push(config.variant ?? "info", config),
  avatar: (config: NotificationConfig & { avatar: NonNullable<NotificationOptions["avatar"]> }) =>
    push(config.variant ?? "info", { ...config, layout: "avatar" }),
  image: (config: NotificationConfig & { image: NonNullable<NotificationOptions["image"]> }) =>
    push(config.variant ?? "info", { ...config, layout: "image" }),
  progress: (
    config: NotificationConfig & { progress: NonNullable<NotificationOptions["progress"]> },
  ) => push(config.variant ?? "info", { ...config, layout: "progress" }),
  destroy: dismissNotification,
  dismiss: dismissNotification,
  config: configureNotification,
};

const icons: Record<NotificationVariant, ReactNode> = {
  success: <CircleCheckIcon />,
  info: <InfoIcon />,
  warning: <TriangleAlertIcon />,
  error: <CircleXIcon />,
};

const featuredColor: Record<NotificationVariant, FeaturedIconColor> = {
  success: "success",
  info: "brand",
  warning: "warning",
  error: "error",
};

const placementClass: Record<NotificationPlacement, string> = {
  top: styles.viewportTop ?? "",
  topLeft: styles.viewportTopLeft ?? "",
  topRight: styles.viewportTopRight ?? "",
  bottom: styles.viewportBottom ?? "",
  bottomLeft: styles.viewportBottomLeft ?? "",
  bottomRight: styles.viewportBottomRight ?? "",
};

const swipeDirection: Record<NotificationPlacement, "up" | "down" | "left" | "right"> = {
  top: "up",
  topLeft: "left",
  topRight: "right",
  bottom: "down",
  bottomLeft: "left",
  bottomRight: "right",
};

export type NotificationProviderProps = NotificationGlobalConfig & {
  children?: ReactNode;
  getContainer?: () => HTMLElement | null;
};

function NotificationItem({
  item,
  providerCloseIcon,
  stackIndex,
  stackCount,
  stacked,
}: {
  item: NotificationRecord;
  providerCloseIcon?: ReactNode | false | null;
  stackIndex: number;
  stackCount: number;
  stacked: boolean;
}) {
  const { enabled: isClosable, config: closableConfig } = resolveClosable(item.closable);
  const resolvedCloseIcon =
    item.closeIcon === false || item.closeIcon === null
      ? null
      : (item.closeIcon ??
        closableConfig.closeIcon ??
        (providerCloseIcon === false || providerCloseIcon === null ? null : providerCloseIcon) ?? (
          <XIcon />
        ));

  const showClose = isClosable && resolvedCloseIcon !== null;
  const durationMs = item.duration === false ? Infinity : item.duration;
  const hasAutoClose = Number.isFinite(durationMs) && durationMs > 0;
  const showProgress = item.showProgress && hasAutoClose;

  const customTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progressKey, setProgressKey] = useState(0);
  const closedRef = useRef(false);

  const clearCustomTimer = useCallback(() => {
    if (customTimerRef.current) {
      clearTimeout(customTimerRef.current);
      customTimerRef.current = null;
    }
  }, []);

  const remove = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    clearCustomTimer();
    closableConfig.onClose?.();
    dismissNotification(item.id);
  }, [clearCustomTimer, closableConfig, item.id]);

  useEffect(() => {
    if (!hasAutoClose || item.pauseOnHover) return;

    customTimerRef.current = setTimeout(() => {
      remove();
    }, durationMs);

    return clearCustomTimer;
  }, [clearCustomTimer, durationMs, hasAutoClose, item.pauseOnHover, item.id, remove]);

  useEffect(() => {
    if (showProgress) setProgressKey((key) => key + 1);
  }, [showProgress, durationMs, item.id]);

  const useDefaultStatusIcon = item.layout === "default";

  const statusIcon =
    item.icon === null ? null : item.icon !== undefined ? (
      item.icon
    ) : useDefaultStatusIcon ? (
      <FeaturedIcon type="light-circle" color={featuredColor[item.variant]} size="sm">
        {icons[item.variant]}
      </FeaturedIcon>
    ) : null;

  const leadingNode =
    item.layout === "avatar" && item.avatar != null
      ? renderLeadingAvatar(item.avatar)
      : item.layout === "image" && item.image != null
        ? renderLeadingImage(item.image)
        : null;

  const actionsNode = item.actions;
  const legacyAction = !actionsNode && item.action ? item.action : null;
  const depthFromTop = stacked ? stackCount - 1 - stackIndex : 0;

  return (
    <RxToast.Root
      className={cx(
        styles.root,
        styles[item.variant],
        item.layout === "image" && styles.rootLayoutImage,
        item.animated && styles.animated,
        stacked && styles.stackedItem,
        stacked && depthFromTop > 0 && styles.stackedBehind,
        item.className,
      )}
      style={
        {
          ...item.style,
          ...(item.animated
            ? {
                ["--cx-notification-anim-delay" as string]: `${item.animationDelay}ms`,
              }
            : null),
          ...(stacked
            ? {
                ["--cx-notification-stack-offset" as string]: `${depthFromTop * 10}px`,
                ["--cx-notification-stack-scale" as string]: `${Math.max(0.92, 1 - depthFromTop * 0.04)}`,
              }
            : null),
        } as CSSProperties
      }
      duration={item.pauseOnHover && hasAutoClose ? durationMs : Infinity}
      type={item.role === "status" ? "background" : "foreground"}
      onOpenChange={(open) => {
        if (!open) remove();
      }}
      onClick={item.onClick}
      data-stacked={stacked ? "true" : undefined}
      data-animated={item.animated ? "true" : "false"}
    >
      {leadingNode}
      {statusIcon ? <div className={styles.icon}>{statusIcon}</div> : null}
      <div className={styles.section}>
        {item.title ? <RxToast.Title className={styles.title}>{item.title}</RxToast.Title> : null}
        {item.description ? (
          <RxToast.Description className={styles.description}>
            {item.description}
          </RxToast.Description>
        ) : null}
        {item.contentProgress ? (
          <ProgressBar
            className={styles.contentProgress}
            value={item.contentProgress.value}
            max={item.contentProgress.max}
            label={item.contentProgress.label}
            showValue={item.contentProgress.showValue}
          />
        ) : null}
        {actionsNode ? <div className={styles.actions}>{actionsNode}</div> : null}
        {legacyAction ? (
          <RxToast.Action asChild altText={legacyAction.label}>
            <button type="button" className={styles.action} onClick={legacyAction.onClick}>
              {legacyAction.label}
            </button>
          </RxToast.Action>
        ) : null}
      </div>
      {showClose ? (
        <RxToast.Close asChild>
          <IconButton
            aria-label="Dismiss notification"
            variant="tertiary"
            size="xs"
            className={styles.close}
          >
            {resolvedCloseIcon}
          </IconButton>
        </RxToast.Close>
      ) : null}
      {showProgress ? (
        <div
          key={progressKey}
          className={styles.progress}
          style={{ animationDuration: `${durationMs}ms` }}
          data-pause-on-hover={item.pauseOnHover ? "true" : "false"}
        />
      ) : null}
    </RxToast.Root>
  );
}

export function NotificationProvider({
  children,
  duration = DEFAULT_DURATION_MS,
  placement = DEFAULT_PLACEMENT,
  top = DEFAULT_OFFSET,
  bottom = DEFAULT_OFFSET,
  maxCount,
  stack = DEFAULT_STACK_CONFIG,
  showProgress = false,
  pauseOnHover = true,
  closeIcon,
  getContainer,
  rtl = false,
  animated = DEFAULT_ANIMATED,
}: NotificationProviderProps) {
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [customContainerCount, setCustomContainerCount] = useState(customContainerProviderCount);
  const usesCustomContainer = typeof getContainer === "function";

  useEffect(() => {
    globalConfig = {
      ...globalConfig,
      duration,
      placement,
      top,
      bottom,
      maxCount,
      stack,
      showProgress,
      pauseOnHover,
      closeIcon,
      rtl,
      animated,
    };
  }, [
    animated,
    bottom,
    closeIcon,
    duration,
    maxCount,
    pauseOnHover,
    placement,
    rtl,
    showProgress,
    stack,
    top,
  ]);

  useEffect(() => {
    listeners.add(setItems);
    setItems([...memory]);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  useEffect(() => {
    const sync = () => setCustomContainerCount(customContainerProviderCount);
    customContainerListeners.add(sync);
    sync();
    return () => {
      customContainerListeners.delete(sync);
    };
  }, []);

  useEffect(() => {
    if (!usesCustomContainer) return;
    setCustomContainerProviderCount(1);
    return () => setCustomContainerProviderCount(-1);
  }, [usesCustomContainer]);

  useEffect(() => {
    setMounted(true);
    if (!getContainer) {
      setPortalTarget(document.body);
      return;
    }
    const resolve = () => {
      const target = getContainer();
      setPortalTarget(target && target !== document.body ? target : null);
    };
    resolve();
    // Custom containers may not be ready on the first paint (ref not set yet).
    const frame = requestAnimationFrame(resolve);
    return () => cancelAnimationFrame(frame);
  }, [getContainer]);

  const stackThreshold = resolveStackThreshold(stack);
  const offsetStyle = {
    ["--cx-notification-offset-top" as string]: `${top}px`,
    ["--cx-notification-offset-bottom" as string]: `${bottom}px`,
  } as CSSProperties;
  const contained =
    portalTarget != null && typeof document !== "undefined" && portalTarget !== document.body;
  // Nested demo providers (custom getContainer) own the toast UI; suppress the app-level body host.
  const suppressPortal = !usesCustomContainer && customContainerCount > 0;

  const byPlacement = useMemo(() => {
    const map = new Map<NotificationPlacement, NotificationRecord[]>();
    for (const placementKey of PLACEMENTS) map.set(placementKey, []);
    for (const item of items) {
      const list = map.get(item.placement) ?? map.get(DEFAULT_PLACEMENT)!;
      list.push(item);
    }
    return map;
  }, [items]);

  const portals =
    mounted && portalTarget && !suppressPortal
      ? createPortal(
          <div
            className={cx(styles.host, contained && styles.hostContained, rtl && styles.rtl)}
            data-notification-host=""
            data-contained={contained ? "true" : undefined}
          >
            {PLACEMENTS.map((placementKey) => {
              const group = byPlacement.get(placementKey) ?? [];
              if (group.length === 0) return null;
              const stacked = stackThreshold != null && group.length > stackThreshold;
              return (
                <RxToast.Provider
                  key={placementKey}
                  duration={typeof duration === "number" ? duration : DEFAULT_DURATION_MS}
                  swipeDirection={swipeDirection[placementKey]}
                  label="Notifications"
                >
                  {group.map((item, index) => (
                    <NotificationItem
                      key={item.id}
                      item={item}
                      providerCloseIcon={closeIcon}
                      stackIndex={index}
                      stackCount={group.length}
                      stacked={stacked}
                    />
                  ))}
                  <RxToast.Viewport
                    className={cx(
                      styles.viewport,
                      contained && styles.viewportContained,
                      placementClass[placementKey],
                      stacked && styles.viewportStacked,
                      rtl && styles.rtl,
                    )}
                    style={offsetStyle}
                    data-placement={placementKey}
                    data-stack={stacked ? "true" : undefined}
                  />
                </RxToast.Provider>
              );
            })}
          </div>,
          portalTarget,
        )
      : null;

  return (
    <>
      {children}
      {portals}
    </>
  );
}
