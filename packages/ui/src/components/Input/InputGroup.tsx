"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { FormField, fieldDescribedBy } from "../FormField/FormField";
import { useId } from "../../utils/useId";
import { cx } from "../../utils/cx";
import type { InputProps, InputSize } from "./Input";
import styles from "./InputGroup.module.css";

export type InputGroupProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  description?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: InputSize;
  /** Inline leading text inside the shared field (e.g. https://). */
  leadingText?: string;
  /** Joined addon before the input (dropdown, select, etc.). */
  leadingAddon?: ReactNode;
  /** Joined addon after the input (button, dropdown, etc.). */
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
      className={cx(
        styles.root,
        styles[size],
        hasLeading && styles.hasLeading,
        hasTrailing && styles.hasTrailing,
        isInvalid && styles.invalid,
        className,
      )}
      data-input-size={size}
      data-invalid={isInvalid || undefined}
      aria-describedby={describedBy}
      {...rest}
    >
      {leadingAddon ? (
        <div className={styles.leadingAddon} data-leading="">
          {leadingAddon}
        </div>
      ) : null}
      <div className={styles.inputSlot}>{enhanced}</div>
      {trailingAddon ? (
        <div className={styles.trailingAddon} data-trailing="">
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

/** Prefix chip for leading/trailing addons (joined select/button chrome). */
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
        styles.prefix,
        position === "leading" ? styles.prefixLeading : styles.prefixTrailing,
        disabled && styles.prefixDisabled,
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

InputGroup.Prefix = InputPrefix;
