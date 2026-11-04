"use client";

import type { ReactNode } from "react";
import * as RxRadio from "@radix-ui/react-radio-group";
import { useId } from "../../utils/useId";
import { cx } from "../../utils/cx";
import styles from "./Radio.module.css";

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
    <div className={cx(styles.item, className)}>
      <RxRadio.Item
        id={inputId}
        value={value}
        disabled={disabled}
        className={styles.radio}
        aria-describedby={descriptionId}
      >
        <RxRadio.Indicator className={styles.indicator} />
      </RxRadio.Item>
      {label || description ? (
        <div className={styles.copy}>
          {label ? (
            <label htmlFor={inputId} className={styles.label}>
              {label}
            </label>
          ) : null}
          {description ? (
            <p id={descriptionId} className={styles.description}>
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
    <div className={cx(styles.root, className)} id={groupId}>
      {label ? (
        <div className={styles.groupLabel} id={`${groupId}-label`}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
        </div>
      ) : null}
      {description ? <p className={styles.description}>{description}</p> : null}
      <RxRadio.Root
        className={cx(styles.group, orientation === "horizontal" && styles.horizontal)}
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
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
