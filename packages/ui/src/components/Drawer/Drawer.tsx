"use client";
import { XIcon } from "../../icons";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "../IconButton/IconButton";
import { cx } from "../../utils/cx";
import styles from "./Drawer.module.css";

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg";

export type DrawerProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
  closeButton?: boolean;
  closeOnBackdropClick?: boolean;
  modal?: boolean;
  portalContainer?: HTMLElement | null;
  children?: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  footer,
  side = "right",
  size = "md",
  closeButton = true,
  closeOnBackdropClick = true,
  modal = true,
  portalContainer,
  children,
  className,
}: DrawerProps) {
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
          className={cx(styles.content, styles[side], styles[size], className)}
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
              // If rendered inline in a portal, clicking outside the portal (e.g. configurator controls) shouldn't close it
              event.preventDefault();
            }
          }}
        >
          <div className={styles.header}>
            <div>
              {title ? (
                <Dialog.Title className={styles.title}>{title}</Dialog.Title>
              ) : (
                <Dialog.Title className={styles.srOnly}>Drawer</Dialog.Title>
              )}
              {description ? (
                <Dialog.Description className={styles.description}>
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className={styles.srOnly}>Drawer content</Dialog.Description>
              )}
            </div>
            {closeButton ? (
              <Dialog.Close asChild>
                <IconButton aria-label="Close drawer" variant="tertiary" size="sm">
                  <XIcon />
                </IconButton>
              </Dialog.Close>
            ) : null}
          </div>
          <div className={styles.body}>{children}</div>
          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
