"use client";
import { CircleHelpIcon } from "@/lib/icons";

import type { LabelHTMLAttributes, ReactNode } from "react";
import * as RadixLabel from "@radix-ui/react-label";
import { cx } from "@/lib/utils";
import { Icon } from "./icon";
import { Tooltip } from "./tooltip";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  content: "inline min-w-0",
  helpButton:
    "inline-flex items-center justify-center m-0 p-0 border-none bg-transparent cursor-help align-middle transition-colors",
  optional: "text-xs leading-4 font-normal",
  required: "font-bold ml-px",
  root: "inline-flex items-center flex-wrap gap-1 m-0 font-sans select-none cursor-default",
};

export type LabelSize = "xs" | "sm" | "md" | "lg" | "xl";

export type LabelProps = Omit<LabelHTMLAttributes<HTMLLabelElement>, "size"> & {
  /** Appends a red required asterisk (`aria-hidden`). */
  required?: boolean;
  /** Appends muted `(optional)` when not required. */
  optional?: boolean;
  /** Demotes contrast when the paired control is disabled. */
  disabled?: boolean;
  /** Inline helper tooltip rendered as an info icon after the label text. */
  tooltip?: ReactNode;
  /** Supporting line under the tooltip title. */
  tooltipSupportingText?: ReactNode;
  /** Visual scale aligned to paired control heights (xs–xl). Default `md`. */
  size?: LabelSize;
  children: ReactNode;
};

export function Label({
  required,
  optional,
  disabled,
  tooltip,
  tooltipSupportingText,
  size = "md",
  className,
  children,
  ...rest
}: LabelProps) {
  return (
    <RadixLabel.Root
      className={cx(CX.root, CX[`size-${size}`], disabled && CX.disabled, className)}
      data-disabled={disabled || undefined}
      data-required={required || undefined}
      data-optional={(optional && !required) || undefined}
      {...rest}
    >
      <span className={CX.content}>{children}</span>

      {tooltip ? (
        <Tooltip content={tooltip} supportingText={tooltipSupportingText} side="top">
          <button
            type="button"
            className={CX.helpButton}
            aria-label="More information"
            tabIndex={-1}
            disabled={disabled}
            onClick={(event) => {
              // Avoid stealing focus transfer to the labelled control.
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <Icon size="sm">
              <CircleHelpIcon />
            </Icon>
          </button>
        </Tooltip>
      ) : null}

      {required ? (
        <span className={CX.required} aria-hidden="true">
          *
        </span>
      ) : null}

      {optional && !required ? <span className={CX.optional}>(optional)</span> : null}
    </RadixLabel.Root>
  );
}
