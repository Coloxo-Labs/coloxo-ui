"use client";
import { XIcon } from "@/lib/icons";

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
import { IconButton } from "./icon-button";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  body: "pt-5 px-6 pb-6 overflow-auto flex-1",
  content: "fixed top-[50%] left-[50%] bg-cx-primary text-cx-primary rounded-2xl shadow-xl border-none font-sans flex flex-col outline-none",
  description: "mt-1 mx-0 mb-0 text-sm leading-5 text-cx-tertiary",
  footer: "flex justify-end gap-3 pt-0 px-6 pb-6",
  header: "flex items-start justify-between gap-3 pt-6 px-6 pb-0",
  lg: "max-w-[50rem]",
  md: "max-w-[35rem]",
  overlay: "fixed inset-0 bg-[rgb(var(--cx-alpha-black)_/_0.7)]",
  sm: "max-w-[25rem]",
  srOnly: "absolute w-px h-px p-0 m-px overflow-hidden whitespace-nowrap border-0",
  title: "m-0 text-lg font-semibold leading-7 text-cx-primary tracking-[-0.01em]",
  xl: "max-w-[71.25rem]",
};

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
          ref={applyOrigin}
          className={cx(CX.content, CX[size], className)}
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
            <div className={CX.header}>
              <div>
                {title ? (
                  <Dialog.Title className={CX.title}>{title}</Dialog.Title>
                ) : (
                  <Dialog.Title className={CX.srOnly}>Dialog</Dialog.Title>
                )}
                {description ? (
                  <Dialog.Description className={CX.description}>
                    {description}
                  </Dialog.Description>
                ) : (
                  <Dialog.Description className={CX.srOnly}>
                    Dialog content
                  </Dialog.Description>
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
          <div className={CX.body}>{children}</div>
          {footer ? <div className={CX.footer}>{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
