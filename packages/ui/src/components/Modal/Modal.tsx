"use client";
import { XIcon } from "../../icons";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "../IconButton/IconButton";
import { cx } from "../../utils/cx";
import styles from "./Modal.module.css";

export type ModalSize = "sm" | "md" | "lg" | "xl";

export type ModalProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  closeButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  modal?: boolean;
  portalContainer?: HTMLElement | null;
  /**
   * Trigger element the modal should visually pop from.
   * When set, enter/exit scale originates at the trigger’s center.
   */
  originRef?: RefObject<HTMLElement | null>;
  children?: ReactNode;
  className?: string;
};

function resolveTransformOrigin(
  content: HTMLElement,
  trigger: HTMLElement | null | undefined,
): string {
  if (!trigger) return "center center";
  const contentRect = content.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  if (contentRect.width === 0 || contentRect.height === 0) return "center center";
  const x = triggerRect.left + triggerRect.width / 2 - contentRect.left;
  const y = triggerRect.top + triggerRect.height / 2 - contentRect.top;
  return `${x}px ${y}px`;
}

export function Modal({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  footer,
  size = "md",
  closeButton = true,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  modal = true,
  portalContainer,
  originRef,
  children,
  className,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [originStyle, setOriginStyle] = useState<CSSProperties>({
    transformOrigin: "center center",
  });

  const applyOrigin = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (!node) return;
      setOriginStyle({
        transformOrigin: resolveTransformOrigin(node, originRef?.current),
      });
    },
    [originRef],
  );

  useLayoutEffect(() => {
    applyOrigin(contentRef.current);
    // Re-measure after layout so trigger → dialog origin is accurate.
    const frame = requestAnimationFrame(() => applyOrigin(contentRef.current));
    return () => cancelAnimationFrame(frame);
  }, [open, size, portalContainer, applyOrigin]);

  return (
    <Dialog.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
      <Dialog.Portal container={portalContainer}>
        {modal !== false ? (
          <Dialog.Overlay className={styles.overlay} />
        ) : (
          <div
            className={styles.overlay}
            aria-hidden="true"
            onClick={() => {
              if (closeOnBackdropClick !== false) {
                onOpenChange?.(false);
              }
            }}
          />
        )}
        <Dialog.Content
          ref={applyOrigin}
          className={cx(styles.content, styles[size], className)}
          style={originStyle}
          data-origin={originRef ? "trigger" : "center"}
          onEscapeKeyDown={(event) => {
            if (!closeOnEscape) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (!closeOnBackdropClick) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (!closeOnBackdropClick) {
              event.preventDefault();
            } else if (
              portalContainer &&
              event.target instanceof Node &&
              !portalContainer.contains(event.target)
            ) {
              event.preventDefault();
            }
          }}
        >
          {(title || closeButton) && (
            <div className={styles.header}>
              <div>
                {title ? (
                  <Dialog.Title className={styles.title}>{title}</Dialog.Title>
                ) : (
                  <Dialog.Title className={styles.srOnly}>Dialog</Dialog.Title>
                )}
                {description ? (
                  <Dialog.Description className={styles.description}>
                    {description}
                  </Dialog.Description>
                ) : (
                  <Dialog.Description className={styles.srOnly}>Dialog content</Dialog.Description>
                )}
              </div>
              {closeButton ? (
                <Dialog.Close asChild>
                  <IconButton aria-label="Close dialog" variant="tertiary" size="sm">
                    <XIcon />
                  </IconButton>
                </Dialog.Close>
              ) : null}
            </div>
          )}
          <div className={styles.body}>{children}</div>
          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
