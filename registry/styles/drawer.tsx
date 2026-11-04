"use client";
import { XIcon } from "@/lib/icons";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { IconButton } from "./icon-button";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  body: "p-4 overflow-auto flex-1",
  bottom: "bottom-0 left-0 right-0 w-full",
  content: "fixed bg-cx-primary text-cx-primary font-sans flex flex-col outline-none shadow-xl",
  description: "mt-1 mx-0 mb-0 text-sm text-cx-tertiary",
  footer: "flex justify-end gap-2 p-4",
  header: "flex items-start justify-between gap-3 p-4",
  left: "top-0 left-0 h-full",
  overlay: "fixed inset-0 bg-[rgb(var(--cx-alpha-black)_/_0.7)]",
  right: "top-0 right-0 h-full",
  srOnly: "absolute w-px h-px p-0 m-px overflow-hidden whitespace-nowrap border-0",
  title: "m-0 text-lg font-semibold text-cx-primary",
  top: "top-0 left-0 right-0 w-full",
};

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
          <Dialog.Overlay className={CX.overlay} />
        ) : (
          <div
            className={CX.overlay}
            aria-hidden="true"
            onClick={() => {
              if (closeOnBackdropClick !== false) {
                onOpenChange?.(false);
              }
            }}
          />
        )}
        <Dialog.Content
          className={cx(CX.content, CX[side], CX[size], className)}
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
          <div className={CX.header}>
            <div>
              {title ? (
                <Dialog.Title className={CX.title}>{title}</Dialog.Title>
              ) : (
                <Dialog.Title className={CX.srOnly}>Drawer</Dialog.Title>
              )}
              {description ? (
                <Dialog.Description className={CX.description}>{description}</Dialog.Description>
              ) : (
                <Dialog.Description className={CX.srOnly}>Drawer content</Dialog.Description>
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
          <div className={CX.body}>{children}</div>
          {footer ? <div className={CX.footer}>{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
