"use client";

import type { ReactNode } from "react";
import * as RxSwitch from "@radix-ui/react-switch";
import { useId } from "../../utils/useId";
import { cx } from "../../utils/cx";
import styles from "./Switch.module.css";

export type SwitchProps = {
  label?: ReactNode;
  description?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  required?: boolean;
};

export function Switch({
  label,
  description,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  id,
  className,
  required,
}: SwitchProps) {
  const inputId = useId(id);
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <div className={cx(styles.root, className)}>
      <RxSwitch.Root
        id={inputId}
        className={styles.switch}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        name={name}
        required={required}
        aria-describedby={descriptionId}
      >
        <RxSwitch.Thumb className={styles.thumb} />
      </RxSwitch.Root>
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
