import type { HTMLAttributes, ReactNode } from "react";
import { Label, type LabelSize } from "../Label/Label";
import { cx } from "../../utils/cx";
import styles from "./FormField.module.css";

export type FormFieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  size?: LabelSize;
  tooltip?: ReactNode;
  tooltipSupportingText?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  required,
  optional,
  disabled,
  size,
  tooltip,
  tooltipSupportingText,
  description,
  error,
  children,
  className,
  id,
  ...rest
}: FormFieldProps) {
  const descriptionId = description && htmlFor ? `${htmlFor}-description` : undefined;
  const errorId = error && htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cx(styles.root, className)} id={id} {...rest}>
      {label ? (
        <Label
          htmlFor={htmlFor}
          required={required}
          optional={optional}
          disabled={disabled}
          size={size}
          tooltip={tooltip}
          tooltipSupportingText={tooltipSupportingText}
        >
          {label}
        </Label>
      ) : null}
      {children}
      {description && !error ? (
        <p className={styles.description} id={descriptionId}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function fieldDescribedBy(options: {
  id: string;
  description?: ReactNode;
  error?: ReactNode;
}): string | undefined {
  const ids: string[] = [];
  if (options.error) ids.push(`${options.id}-error`);
  else if (options.description) ids.push(`${options.id}-description`);
  return ids.length ? ids.join(" ") : undefined;
}
