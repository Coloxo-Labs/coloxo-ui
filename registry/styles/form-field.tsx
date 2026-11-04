import type { HTMLAttributes, ReactNode } from "react";
import { Label, type LabelSize } from "./label";
import { cx } from "@/lib/utils";

/*
 * Tailwind class map. Generated from the CSS Module so the installed
 * file needs no stylesheet of its own and no runtime styling deps.
 */
const CX: Record<string, string> = {
  description: "m-0 text-sm leading-5 text-cx-tertiary",
  error: "m-0 text-sm leading-5 text-cx-error",
  root: "flex flex-col items-start gap-1.5 w-full font-sans",
};

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
    <div className={cx(CX.root, className)} id={id} {...rest}>
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
        <p className={CX.description} id={descriptionId}>
          {description}
        </p>
      ) : null}
      {error ? (
        <p className={CX.error} id={errorId} role="alert">
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
