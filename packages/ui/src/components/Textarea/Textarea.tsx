"use client";
import { CircleAlertIcon } from "../../icons";

import { useState, type ChangeEvent, type ReactNode, type TextareaHTMLAttributes } from "react";
import { FormField, fieldDescribedBy } from "../FormField/FormField";
import { Icon } from "../Icon/Icon";
import { useId } from "../../utils/useId";
import { cx } from "../../utils/cx";
import control from "../_internal/Control.module.css";
import styles from "./Textarea.module.css";

export type TextareaResize = "none" | "vertical" | "horizontal" | "both";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  required?: boolean;
  optional?: boolean;
  /** Helper text below the field (Untitled `hint`). */
  description?: ReactNode;
  /** Alias for `description` (Untitled API). */
  hint?: ReactNode;
  error?: ReactNode;
  resize?: TextareaResize;
  /** Show `current/max` when `maxLength` is set. */
  showCount?: boolean;
};

function textLength(value: unknown): number {
  if (typeof value === "string") return value.length;
  if (typeof value === "number") return String(value).length;
  if (Array.isArray(value)) return value.join("").length;
  return 0;
}

export function Textarea({
  label,
  required,
  optional,
  description,
  hint,
  error,
  resize = "vertical",
  showCount,
  maxLength,
  disabled,
  className,
  id,
  value,
  defaultValue,
  rows = 4,
  onChange,
  ...rest
}: TextareaProps) {
  const textareaId = useId(id);
  const help = hint ?? description;
  const describedBy = fieldDescribedBy({ id: textareaId, description: help, error });
  const isInvalid = Boolean(error);
  const isControlled = value !== undefined;

  const [uncontrolledLength, setUncontrolledLength] = useState(() => textLength(defaultValue));

  const currentLength = isControlled ? textLength(value) : uncontrolledLength;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setUncontrolledLength(event.target.value.length);
    }
    onChange?.(event);
  };

  const field = (
    <>
      <div
        className={cx(
          control.surface,
          styles.wrap,
          isInvalid && control.invalid,
          isInvalid && styles.invalid,
          disabled && control.disabled,
          className,
        )}
        data-disabled={disabled || undefined}
        data-invalid={isInvalid || undefined}
      >
        <textarea
          id={textareaId}
          className={cx(styles.textarea, styles[resize], isInvalid && styles.hasTrailingIcon)}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          {...rest}
          onChange={handleChange}
        />
        {isInvalid ? (
          <span className={styles.invalidIcon} aria-hidden="true">
            <Icon size="sm">
              <CircleAlertIcon />
            </Icon>
          </span>
        ) : null}
      </div>
      {showCount && maxLength != null ? (
        <div className={cx(styles.count, isInvalid && styles.countInvalid)} aria-live="polite">
          {currentLength}/{maxLength}
        </div>
      ) : null}
    </>
  );

  if (!label && !help && !error && !showCount) return field;

  return (
    <FormField
      label={label}
      htmlFor={textareaId}
      required={required}
      optional={optional}
      description={help}
      error={error}
    >
      {field}
    </FormField>
  );
}
