"use client";

import type { ReactNode } from "react";
import * as RxRadio from "@radix-ui/react-radio-group";
import { useId } from "@/lib/utils";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  copy: "flex flex-col gap-0.5",
  description: "m-0 text-sm leading-5 text-cx-tertiary",
  error: "m-0 text-sm text-cx-error",
  group: "flex flex-col gap-3",
  groupLabel: "text-sm font-medium text-cx-primary",
  horizontal: "flex-row flex-wrap gap-4",
  indicator: "w-2 h-2 rounded-full",
  item: "flex items-start gap-2",
  label: "text-sm font-medium leading-5 text-cx-secondary cursor-pointer",
  radio: "w-5 h-5 mt-0.5 shrink-0 rounded-full border border-solid border-cx-primary bg-cx-primary p-0 cursor-pointer inline-flex items-center justify-center hover:disabled:bg-cx-brand-soft hover:disabled:border-cx-brand focus:outline-none focus-visible:outline disabled:cursor-not-allowed",
  required: "text-cx-error ml-0.5",
  root: "flex flex-col gap-3 font-sans",
};

export type RadioProps = {
  label?: ReactNode;
  description?: ReactNode;
  value: string;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function Radio({ label, description, value, disabled, id, className }: RadioProps) {
  const inputId = useId(id);
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className={cx(CX.item, className)}>
      <RxRadio.Item
        id={inputId}
        value={value}
        disabled={disabled}
        className={CX.radio}
        aria-describedby={descriptionId}
      >
        <RxRadio.Indicator className={CX.indicator} />
      </RxRadio.Item>
      {label || description ? (
        <div className={CX.copy}>
          {label ? (
            <label htmlFor={inputId} className={CX.label}>
              {label}
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
  );
}

export type RadioOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};

export type RadioGroupProps = {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  options?: RadioOption[];
  children?: ReactNode;
  className?: string;
  id?: string;
};

export function RadioGroup({
  label,
  description,
  error,
  value,
  defaultValue,
  onValueChange,
  name,
  required,
  disabled,
  orientation = "vertical",
  options,
  children,
  className,
  id,
}: RadioGroupProps) {
  const groupId = useId(id);

  return (
    <div className={cx(CX.root, className)} id={groupId}>
      {label ? (
        <div className={CX.groupLabel} id={`${groupId}-label`}>
          {label}
          {required ? (
            <span className={CX.required} aria-hidden="true">
              *
            </span>
          ) : null}
        </div>
      ) : null}
      {description ? <p className={CX.description}>{description}</p> : null}
      <RxRadio.Root
        className={cx(CX.group, orientation === "horizontal" && CX.horizontal)}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        required={required}
        disabled={disabled}
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-invalid={error ? true : undefined}
      >
        {options
          ? options.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                label={option.label}
                description={option.description}
                disabled={option.disabled}
              />
            ))
          : children}
      </RxRadio.Root>
      {error ? (
        <p className={CX.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
