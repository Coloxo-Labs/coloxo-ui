"use client";
import { CheckIcon, MinusIcon } from "../../icons";

import type { ReactNode } from "react";
import * as RxCheckbox from "@radix-ui/react-checkbox";
import { Icon } from "../Icon/Icon";
import { useId } from "../../utils/useId";
import { cx } from "../../utils/cx";
import styles from "./Checkbox.module.css";

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
    <div className={cx(styles.root, className)}>
      <div className={styles.row}>
        <RxCheckbox.Root
          id={inputId}
          className={cx(styles.box, error && styles.invalid)}
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
          <RxCheckbox.Indicator className={styles.indicator}>
            <Icon size="sm">{indeterminate ? <MinusIcon /> : <CheckIcon />}</Icon>
          </RxCheckbox.Indicator>
        </RxCheckbox.Root>
        {label || description ? (
          <div className={styles.copy}>
            {label ? (
              <label htmlFor={inputId} className={styles.label}>
                {label}
                {required ? (
                  <span className={styles.required} aria-hidden="true">
                    *
                  </span>
                ) : null}
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
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
