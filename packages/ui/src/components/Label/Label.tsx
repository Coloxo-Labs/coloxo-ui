"use client";
import { CircleHelpIcon } from "../../icons";

import type { LabelHTMLAttributes, ReactNode } from "react";
import * as RadixLabel from "@radix-ui/react-label";
import { cx } from "../../utils/cx";
import { Icon } from "../Icon/Icon";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./Label.module.css";

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
      className={cx(
        styles.root,
        styles[`size-${size}`],
        disabled && styles.disabled,
        className,
      )}
      data-disabled={disabled || undefined}
      data-required={required || undefined}
      data-optional={(optional && !required) || undefined}
      {...rest}
    >
      <span className={styles.content}>{children}</span>

      {tooltip ? (
        <Tooltip content={tooltip} supportingText={tooltipSupportingText} side="top">
          <button
            type="button"
            className={styles.helpButton}
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
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      ) : null}

      {optional && !required ? <span className={styles.optional}>(optional)</span> : null}
    </RadixLabel.Root>
  );
}
