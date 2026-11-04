"use client";

import type { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  content: "py-2 px-3 rounded-md shadow-lg font-sans max-w-[20rem]",
  dark: "text-cx-white",
  light: "bg-cx-primary border border-solid border-cx-secondary text-cx-secondary",
  supporting: "mt-0.5 text-xs leading-4 font-normal",
  title: "text-xs leading-4 font-semibold",
};

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
            className={cx(CX.content, CX[variant], className)}
            side={side}
            sideOffset={6}
          >
            <div className={CX.title}>{content}</div>
            {supportingText ? <div className={CX.supporting}>{supportingText}</div> : null}
            <RadixTooltip.Arrow className={CX.arrow} />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
