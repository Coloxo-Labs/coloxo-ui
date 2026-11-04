"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { FormField, fieldDescribedBy } from "./form-field";
import { useId, cx } from "@/lib/utils";
import type { InputProps, InputSize } from "./input";

const CX = {
  root: "relative flex w-full flex-row items-stretch rounded-lg bg-cx-primary shadow-xs after:pointer-events-none after:absolute after:inset-0 after:z-[3] after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_var(--cx-color-border-primary)] after:transition-shadow focus-within:after:shadow-[inset_0_0_0_2px_var(--cx-color-border-brand)]",
  invalid:
    "after:shadow-[inset_0_0_0_1px_var(--cx-color-border-error-subtle)] focus-within:after:shadow-[inset_0_0_0_2px_var(--cx-color-border-error)]",
  sm: "min-h-8 text-sm leading-5",
  md: "min-h-10 text-base leading-6",
  lg: "min-h-11 text-base leading-6",
  addon: "relative z-[1] flex shrink-0 items-stretch",
  leading: "border-r border-solid border-cx-primary focus-within:border-cx-brand",
  trailing: "border-l border-solid border-cx-primary focus-within:border-cx-brand",
  invalidEdge:
    "border-[var(--cx-color-border-error-subtle)] focus-within:border-[var(--cx-color-border-error)]",
  slot: "relative z-[1] flex min-w-0 flex-1 [&_input]:shadow-none [&_input]:focus-visible:ring-0",
  onlyLeading: "[&_input]:rounded-r-lg",
  onlyTrailing: "[&_input]:rounded-l-lg",
  prefix:
    "inline-flex items-center gap-1 whitespace-nowrap bg-transparent px-3 py-2 text-[inherit] leading-[inherit] text-cx-tertiary shadow-none",
  prefixLeading: "rounded-l-lg",
  prefixTrailing: "rounded-r-lg",
  prefixDisabled: "cursor-not-allowed opacity-50",
};

export type InputGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: InputSize;
  leadingText?: string;
  leadingAddon?: ReactNode;
  trailingAddon?: ReactNode;
  children: ReactNode;
};

export function InputGroup({
  label,
  required,
  optional,
  description,
  hint,
  error,
  size = "md",
  leadingText,
  leadingAddon,
  trailingAddon,
  children,
  className,
  id,
  ...rest
}: InputGroupProps) {
  const groupId = useId(id);
  const help = hint ?? description;
  const describedBy = fieldDescribedBy({ id: groupId, description: help, error });
  const hasLeading = Boolean(leadingAddon);
  const hasTrailing = Boolean(trailingAddon);
  const isInvalid = Boolean(error);

  const enhanced = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    const props = child.props as InputProps;
    return cloneElement(child as ReactElement<InputProps>, {
      size,
      groupFlat: hasLeading || hasTrailing,
      groupFlatLeading: hasLeading,
      groupFlatTrailing: hasTrailing,
      leadingText: leadingText ?? props.leadingText,
    });
  });

  const field = (
    <div
      id={groupId}
      className={cx(CX.root, CX[size], isInvalid && CX.invalid, className)}
      data-input-size={size}
      data-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      {...rest}
    >
      {leadingAddon ? (
        <div className={cx(CX.addon, CX.leading, isInvalid && CX.invalidEdge)} data-leading="">
          {leadingAddon}
        </div>
      ) : null}
      <div
        className={cx(
          CX.slot,
          hasLeading && !hasTrailing && CX.onlyLeading,
          hasTrailing && !hasLeading && CX.onlyTrailing,
        )}
      >
        {enhanced}
      </div>
      {trailingAddon ? (
        <div className={cx(CX.addon, CX.trailing, isInvalid && CX.invalidEdge)} data-trailing="">
          {trailingAddon}
        </div>
      ) : null}
    </div>
  );

  if (!label && !help && !error) return field;

  return (
    <FormField
      label={label}
      htmlFor={groupId}
      required={required}
      optional={optional}
      description={help}
      error={error}
    >
      {field}
    </FormField>
  );
}

export function InputPrefix({
  children,
  className,
  position = "leading",
  disabled,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  position?: "leading" | "trailing";
  disabled?: boolean;
}) {
  return (
    <span
      className={cx(
        CX.prefix,
        position === "leading" ? CX.prefixLeading : CX.prefixTrailing,
        disabled && CX.prefixDisabled,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

InputGroup.Prefix = InputPrefix;
