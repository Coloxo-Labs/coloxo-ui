"use client";
import { CircleAlertIcon } from "@/lib/icons";

import {
  useState,
  type ChangeEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { FormField, fieldDescribedBy } from "./form-field";
import { Icon } from "./icon";
import { useId } from "@/lib/utils";
import { cx } from "@/lib/utils";
import control from "@/lib/form-control";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  count: "text-sm leading-5 text-cx-tertiary",
  countInvalid: "text-cx-error",
  hasTrailingIcon: "pe-10",
  invalidIcon: "absolute top-3 right-3 inline-flex pointer-events-none z-[1]",
  textarea: "block w-full min-h-[8rem] py-3 px-3.5 m-0 border-none bg-transparent text-inherit leading-6 outline-none shadow-none placeholder:text-cx-placeholder disabled:cursor-not-allowed",
  wrap: "block w-full p-0",
};

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
          CX.wrap,
          isInvalid && control.invalid,
          isInvalid && CX.invalid,
          disabled && control.disabled,
          className,
        )}
        data-disabled={disabled || undefined}
        data-invalid={isInvalid || undefined}
      >
        <textarea
          id={textareaId}
          className={cx(CX.textarea, CX[resize], isInvalid && CX.hasTrailingIcon)}
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
          <span className={CX.invalidIcon} aria-hidden="true">
            <Icon size="sm">
              <CircleAlertIcon />
            </Icon>
          </span>
        ) : null}
      </div>
      {showCount && maxLength != null ? (
        <div className={cx(CX.count, isInvalid && CX.countInvalid)} aria-live="polite">
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
