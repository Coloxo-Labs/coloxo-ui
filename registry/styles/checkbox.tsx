"use client";
import { CheckIcon, MinusIcon } from "@/lib/icons";

import type { ReactNode } from "react";
import * as RxCheckbox from "@radix-ui/react-checkbox";
import { Icon } from "./icon";
import { useId } from "@/lib/utils";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  box: "w-5 h-5 mt-0.5 shrink-0 border border-solid border-cx-primary rounded-md bg-cx-primary text-cx-white inline-flex items-center justify-center cursor-pointer p-0 hover:disabled:bg-cx-brand-soft hover:disabled:border-cx-brand focus:outline-none focus-visible:outline disabled:cursor-not-allowed",
  copy: "flex flex-col gap-0.5 min-w-0",
  description: "m-0 text-sm leading-5 text-cx-tertiary",
  error: "text-sm text-cx-error",
  indicator: "inline-flex",
  invalid: "border-cx-error",
  label: "text-sm font-medium leading-5 text-cx-secondary cursor-pointer",
  required: "text-cx-error ml-0.5",
  root: "flex flex-col gap-1 font-sans",
  row: "flex items-start gap-2",
};

export type CheckboxProps = {
  label?: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  indeterminate?: boolean;
  error?: ReactNode;
  "aria-label"?: string;
};

export function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  name,
  value,
  id,
  className,
  indeterminate,
  error,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  const inputId = useId(id);
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cx(CX.root, className)}>
      <div className={CX.row}>
        <RxCheckbox.Root
          id={inputId}
          className={cx(CX.box, error && CX.invalid)}
          checked={indeterminate ? "indeterminate" : checked}
          defaultChecked={defaultChecked}
          onCheckedChange={(next) => onCheckedChange?.(next === true)}
          disabled={disabled}
          required={required}
          name={name}
          value={value}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? true : undefined}
          aria-label={ariaLabel}
        >
          <RxCheckbox.Indicator className={CX.indicator}>
            <Icon size="sm">{indeterminate ? <MinusIcon /> : <CheckIcon />}</Icon>
          </RxCheckbox.Indicator>
        </RxCheckbox.Root>
        {label || description ? (
          <div className={CX.copy}>
            {label ? (
              <label htmlFor={inputId} className={CX.label}>
                {label}
                {required ? (
                  <span className={CX.required} aria-hidden="true">
                    *
                  </span>
                ) : null}
              </label>
            ) : null}
            {description ? (
              <p id={descriptionId} className={CX.description}>
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className={CX.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
