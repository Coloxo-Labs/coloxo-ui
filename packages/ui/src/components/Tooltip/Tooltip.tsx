"use client";

import type { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cx } from "../../utils/cx";
import styles from "./Tooltip.module.css";

export type TooltipVariant = "dark" | "light";

export type TooltipProps = {
  content: ReactNode;
  supportingText?: ReactNode;
  variant?: TooltipVariant;
  side?: "top" | "right" | "bottom" | "left";
  children: ReactNode;
  delayDuration?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
};

export function Tooltip({
  content,
  supportingText,
  variant = "dark",
  side = "top",
  children,
  delayDuration = 200,
  open,
  defaultOpen,
  onOpenChange,
  className,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={cx(styles.content, styles[variant], className)}
            side={side}
            sideOffset={6}
          >
            <div className={styles.title}>{content}</div>
            {supportingText ? <div className={styles.supporting}>{supportingText}</div> : null}
            <RadixTooltip.Arrow className={styles.arrow} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
